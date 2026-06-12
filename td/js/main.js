// RUSH TD - app shell and integration. Owns screens, networking glue, game loop.
import { createTransport, genCode } from './net/transport.js';
import { Sim } from './sim.js';
import { Renderer, drawTowerIcon, drawMapThumb } from './render.js';
import TOWERS from './data/towers.js';
import ENEMIES from './data/enemies.js';
import SENDS from './data/sends.js';
import POWERS from './data/powers.js';
import MAPS from './data/maps.js';
import EMOTES from './data/emotes.js';
import SETTINGS_SCHEMA, { defaultSettings, cleanSettings } from './data/settings.js';
import { initTitle, titleError } from './ui/title.js';
import { initLobby, updateLobby } from './ui/lobby.js';
import { initHud, updateHud, setSelected, flashMsg, showEmote } from './ui/hud.js';
import { initGameOver, showGameOver } from './ui/gameover.js';

const PLAYER_COLORS = ['#e2b714', '#60a5fa', '#4ade80', '#ef4444', '#c084fc', '#fb923c', '#2dd4bf', '#f472b6', '#a3e635', '#94a3b8', '#f87171', '#38bdf8'];
const ROUND_GAP = 4;            // s between all-done and next round
const ROUND_CAP = 75;           // s max round duration before forced advance
const TICK = 1 / 30;

const screens = {};
for (const name of ['title', 'lobby', 'game', 'gameover']) {
  screens[name] = document.getElementById('screen-' + name);
}
function showScreen(name) {
  for (const k in screens) screens[k].classList.toggle('hidden', k !== name);
}

// ---------------- global session state ----------------
let net = null;          // transport
let myName = '';
let lobby = null;        // {players:[{id,name,color,ready,powers}], mapId, hostId}
let game = null;         // in-game state bundle
let amHost = false;

function myId() { return net ? net.id : null; }
function getPlayer(id) { return lobby ? lobby.players.find(p => p.id === id) : null; }

// ---------------- title ----------------
initTitle({
  onHost: async (name) => {
    tryFullscreen();
    myName = name;
    const code = genCode();
    try {
      net = await createTransport({ code, isHost: true, name });
    } catch (e) {
      titleError('Could not open room: ' + e.message);
      return;
    }
    amHost = true;
    lobby = {
      players: [{ id: net.id, name, color: PLAYER_COLORS[0], ready: false, powers: [] }],
      mapId: MAPS[0].id, hostId: net.id, settings: defaultSettings(),
    };
    wireNet();
    enterLobby(code);
    broadcastLobby();
  },
  onJoin: async (name, code) => {
    tryFullscreen();
    myName = name;
    try {
      net = await createTransport({ code, isHost: false, name });
    } catch (e) {
      titleError('Could not join room ' + code + ': ' + e.message);
      return;
    }
    amHost = false;
    wireNet();
    net.broadcast({ t: 'hello', name });
    enterLobby(code);
  },
});

// ---------------- lobby ----------------
function enterLobby(code) {
  initLobby({
    isHost: amHost,
    code,
    powers: POWERS,
    maps: MAPS,
    settingsSchema: SETTINGS_SCHEMA,
    drawMapThumb,
    onSetSettings: (s) => {
      if (!amHost) return;
      lobby.settings = cleanSettings(s);
      broadcastLobby();
    },
    onSetPowers: (ids) => {
      if (amHost) { const me = getPlayer(myId()); me.powers = ids; broadcastLobby(); }
      else net.broadcast({ t: 'setPowers', powers: ids });
    },
    onReady: (ready) => {
      if (amHost) { const me = getPlayer(myId()); me.ready = ready; broadcastLobby(); }
      else net.broadcast({ t: 'setReady', ready });
    },
    onSetMap: (mapId) => {
      if (!amHost) return;
      lobby.mapId = mapId; broadcastLobby();
    },
    onStart: () => {
      if (!amHost) return;
      const everyoneReady = lobby.players.every(p => p.ready && p.powers.length === 3);
      if (!everyoneReady) { flashMsg('Everyone must pick 3 powers and ready up'); return; }
      net.broadcast({ t: 'start', mapId: lobby.mapId, players: lobby.players, settings: lobby.settings, hostId: lobby.hostId });
      startGame(lobby.mapId, lobby.players, lobby.settings);
    },
  });
  showScreen('lobby');
  pushLobbyToUi();
}

