// RUSH TD renderer. Flat 2D Canvas, no gradients, no shadows, no rounded rects.
//
// Expected shapes (matching DESIGN.md):
//   mapDef: { id, name, style:'meadow'|'desert'|'night'|'circuit'|'image',
//             image? (src string, used when style is not procedural),
//             path:[{x,y},...] in 1280x720 logical space, pathRadius? (default 26) }
//   simState (sim.state): {
//     towers:  [{ x, y, aim, def, tier, visualTokens:[], disabled, range }],
//     enemies: [{ x, y, px, py, hp, maxHp, shield, flash, def:{ color, size, shape, traits } }],
//     projectiles: [{ x, y, px, py, damageType }],
//     effects: [{ type:'hit', x, y, r } | { type:'beam', x1, y1, x2, y2, damageType }
//               | { type:'spray', x, y, angle, range, spread }]
//   }
//   ui: { selected (tower|null), placing (towerDef|null), mouse:{x,y},
//         alpha (0..1), targetingPlayer (name|null), blackout (bool) }

export const VIEW_W = 1280;
export const VIEW_H = 720;

const COL = {
  bg: '#16181c',
  surface: '#22252b',
  path: '#3a3f49',
  line: '#6b7280',
  text: '#e6e8eb',
  accent: '#e2b714',
  good: '#4ade80',
  bad: '#ef4444',
  blue: '#60a5fa',
};

const DMG_COLOR = {
  sharp: '#e6e8eb',
  blast: '#e2b714',
  energy: '#60a5fa',
  cold: '#a8d4e8',
  toxic: '#4ade80',
};

const DASH_CAMO = [3, 3];
const DASH_NONE = [];
const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------
// small utilities
// ---------------------------------------------------------------------------

