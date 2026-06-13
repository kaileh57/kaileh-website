// js/ui/hud.js - in-game HUD: top bar, bottom bar, send strip, right panel,
// selected-tower card, powers, abilities, emotes, toast.
//
// Contract:
//   initHud({
//     towers: [towerDef],            all 10 tower defs {id,name,cost,desc,paths:[[up x4],[up x4]],...}
//     sends:  [sendDef],             {id,name,cost,ecoDelta,unlockRound}
//     powers: [powerDef],            MY 3 picked defs {id,name,desc,cooldown,uses,type}
//     emotes: [emoteDef],            {id,text} (plain strings also accepted)
//     callbacks: {
//       onPickTower(id), onCycleTarget(towerRef), onUpgrade(towerRef, pathIdx),
//       onSell(towerRef), onAbility(towerRef), onSendUnits(unitId, count),
//       onUsePower(powerId), onTargetPlayer(peerId), onEmote(emoteId)
//     },
//     drawTowerIcon(canvas, towerDef)   renders a mini procedural tower icon
//   })
//
//   updateHud(simState, roster, myTarget, powerStates)   call at ~10 Hz
//     simState (sim.state): { cash, lives, eco, round, nextRoundIn (s or null),
//                             towers:[towerRef] }
//     towerRef: { def, tiers:[a,b], targetMode?, sellValue?,
//                 ability?:{id,name,cooldown,cd} }   (cd = seconds remaining, 0 = ready)
//     roster: [{id,name,color,lives,eco,round,dead}]   includes me (id === myId not needed,
//             rows are click-to-target; main.js may pass me with dead/me semantics it wants)
//     myTarget: peerId or null (highlighted row)
//     powerStates: { [powerId]: {cd, cdMax, uses} }   cd seconds remaining, 0 = ready
//
//   setSelected(towerOrNull)   show/hide the side tower card
//   flashMsg(text)             small toast for 2 s, max 1 visible
//   showEmote(fromId, text)    stamp an emote next to that player's row for 2.5 s
//
// Keyboard handling lives in main.js, not here.

let H = null; // hud session state

export function initHud({ towers, sends, powers, emotes, callbacks, drawTowerIcon }) {
  H = {
    cb: callbacks,
    sendDefs: sends,
    powerDefs: powers,
    sendCount: 1,
    selected: null,
    lastState: null,
    cardSig: '',
    cardBuyBtns: [],      // [{btn, cost}] for in-place disabled refresh
    cardAbilityBtn: null,
    towerBtns: [],        // [{btn, cost}]
    sendBtns: [],         // [{btn, def, infoEl, lockEl}]
    powerBtns: new Map(), // powerId -> {btn, sweep, subEl}
    abilityBtns: new Map(), // towerRef -> {btn, sweep, subEl}
    playerRows: new Map(),  // peerId -> {row, nameEl, lEl, eEl, rEl}
    emoteStamps: new Map(), // peerId -> timeout id
    toastTimer: null,
  };

  buildTowerBar(towers, drawTowerIcon);
  buildSendStrip();
  buildPowerBar();
  buildEmotes(emotes);

  document.getElementById('hud-abilities').innerHTML = '';
  document.getElementById('hud-players').innerHTML = '';
  setSelected(null);
}

/* ---------- build: bottom tower bar ---------- */

function buildTowerBar(towers, drawTowerIcon) {
  const wrap = document.getElementById('hud-towers');
  wrap.innerHTML = '';
  towers.forEach((def, i) => {
    const btn = document.createElement('button');
    btn.className = 'btn tower-btn';
    btn.title = def.desc || '';
    const key = document.createElement('span');
    key.className = 'tb-key';
    key.textContent = String((i + 1) % 10);
    btn.appendChild(key);
    const cv = document.createElement('canvas');
    cv.width = 32;
    cv.height = 32;
    btn.appendChild(cv);
    const nm = document.createElement('span');
    nm.className = 'tb-name';
    nm.textContent = def.name;
    btn.appendChild(nm);
    const cost = document.createElement('span');
    cost.className = 'tb-cost';
    cost.textContent = '$' + def.cost;
    btn.appendChild(cost);
    btn.addEventListener('click', () => H.cb.onPickTower(def.id));
    wrap.appendChild(btn);
    H.towerBtns.push({ btn, cost: def.cost });
    try { drawTowerIcon(cv, def); } catch (e) { /* icon render failed, leave blank */ }
  });
}

/* ---------- build: send strip ---------- */