function broadcastLobby() {
  if (!amHost || !net) return;
  net.broadcast({ t: 'lobby', players: lobby.players, mapId: lobby.mapId, hostId: lobby.hostId, settings: lobby.settings });
  pushLobbyToUi();
}

function pushLobbyToUi() {
  if (!lobby) return;
  const allReady = lobby.players.every(p => p.ready && p.powers.length === 3);
  updateLobby({ ...lobby, myId: myId(), allReady });
}

// ---------------- networking ----------------
function wireNet() {
  net.onMessage((msg, fromId) => {
    if (amHost) handleAsHost(msg, fromId);
    handleCommon(msg, fromId);
  });
  net.onPeerJoin((id) => {
    // reconnect within the grace window: cancel the pending departure
    if (game && game.leaveTimers && game.leaveTimers.has(id)) {
      clearTimeout(game.leaveTimers.get(id));
      game.leaveTimers.delete(id);
    }
  });
  net.onPeerLeave((id) => {
    if (lobby && !game) {
      if (amHost) {
        lobby.players = lobby.players.filter(p => p.id !== id);
        broadcastLobby();
      } else if (id === lobby.hostId) {
        titleError('Host left the room');
        location.reload();
      }
    } else if (game && !game.over) {
      // grace period: network blips emit leave+join churn, only eliminate
      // a player who stays gone for 8s
      if (!game.leaveTimers) game.leaveTimers = new Map();
      if (game.leaveTimers.has(id)) return;
      const p = game.roster.find(r => r.id === id);
      if (!p || p.dead) return;
      game.leaveTimers.set(id, setTimeout(() => {
        game.leaveTimers.delete(id);
        const r = game.roster.find(x => x.id === id);
        if (r && !r.dead) {
          r.dead = true; r.left = true;
          flashMsg(r.name + ' disconnected');
          checkGameOver();
        }
      }, 8000));
    }
  });
}

function handleAsHost(msg, fromId) {
  if (!lobby) return;
  switch (msg.t) {
    case 'hello': {
      if (game) { net.send(fromId, { t: 'busy' }); return; } // no late joins into running game
      if (!getPlayer(fromId)) {
        lobby.players.push({
          id: fromId, name: sanitizeName(msg.name),
          color: PLAYER_COLORS[lobby.players.length % PLAYER_COLORS.length],
          ready: false, powers: [],
        });
      }
      broadcastLobby();
      break;
    }
    case 'setReady': { const p = getPlayer(fromId); if (p) { p.ready = !!msg.ready; broadcastLobby(); } break; }
    case 'setPowers': { const p = getPlayer(fromId); if (p) { p.powers = (msg.powers || []).slice(0, 3); broadcastLobby(); } break; }
    case 'setName': { const p = getPlayer(fromId); if (p) { p.name = sanitizeName(msg.name); broadcastLobby(); } break; }
  }
}