function hashStr(s) {
  let h = 2166136261;
  s = String(s || 'map');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ptX(p) { return Array.isArray(p) ? p[0] : p.x; }
function ptY(p) { return Array.isArray(p) ? p[1] : p.y; }

function polyPath(ctx, cx, cy, r, sides, rot) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = rot + (i / sides) * TAU;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// cached background images keyed by src
const imageCache = new Map();
function loadImage(src, onload) {
  let entry = imageCache.get(src);
  if (!entry) {
    entry = { img: new Image(), loaded: false, cbs: [] };
    entry.img.onload = () => {
      entry.loaded = true;
      const cbs = entry.cbs;
      entry.cbs = [];
      for (const cb of cbs) cb();
    };
    entry.img.src = src;
    imageCache.set(src, entry);
  }
  if (onload) {
    if (entry.loaded) onload();
    else entry.cbs.push(onload);
  }
  return entry;
}

// ---------------------------------------------------------------------------
// procedural backgrounds (flat shapes only)
// ---------------------------------------------------------------------------

function blob(ctx, rng, cx, cy, rMin, rMax, verts) {
  ctx.beginPath();
  for (let i = 0; i < verts; i++) {
    const a = (i / verts) * TAU + rng() * 0.5;
    const r = rMin + rng() * (rMax - rMin);
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * 0.7;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawMeadow(ctx, rng) {
  ctx.fillStyle = '#191f18';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const patch = ['#1d241b', '#20291e', '#1b211a'];
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = patch[i % 3];
    blob(ctx, rng, rng() * VIEW_W, rng() * VIEW_H, 40, 130, 6);
  }
  // grass tufts: tiny triangles
  ctx.fillStyle = '#2c3a28';
  for (let i = 0; i < 50; i++) {
    const x = rng() * VIEW_W, y = rng() * VIEW_H;
    ctx.beginPath();
    ctx.moveTo(x - 3, y + 3); ctx.lineTo(x + 3, y + 3); ctx.lineTo(x, y - 4);
    ctx.closePath(); ctx.fill();
  }
  // muted flower dots
  const dots = ['#5c5a37', '#4a5a44', '#5a4a44'];
  for (let i = 0; i < 36; i++) {
    ctx.fillStyle = dots[i % 3];
    ctx.beginPath();
    ctx.arc(rng() * VIEW_W, rng() * VIEW_H, 1.5 + rng(), 0, TAU);
    ctx.fill();
  }
}

function drawDesert(ctx, rng) {
  ctx.fillStyle = '#221d14';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // dunes: wide flat quads
  const dune = ['#272115', '#2b2518', '#241f13'];
  for (let i = 0; i < 9; i++) {
    const x = rng() * VIEW_W, y = rng() * VIEW_H;
    const w = 140 + rng() * 260, h = 24 + rng() * 50;
    ctx.fillStyle = dune[i % 3];
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y + h / 2);
    ctx.lineTo(x - w * 0.18, y - h / 2);
    ctx.lineTo(x + w * 0.3, y - h * 0.25);
    ctx.lineTo(x + w / 2, y + h / 2);
    ctx.closePath(); ctx.fill();
  }
  // stones
  ctx.fillStyle = '#352d1d';
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.arc(rng() * VIEW_W, rng() * VIEW_H, 1.5 + rng() * 2, 0, TAU);
    ctx.fill();
  }
  // dry cracks
  ctx.strokeStyle = '#2c2618';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    let x = rng() * VIEW_W, y = rng() * VIEW_H;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      x += (rng() - 0.5) * 70; y += (rng() - 0.5) * 70;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawNight(ctx, rng) {
  ctx.fillStyle = '#121419';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // dark ground patches
  ctx.fillStyle = '#171a21';
  for (let i = 0; i < 8; i++) blob(ctx, rng, rng() * VIEW_W, rng() * VIEW_H, 60, 150, 6);
  // moon: flat circle, no glow
  ctx.fillStyle = '#2a3040';
  ctx.beginPath(); ctx.arc(VIEW_W - 140, 110, 38, 0, TAU); ctx.fill();
  ctx.fillStyle = '#232838';
  ctx.beginPath(); ctx.arc(VIEW_W - 152, 100, 9, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(VIEW_W - 128, 124, 6, 0, TAU); ctx.fill();
  // stars
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = i % 4 === 0 ? '#6b7280' : '#3b4252';
    const x = rng() * VIEW_W, y = rng() * VIEW_H;
    ctx.fillRect(x, y, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1);
  }
}

function drawCircuit(ctx, rng) {
  ctx.fillStyle = '#14161a';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // grid lines
  ctx.strokeStyle = '#1c2026';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= VIEW_W; x += 40) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, VIEW_H); }
  for (let y = 0; y <= VIEW_H; y += 40) { ctx.moveTo(0, y + 0.5); ctx.lineTo(VIEW_W, y + 0.5); }
  ctx.stroke();
  // traces: L-shaped runs snapped to grid, with square pads at the ends
  for (let i = 0; i < 14; i++) {
    const x0 = Math.floor(rng() * 32) * 40, y0 = Math.floor(rng() * 18) * 40;
    const x1 = x0 + (Math.floor(rng() * 8) - 4) * 40;
    const y1 = y0 + (Math.floor(rng() * 6) - 3) * 40;
    ctx.strokeStyle = '#24372c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.fillStyle = '#2c4636';
    ctx.fillRect(x0 - 3, y0 - 3, 6, 6);
    ctx.fillRect(x1 - 3, y1 - 3, 6, 6);
  }
  // vias
  ctx.fillStyle = '#232830';
  for (let i = 0; i < 30; i++) {
    ctx.beginPath();
    ctx.arc(Math.floor(rng() * 32) * 40, Math.floor(rng() * 18) * 40, 3, 0, TAU);
    ctx.fill();
  }
}

const PROC_STYLES = {
  meadow: drawMeadow,
  desert: drawDesert,
  night: drawNight,
  circuit: drawCircuit,
};

// ---------------------------------------------------------------------------
// road
// ---------------------------------------------------------------------------

