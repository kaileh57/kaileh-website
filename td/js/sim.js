// sim.js - RUSH TD game simulation. Pure logic: no DOM, no window, no canvas.
// Fixed timestep 30 ticks/s; the caller invokes tick(1/30).

import TOWERS from './data/towers.js';
import ENEMIES from './data/enemies.js';
import ROUNDS, { scaleRound } from './data/rounds.js';
import SENDS from './data/sends.js';
import POWERS from './data/powers.js';
import { buildPath } from './path.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const TICK_RATE = 30;
const BOARD_W = 1280;
const BOARD_H = 720;
const PLACE_MARGIN = 16;
const TOWER_FOOTPRINT = 28;
const PATH_CLEARANCE = 14;
const START_CASH = 600;
const START_LIVES = 150;
const START_ECO = 150;
const SELL_RATIO = 0.7;
// Passive eco pays eco/ECO_DIVISOR dollars per second. Higher = slower money.
const ECO_DIVISOR = 13;
// Handcrafted rounds get a compounding hp ramp so the mid-late game has teeth:
// hp *= 1 + ROUND_HP_RAMP * max(0, round - ROUND_HP_RAMP_FROM).
const ROUND_HP_RAMP = 0.06;
const ROUND_HP_RAMP_FROM = 8;
// Towers can only see/shoot this far while their owner is blacked out.
const BLACKOUT_VISION = 105;

// Host-tweakable match settings (lobby), all optional.
const DEFAULT_SETTINGS = {
  startCash: START_CASH, startLives: START_LIVES, startEco: START_ECO,
  ecoMult: 1, enemyHpMult: 1, enemySpeedMult: 1,
  towerCostMult: 1, upgradeCostMult: 0.85, sendCostMult: 1, bountyMult: 1, roundBonusMult: 1,
  powerCdMult: 1, powerUsesMult: 1, abilityCdMult: 1,
  startRound: 1, roundCap: 75, sellRefundPct: 70,
};
const SEND_SPACING = 0.35;
const BEAM_INFINITE_RANGE = 9000;
const BOSS_DMG_CAP = 150;
const TARGETING_MODES = ['first', 'last', 'strong', 'close'];

// ---------------------------------------------------------------------------
// Data lookups (tolerate array or keyed-object module shapes)
// ---------------------------------------------------------------------------

function byId(data) {
  const map = Object.create(null);
  const list = Array.isArray(data) ? data : Object.values(data);
  for (const item of list) map[item.id] = item;
  return map;
}

const TOWER_BY_ID = byId(TOWERS);
const ENEMY_BY_ID = byId(ENEMIES);
const SEND_BY_ID = byId(SENDS);
const POWER_BY_ID = byId(POWERS);
const ENEMY_LIST = Array.isArray(ENEMIES) ? ENEMIES : Object.values(ENEMIES);
const SEND_LIST = Array.isArray(SENDS) ? SENDS : Object.values(SENDS);

function roundDef(n) {
  if (Array.isArray(ROUNDS)) {
    const found = ROUNDS.find((r) => r.n === n) || ROUNDS[n - 1];
    if (found && n <= ROUNDS.length) return found;
  } else if (ROUNDS[n]) {
    return ROUNDS[n];
  }
  return scaleRound(n);
}

// Normalize one round into spawn groups: { id, count, interval, delay }
function roundGroups(r) {
  const raw = r.waves || r.groups || r.spawns || [];
  return raw.map((g) => ({
    id: g.id || g.enemy || g.enemyId || g.unit,
    count: g.count != null ? g.count : 1,
    interval: g.interval != null ? g.interval : (g.spacing != null ? g.spacing : 0.8),
    delay: g.delay != null ? g.delay : (g.at != null ? g.at : 0),
  }));
}

function sendEnemyId(unitId) {
  const s = SEND_BY_ID[unitId];
  if (s) return s.enemy || s.enemyId || s.unit || s.id;
  return ENEMY_BY_ID[unitId] ? unitId : null;
}

// Pick a regular (non-boss) enemy of roughly the given tier, used as a
// fallback when a gimmick needs adds and the data does not name them.
function enemyOfTier(tier) {
  const regulars = ENEMY_LIST.filter((e) => !(e.traits && e.traits.boss));
  let exact = regulars.find((e) => e.tier === tier);
  if (exact) return exact.id;
  const sorted = regulars.slice().sort((a, b) => (a.hp || 1) - (b.hp || 1));
  const idx = Math.min(sorted.length - 1, Math.max(0, tier - 1) * 2);
  return sorted[idx] ? sorted[idx].id : (regulars[0] && regulars[0].id);
}

// Recursive default lives cost: itself plus everything inside it.
function livesCostOf(def, depth = 0) {
  if (!def) return 1;
  if (def.livesCost != null) return def.livesCost;
  if (def.lives != null) return def.lives;
  if (depth > 8) return 1;
  let cost = 1;
  if (def.child) {
    const n = def.childCount != null ? def.childCount : 1;
    cost += n * livesCostOf(ENEMY_BY_ID[def.child], depth + 1);
  }
  const split = def.traits && def.traits.split;
  if (split && split.id) {
    cost += (split.count || 1) * livesCostOf(ENEMY_BY_ID[split.id], depth + 1);
  }
  return cost;
}