function handleCommon(msg, fromId) {
  switch (msg.t) {
    case 'lobby':
      if (!amHost) { lobby = { players: msg.players, mapId: msg.mapId, hostId: msg.hostId, settings: msg.settings }; pushLobbyToUi(); }
      break;
    case 'start':
      if (!amHost && msg.players.some(p => p.id === myId())) {
        if (!lobby) lobby = { players: msg.players, mapId: msg.mapId, hostId: msg.hostId || fromId, settings: msg.settings };
        startGame(msg.mapId, msg.players, msg.settings);
      }
      break;
    case 'roundStart':
      if (game && !game.over) beginRound(msg.n);
      break;
    case 'sendUnits': {
      if (!game) break;
      const from = game.roster.find(r => r.id === fromId);
      if (msg.to === myId() && !game.dead) {
        game.sim.queueSend(msg.unitId, msg.count);
        if (from) flashMsg(from.name + ' sent ' + sendName(msg.unitId, msg.count));
      }
      break;
    }
    case 'power': {
      if (!game) break;
      if (msg.to === myId() && !game.dead) {
        game.sim.applyPower(msg.powerId, false);
        const from = game.roster.find(r => r.id === fromId);
        const pw = POWERS.find(p => p.id === msg.powerId);
        if (from && pw) flashMsg(from.name + ' used ' + pw.name + ' on you');
      }
      break;
    }
    case 'status': {
      if (!game) break;
      const r = game.roster.find(x => x.id === fromId);
      if (r) { r.lives = msg.lives; r.cash = msg.cash; r.eco = msg.eco; r.round = msg.round; if (msg.popped != null) r.popped = msg.popped; }
      break;
    }
    case 'roundDone': {
      if (game) {
        game.roundDone.add(fromId);
        maybeScheduleNextRound();
      }
      break;
    }
    case 'nextRound': {
      if (game) game.nextRoundAt = performance.now() + (msg.inMs || 4000);
      break;
    }
    case 'busy': {
      if (!game) {
        titleError('Game already in progress in that room');
        showScreen('title');
      }
      break;
    }
    case 'defeat': {
      if (!game) break;
      const r = game.roster.find(x => x.id === fromId);
      if (r && !r.dead) {
        r.dead = true; r.lives = 0;
        flashMsg(r.name + ' was eliminated');
        checkGameOver();
      }
      break;
    }
    case 'emote': {
      if (!game) break;
      const em = EMOTES.find(e => e.id === msg.emoteId);
      if (em) showEmote(fromId, em.text);
      break;
    }
    case 'gameOver':
      if (game && !game.over) endGame(msg.winnerId);
      break;
  }
}

function sanitizeName(n) {
  return String(n || 'player').replace(/[^\w \-\.]/g, '').slice(0, 16) || 'player';
}
function sendName(unitId, count) {
  const s = SENDS.find(x => x.id === unitId);
  return s ? (count > 1 ? count + 'x ' + s.name : s.name) : 'units';
}