function drawRoad(ctx, mapDef) {
  const pts = mapDef.path || [];
  if (pts.length < 2) return;
  const r = mapDef.pathRadius || 26;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'butt';
  // edge lines: 2px on each side
  ctx.strokeStyle = COL.line;
  ctx.lineWidth = r * 2 + 4;
  ctx.beginPath();
  ctx.moveTo(ptX(pts[0]), ptY(pts[0]));
  for (let i = 1; i < pts.length; i++) ctx.lineTo(ptX(pts[i]), ptY(pts[i]));
  ctx.stroke();
  // road surface
  ctx.strokeStyle = COL.path;
  ctx.lineWidth = r * 2;
  ctx.beginPath();
  ctx.moveTo(ptX(pts[0]), ptY(pts[0]));
  for (let i = 1; i < pts.length; i++) ctx.lineTo(ptX(pts[i]), ptY(pts[i]));
  ctx.stroke();
  // entry arrow: chevron pointing along the first segment, just inside view
  const x0 = ptX(pts[0]), y0 = ptY(pts[0]);
  const x1 = ptX(pts[1]), y1 = ptY(pts[1]);
  const a = Math.atan2(y1 - y0, x1 - x0);
  let ax = x0, ay = y0;
  // step along the segment until the arrow anchor is on screen
  const segLen = Math.hypot(x1 - x0, y1 - y0) || 1;
  for (let d = 0; d <= segLen; d += 10) {
    ax = x0 + Math.cos(a) * d;
    ay = y0 + Math.sin(a) * d;
    if (ax > 24 && ax < VIEW_W - 24 && ay > 24 && ay < VIEW_H - 24) break;
  }
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(a);
  ctx.fillStyle = COL.line;
  ctx.beginPath();
  ctx.moveTo(10, 0); ctx.lineTo(-6, -9); ctx.lineTo(-2, 0); ctx.lineTo(-6, 9);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// draws the full background (proc shapes or image, then road) in 1280x720 space
function renderBackground(ctx, mapDef, onImageReady) {
  const bg = mapDef.bg || mapDef;
  const src = bg.src || mapDef.image || mapDef.bgImage || null;
  const proc = PROC_STYLES[bg.style || mapDef.style];
  if (proc && !src) {
    proc(ctx, mulberry32(hashStr(mapDef.id || mapDef.name)));
  } else if (src) {
    const entry = loadImage(src, onImageReady);
    if (entry.loaded) {
      const img = entry.img;
      const s = Math.max(VIEW_W / img.width, VIEW_H / img.height);
      const w = img.width * s, h = img.height * s;
      ctx.drawImage(img, (VIEW_W - w) / 2, (VIEW_H - h) / 2, w, h);
    } else {
      ctx.fillStyle = COL.surface;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
    // 35% dark overlay so the road and units read on top
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  } else {
    ctx.fillStyle = COL.bg;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  drawRoad(ctx, mapDef);
}

// ---------------------------------------------------------------------------
// procedural towers
// ---------------------------------------------------------------------------

const BARREL_TOKENS = { barrel2: 1, barrelLong: 1, barrelWide: 1 };
const BARREL_COL = '#a7adb8';
const BARREL_DARK = '#454b56';

function has(tokens, t) { return tokens.indexOf(t) !== -1; }

// draws a tower centered at the current origin; f = half footprint
function drawTowerBody(ctx, base, color, tokens, f, aim, hasGun) {
  // ring: outline circle around the whole base
  if (has(tokens, 'ring')) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, f + 4.5, 0, TAU); ctx.stroke();
  }
  // spikes: 8 small triangles on the perimeter (not aim-rotated)
  if (has(tokens, 'spikes')) {
    ctx.fillStyle = color;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(f - 1, -3); ctx.lineTo(f - 1, 3); ctx.lineTo(f + 5, 0);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }

  // aim-rotated layer: barrels and attachments sit under or over the base
  ctx.save();
  ctx.rotate(aim);

  // blades: 4 thin rotor bars through the center, under the base
  if (has(tokens, 'blades')) {
    ctx.fillStyle = BARREL_DARK;
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i / 4) * Math.PI);
      ctx.fillRect(-f - 7, -1.5, (f + 7) * 2, 3);
      ctx.restore();
    }
  }
  // tank: rectangle pod at the rear
  if (has(tokens, 'tank')) {
    ctx.fillStyle = BARREL_DARK;
    ctx.fillRect(-f - 7, -5, 8, 10);
    ctx.strokeStyle = BARREL_COL;
    ctx.lineWidth = 1;
    ctx.strokeRect(-f - 7, -5, 8, 10);
  }
  // fins: two rear triangles
  if (has(tokens, 'fins')) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-f + 2, -4); ctx.lineTo(-f - 7, -9); ctx.lineTo(-f - 3, -2);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-f + 2, 4); ctx.lineTo(-f - 7, 9); ctx.lineTo(-f - 3, 2);
    ctx.closePath(); ctx.fill();
  }

  // barrels
  const custom = has(tokens, 'barrel2') || has(tokens, 'barrelLong') || has(tokens, 'barrelWide');
  ctx.fillStyle = BARREL_COL;
  if (has(tokens, 'barrel2')) {
    ctx.fillRect(0, -5, f + 8, 3.5);
    ctx.fillRect(0, 1.5, f + 8, 3.5);
  }
  if (has(tokens, 'barrelLong')) {
    ctx.fillRect(0, -2, f + 14, 4);
  }
  if (has(tokens, 'barrelWide')) {
    ctx.fillRect(0, -4.5, f + 6, 9);
  }
  if (!custom && hasGun) {
    ctx.fillRect(0, -2, f + 6, 4);
  }
  if (has(tokens, 'twin')) {
    // mirrored second barrel facing backward
    ctx.fillRect(-(f + 6), -2, f + 6, 4);
  }
  // coil: bars wrapped across the barrel
  if (has(tokens, 'coil')) {
    ctx.fillStyle = COL.blue;
    ctx.fillRect(4, -5, 2.5, 10);
    ctx.fillRect(9, -5, 2.5, 10);
    ctx.fillRect(14, -5, 2.5, 10);
  }
  // scope: small circle with a sight line, on the barrel
  if (has(tokens, 'scope')) {
    ctx.strokeStyle = COL.text;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(7, -6, 3, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7, -6); ctx.lineTo(13, -6); ctx.stroke();
  }
  // drum: ammo drum circle beside the barrel root
  if (has(tokens, 'drum')) {
    ctx.fillStyle = BARREL_DARK;
    ctx.beginPath(); ctx.arc(2, 6, 4.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = BARREL_COL;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(2, 6, 4.5, 0, TAU); ctx.stroke();
  }
  // dish: open arc facing forward with a feed line
  if (has(tokens, 'dish')) {
    ctx.strokeStyle = BARREL_COL;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(f - 2, 0, 7, -Math.PI * 0.55, Math.PI * 0.55); ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(f + 2, 0); ctx.stroke();
  }
  ctx.restore();

  // base shape on top of barrels' roots
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;
  if (base === 'circle') {
    ctx.beginPath(); ctx.arc(0, 0, f, 0, TAU);
    ctx.fill(); ctx.stroke();
  } else if (base === 'hex') {
    polyPath(ctx, 0, 0, f + 1, 6, Math.PI / 6);
    ctx.fill(); ctx.stroke();
  } else if (base === 'diamond') {
    polyPath(ctx, 0, 0, f + 2, 4, 0);
    ctx.fill(); ctx.stroke();
  } else { // square
    ctx.fillRect(-f, -f, f * 2, f * 2);
    ctx.strokeRect(-f, -f, f * 2, f * 2);
  }

  // core: small accent square in the middle
  if (has(tokens, 'core')) {
    ctx.fillStyle = COL.accent;
    ctx.fillRect(-3.5, -3.5, 7, 7);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.strokeRect(-3.5, -3.5, 7, 7);
  }
  // crown: 3 triangles on top, never rotated
  if (has(tokens, 'crown')) {
    ctx.fillStyle = COL.accent;
    const cy = -f - 2;
    ctx.beginPath();
    ctx.moveTo(-7, cy); ctx.lineTo(-7, cy - 6); ctx.lineTo(-3.5, cy);
    ctx.lineTo(0, cy - 7); ctx.lineTo(3.5, cy);
    ctx.lineTo(7, cy - 6); ctx.lineTo(7, cy);
    ctx.closePath(); ctx.fill();
  }
}