function buildSendStrip() {
  const wrap = document.getElementById('hud-sends');
  wrap.innerHTML = '';
  const x1 = document.getElementById('send-x1');
  const x10 = document.getElementById('send-x10');
  const setCount = (n) => {
    H.sendCount = n;
    x1.classList.toggle('toggle-on', n === 1);
    x10.classList.toggle('toggle-on', n === 10);
    refreshSendButtons();
  };
  x1.onclick = () => setCount(1);
  x10.onclick = () => setCount(10);
  setCount(1);

  for (const def of H.sendDefs) {
    const btn = document.createElement('button');
    btn.className = 'btn send-btn';
    const nm = document.createElement('span');
    nm.className = 'sb-name';
    nm.textContent = def.name || def.id;
    btn.appendChild(nm);
    const info = document.createElement('span');
    info.className = 'sb-info';
    btn.appendChild(info);
    const lock = document.createElement('span');
    lock.className = 'sb-lock hidden';
    lock.textContent = 'R' + (def.unlockRound != null ? def.unlockRound : '?');
    btn.appendChild(lock);
    btn.addEventListener('click', () => H.cb.onSendUnits(def.id, H.sendCount));
    wrap.appendChild(btn);
    H.sendBtns.push({ btn, def, infoEl: info, lockEl: lock });
  }
  refreshSendButtons();
}

function refreshSendButtons() {
  if (!H) return;
  const st = H.lastState;
  const round = st ? st.round : 0;
  const cash = st ? st.cash : 0;
  for (const { btn, def, infoEl, lockEl } of H.sendBtns) {
    const locked = round < (def.unlockRound || 0);
    lockEl.classList.toggle('hidden', !locked);
    infoEl.classList.toggle('hidden', locked);
    if (!locked) {
      const eco = (def.ecoDelta || 0) * H.sendCount;
      const ecoCls = eco >= 0 ? 'eco-up' : 'eco-down';
      infoEl.innerHTML = '';
      const c = document.createElement('span');
      c.textContent = '$' + def.cost * H.sendCount + ' ';
      infoEl.appendChild(c);
      const e = document.createElement('span');
      e.className = ecoCls;
      e.textContent = (eco >= 0 ? '+' : '') + eco;
      infoEl.appendChild(e);
    }
    btn.disabled = locked || cash < def.cost * H.sendCount;
  }
}

/* ---------- build: power bar ---------- */

function buildPowerBar() {
  const wrap = document.getElementById('hud-powers');
  wrap.innerHTML = '';
  H.powerBtns.clear();
  for (const def of H.powerDefs) {
    const neg = def.type === 'neg' || (!def.type && String(def.id).startsWith('n_'));
    const btn = document.createElement('button');
    btn.className = 'btn cd-btn ' + (neg ? 'power-neg' : 'power-pos');
    btn.title = def.desc || '';
    const nm = document.createElement('span');
    nm.className = 'cd-name';
    nm.textContent = def.name || def.id;
    btn.appendChild(nm);
    const sub = document.createElement('span');
    sub.className = 'cd-sub';
    sub.textContent = 'READY x' + (def.uses != null ? def.uses : '?');
    btn.appendChild(sub);
    const sweep = document.createElement('span');
    sweep.className = 'cdsweep';
    btn.appendChild(sweep);
    btn.addEventListener('click', () => H.cb.onUsePower(def.id));
    wrap.appendChild(btn);
    H.powerBtns.set(def.id, { btn, sweep, subEl: sub });
  }
}

/* ---------- build: emote popover ---------- */

function buildEmotes(emotes) {
  const grid = document.getElementById('hud-emotes');
  const toggle = document.getElementById('btn-emote');
  grid.innerHTML = '';
  emotes.forEach((e, i) => {
    const id = typeof e === 'string' ? i : e.id;
    const text = typeof e === 'string' ? e : e.text;
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = text;
    btn.addEventListener('click', () => {
      grid.classList.add('hidden');
      H.cb.onEmote(id);
    });
    grid.appendChild(btn);
  });
  toggle.onclick = (ev) => {
    ev.stopPropagation();
    grid.classList.toggle('hidden');
  };
  if (H.outsideClick) document.removeEventListener('click', H.outsideClick);
  H.outsideClick = (ev) => {
    if (!grid.classList.contains('hidden') && !grid.contains(ev.target)) {
      grid.classList.add('hidden');
    }
  };
  document.addEventListener('click', H.outsideClick);
}