// ---------------- game ----------------
function startGame(mapId, players, settings) {
  const cfg = cleanSettings(settings);
  const mapDef = MAPS.find(m => m.id === mapId) || MAPS[0];
  const canvas = document.getElementById('game');
  const me = players.find(p => p.id === myId());
  const myPowers = (me ? me.powers : []).map(id => POWERS.find(p => p.id === id)).filter(Boolean);

  const sim = new Sim({
    mapDef,
    settings: cfg,
    onLeak: () => {},
    onPop: () => {},
    onCash: () => {},
    onRoundEnd: (n) => {
      game.roundActive = false;
      game.roundDone.add(myId());
      net.broadcast({ t: 'roundDone', n });
      maybeScheduleNextRound();
    },
    onDefeat: () => {
      game.dead = true;
      const r = game.roster.find(x => x.id === myId());
      if (r) { r.dead = true; r.lives = 0; }
      net.broadcast({ t: 'defeat' });
      flashMsg('You were eliminated. Spectating.');
      checkGameOver();
    },
  });

  game = {
    sim, mapDef, cfg,
    renderer: new Renderer(canvas, mapDef),
    roster: players.map(p => ({ ...p, me: p.id === myId(), lives: cfg.startLives, cash: cfg.startCash, eco: cfg.startEco, round: 0, popped: 0, dead: false })),
    clockOwner: lobby.hostId,
    round: 0, roundActive: false, roundDone: new Set(), nextRoundAt: 0, roundStartedAt: 0,
    target: null,          // peer id I am sending to
    placing: null,         // towerDef being placed
    selected: null,        // selected tower
    mouse: { x: -100, y: -100 },
    powerStates: myPowers.map(p => ({ def: p, usesLeft: Math.ceil(p.uses * cfg.powerUsesMult), readyAt: 0 })),
    dead: false, over: false,
    sendCount: 1,
    lastStatus: 0, lastHud: 0, acc: 0, lastT: performance.now(),
  };
  pickDefaultTarget();

  initHud({
    towers: TOWERS, sends: SENDS, powers: myPowers, emotes: EMOTES,
    drawTowerIcon: (cv, def) => drawTowerIcon(cv.getContext('2d'), def, Math.min(cv.width, cv.height)),
    callbacks: {
      onPickTower: (id) => {
        if (game.dead) return;
        const def = TOWERS.find(t => t.id === id);
        game.placing = (game.placing && game.placing.id === id) ? null : def;
        game.selected = null; setSelected(null);
      },
      onCycleTarget: (tower) => { game.sim.cycleTargeting ? game.sim.cycleTargeting(tower) : cycleTargetingFallback(tower); },
      onUpgrade: (tower, pathIdx) => { if (!game.sim.upgrade(tower, pathIdx)) flashMsg('Cannot buy that upgrade'); setSelected(tower); },
      onSell: (tower) => { game.sim.sellTower(tower); game.selected = null; setSelected(null); },
      onAbility: (tower) => { if (!game.sim.useAbility(tower)) flashMsg('Ability not ready'); },
      onSendUnits: (unitId, count) => doSend(unitId, count),
      onUsePower: (powerId) => usePower(powerId),
      onTargetPlayer: (peerId) => {
        const r = game.roster.find(x => x.id === peerId);
        if (r && !r.dead && peerId !== myId()) { game.target = peerId; }
      },
      onEmote: (emoteId) => {
        const now = performance.now();
        if (game.lastEmote && now - game.lastEmote < 3000) return;
        game.lastEmote = now;
        net.broadcast({ t: 'emote', emoteId });
        const em = EMOTES.find(e => e.id === emoteId);
        if (em) showEmote(myId(), em.text);
      },
    },
  });

  wireCanvas(canvas);
  showScreen('game');
  const firstRound = Math.max(1, Math.round(cfg.startRound));
  flashMsg('Round ' + firstRound + ' in 3s');

  // countdown then clock owner starts the first round
  setTimeout(() => {
    if (game && game.clockOwner === myId() && !game.over) {
      net.broadcast({ t: 'roundStart', n: firstRound });
      beginRound(firstRound);
    }
  }, 3000);

  requestAnimationFrame(loop);
}

function cycleTargetingFallback(tower) {
  const modes = ['first', 'last', 'strong', 'close'];
  tower.targeting = modes[(modes.indexOf(tower.targeting) + 1) % modes.length];
}

function pickDefaultTarget() {
  const others = game.roster.filter(r => r.id !== myId() && !r.dead);
  game.target = others.length ? others[0].id : null;
}

function doSend(unitId, count) {
  if (game.dead) return;
  if (!game.target) { flashMsg('No target selected'); return; }
  const t = game.roster.find(r => r.id === game.target);
  if (!t || t.dead) { pickDefaultTarget(); flashMsg('Target is gone, pick another'); return; }
  if (!game.sim.registerOutgoingSend(unitId, count)) { flashMsg('Cannot afford that send'); return; }
  net.broadcast({ t: 'sendUnits', to: game.target, unitId, count });
}

function usePower(powerId) {
  if (game.dead) return;
  const ps = game.powerStates.find(s => s.def.id === powerId);
  if (!ps || ps.usesLeft <= 0 || performance.now() < ps.readyAt) return;
  if (ps.def.type === 'neg') {
    if (!game.target) { flashMsg('Pick a target first'); return; }
    const t = game.roster.find(r => r.id === game.target);
    if (!t || t.dead) { flashMsg('Target is gone'); return; }
    net.broadcast({ t: 'power', to: game.target, powerId });
    flashMsg(ps.def.name + ' sent to ' + t.name);
  } else {
    game.sim.applyPower(powerId, true);
  }
  ps.usesLeft--;
  ps.readyAt = performance.now() + ps.def.cooldown * 1000 * game.cfg.powerCdMult;
}