function towerTokens(towerDef) {
  const v = towerDef && towerDef.visual;
  if (!v) return [];
  if (Array.isArray(v.tokens)) return v.tokens;
  if (Array.isArray(v.add)) return v.add;
  return [];
}

function towerIsGun(towerDef) {
  return !towerDef || towerDef.mode !== 'support';
}

export function drawTowerIcon(ctx, towerDef, size) {
  const v = (towerDef && towerDef.visual) || {};
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.scale(size / 40, size / 40);
  drawTowerBody(ctx, v.base || 'square', v.color || COL.blue,
    towerTokens(towerDef), 11, -Math.PI / 2, towerIsGun(towerDef));
  ctx.restore();
}

export function drawMapThumb(canvas, mapDef) {
  const ctx = canvas.getContext('2d');
  const paint = () => {
    ctx.save();
    ctx.setTransform(canvas.width / VIEW_W, 0, 0, canvas.height / VIEW_H, 0, 0);
    renderBackground(ctx, mapDef, null);
    ctx.restore();
  };
  ctx.save();
  ctx.setTransform(canvas.width / VIEW_W, 0, 0, canvas.height / VIEW_H, 0, 0);
  renderBackground(ctx, mapDef, paint); // repaints once the image finishes loading
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

export class Renderer {
  constructor(canvas, mapDef) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mapDef = mapDef;
    // pre-rendered background
    this.bg = document.createElement('canvas');
    this.bg.width = VIEW_W;
    this.bg.height = VIEW_H;
    this._renderBg();
    // reusable overlay canvas for the blackout debuff
    this.ovl = document.createElement('canvas');
    this.ovl.width = VIEW_W;
    this.ovl.height = VIEW_H;
  }

  _renderBg() {
    const ctx = this.bg.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    renderBackground(ctx, this.mapDef, () => this._renderBg());
  }

  draw(simState, ui) {
    const ctx = this.ctx;
    const cw = this.canvas.width, ch = this.canvas.height;
    const s = Math.min(cw / VIEW_W, ch / VIEW_H);
    const ox = (cw - VIEW_W * s) / 2;
    const oy = (ch - VIEW_H * s) / 2;
    const alpha = (ui && typeof ui.alpha === 'number') ? ui.alpha : 1;

    // letterbox bars + transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = COL.bg;
    ctx.fillRect(0, 0, cw, ch);
    ctx.setTransform(s, 0, 0, s, ox, oy);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, VIEW_W, VIEW_H);
    ctx.clip();

    ctx.drawImage(this.bg, 0, 0);

    const towers = simState.towers || [];
    const enemies = simState.enemies || [];
    const projectiles = simState.projectiles || [];
    const effects = simState.effects || [];

    // towers ----------------------------------------------------------------
    for (let i = 0; i < towers.length; i++) {
      this._drawTower(ctx, towers[i], ui);
    }

    // enemies ---------------------------------------------------------------
    for (let i = 0; i < enemies.length; i++) {
      this._drawEnemy(ctx, enemies[i], alpha);
    }

    // projectiles -----------------------------------------------------------
    for (let i = 0; i < projectiles.length; i++) {
      const p = projectiles[i];
      const px = (p.px !== undefined) ? p.px + (p.x - p.px) * alpha : p.x;
      const py = (p.py !== undefined) ? p.py + (p.y - p.py) * alpha : p.y;
      const dt = p.damageType || 'sharp';
      ctx.fillStyle = DMG_COLOR[dt] || COL.text;
      if (dt === 'blast' || dt === 'cold') {
        ctx.beginPath(); ctx.arc(px, py, 2, 0, TAU); ctx.fill();
      } else if (dt === 'energy') {
        ctx.beginPath();
        ctx.moveTo(px, py - 3); ctx.lineTo(px + 3, py);
        ctx.lineTo(px, py + 3); ctx.lineTo(px - 3, py);
        ctx.closePath(); ctx.fill();
      } else {
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
      }
    }

    // effects ---------------------------------------------------------------
    for (let i = 0; i < effects.length; i++) {
      const e = effects[i];
      const ty = e.type || e.kind;
      if (ty === 'beam' || ty === 'chain') {
        ctx.strokeStyle = DMG_COLOR[e.damageType] || (ty === 'chain' ? COL.blue : COL.text);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(e.x1 != null ? e.x1 : e.x, e.y1 != null ? e.y1 : e.y);
        ctx.lineTo(e.x2, e.y2);
        ctx.stroke();
      } else if (ty === 'spray' || ty === 'cone') {
        const half = ((e.spread || e.coneDeg || 40) * Math.PI / 180) / 2;
        const rr = e.range || e.r || 90;
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = DMG_COLOR[e.damageType] || COL.accent;
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x + Math.cos(e.angle - half) * rr, e.y + Math.sin(e.angle - half) * rr);
        ctx.lineTo(e.x + Math.cos(e.angle) * rr * 1.06, e.y + Math.sin(e.angle) * rr * 1.06);
        ctx.lineTo(e.x + Math.cos(e.angle + half) * rr, e.y + Math.sin(e.angle + half) * rr);
        ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1;
      } else if (ty) {
        // ring effects: hit, flash, pulse, splash, heal, shieldpulse,
        // bossphase, split, headshot, magnet, bigfreeze, airstrike, meltdown
        ctx.strokeStyle = ty === 'heal' ? COL.good
          : ty === 'bossphase' || ty === 'airstrike' || ty === 'headshot' ? COL.bad
          : ty === 'bigfreeze' || ty === 'pulse' ? COL.blue
          : ty === 'meltdown' ? COL.accent
          : COL.text;
        ctx.lineWidth = 1;
        const rr = e.r || (ty === 'bigfreeze' || ty === 'airstrike' || ty === 'meltdown' ? 120 : 12);
        ctx.beginPath(); ctx.arc(e.x, e.y, rr, 0, TAU); ctx.stroke();
      }
    }

    // selected tower range --------------------------------------------------
    if (ui && ui.selected) {
      const t = ui.selected;
      const range = t.range || (t.def && t.def.range) || 0;
      if (range > 0 && range < 9000) {
        ctx.strokeStyle = 'rgba(230,232,235,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(t.x, t.y, range, 0, TAU); ctx.stroke();
      }
    }

    // placement ghost ---------------------------------------------------------
    if (ui && ui.placing && ui.mouse) {
      const def = ui.placing;
      const mx = ui.mouse.x, my = ui.mouse.y;
      if (def.range && def.range < 9000) {
        ctx.strokeStyle = 'rgba(230,232,235,0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(mx, my, def.range, 0, TAU); ctx.stroke();
      }
      ctx.globalAlpha = 0.6;
      ctx.save();
      ctx.translate(mx, my);
      const v = def.visual || {};
      drawTowerBody(ctx, v.base || 'square', v.color || COL.blue,
        towerTokens(def), 11, -Math.PI / 2, towerIsGun(def));
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // blackout debuff ---------------------------------------------------------
    if (ui && ui.blackout) {
      const octx = this.ovl.getContext('2d');
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.globalCompositeOperation = 'source-over';
      octx.clearRect(0, 0, VIEW_W, VIEW_H);
      octx.fillStyle = 'rgba(0,0,0,0.82)';
      octx.fillRect(0, 0, VIEW_W, VIEW_H);
      octx.globalCompositeOperation = 'destination-out';
      octx.fillStyle = '#fff';
      for (let i = 0; i < towers.length; i++) {
        octx.beginPath();
        octx.arc(towers[i].x, towers[i].y, 90, 0, TAU);
        octx.fill();
      }
      octx.globalCompositeOperation = 'source-over';
      ctx.drawImage(this.ovl, 0, 0);
    }

    // send target indicator ---------------------------------------------------
    if (ui && ui.targetingPlayer) {
      ctx.fillStyle = COL.accent;
      ctx.font = '13px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('TARGET: ' + ui.targetingPlayer, VIEW_W - 10, 8);
    }

    ctx.restore();
  }

  _drawTower(ctx, t, ui) {
    const def = t.def || {};
    const v = def.visual || {};
    // combined token list: base visual plus purchased visualAdd tokens (cached)
    const vt = t.visualTokens || [];
    if (!t._rtok || t._rtokN !== vt.length) {
      t._rtok = towerTokens(def).concat(vt);
      t._rtokN = vt.length;
    }
    const tier = (typeof t.tier === 'number') ? t.tier : vt.length;
    const f = Math.min(11 + tier * 0.9, 15); // footprint grows slightly per tier

    ctx.save();
    ctx.translate(t.x, t.y);
    drawTowerBody(ctx, v.base || 'square', v.color || COL.blue,
      t._rtok, f, t.aim || 0, towerIsGun(def));
    if (t.disabled || t.jammed) {
      // 40% darker plus an X
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(-f - 4, -f - 4, (f + 4) * 2, (f + 4) * 2);
      ctx.strokeStyle = COL.bad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-f, -f); ctx.lineTo(f, f);
      ctx.moveTo(f, -f); ctx.lineTo(-f, f);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawEnemy(ctx, e, alpha) {
    const def = e.def || {};
    const traits = def.traits || {};
    const size = def.size || e.size || 9;
    const x = (e.px !== undefined) ? e.px + (e.x - e.px) * alpha : e.x;
    const y = (e.py !== undefined) ? e.py + (e.y - e.py) * alpha : e.y;
    const shape = def.shape || 'circle';

    ctx.fillStyle = def.color || e.color || COL.bad;
    if (shape === 'circle') {
      ctx.beginPath(); ctx.arc(x, y, size, 0, TAU); ctx.fill();
    } else if (shape === 'triangle') {
      polyPath(ctx, x, y, size + 1, 3, -Math.PI / 2); ctx.fill();
    } else if (shape === 'square') {
      ctx.fillRect(x - size * 0.85, y - size * 0.85, size * 1.7, size * 1.7);
    } else if (shape === 'pentagon') {
      polyPath(ctx, x, y, size, 5, -Math.PI / 2); ctx.fill();
    } else { // hex (bosses are big hexes)
      polyPath(ctx, x, y, size, 6, 0); ctx.fill();
    }

    // hit flash: 1-tick white outline
    if (e.flash) {
      ctx.strokeStyle = COL.text;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, size + 1.5, 0, TAU); ctx.stroke();
    }
    // camo: dashed outline
    if (traits.camo) {
      ctx.strokeStyle = COL.text;
      ctx.lineWidth = 1;
      ctx.setLineDash(DASH_CAMO);
      ctx.beginPath(); ctx.arc(x, y, size + 3, 0, TAU); ctx.stroke();
      ctx.setLineDash(DASH_NONE);
    }
    // shield: thin white ring while shield hits remain
    const shield = (e.shield !== undefined) ? e.shield : traits.shield;
    if (shield > 0) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, size + 5, 0, TAU); ctx.stroke();
    }
    // regen: small green plus tick
    if (traits.regen) {
      ctx.strokeStyle = COL.good;
      ctx.lineWidth = 1.5;
      const tx = x + size + 4, ty = y - size - 4;
      ctx.beginPath();
      ctx.moveTo(tx - 3, ty); ctx.lineTo(tx + 3, ty);
      ctx.moveTo(tx, ty - 3); ctx.lineTo(tx, ty + 3);
      ctx.stroke();
    }
    // boss / miniboss hp bar
    if (traits.boss || def.boss || def.miniboss) {
      const maxHp = e.maxHp || def.hp || 1;
      const frac = Math.max(0, Math.min(1, (e.hp !== undefined ? e.hp : maxHp) / maxHp));
      const bw = Math.max(size * 2.4, 34);
      const bx = x - bw / 2, by = y - size - 9;
      ctx.fillStyle = COL.surface;
      ctx.fillRect(bx, by, bw, 3);
      ctx.fillStyle = COL.bad;
      ctx.fillRect(bx, by, bw * frac, 3);
    }
  }
}