// main.js keyboard handler can call this for the E key.
export function toggleEmoteMenu() {
  document.getElementById('hud-emotes').classList.toggle('hidden');
}

/* ---------- update (call at ~10 Hz) ---------- */

export function updateHud(simState, roster, myTarget, powerStates) {
  if (!H) return;
  H.lastState = simState;

  // top bar
  document.getElementById('hud-lives').textContent = String(simState.lives);
  document.getElementById('hud-cash').textContent = '$' + Math.floor(simState.cash);
  document.getElementById('hud-eco').textContent = String(Math.floor(simState.eco));
  document.getElementById('hud-round').textContent =
    simState.round > 45 ? String(simState.round) : simState.round + '/45';
  const t = simState.nextRoundIn;
  document.getElementById('hud-timer').textContent =
    t != null && t > 0 ? Math.ceil(t) + 's' : '--';

  // tower buttons: lock when cash short
  for (const { btn, cost } of H.towerBtns) {
    btn.disabled = simState.cash < cost;
  }

  refreshSendButtons();
  updatePlayerRows(roster, myTarget);
  updatePowerBar(powerStates || {});
  updateAbilityBar(simState.towers || [], simState.time || 0);
  updateTowerCard(simState);
}

/* ---------- player rows ---------- */

function updatePlayerRows(roster, myTarget) {
  const wrap = document.getElementById('hud-players');
  const seen = new Set();
  for (const p of roster) {
    seen.add(p.id);
    let r = H.playerRows.get(p.id);
    if (!r) {
      const row = document.createElement('div');
      row.className = 'player-row';
      const sw = document.createElement('span');
      sw.className = 'swatch';
      row.appendChild(sw);
      const nameEl = document.createElement('span');
      nameEl.className = 'pr-name';
      row.appendChild(nameEl);
      const lEl = mkStat(row, 'L');
      const eEl = mkStat(row, 'E');
      const rEl = mkStat(row, 'R');
      row.addEventListener('click', () => {
        const cur = H.playerRows.get(p.id);
        if (cur && !cur.dead && !cur.me) H.cb.onTargetPlayer(p.id);
      });
      wrap.appendChild(row);
      r = { row, sw, nameEl, lEl, eEl, rEl, dead: false, me: false };
      H.playerRows.set(p.id, r);
    }
    r.dead = !!p.dead;
    r.me = !!p.me;
    r.sw.style.background = p.color || 'var(--line)';
    r.nameEl.textContent = p.name + (p.me ? ' (YOU)' : '');
    r.lEl.textContent = String(p.lives != null ? p.lives : '-');
    r.eEl.textContent = String(p.eco != null ? Math.floor(p.eco) : '-');
    r.rEl.textContent = String(p.round != null ? p.round : '-');
    r.row.classList.toggle('dead', r.dead);
    r.row.classList.toggle('me', r.me);
    r.row.classList.toggle('targeted', p.id === myTarget && !r.dead);
  }
  for (const [id, r] of H.playerRows) {
    if (!seen.has(id)) {
      r.row.remove();
      H.playerRows.delete(id);
    }
  }
}

function mkStat(row, prefix) {
  const s = document.createElement('span');
  s.className = 'pr-stat';
  s.append(prefix + ' ');
  const b = document.createElement('b');
  s.appendChild(b);
  row.appendChild(s);
  return b;
}

/* ---------- powers ---------- */

function updatePowerBar(powerStates) {
  for (const [id, { btn, sweep, subEl }] of H.powerBtns) {
    const ps = powerStates[id];
    if (!ps) continue;
    const frac = ps.cdMax > 0 ? Math.max(0, Math.min(1, ps.cd / ps.cdMax)) : 0;
    sweep.style.setProperty('--cd', String(frac));
    const out = ps.uses <= 0;
    subEl.textContent = out
      ? 'USED UP'
      : (ps.cd > 0 ? Math.ceil(ps.cd) + 's' : 'READY') + ' x' + ps.uses;
    btn.disabled = out || ps.cd > 0;
  }
}

/* ---------- ability bar (tier-4 actives, appear when owned) ---------- */