// round clock (runs on clock owner only)
function maybeScheduleNextRound() {
  if (game.clockOwner !== myId() || game.over) return;
  const alive = game.roster.filter(r => !r.dead).map(r => r.id);
  const allDone = alive.every(id => game.roundDone.has(id));
  if (allDone && !game.nextRoundAt) {
    game.nextRoundAt = performance.now() + ROUND_GAP * 1000;
    net.broadcast({ t: 'nextRound', inMs: ROUND_GAP * 1000 });
  }
}

function beginRound(n) {
  game.round = n;
  game.roundActive = true;
  game.roundDone = new Set();
  game.nextRoundAt = 0;
  game.roundStartedAt = performance.now();
  if (!game.dead) game.sim.startRound(n);
}

function checkGameOver() {
  const alive = game.roster.filter(r => !r.dead);
  if (alive.length === 1 && game.roster.length > 1) {
    if (game.clockOwner === myId() || (game.dead && alive[0].id === myId())) {
      net.broadcast({ t: 'gameOver', winnerId: alive[0].id });
    }
    endGame(alive[0].id);
  } else if (alive.length === 0) {
    endGame(null);
  }
  // clock owner died or left: migrate clock to oldest alive peer
  if (game.roster.find(r => r.id === game.clockOwner && r.dead)) {
    const order = net.peers();
    const next = order.find(id => { const r = game.roster.find(x => x.id === id); return r && !r.dead; });
    if (next && next !== game.clockOwner) {
      game.clockOwner = next;
      if (next === myId()) maybeScheduleNextRound();
    }
  }
}

function endGame(winnerId) {
  if (game.over) return;
  game.over = true;
  const winner = game.roster.find(r => r.id === winnerId);
  showGameOver({
    won: winnerId === myId(),
    winnerName: winner ? winner.name : 'nobody',
    stats: game.roster.map(r => ({ name: r.name, roundsSurvived: r.round, popped: r.popped || 0 })),
  });
  showScreen('gameover');
}

initGameOver({ onBack: () => location.reload() });

// ---------------- game loop ----------------
function loop(t) {
  if (!game || game.over) { if (game && game.over) return; }
  const now = performance.now();
  let dt = (now - game.lastT) / 1000;
  game.lastT = now;
  if (dt > 0.25) dt = 0.25;
  game.acc += dt;
  while (game.acc >= TICK) {
    game.sim.tick(TICK);
    game.acc -= TICK;
  }

  // clock owner: forced round advance + scheduled next round
  if (game.clockOwner === myId() && !game.over) {
    if (game.nextRoundAt && now >= game.nextRoundAt) {
      const n = game.round + 1;
      net.broadcast({ t: 'roundStart', n });
      beginRound(n);
    } else if (game.roundActive && now - game.roundStartedAt > game.cfg.roundCap * 1000) {
      const n = game.round + 1;
      net.broadcast({ t: 'roundStart', n });
      beginRound(n);
    }
  }

  // status broadcast 2 Hz
  if (now - game.lastStatus > 500) {
    game.lastStatus = now;
    const s = game.sim.state;
    net.broadcast({ t: 'status', lives: s.lives, cash: Math.floor(s.cash), eco: Math.floor(s.eco), round: game.round, popped: s.popped || 0 });
    const meR = game.roster.find(r => r.id === myId());
    if (meR) { meR.lives = s.lives; meR.cash = Math.floor(s.cash); meR.eco = Math.floor(s.eco); meR.round = game.round; meR.popped = s.popped || 0; }
  }

  // hud 10 Hz
  if (now - game.lastHud > 100) {
    game.lastHud = now;
    const powerMap = {};
    for (const ps of game.powerStates) {
      powerMap[ps.def.id] = {
        cd: Math.max(0, (ps.readyAt - now) / 1000),
        cdMax: Math.max(0.001, ps.def.cooldown * game.cfg.powerCdMult),
        uses: ps.usesLeft,
      };
    }
    game.sim.state.nextRoundIn = game.nextRoundAt ? Math.max(0, (game.nextRoundAt - now) / 1000) : null;
    updateHud(game.sim.state, game.roster, game.target, powerMap);
  }

  const s = game.sim.state;
  game.renderer.draw(s, {
    selected: game.selected,
    placing: game.placing,
    mouse: game.mouse,
    alpha: game.acc / TICK,
    blackout: s.blackoutUntil > s.time,
    targetingPlayer: null,
  });

  requestAnimationFrame(loop);
}

