// Headless validation: data integrity + sim smoke + rough balance. Run: node test/validate.mjs
import TOWERS from '../js/data/towers.js';
import ENEMIES from '../js/data/enemies.js';
import ROUNDS, { scaleRound } from '../js/data/rounds.js';
import SENDS from '../js/data/sends.js';
import POWERS from '../js/data/powers.js';
import MAPS from '../js/data/maps.js';
import EMOTES from '../js/data/emotes.js';
import { Sim } from '../js/sim.js';

let fails = 0;
function check(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); fails++; }
}

const EFFECT_KEYS = new Set(['dmgAdd', 'rateMult', 'rangeMult', 'pierceAdd', 'projSpeedMult', 'splashSet', 'splashMult', 'multishotSet', 'chainSet', 'slowSet', 'burnSet', 'camoDetect', 'leadPop', 'stripCamo', 'stripShield', 'moneyPerPop', 'auraSet', 'incomeSet', 'abilitySet']);
const ABILITY_IDS = new Set(['barrage', 'bigfreeze', 'airstrike', 'cashdrop', 'overdrive', 'wallnow', 'meltdown', 'headshot', 'jackpot', 'magnet']);
const VISUAL_TOKENS = new Set(['barrel2', 'barrelLong', 'barrelWide', 'drum', 'dish', 'blades', 'ring', 'spikes', 'core', 'fins', 'scope', 'coil', 'tank', 'crown', 'twin']);
const POWER_IDS = new Set(['p_cash', 'p_overclock', 'p_frost', 'p_medkit', 'p_surplus', 'n_blackout', 'n_jam', 'n_leech', 'n_haste', 'n_strike']);
const DMG_TYPES = new Set(['sharp', 'blast', 'energy', 'cold', 'toxic']);

// ---- towers ----
check(TOWERS.length === 10, 'need 10 towers, got ' + TOWERS.length);
let abilityCount = 0;
for (const t of TOWERS) {
  check(t.id && t.name && t.cost > 0, 'tower basic fields: ' + t.id);
  check(t.desc && t.desc.length <= 70, 'tower desc len: ' + t.id);
  check(t.paths && t.paths.length === 2, 'tower needs 2 paths: ' + t.id);
  check(DMG_TYPES.has(t.damageType), 'tower damageType: ' + t.id);
  for (const p of t.paths) {
    check(p.upgrades.length === 4, 'path needs 4 upgrades: ' + t.id + '/' + p.name);
    for (const u of p.upgrades) {
      check(u.name && u.cost > 0 && u.desc, 'upgrade fields: ' + t.id + '/' + u.name);
      check(u.desc.length <= 80, 'upgrade desc len: ' + t.id + '/' + u.name + ' (' + u.desc.length + ')');
      for (const k of Object.keys(u.effects || {})) {
        check(EFFECT_KEYS.has(k), 'unknown effect key "' + k + '" in ' + t.id + '/' + u.name);
      }
      if (u.effects && u.effects.abilitySet) {
        abilityCount++;
        check(ABILITY_IDS.has(u.effects.abilitySet.id), 'unknown ability id ' + u.effects.abilitySet.id + ' in ' + t.id);
      }
      if (u.visualAdd) check(VISUAL_TOKENS.has(u.visualAdd), 'unknown visual token "' + u.visualAdd + '" in ' + t.id + '/' + u.name);
    }
  }
}
check(abilityCount >= 4, 'need >=4 tier-4 abilities, got ' + abilityCount);
check(new Set(TOWERS.map(t => t.id)).size === 10, 'tower ids unique');

// ---- enemies ----
const eIds = new Set(ENEMIES.map(e => e.id));
check(ENEMIES.length >= 19, 'need >=19 enemies, got ' + ENEMIES.length);
check(eIds.has('boss_overlord'), 'boss_overlord exists');
const minibosses = ENEMIES.filter(e => e.id.startsWith('mb_'));
check(minibosses.length === 3, 'need 3 minibosses');
for (const e of ENEMIES) {
  check(e.hp > 0 && e.speed > 0 && e.bounty >= 0 && e.livesCost > 0, 'enemy stats: ' + e.id);
  if (e.child) check(eIds.has(e.child), 'enemy child exists: ' + e.id + ' -> ' + e.child);
  for (const im of (e.traits && e.traits.immune) || []) check(DMG_TYPES.has(im), 'immune type: ' + e.id + '/' + im);
}

// ---- rounds ----
check(ROUNDS.length === 45, 'need 45 handcrafted rounds, got ' + ROUNDS.length);
for (const r of ROUNDS) {
  check(r.groups && r.groups.length > 0, 'round has groups: ' + r.n);
  for (const g of r.groups) {
    check(eIds.has(g.enemy), 'round ' + r.n + ' unknown enemy ' + g.enemy);
    check(g.count > 0 && g.spacing >= 0, 'round ' + r.n + ' group numbers');
  }
}
const r50 = scaleRound(50);
check(r50 && r50.groups && r50.groups.length > 0 && r50.hpMult > 1, 'scaleRound(50) works');
check(ROUNDS[44].groups.some(g => g.enemy === 'boss_overlord'), 'boss at round 45');