function normMultishot(v) {
  if (!v) return null;
  if (typeof v === 'number') return { count: v, spreadDeg: 20 };
  return { count: v.count || 2, spreadDeg: v.spreadDeg != null ? v.spreadDeg : 20 };
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// ---------------------------------------------------------------------------
// Sim
// ---------------------------------------------------------------------------

export class Sim {
  constructor({ mapDef, onLeak, onPop, onCash, onRoundEnd, onDefeat, settings }) {
    const noop = () => {};
    this.cfg = { ...DEFAULT_SETTINGS, ...(settings || {}) };
    this.onLeak = onLeak || noop;
    this.onPop = onPop || noop;
    this.onCash = onCash || noop;
    this.onRoundEnd = onRoundEnd || noop;
    this.onDefeat = onDefeat || noop;

    this.mapDef = mapDef;
    this.path = buildPath(mapDef.path || mapDef.points);
    this.pathRadius = mapDef.pathRadius != null ? mapDef.pathRadius : 26;

    this.state = {
      time: 0,
      cash: this.cfg.startCash,
      lives: this.cfg.startLives,
      eco: this.cfg.startEco,
      round: 0,
      roundActive: false,
      defeated: false,
      enemies: [],
      towers: [],
      projectiles: [],
      effects: [],
      incoming: [],          // queued sends: { enemyId, at }
      shieldLives: 0,        // from wallnow ability
      blackoutUntil: 0,      // render-only debuff
      ecoLeechUntil: 0,
      ecoLeechPct: 0,
      frostUntil: 0,         // p_frost global slow field
      frostMult: 1,
      surplusUntil: 0,       // p_surplus eco payout multiplier
      surplusMult: 1,
      overclockUntil: 0,     // p_overclock global rate buff
      overclockMult: 1,
      barrageUntil: 0,       // barrage ability: all towers rate x5
      pathRadius: mapDef.pathRadius != null ? mapDef.pathRadius : 26,
    };

    this._schedule = [];       // round spawn events: { enemyId, at }
    this._scheduleDone = true;
    this._ecoTimer = 0;
    this._lastIncomingAt = 0;
    this._nextUid = 1;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  startRound(n) {
    const s = this.state;
    s.round = n;
    s.roundActive = true;
    const def = roundDef(n);
    this._roundHpMult = def.hpMult || 1;
    const groups = roundGroups(def);
    for (const g of groups) {
      if (!g.id || !ENEMY_BY_ID[g.id]) continue;
      for (let i = 0; i < g.count; i++) {
        this._schedule.push({ enemyId: g.id, at: s.time + g.delay + i * g.interval });
      }
    }
    this._schedule.sort((a, b) => a.at - b.at);
    this._scheduleDone = this._schedule.length === 0;
  }

  // Enemies sent BY an opponent AT me. They arrive immediately, even
  // mid-round, spaced SEND_SPACING apart per unit.
  queueSend(unitId, count) {
    const enemyId = sendEnemyId(unitId);
    if (!enemyId || !ENEMY_BY_ID[enemyId]) return;
    const s = this.state;
    let base = Math.max(s.time, this._lastIncomingAt);
    for (let i = 0; i < count; i++) {
      base += SEND_SPACING;
      s.incoming.push({ enemyId, at: base });
    }
    this._lastIncomingAt = base;
    s.incoming.sort((a, b) => a.at - b.at);
  }

  // I send units at an opponent: charge cost, apply ecoDelta. The network
  // layer broadcasts the actual sendUnits message; the sim only does economy.
  registerOutgoingSend(unitId, count) {
    const s = this.state;
    const def = SEND_BY_ID[unitId];
    if (!def) return false;
    const unlock = def.unlockRound != null ? def.unlockRound : 1;
    if (s.round < unlock) return false;
    const total = Math.round((def.cost || 0) * this.cfg.sendCostMult) * count;
    if (s.cash < total) return false;
    s.cash -= total;
    s.eco = Math.max(0, s.eco + (def.ecoDelta || 0) * count);
    return true;
  }

  placeTower(towerId, x, y) {
    const def = TOWER_BY_ID[towerId];
    if (!def) return null;
    const s = this.state;
    const cost = Math.round(def.cost * this.cfg.towerCostMult);
    if (s.cash < cost) return null;
    if (!this.canPlace(x, y)) return null;
    const t = this._makeTower(def, x, y);
    s.cash -= cost;
    t.spent = cost;
    t.sellValue = Math.floor(cost * (this.cfg.sellRefundPct / 100));
    s.towers.push(t);
    return t;
  }

  canPlace(x, y) {
    if (x < PLACE_MARGIN || x > BOARD_W - PLACE_MARGIN) return false;
    if (y < PLACE_MARGIN || y > BOARD_H - PLACE_MARGIN) return false;
    if (this.path.distToPath(x, y) <= this.pathRadius + PATH_CLEARANCE) return false;
    for (const t of this.state.towers) {
      if (Math.hypot(t.x - x, t.y - y) < TOWER_FOOTPRINT) return false;
    }
    return true;
  }

  // Crossing rule: both paths allowed, but only one path may pass tier 2.
  upgrade(tower, pathIdx) {
    const tier = tower.tiers[pathIdx];
    if (tier >= 4) return false;
    const other = tower.tiers[1 - pathIdx];
    if (tier + 1 >= 3 && other >= 3) return false;
    const path = tower.def.paths[pathIdx];
    const up = (path.upgrades || path)[tier];
    if (!up) return false;
    // upgrades use a separate (cheaper) multiplier so upgrading beats spamming
    // new towers
    const cost = Math.round(up.cost * this.cfg.towerCostMult * this.cfg.upgradeCostMult);
    if (this.state.cash < cost) return false;
    this.state.cash -= cost;
    tower.spent += cost;
    tower.sellValue = Math.floor(tower.spent * (this.cfg.sellRefundPct / 100));
    tower.tiers[pathIdx] = tier + 1;
    if (up.visualAdd) tower.visualTokens.push(up.visualAdd);
    this._applyEffects(tower, up.effects || {});
    return true;
  }

  sellTower(tower) {
    const s = this.state;
    const idx = s.towers.indexOf(tower);
    if (idx === -1) return 0;
    s.towers.splice(idx, 1);
    const refund = Math.floor(tower.spent * (this.cfg.sellRefundPct / 100));
    this._addCash(refund);
    return refund;
  }

  cycleTargeting(tower) {
    const i = TARGETING_MODES.indexOf(tower.targeting);
    tower.targeting = TARGETING_MODES[(i + 1) % TARGETING_MODES.length];
    return tower.targeting;
  }

  useAbility(tower) {
    const s = this.state;
    const ab = tower.ability;
    if (!ab) return false;
    if (s.time < tower.abilityReadyAt) return false;
    if (!this._runAbility(ab.id, tower)) return false;
    tower.abilityReadyAt = s.time + (ab.cooldown || 30) * this.cfg.abilityCdMult;
    return true;
  }

  // Effect on MY board: own buff (positive) or an opponent attack on me.
  applyPower(powerId) {
    const def = POWER_BY_ID[powerId] || {};
    const p = def.params || def;
    const s = this.state;
    const dur = (v) => s.time + (p.dur != null ? p.dur : v);
    switch (powerId) {
      case 'p_cash':
        this._addCash(p.amount != null ? p.amount : 750);
        return true;
      case 'p_overclock':
        s.overclockMult = p.mult != null ? p.mult : 1.5;
        s.overclockUntil = dur(10);
        return true;
      case 'p_frost':
        s.frostMult = p.mult != null ? p.mult : 0.5;
        s.frostUntil = dur(8);
        return true;
      case 'p_medkit':
        s.lives += p.amount != null ? p.amount : 25;
        return true;
      case 'p_surplus':
        s.surplusMult = p.mult != null ? p.mult : 1.5;
        s.surplusUntil = dur(20);
        return true;
      case 'n_blackout':
        s.blackoutUntil = dur(8);
        return true;
      case 'n_jam':
        this._jamTowers(p.count != null ? p.count : 3, p.dur != null ? p.dur : 8);
        return true;
      case 'n_leech':
        s.ecoLeechPct = p.pct != null ? p.pct : 0.3;
        s.ecoLeechUntil = dur(15);
        return true;
      case 'n_haste': {
        const mult = p.mult != null ? p.mult : 1.5;
        const until = dur(6);
        for (const e of s.enemies) {
          e.hasteMult = mult;
          e.hasteUntil = until;
        }
        return true;
      }
      case 'n_strike':
        this._strikeWave(p.wave);
        return true;
      default:
        return false;
    }
  }

  tick(dt) {
    const s = this.state;
    s.time += dt;
    this._tickEco(dt);
    this._tickSpawns();
    this._tickAuras();
    this._tickTowers(dt);
    this._tickProjectiles(dt);
    this._tickEnemies(dt);
    this._cleanup();
    this._checkRoundEnd();
  }

  // -------------------------------------------------------------------------
  // Tower construction & upgrade effects
  // -------------------------------------------------------------------------

  _makeTower(rawDef, x, y) {
    // data nests stats under def.base ({range, fireRate, damage, ...}); flatten
    const b = rawDef.base || {};
    const def = {
      ...rawDef,
      range: b.range != null ? b.range : rawDef.range,
      rate: b.fireRate != null ? b.fireRate : (rawDef.fireRate != null ? rawDef.fireRate : rawDef.rate),
      dmg: b.damage != null ? b.damage : (rawDef.damage != null ? rawDef.damage : rawDef.dmg),
      pierce: b.pierce != null ? b.pierce : rawDef.pierce,
      projSpeed: b.projSpeed != null ? b.projSpeed : rawDef.projSpeed,
      splash: b.splash != null ? b.splash : rawDef.splash,
      aura: b.aura != null ? b.aura : rawDef.aura,
      income: b.income != null ? b.income : rawDef.income,
    };
    return {
      uid: this._nextUid++,
      id: def.id,
      def,
      x,
      y,
      mode: def.mode || def.attack || def.attackMode || 'projectile',
      damageType: def.damageType || 'sharp',
      dmg: def.dmg != null ? def.dmg : (def.damage != null ? def.damage : 1),
      rate: def.rate != null ? def.rate : 1,
      range: def.range != null ? def.range : 120,
      projSpeed: def.projSpeed != null ? def.projSpeed : 360,
      pierce: def.pierce != null ? def.pierce : 1,
      splash: def.splash || 0,
      chain: def.chain || null,
      multishot: normMultishot(def.multishot),
      coneDeg: def.coneDeg != null ? def.coneDeg : 55,
      slow: def.slow || null,           // {mult, dur}
      burn: def.burn || null,           // {dps, dur}
      camoDetect: !!def.camoDetect,
      leadPop: !!def.leadPop,
      stripCamo: !!def.stripCamo,
      stripShield: !!def.stripShield,
      moneyPerPop: def.moneyPerPop || 0,
      aura: def.aura || null,
      income: def.income || null,       // {amount, interval}
      ability: null,
      abilityReadyAt: 0,
      overdriveUntil: 0,
      disabledUntil: 0,
      tiers: [0, 0],
      visualTokens: [],
      spent: def.cost,
      targeting: 'first',
      aim: -Math.PI / 2,
      nextShot: 0,
      incomeTimer: 0,
      pops: 0,
      buff: { rateMult: 1, rangeMult: 1, dmgAdd: 0 },
    };
  }

  _applyEffects(t, fx) {
    if (fx.dmgAdd != null) t.dmg += fx.dmgAdd;
    if (fx.rateMult != null) t.rate *= fx.rateMult;
    if (fx.rangeMult != null) t.range *= fx.rangeMult;
    if (fx.pierceAdd != null) t.pierce += fx.pierceAdd;
    if (fx.projSpeedMult != null) t.projSpeed *= fx.projSpeedMult;
    if (fx.splashSet != null) t.splash = fx.splashSet;
    if (fx.splashMult != null) t.splash *= fx.splashMult;
    if (fx.multishotSet != null) t.multishot = normMultishot(fx.multishotSet);
    if (fx.chainSet != null) t.chain = fx.chainSet;
    if (fx.slowSet != null) t.slow = fx.slowSet;
    if (fx.burnSet != null) t.burn = fx.burnSet;
    if (fx.camoDetect) t.camoDetect = true;
    if (fx.leadPop) t.leadPop = true;
    if (fx.stripCamo) t.stripCamo = true;
    if (fx.stripShield) t.stripShield = true;
    if (fx.moneyPerPop != null) t.moneyPerPop = fx.moneyPerPop;
    if (fx.auraSet != null) t.aura = fx.auraSet;
    if (fx.incomeSet != null) {
      t.income = fx.incomeSet;
      t.incomeTimer = 0;
    }
    if (fx.abilitySet != null) {
      t.ability = fx.abilitySet;
      t.abilityReadyAt = 0;
    }
  }

  // -------------------------------------------------------------------------
  // Effective stats (base + aura buffs + global modifiers)
  // -------------------------------------------------------------------------

  _effDmg(t) {
    return t.dmg + t.buff.dmgAdd;
  }

  _effRange(t) {
    const r = t.range * t.buff.rangeMult;
    // while blacked out a tower can only see/shoot what is close to it, so even
    // an unlimited-range sniper is blinded
    if (this.state.time < this.state.blackoutUntil) return Math.min(r, BLACKOUT_VISION);
    return r;
  }

  _effRate(t) {
    const s = this.state;
    let r = t.rate * t.buff.rateMult;
    if (s.time < s.overclockUntil) r *= s.overclockMult;
    if (s.time < s.barrageUntil) r *= 5;
    if (s.time < t.overdriveUntil) r *= 3;
    return r;
  }

  _towerDisabled(t) {
    return this.state.time < t.disabledUntil;
  }

  _tickAuras() {
    const towers = this.state.towers;
    for (const t of towers) {
      t.buff.rateMult = 1;
      t.buff.rangeMult = 1;
      t.buff.dmgAdd = 0;
    }
    for (const src of towers) {
      if (!src.aura || this._towerDisabled(src)) continue;
      for (const t of towers) {
        if (t === src) continue;
        if (Math.hypot(t.x - src.x, t.y - src.y) > src.range) continue;
        if (src.aura.rateMult != null) t.buff.rateMult *= src.aura.rateMult;
        if (src.aura.rangeMult != null) t.buff.rangeMult *= src.aura.rangeMult;
        if (src.aura.dmgAdd != null) t.buff.dmgAdd += src.aura.dmgAdd;
      }
    }
  }

  // -------------------------------------------------------------------------
  // Targeting
  // -------------------------------------------------------------------------

  _canTarget(t, e) {
    if (e.dead) return false;
    if (e.camo && !t.camoDetect) return false;
    return true;
  }

  _enemiesInRange(t, range) {
    const infinite = range >= BEAM_INFINITE_RANGE;
    const out = [];
    for (const e of this.state.enemies) {
      if (!this._canTarget(t, e)) continue;
      if (infinite || Math.hypot(e.x - t.x, e.y - t.y) <= range) out.push(e);
    }
    return out;
  }

  _pickTarget(t, candidates) {
    if (candidates.length === 0) return null;
    let best = candidates[0];
    for (const e of candidates) {
      switch (t.targeting) {
        case 'last':
          if (e.dist < best.dist) best = e;
          break;
        case 'strong':
          if (e.hp > best.hp) best = e;
          break;
        case 'close': {
          const de = Math.hypot(e.x - t.x, e.y - t.y);
          const db = Math.hypot(best.x - t.x, best.y - t.y);
          if (de < db) best = e;
          break;
        }
        default: // first
          if (e.dist > best.dist) best = e;
      }
    }
    return best;
  }

  // -------------------------------------------------------------------------
  // Tower attacks
  // -------------------------------------------------------------------------

  _tickTowers(dt) {
    const s = this.state;
    for (const t of s.towers) {
      if (this._towerDisabled(t)) continue;
      if (t.mode === 'support') {
        this._tickIncome(t, dt);
        continue;
      }
      const rate = this._effRate(t);
      if (rate <= 0) continue;
      if (s.time < t.nextShot) continue;
      if (this._fireOnce(t)) {
        t.nextShot = s.time + 1 / rate;
      }
    }
  }

  _tickIncome(t, dt) {
    if (!t.income) return;
    t.incomeTimer += dt;
    const interval = t.income.interval || 5;
    while (t.incomeTimer >= interval) {
      t.incomeTimer -= interval;
      this._addCash(t.income.amount || 0);
    }
  }

  _fireOnce(t) {
    switch (t.mode) {
      case 'projectile':
        return this._fireProjectile(t);
      case 'beam':
        return this._fireBeam(t);
      case 'pulse':
        return this._firePulse(t);
      case 'spray':
        return this._fireSpray(t);
      default:
        return false;
    }
  }

  _fireProjectile(t) {
    const target = this._pickTarget(t, this._enemiesInRange(t, this._effRange(t)));
    if (!target) return false;
    const baseAngle = Math.atan2(target.y - t.y, target.x - t.x);
    t.aim = baseAngle;
    const shots = [];
    if (t.multishot && t.multishot.count > 1) {
      const n = t.multishot.count;
      const spread = (t.multishot.spreadDeg * Math.PI) / 180;
      for (let i = 0; i < n; i++) {
        shots.push(baseAngle - spread / 2 + (n > 1 ? (spread * i) / (n - 1) : 0));
      }
    } else {
      shots.push(baseAngle);
    }
    for (const a of shots) {
      this.state.projectiles.push({
        x: t.x,
        y: t.y,
        vx: Math.cos(a) * t.projSpeed,
        vy: Math.sin(a) * t.projSpeed,
        angle: a,
        dmg: this._effDmg(t),
        pierce: t.pierce,
        splash: t.splash,
        chain: t.chain,
        src: t,
        hit: new Set(),
        dieAt: this.state.time + 3,
      });
    }
    return true;
  }

  _fireBeam(t) {
    const target = this._pickTarget(t, this._enemiesInRange(t, this._effRange(t)));
    if (!target) return false;
    t.aim = Math.atan2(target.y - t.y, target.x - t.x);
    this._hitEnemy(t, target, this._effDmg(t));
    this._pushEffect('beam', t.x, t.y, { x2: target.x, y2: target.y }, 0.08);
    return true;
  }

  _firePulse(t) {
    const range = this._effRange(t);
    const hits = this._enemiesInRange(t, range);
    if (hits.length === 0) return false;
    for (const e of hits) this._hitEnemy(t, e, this._effDmg(t));
    this._pushEffect('pulse', t.x, t.y, { r: range }, 0.2);
    return true;
  }

  _fireSpray(t) {
    const range = this._effRange(t);
    const target = this._pickTarget(t, this._enemiesInRange(t, range));
    if (!target) return false;
    const aim = Math.atan2(target.y - t.y, target.x - t.x);
    t.aim = aim;
    const half = ((t.coneDeg / 2) * Math.PI) / 180;
    const dmg = this._effDmg(t);
    for (const e of this._enemiesInRange(t, range)) {
      const a = Math.atan2(e.y - t.y, e.x - t.x);
      if (Math.abs(angleDiff(a, aim)) <= half) this._hitEnemy(t, e, dmg);
    }
    this._pushEffect('spray', t.x, t.y, { angle: aim, r: range, coneDeg: t.coneDeg }, 0.1);
    return true;
  }

  // -------------------------------------------------------------------------
  // Projectiles
  // -------------------------------------------------------------------------

  _tickProjectiles(dt) {
    const s = this.state;
    for (const p of s.projectiles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (s.time >= p.dieAt || p.x < -40 || p.x > BOARD_W + 40 || p.y < -40 || p.y > BOARD_H + 40) {
        p.dead = true;
        continue;
      }
      for (const e of s.enemies) {
        if (p.dead) break;
        if (p.hit.has(e.uid)) continue;
        if (!this._canTarget(p.src, e)) continue;
        if (Math.hypot(e.x - p.x, e.y - p.y) > e.size + 4) continue;
        this._projectileHit(p, e);
      }
    }
    s.projectiles = s.projectiles.filter((p) => !p.dead);
  }

  _projectileHit(p, e) {
    const t = p.src;
    p.hit.add(e.uid);
    this._hitEnemy(t, e, p.dmg);
    if (p.splash > 0) {
      for (const other of this.state.enemies) {
        if (other === e || p.hit.has(other.uid)) continue;
        if (!this._canTarget(t, other)) continue;
        if (Math.hypot(other.x - e.x, other.y - e.y) <= p.splash) {
          p.hit.add(other.uid);
          this._hitEnemy(t, other, p.dmg);
        }
      }
      this._pushEffect('splash', e.x, e.y, { r: p.splash }, 0.15);
    }
    if (p.chain && p.chain.jumps > 0) this._chainZap(p, e);
    p.pierce -= 1;
    if (p.pierce <= 0) p.dead = true;
  }

  _chainZap(p, fromEnemy) {
    const t = p.src;
    let cur = fromEnemy;
    for (let j = 0; j < p.chain.jumps; j++) {
      let next = null;
      let bestD = p.chain.range || 90;
      for (const e of this.state.enemies) {
        if (p.hit.has(e.uid) || !this._canTarget(t, e)) continue;
        const d = Math.hypot(e.x - cur.x, e.y - cur.y);
        if (d <= bestD) {
          bestD = d;
          next = e;
        }
      }
      if (!next) break;
      p.hit.add(next.uid);
      this._hitEnemy(t, next, p.dmg);
      this._pushEffect('chain', cur.x, cur.y, { x2: next.x, y2: next.y }, 0.1);
      cur = next;
    }
  }

  // -------------------------------------------------------------------------
  // Damage & death
  // -------------------------------------------------------------------------

  // A single hit from a tower: strips, shield, immunity, on-hit slow/burn.
  _hitEnemy(t, e, amount) {
    if (e.dead) return;
    if (t.stripCamo) e.camo = false;
    if (t.stripShield) e.shield = 0;
    const immune = e.immune.includes(t.damageType);
    if (immune && !t.leadPop) return;
    if (e.shield > 0) {
      e.shield -= 1;
      return;
    }
    if (t.slow) {
      e.slowMult = t.slow.mult != null ? t.slow.mult : 0.6;
      e.slowUntil = this.state.time + (t.slow.dur != null ? t.slow.dur : 1.5);
    }
    if (t.burn) {
      e.burnDps = t.burn.dps != null ? t.burn.dps : 5;
      e.burnUntil = this.state.time + (t.burn.dur != null ? t.burn.dur : 3);
    }
    this._damage(e, amount, t);
  }

  // Raw hp loss (already past shield and immunity). opts.ignoreCap for headshot.
  _damage(e, amount, tower, opts = {}) {
    if (e.dead || amount <= 0) return;
    let dmg = amount;
    if (e.dmgCap > 0 && !opts.ignoreCap) dmg = Math.min(dmg, e.dmgCap);
    e.hp -= dmg;
    this._checkGimmickThresholds(e);
    if (e.hp <= 0) this._killEnemy(e, tower);
  }

  _checkGimmickThresholds(e) {
    const frac = Math.max(0, e.hp / e.maxHp);
    if (e.id === 'boss_overlord') {
      const phases = [0.75, 0.5, 0.25];
      while (e.phaseIdx < phases.length && frac <= phases[e.phaseIdx]) {
        e.phaseIdx += 1;
        this._bossPhase(e);
      }
    }
    if (e.id === 'mb_splitter') {
      const quarters = Math.min(4, Math.floor((1 - frac) * 4));
      while (e.splitEmitted < quarters) {
        e.splitEmitted += 1;
        this._emitSplitterWave(e);
      }
    }
  }

  _bossPhase(e) {
    const escortId = (e.def.traits && e.def.traits.escortId) || enemyOfTier(4);
    const count = (e.def.traits && e.def.traits.escorts) || 6;
    for (let i = 0; i < count; i++) {
      this._spawnEnemy(escortId, Math.max(0, e.dist - 10 - i * 14));
    }
    e.burstUntil = this.state.time + 2; // brief speed burst
    this._pushEffect('bossphase', e.x, e.y, {}, 0.6);
  }

  _emitSplitterWave(e) {
    const id = (e.def.traits && e.def.traits.splitId) || enemyOfTier(2);
    for (let i = 0; i < 6; i++) {
      this._spawnEnemy(id, Math.max(0, e.dist - 6 - i * 10));
    }
    this._pushEffect('split', e.x, e.y, {}, 0.4);
  }

  _killEnemy(e, tower) {
    if (e.dead) return;
    e.dead = true;
    e.hp = 0;
    if (e.id === 'mb_splitter') {
      while (e.splitEmitted < 4) {
        e.splitEmitted += 1;
        this._emitSplitterWave(e);
      }
    }
    const base = e.def.bounty != null ? e.def.bounty : 1;
    const bounty = Math.max(1, Math.round(base * this.cfg.bountyMult)) + (tower ? tower.moneyPerPop : 0);
    this._addCash(bounty);
    if (tower) tower.pops += 1;
    this.state.popped = (this.state.popped || 0) + 1;
    this.onPop(e, tower);
    // child spawning (bloon layering)
    if (e.def.child && ENEMY_BY_ID[e.def.child]) {
      const n = e.def.childCount != null ? e.def.childCount : 1;
      for (let i = 0; i < n; i++) {
        this._spawnEnemy(e.def.child, Math.max(0, e.dist - i * 8), { camo: e.camo, sent: e.sent });
      }
    }
    const split = e.def.traits && e.def.traits.split;
    if (split && split.id && ENEMY_BY_ID[split.id]) {
      for (let i = 0; i < (split.count || 1); i++) {
        this._spawnEnemy(split.id, Math.max(0, e.dist - i * 8), { sent: e.sent });
      }
    }
  }

  // -------------------------------------------------------------------------
  // Enemies
  // -------------------------------------------------------------------------

  _spawnEnemy(id, dist = 0, overrides = {}) {
    const def = ENEMY_BY_ID[id];
    if (!def) return null;
    const traits = def.traits || {};
    const pos = this.path.posAt(dist);
    // compounding per-round ramp gives mid-late handcrafted rounds real threat
    const ramp = overrides.sent ? 1 : (1 + ROUND_HP_RAMP * Math.max(0, this.state.round - ROUND_HP_RAMP_FROM));
    const hpMult = (this._roundHpMult || 1) * this.cfg.enemyHpMult * ramp;
    const hp = Math.max(1, Math.round((def.hp != null ? def.hp : 1) * hpMult));
    const e = {
      uid: this._nextUid++,
      id,
      def,
      hp,
      maxHp: hp,
      dist,
      // data scale: 1.0 = 60 px/s
      speed: (def.speed != null ? def.speed : 0.7) * 60 * this.cfg.enemySpeedMult,
      x: pos.x,
      y: pos.y,
      px: pos.x,
      py: pos.y,
      angle: pos.angle,
      size: def.size != null ? def.size : 10,
      color: def.color,
      shape: def.shape,
      tier: def.tier,
      camo: overrides.camo != null ? overrides.camo : !!traits.camo,
      sent: !!overrides.sent, // enemy sent by an opponent (does not gate round end)
      shield: traits.shield || 0,
      regen: traits.regen || 0,
      immune: traits.immune || [],
      boss: !!traits.boss,
      dmgCap: traits.dmgCap != null ? traits.dmgCap : (traits.boss ? BOSS_DMG_CAP : 0),
      livesCost: livesCostOf(def),
      slowUntil: 0,
      slowMult: 1,
      freezeUntil: 0,
      hasteUntil: 0,
      hasteMult: 1,
      burstUntil: 0,
      burnUntil: 0,
      burnDps: 0,
      gimmickTimer: 0,
      phaseIdx: 0,
      splitEmitted: 0,
      dead: false,
    };
    this.state.enemies.push(e);
    return e;
  }

  _speedMult(e) {
    const s = this.state;
    if (s.time < e.freezeUntil) return 0;
    let m = 1;
    if (s.time < e.slowUntil) m *= e.slowMult;
    if (s.time < s.frostUntil) m *= s.frostMult;
    if (s.time < e.hasteUntil) m *= e.hasteMult;
    if (s.time < e.burstUntil) m *= 1.8;
    return m;
  }

  _tickEnemies(dt) {
    const s = this.state;
    // iterate over a snapshot index range; newly spawned children are
    // processed starting next tick
    const count = s.enemies.length;
    for (let i = 0; i < count; i++) {
      const e = s.enemies[i];
      if (e.dead) continue;
      e.px = e.x;
      e.py = e.y;
      this._tickGimmick(e, dt);
      if (e.dead) continue;
      // burn: bypasses shield and immunity (applied on-hit by the tower)
      if (s.time < e.burnUntil && e.burnDps > 0) {
        this._damage(e, e.burnDps * dt, null);
        if (e.dead) continue;
      }
      if (e.regen > 0) e.hp = Math.min(e.maxHp, e.hp + e.regen * dt);
      e.dist += e.speed * this._speedMult(e) * dt;
      if (e.dist >= this.path.length) {
        this._leak(e);
        continue;
      }
      const pos = this.path.posAt(e.dist);
      e.x = pos.x;
      e.y = pos.y;
      e.angle = pos.angle;
    }
  }

  _tickGimmick(e, dt) {
    const s = this.state;
    if (e.id === 'mb_healer') {
      e.gimmickTimer += dt;
      if (e.gimmickTimer >= 3) {
        e.gimmickTimer -= 3;
        const heal = (e.def.traits && e.def.traits.heal) || 40;
        for (const other of s.enemies) {
          if (other.dead || other === e) continue;
          if (Math.hypot(other.x - e.x, other.y - e.y) <= 120) {
            other.hp = Math.min(other.maxHp, other.hp + heal);
          }
        }
        this._pushEffect('heal', e.x, e.y, { r: 120 }, 0.4);
      }
    } else if (e.id === 'mb_warden') {
      e.gimmickTimer += dt;
      if (e.gimmickTimer >= 4) {
        e.gimmickTimer -= 4;
        for (const other of s.enemies) {
          if (other.dead || other === e) continue;
          if (Math.hypot(other.x - e.x, other.y - e.y) <= 100) {
            other.shield = Math.max(other.shield, 2);
          }
        }
        this._pushEffect('shieldpulse', e.x, e.y, { r: 100 }, 0.4);
      }
    }
  }

  // Enemy reached path end: costs lives, removed, NO child spawn.
  _leak(e) {
    const s = this.state;
    e.dead = true;
    let cost = e.livesCost;
    if (s.shieldLives > 0) {
      const absorbed = Math.min(s.shieldLives, cost);
      s.shieldLives -= absorbed;
      cost -= absorbed;
    }
    if (cost > 0) s.lives = Math.max(0, s.lives - cost);
    this.onLeak(e, e.livesCost);
    if (s.lives <= 0 && !s.defeated) {
      s.defeated = true;
      this.onDefeat();
      // sim keeps running so the player can spectate
    }
  }

  // -------------------------------------------------------------------------
  // Spawning, economy, round flow
  // -------------------------------------------------------------------------

  _tickSpawns() {
    const s = this.state;
    while (this._schedule.length > 0 && this._schedule[0].at <= s.time) {
      this._spawnEnemy(this._schedule.shift().enemyId, 0);
    }
    if (this._schedule.length === 0) this._scheduleDone = true;
    while (s.incoming.length > 0 && s.incoming[0].at <= s.time) {
      this._spawnEnemy(s.incoming.shift().enemyId, 0, { sent: true });
    }
  }

  _tickEco(dt) {
    const s = this.state;
    this._ecoTimer += dt;
    while (this._ecoTimer >= 1) {
      this._ecoTimer -= 1;
      let gain = (s.eco / ECO_DIVISOR) * this.cfg.ecoMult;
      if (s.time < s.surplusUntil) gain *= s.surplusMult;
      if (s.time < s.ecoLeechUntil) gain *= 1 - s.ecoLeechPct;
      this._addCash(gain);
    }
  }

  _checkRoundEnd() {
    const s = this.state;
    if (!s.roundActive) return;
    if (!this._scheduleDone) return;
    // a round ends once the NATURAL (round-spawned) enemies are cleared. Units
    // sent by opponents, and any still queued to arrive, do not hold it open.
    for (let i = 0; i < s.enemies.length; i++) {
      if (!s.enemies[i].dead && !s.enemies[i].sent) return;
    }
    s.roundActive = false;
    this._addCash(Math.round((35 + 5 * s.round) * this.cfg.roundBonusMult));
    this.onRoundEnd(s.round);
  }

  _addCash(n) {
    if (n === 0) return;
    this.state.cash += n;
    this.onCash(n);
  }

  _cleanup() {
    const s = this.state;
    s.enemies = s.enemies.filter((e) => !e.dead);
    s.effects = s.effects.filter((f) => f.until > s.time);
  }

  _pushEffect(kind, x, y, extra, dur) {
    this.state.effects.push({ kind, x, y, ...extra, until: this.state.time + dur });
  }

  // -------------------------------------------------------------------------
  // Powers helpers
  // -------------------------------------------------------------------------

  _jamTowers(count, dur) {
    const s = this.state;
    const pool = s.towers.filter((t) => !this._towerDisabled(t));
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      const t = pool.splice(idx, 1)[0];
      t.disabledUntil = s.time + dur;
    }
  }

  // n_strike: instant bonus wave at me, ignores send costs.
  _strikeWave(wave) {
    let entries;
    if (Array.isArray(wave)) {
      entries = wave;
    } else if (wave && (wave.id || wave.unitId)) {
      entries = [wave];
    } else {
      // default wave: 8 of the strongest send currently in the data
      const sorted = SEND_LIST.slice().sort((a, b) => (b.cost || 0) - (a.cost || 0));
      const pick = sorted.find((u) => (u.unlockRound || 1) <= Math.max(1, this.state.round)) || sorted[0];
      entries = pick ? [{ id: pick.id, count: 8 }] : [];
    }
    for (const w of entries) {
      this.queueSend(w.id || w.unitId, w.count != null ? w.count : 1);
    }
  }

  // -------------------------------------------------------------------------
  // Tier-4 abilities
  // -------------------------------------------------------------------------

  _runAbility(id, tower) {
    const s = this.state;
    switch (id) {
      case 'barrage': // every tower fires 5x rate for 8s
        s.barrageUntil = s.time + 8;
        return true;
      case 'bigfreeze': // freeze all enemies 4s
        for (const e of s.enemies) e.freezeUntil = s.time + 4;
        this._pushEffect('bigfreeze', BOARD_W / 2, BOARD_H / 2, {}, 0.5);
        return true;
      case 'airstrike': { // 900 blast dmg split over all enemies
        const live = s.enemies.filter((e) => !e.dead);
        if (live.length === 0) return true;
        const per = 900 / live.length;
        for (const e of live) {
          if (e.immune.includes('blast') && !tower.leadPop) continue;
          if (e.shield > 0) {
            e.shield -= 1;
            continue;
          }
          this._damage(e, per, tower);
        }
        this._pushEffect('airstrike', BOARD_W / 2, BOARD_H / 2, {}, 0.5);
        return true;
      }
      case 'cashdrop':
        this._addCash(1500);
        return true;
      case 'overdrive': // this tower rate x3 for 20s
        tower.overdriveUntil = s.time + 20;
        return true;
      case 'wallnow': // +50 lives shield, consumed by leaks before lives
        s.shieldLives += 50;
        return true;
      case 'meltdown': // all enemies burn 30 dps 10s
        for (const e of s.enemies) {
          e.burnDps = Math.max(e.burnDps, 30);
          e.burnUntil = Math.max(e.burnUntil, s.time + 10);
        }
        this._pushEffect('meltdown', BOARD_W / 2, BOARD_H / 2, {}, 0.5);
        return true;
      case 'headshot': { // kill strongest non-boss; bosses take 500 instead
        let best = null;
        for (const e of s.enemies) {
          if (e.dead) continue;
          if (!best || e.hp > best.hp) best = e;
        }
        if (!best) return true;
        if (best.boss) this._damage(best, 500, tower, { ignoreCap: true });
        else this._killEnemy(best, tower);
        this._pushEffect('headshot', best.x, best.y, {}, 0.4);
        return true;
      }
      case 'jackpot': // income towers trigger instantly at x5
        for (const t of s.towers) {
          if (!t.income || this._towerDisabled(t)) continue;
          this._addCash((t.income.amount || 0) * 5);
          t.incomeTimer = 0;
        }
        return true;
      case 'magnet': // all enemies knocked back 150px along the path
        for (const e of s.enemies) {
          if (e.dead) continue;
          e.dist = Math.max(0, e.dist - 150);
          const pos = this.path.posAt(e.dist);
          e.x = pos.x;
          e.y = pos.y;
          e.px = pos.x;
          e.py = pos.y;
          e.angle = pos.angle;
        }
        this._pushEffect('magnet', tower.x, tower.y, {}, 0.4);
        return true;
      default:
        return false;
    }
  }
}