function updateAbilityBar(towers, simTime) {
  const wrap = document.getElementById('hud-abilities');
  const live = new Set();
  for (const tw of towers) {
    if (!tw.ability) continue;
    live.add(tw);
    let a = H.abilityBtns.get(tw);
    if (!a) {
      const btn = document.createElement('button');
      btn.className = 'btn cd-btn';
      btn.title = tw.ability.desc || '';
      const nm = document.createElement('span');
      nm.className = 'cd-name';
      nm.textContent = tw.ability.name || tw.ability.id;
      btn.appendChild(nm);
      const sub = document.createElement('span');
      sub.className = 'cd-sub';
      btn.appendChild(sub);
      const sweep = document.createElement('span');
      sweep.className = 'cdsweep';
      btn.appendChild(sweep);
      btn.addEventListener('click', () => H.cb.onAbility(tw));
      wrap.appendChild(btn);
      a = { btn, sweep, subEl: sub };
      H.abilityBtns.set(tw, a);
    }
    paintAbility(a, tw.ability, Math.max(0, (tw.abilityReadyAt || 0) - simTime));
  }
  for (const [tw, a] of H.abilityBtns) {
    if (!live.has(tw)) {
      a.btn.remove();
      H.abilityBtns.delete(tw);
    }
  }
}

function paintAbility(a, ability, cdRemaining) {
  const cd = cdRemaining != null ? cdRemaining : (ability.cd || 0);
  const max = ability.cooldown || 1;
  a.sweep.style.setProperty('--cd', String(Math.max(0, Math.min(1, cd / max))));
  a.subEl.textContent = cd > 0 ? Math.ceil(cd) + 's' : 'READY';
  a.btn.disabled = cd > 0;
}

/* ---------- selected tower card ---------- */

export function setSelected(towerOrNull) {
  if (!H) return;
  H.selected = towerOrNull;
  H.cardSig = ''; // force rebuild on next paint
  const card = document.getElementById('hud-towercard');
  if (!towerOrNull) {
    card.classList.add('hidden');
    card.innerHTML = '';
    return;
  }
  card.classList.remove('hidden');
  if (H.lastState) updateTowerCard(H.lastState);
  else rebuildTowerCard(towerOrNull, 0);
}

function updateTowerCard(simState) {
  const tw = H.selected;
  if (!tw) return;
  // selected tower was sold or removed
  if (simState.towers && !simState.towers.includes(tw)) {
    setSelected(null);
    return;
  }
  const sig = [
    tw.tiers ? tw.tiers.join(',') : '',
    tw.targeting || tw.targetMode || '',
    tw.sellValue != null ? tw.sellValue : '',
  ].join('|');
  if (sig !== H.cardSig) {
    H.cardSig = sig;
    rebuildTowerCard(tw, simState.cash);
  } else {
    for (const { btn, cost } of H.cardBuyBtns) {
      btn.disabled = simState.cash < cost;
    }
  }
  if (H.cardAbilityBtn && tw.ability) {
    paintAbility(H.cardAbilityBtn, tw.ability, Math.max(0, (tw.abilityReadyAt || 0) - (simState.time || 0)));
  }
}

function rebuildTowerCard(tw, cash) {
  const card = document.getElementById('hud-towercard');
  card.innerHTML = '';
  H.cardBuyBtns = [];
  H.cardAbilityBtn = null;
  const def = tw.def;
  const tiers = tw.tiers || [0, 0];

  const head = document.createElement('div');
  head.className = 'tc-head';
  const nm = document.createElement('span');
  nm.className = 'tc-name';
  nm.textContent = def.name;
  head.appendChild(nm);
  const tr = document.createElement('span');
  tr.className = 'tc-tiers';
  tr.textContent = 'T' + tiers[0] + ' / T' + tiers[1];
  head.appendChild(tr);
  card.appendChild(head);

  const stats = document.createElement('div');
  stats.className = 'tc-stats';
  stats.append(statBit('DMG', tw.dmg != null ? tw.dmg : def.dmg));
  stats.append(statBit('RATE', fmtNum(tw.rate != null ? tw.rate : def.rate)));
  stats.append(statBit('RNG', tw.range != null ? tw.range : def.range));
  if ((tw.pierce != null ? tw.pierce : def.pierce) != null) {
    stats.append(statBit('PIERCE', tw.pierce != null ? tw.pierce : def.pierce));
  }
  card.appendChild(stats);

  const paths = document.createElement('div');
  paths.className = 'tc-paths';
  for (let i = 0; i < 2; i++) {
    paths.appendChild(buildPathCol(tw, def, tiers, i, cash));
  }
  card.appendChild(paths);

  // tier-4 ability shortcut on the card
  if (tw.ability) {
    const btn = document.createElement('button');
    btn.className = 'btn cd-btn';
    btn.style.width = '100%';
    btn.title = tw.ability.desc || '';
    const an = document.createElement('span');
    an.className = 'cd-name';
    an.textContent = tw.ability.name || tw.ability.id;
    btn.appendChild(an);
    const sub = document.createElement('span');
    sub.className = 'cd-sub';
    btn.appendChild(sub);
    const sweep = document.createElement('span');
    sweep.className = 'cdsweep';
    btn.appendChild(sweep);
    btn.addEventListener('click', () => H.cb.onAbility(tw));
    card.appendChild(btn);
    H.cardAbilityBtn = { btn, sweep, subEl: sub };
    paintAbility(H.cardAbilityBtn, tw.ability);
  }

  const actions = document.createElement('div');
  actions.className = 'tc-actions';
  const tgt = document.createElement('button');
  tgt.className = 'btn btn-sm';
  tgt.textContent = 'TARGET: ' + String(tw.targeting || tw.targetMode || 'FIRST').toUpperCase();
  tgt.addEventListener('click', () => H.cb.onCycleTarget(tw));
  actions.appendChild(tgt);
  const sell = document.createElement('button');
  sell.className = 'btn btn-sm btn-sell';
  sell.textContent = tw.sellValue != null ? 'SELL $' + Math.floor(tw.sellValue) : 'SELL 70%';
  sell.addEventListener('click', () => H.cb.onSell(tw));
  actions.appendChild(sell);
  card.appendChild(actions);
}