// ---------------- canvas input (mouse + touch) ----------------
function wireCanvas(canvas) {
  function toLogical(cx, cy) {
    const r = canvas.getBoundingClientRect();
    return { x: (cx - r.left) * (1280 / r.width), y: (cy - r.top) * (720 / r.height) };
  }
  function tap(p, keepPlacing) {
    if (game.dead) return;
    if (game.placing) {
      const t = game.sim.placeTower(game.placing.id, p.x, p.y);
      if (t) { if (!keepPlacing) game.placing = null; }
      else flashMsg('Cannot place there');
      return;
    }
    const hit = game.sim.state.towers.find(t => (t.x - p.x) ** 2 + (t.y - p.y) ** 2 < 22 ** 2);
    game.selected = hit || null;
    setSelected(game.selected);
  }

  // mouse
  canvas.addEventListener('mousemove', (e) => { game.mouse = toLogical(e.clientX, e.clientY); });
  canvas.addEventListener('mouseleave', () => { game.mouse = { x: -100, y: -100 }; });
  canvas.addEventListener('click', (e) => tap(toLogical(e.clientX, e.clientY), e.shiftKey));
  canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); game.placing = null; game.selected = null; setSelected(null); });

  // touch: a tap places/selects; while placing, finger drag previews position
  let touchMoved = false;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchMoved = false;
    const t = e.touches[0];
    game.mouse = toLogical(t.clientX, t.clientY);
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    touchMoved = true; // a drag previews the ghost without committing
    const t = e.touches[0];
    game.mouse = toLogical(t.clientX, t.clientY);
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const p = toLogical(t.clientX, t.clientY);
    // when placing, a tap OR the end of a positioning drag both commit
    tap(p, false);
    if (!game.placing) game.mouse = { x: -100, y: -100 };
    e.preventDefault();
  }, { passive: false });
}

// Hide browser chrome on mobile by going fullscreen on a user gesture.
function tryFullscreen() {
  const el = document.documentElement;
  const fn = el.requestFullscreen || el.webkitRequestFullscreen;
  if (fn && !document.fullscreenElement && !document.webkitFullscreenElement) {
    try { const p = fn.call(el); if (p && p.catch) p.catch(() => {}); } catch (e) { /* denied, ignore */ }
  }
  if (screen.orientation && screen.orientation.lock) {
    try { const p = screen.orientation.lock('landscape'); if (p && p.catch) p.catch(() => {}); } catch (e) { /* ignore */ }
  }
}

window.addEventListener('keydown', (e) => {
  if (!game || game.over || game.dead) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const idx = '1234567890'.indexOf(e.key);
  if (idx >= 0 && TOWERS[idx]) {
    game.placing = (game.placing && game.placing.id === TOWERS[idx].id) ? null : TOWERS[idx];
    game.selected = null; setSelected(null);
  } else if (e.key === 'Escape') {
    game.placing = null; game.selected = null; setSelected(null);
  } else if (e.key === 'e' || e.key === 'E') {
    const btn = document.getElementById('btn-emote');
    if (btn) btn.click();
  }
});

// global: block iOS pinch-zoom and page scroll/bounce so the canvas owns
// gestures. Double-tap zoom is handled by CSS `touch-action: manipulation`
// (doing it here in JS would eat rapid successive taps on buttons).
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => {
  // allow scrolling only inside explicitly scrollable panels; block elsewhere
  // so the page itself never scrolls or rubber-bands
  if (e.touches.length > 1) { e.preventDefault(); return; }
  if (!e.target.closest('.scrollable, .lobby-settings, .lobby-powers, .lobby-players, .over-table, #hud-side, .lobby-box, .title-box, .hud-towers, .hud-sends, .hud-powers, .hud-abilities, .hud-bottom, .hud-sendstrip')) {
    e.preventDefault();
  }
}, { passive: false });

showScreen('title');
