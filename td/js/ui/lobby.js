// js/ui/lobby.js - lobby screen: room code, player list, map strip, power picks.
//
// Contract:
//   initLobby({
//     isHost: bool,
//     code: string,                        room code to display
//     powers: [powerDef],                  all 10 power defs: {id,name,desc,cooldown,uses, type:'pos'|'neg'}
//                                          (type may be omitted; ids starting with "n_" are treated as NEG)
//     maps: [mapDef],                      map defs: {id,name,...}
//     onSetPowers(ids),                    called whenever my selection changes (array of 0..3 ids)
//     onReady(bool),                       READY toggled
//     onSetMap(id),                        host clicked a map thumbnail
//     onStart(),                           host clicked START
//     drawMapThumb(canvas, mapDef)         renders a mini map preview into the given canvas
//   })
//   updateLobby(lobbyState)
//     lobbyState = { players:[{id,name,color,ready,powers}], mapId, hostId, myId, allReady }
//
// initLobby fully rebuilds the screen, so it is safe to call on every lobby entry.
// Screen visibility (.hidden on #screen-lobby) is owned by main.js.

const THUMB_W = 128;
const THUMB_H = 72;

let L = null; // current lobby session state

function isNeg(p) {
  return p.type === 'neg' || (!p.type && String(p.id).startsWith('n_'));
}

export function initLobby(opts) {
  L = {
    opts,
    picked: new Set(),
    ready: false,
    cards: new Map(),    // powerId -> card element
    thumbs: new Map(),   // mapId -> thumb element
  };

  const codeEl = document.getElementById('lobby-code');
  const playersEl = document.getElementById('lobby-players');
  const mapsEl = document.getElementById('lobby-maps');
  const mapsLabel = document.getElementById('lobby-maps-label');
  const powersEl = document.getElementById('lobby-powers');
  const readyBtn = document.getElementById('btn-ready');
  const startBtn = document.getElementById('btn-start');
  const waitEl = document.getElementById('lobby-wait');

  codeEl.textContent = opts.code;
  playersEl.innerHTML = '';
  mapsEl.innerHTML = '';
  powersEl.innerHTML = '';
  readyBtn.disabled = true;
  readyBtn.textContent = 'READY';
  startBtn.classList.toggle('hidden', !opts.isHost);
  startBtn.disabled = true;
  waitEl.classList.toggle('hidden', opts.isHost);
  mapsLabel.textContent = opts.isHost ? 'MAP (CLICK TO PICK)' : 'MAP (HOST PICKS)';

  // room code: click to copy
  codeEl.onclick = () => {
    const done = () => {
      const prev = codeEl.textContent;
      codeEl.textContent = 'COPIED';
      setTimeout(() => { codeEl.textContent = opts.code; }, 800);
      void prev;
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(opts.code).then(done, () => {});
    }
  };

  // map strip
  for (const mapDef of opts.maps) {
    const thumb = document.createElement('div');
    thumb.className = 'map-thumb' + (opts.isHost ? '' : ' nohost');
    const cv = document.createElement('canvas');
    cv.width = THUMB_W;
    cv.height = THUMB_H;
    thumb.appendChild(cv);
    const nm = document.createElement('div');
    nm.className = 'map-name';
    nm.textContent = mapDef.name || mapDef.id;
    thumb.appendChild(nm);
    if (opts.isHost) {
      thumb.addEventListener('click', () => opts.onSetMap(mapDef.id));
    }
    mapsEl.appendChild(thumb);
    L.thumbs.set(mapDef.id, thumb);
    try { opts.drawMapThumb(cv, mapDef); } catch (e) { /* thumb render failed, leave blank */ }
  }

  // power grid
  for (const p of opts.powers) {
    const card = document.createElement('div');
    card.className = 'power-card';
    const neg = isNeg(p);
    card.innerHTML =
      '<div class="pc-head">' +
        '<span class="pc-name"></span>' +
        '<span class="pc-tag ' + (neg ? 'neg' : 'pos') + '">' + (neg ? 'NEG' : 'POS') + '</span>' +
      '</div>' +
      '<div class="pc-desc"></div>' +
      '<div class="pc-cd">CD ' + (p.cooldown != null ? p.cooldown : '?') + 's x' + (p.uses != null ? p.uses : '?') + '</div>';
    card.querySelector('.pc-name').textContent = p.name || p.id;
    card.querySelector('.pc-desc').textContent = p.desc || '';
    card.addEventListener('click', () => togglePower(p.id));
    powersEl.appendChild(card);
    L.cards.set(p.id, card);
  }

  readyBtn.onclick = () => {
    if (L.picked.size !== 3) return;
    L.ready = !L.ready;
    syncPickUi();
    opts.onReady(L.ready);
  };

  startBtn.onclick = () => opts.onStart();

  buildSettingsPanel(opts);
  syncPickUi();
}