// ---- sends ----
check(SENDS.length >= 12, 'need >=12 sends, got ' + SENDS.length);
for (const s of SENDS) {
  check(eIds.has(s.enemy), 'send enemy exists: ' + s.id);
  check(s.cost > 0 && typeof s.ecoDelta === 'number' && s.unlockRound >= 1, 'send numbers: ' + s.id);
}

// ---- powers ----
check(POWERS.length === 10, 'need 10 powers');
for (const p of POWERS) {
  check(POWER_IDS.has(p.id), 'power id known: ' + p.id);
  check(p.cooldown > 0 && p.uses > 0 && p.desc && p.desc.length <= 90, 'power fields: ' + p.id);
}
check(POWERS.filter(p => p.type === 'pos').length === 5, '5 positive powers');
check(POWERS.filter(p => p.type === 'neg').length === 5, '5 negative powers');

// ---- maps ----
check(MAPS.length >= 6, 'need >=6 maps, got ' + MAPS.length);
for (const m of MAPS) {
  check(m.path && m.path.length >= 4, 'map path points: ' + m.id);
  const [sx, sy] = m.path[0], [ex, ey] = m.path[m.path.length - 1];
  const off = (x, y) => x < -10 || x > 1290 || y < -10 || y > 730;
  check(off(sx, sy), 'map path starts offscreen: ' + m.id);
  check(off(ex, ey), 'map path ends offscreen: ' + m.id);
  let len = 0;
  for (let i = 1; i < m.path.length; i++) len += Math.hypot(m.path[i][0] - m.path[i - 1][0], m.path[i][1] - m.path[i - 1][1]);
  check(len > 1000, 'map path long enough: ' + m.id + ' (' + Math.round(len) + 'px)');
}
check(MAPS.filter(m => m.bg && m.bg.type === 'image').length >= 2, 'need 2 image maps');

// ---- emotes ----
check(EMOTES.length >= 14, 'need >=14 emotes');
check(!JSON.stringify([TOWERS, POWERS, EMOTES, SENDS]).includes('—'), 'no em dashes in copy');

// ---- sim smoke: no towers -> death; reasonable build -> survives early rounds ----
function fakeMap() { return MAPS[0]; }
function runGame({ build, throughRound }) {
  let defeated = false, ended = -1;
  const sim = new Sim({
    mapDef: fakeMap(),
    onLeak: () => {}, onPop: () => {}, onCash: () => {},
    onRoundEnd: (n) => { ended = n; },
    onDefeat: () => { defeated = true; },
  });
  sim.state.cash = 1e9; // free build for DPS checks
  for (const b of build) {
    const t = sim.placeTower(b.id, b.x, b.y);
    if (!t) { console.error('FAIL: test build cannot place', b.id, 'at', b.x, b.y); fails++; continue; }
    for (const pi of b.ups || []) sim.upgrade(t, pi);
  }
  sim.state.cash = 650;
  const GAP = 3; // seconds between a round finishing spawning and the next
  for (let n = 1; n <= throughRound && !defeated; n++) {
    ended = -1;
    sim.startRound(n);
    let ticks = 0;
    // run until the round finishes SPAWNING (BTD cadence), then a gap during
    // which enemies keep walking and may leak
    while (ended !== n && !defeated && ticks < 30 * 120) { sim.tick(1 / 30); ticks++; }
    if (ended !== n && !defeated) { console.error('FAIL: round ' + n + ' never finished spawning'); fails++; break; }
    for (let i = 0; i < GAP * 30 && !defeated; i++) sim.tick(1 / 30);
  }
  // let the board resolve: stragglers either die or leak
  for (let i = 0; i < 30 * 40 && !defeated; i++) sim.tick(1 / 30);
  return { defeated, lives: sim.state.lives };
}

// find buildable spots near the path of map 0
import { buildPath } from '../js/path.js';
const bp = buildPath(MAPS[0].path);
function spotsNearPath(count, dist) {
  const out = [];
  for (let d = 100; d < bp.length - 100 && out.length < count; d += 90) {
    const p = bp.posAt(d);
    for (const side of [-1, 1]) {
      const x = p.x + Math.cos(p.angle + Math.PI / 2) * dist * side;
      const y = p.y + Math.sin(p.angle + Math.PI / 2) * dist * side;
      if (x > 30 && x < 1250 && y > 30 && y < 690) { out.push({ x, y }); if (out.length >= count) break; }
    }
  }
  return out;
}

{
  const r = runGame({ build: [], throughRound: 6 });
  check(r.defeated, 'no towers should mean defeat by round 6 (lives left: ' + r.lives + ')');
}
{
  const spots = spotsNearPath(8, 70);
  const ids = TOWERS.filter(t => t.mode !== 'support').slice(0, 4).map(t => t.id);
  const build = spots.map((s, i) => ({ id: ids[i % ids.length], x: s.x, y: s.y, ups: [0, 0, 1, 1] }));
  const r = runGame({ build, throughRound: 12 });
  check(!r.defeated, 'strong maxed-ish build should survive round 12');
}

console.log(fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECKS FAILED');
process.exit(fails ? 1 : 0);