function buildPathCol(tw, def, tiers, i, cash) {
  const col = document.createElement('div');
  col.className = 'tc-path';
  const other = 1 - i;
  const myTier = tiers[i];
  const path = (def.paths && def.paths[i]) || {};
  const ups = path.upgrades || path || [];

  // path column header so players can tell the two paths apart
  if (path.name) {
    const hd = document.createElement('div');
    hd.className = 'up-path-name';
    hd.textContent = path.name;
    col.appendChild(hd);
  }

  if (myTier >= ups.length || myTier >= 4) {
    const done = document.createElement('div');
    done.className = 'up-done';
    done.textContent = 'PATH MAXED';
    col.appendChild(done);
    return col;
  }
  // crossing rule: only one path past tier 2
  if (myTier >= 2 && tiers[other] > 2) {
    const lock = document.createElement('div');
    lock.className = 'up-locked';
    lock.textContent = 'PATH LOCKED';
    col.appendChild(lock);
    return col;
  }

  const up = ups[myTier];
  const nm = document.createElement('div');
  nm.className = 'up-name';
  nm.textContent = up.name;
  col.appendChild(nm);
  const cost = document.createElement('div');
  cost.className = 'up-cost';
  cost.textContent = '$' + up.cost;
  col.appendChild(cost);
  const desc = document.createElement('div');
  desc.className = 'up-desc';
  desc.textContent = up.desc || '';
  col.appendChild(desc);
  const buy = document.createElement('button');
  buy.className = 'btn btn-sm';
  buy.textContent = 'BUY';
  buy.disabled = cash < up.cost;
  buy.addEventListener('click', () => H.cb.onUpgrade(tw, i));
  col.appendChild(buy);
  H.cardBuyBtns.push({ btn: buy, cost: up.cost });
  return col;
}

function statBit(label, val) {
  const s = document.createElement('span');
  s.append(label + ' ');
  const b = document.createElement('b');
  b.textContent = val != null ? String(val) : '-';
  s.appendChild(b);
  s.append('  ');
  return s;
}

function fmtNum(n) {
  if (n == null) return null;
  return Math.round(n * 100) / 100;
}

/* ---------- toast ---------- */

export function flashMsg(text) {
  const el = document.getElementById('hud-toast');
  el.textContent = text;
  el.classList.remove('hidden');
  if (H && H.toastTimer) clearTimeout(H.toastTimer);
  const timer = setTimeout(() => el.classList.add('hidden'), 2000);
  if (H) H.toastTimer = timer;
}

/* ---------- emote stamps ---------- */

export function showEmote(fromId, text) {
  if (!H) return;
  const r = H.playerRows.get(fromId);
  if (!r) return;
  let stamp = r.row.querySelector('.emote-stamp');
  if (!stamp) {
    stamp = document.createElement('span');
    stamp.className = 'emote-stamp';
    r.row.appendChild(stamp);
  }
  stamp.textContent = text;
  const old = H.emoteStamps.get(fromId);
  if (old) clearTimeout(old);
  H.emoteStamps.set(
    fromId,
    setTimeout(() => {
      stamp.remove();
      H.emoteStamps.delete(fromId);
    }, 2500)
  );
}