// Host: editable inputs that fire onSetSettings. Clients: read-only values.
function buildSettingsPanel(opts) {
  const wrap = document.getElementById('lobby-settings');
  const labelEl = document.getElementById('lobby-settings-label');
  const arrow = document.getElementById('lobby-settings-arrow');
  if (!wrap || !labelEl) return;
  wrap.innerHTML = '';
  L.settingInputs = new Map();

  labelEl.onclick = () => {
    const open = wrap.classList.toggle('hidden');
    arrow.textContent = open ? '[SHOW]' : '[HIDE]';
  };

  for (const def of opts.settingsSchema || []) {
    const row = document.createElement('div');
    row.className = 'setting-row';
    const lab = document.createElement('span');
    lab.className = 'setting-label';
    lab.textContent = def.label;
    row.appendChild(lab);
    if (opts.isHost) {
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.min = def.min; inp.max = def.max; inp.step = def.step;
      inp.value = def.def;
      inp.addEventListener('change', () => {
        let v = Number(inp.value);
        if (!Number.isFinite(v)) v = def.def;
        v = Math.min(def.max, Math.max(def.min, v));
        inp.value = v;
        const out = {};
        for (const [k, el] of L.settingInputs) out[k] = Number(el.value);
        opts.onSetSettings(out);
      });
      row.appendChild(inp);
      L.settingInputs.set(def.key, inp);
    } else {
      const val = document.createElement('span');
      val.className = 'setting-val';
      val.dataset.key = def.key;
      val.textContent = def.def;
      row.appendChild(val);
    }
    wrap.appendChild(row);
  }
}

function togglePower(id) {
  if (!L || L.ready) return; // selection locked while ready
  if (L.picked.has(id)) {
    L.picked.delete(id);
  } else {
    if (L.picked.size >= 3) return; // exactly 3, deselect one first
    L.picked.add(id);
  }
  syncPickUi();
  L.opts.onSetPowers([...L.picked]);
}

function syncPickUi() {
  const readyBtn = document.getElementById('btn-ready');
  const countEl = document.getElementById('lobby-pick-count');
  countEl.textContent = String(L.picked.size);
  readyBtn.disabled = L.picked.size !== 3;
  readyBtn.textContent = L.ready ? 'UNREADY' : 'READY';
  readyBtn.classList.toggle('btn-accent', L.ready);
  for (const [id, card] of L.cards) {
    const sel = L.picked.has(id);
    card.classList.toggle('selected', sel);
    card.classList.toggle('locked', L.ready || (!sel && L.picked.size >= 3));
  }
}

export function updateLobby(lobbyState) {
  if (!L) return;
  const { players, mapId, hostId, myId, allReady } = lobbyState;

  // sync my ready flag from authoritative lobby state
  const me = players.find((p) => p.id === myId);
  if (me && me.ready !== L.ready) {
    L.ready = !!me.ready;
    syncPickUi();
  }

  // player list
  const playersEl = document.getElementById('lobby-players');
  playersEl.innerHTML = '';
  for (const p of players) {
    const row = document.createElement('div');
    row.className = 'lobby-player';
    const sw = document.createElement('span');
    sw.className = 'swatch';
    sw.style.background = p.color || 'var(--line)';
    row.appendChild(sw);
    const nm = document.createElement('span');
    nm.className = 'pname';
    nm.textContent =
      p.name +
      (p.id === myId ? ' (YOU)' : '') +
      (p.id === hostId ? ' [HOST]' : '');
    row.appendChild(nm);
    const picks = document.createElement('span');
    picks.className = 'ptag';
    picks.textContent = ((p.powers && p.powers.length) || 0) + '/3 POWERS';
    row.appendChild(picks);
    const tag = document.createElement('span');
    tag.className = 'ptag' + (p.ready ? ' ready' : '');
    tag.textContent = p.ready ? 'READY' : 'PICKING';
    row.appendChild(tag);
    playersEl.appendChild(row);
  }

  // map highlight
  for (const [id, thumb] of L.thumbs) {
    thumb.classList.toggle('selected', id === mapId);
  }

  // settings: clients mirror host values; host inputs are authoritative locally
  if (lobbyState.settings && !L.opts.isHost) {
    for (const el of document.querySelectorAll('#lobby-settings .setting-val')) {
      const v = lobbyState.settings[el.dataset.key];
      if (v != null) el.textContent = String(v);
    }
  }

  // start gate
  const startBtn = document.getElementById('btn-start');
  if (L.opts.isHost) {
    startBtn.disabled = !allReady;
  }
}
