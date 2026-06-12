// RUSH TD enemy definitions. Pure data, importable in Node (no DOM access).
// 15 regular enemies (tiers 1-7), 3 minibosses, 1 boss. See DESIGN.md.
// `child` spawns on death at the same position; `childCount` spawns that many.
// Traits used here are only from the DESIGN.md catalog:
// camo, regen (hp/s), shield (absorbs n hits), immune ([damage types]), split, boss.

const enemies = [
  {
    id: 'mite',
    name: 'Mite',
    hp: 1,
    speed: 1.0,
    size: 6,
    color: '#ef4444',
    shape: 'circle',
    tier: 1,
    bounty: 1,
    livesCost: 1,
    traits: {},
    desc: 'The smallest crawler, one hit and it is gone.'
  },
  {
    id: 'drone',
    name: 'Drone',
    hp: 2,
    speed: 1.15,
    size: 7,
    color: '#60a5fa',
    shape: 'circle',
    tier: 2,
    bounty: 1,
    livesCost: 2,
    traits: {},
    child: 'mite',
    desc: 'A shell around a Mite, slightly quicker on its feet.'
  },
  {
    id: 'runner',
    name: 'Runner',
    hp: 4,
    speed: 1.3,
    size: 8,
    color: '#4ade80',
    shape: 'triangle',
    tier: 3,
    bounty: 2,
    livesCost: 3,
    traits: {},
    child: 'drone',
    desc: 'Lean and fast, sheds into a Drone when popped.'
  },
  {
    id: 'wisp',
    name: 'Wisp',
    hp: 4,
    speed: 1.35,
    size: 8,
    color: '#86efac',
    shape: 'triangle',
    tier: 3,
    bounty: 2,
    livesCost: 3,
    traits: { camo: true },
    child: 'drone',
    desc: 'A flickering Runner that only camo detection can target.'
  },
  {
    id: 'bolt',
    name: 'Bolt',
    hp: 10,
    speed: 1.9,
    size: 9,
    color: '#e2b714',
    shape: 'triangle',
    tier: 4,
    bounty: 5,
    livesCost: 4,
    traits: {},
    child: 'runner',
    desc: 'A streak of yellow that outruns most early projectiles.'
  },
  {
    id: 'swarmling',
    name: 'Swarmling',
    hp: 8,
    speed: 2.2,
    size: 7,
    color: '#facc15',
    shape: 'triangle',
    tier: 4,
    bounty: 4,
    livesCost: 4,
    traits: {},
    child: 'runner',
    desc: 'Tiny, frail and the fastest thing on the track.'
  },
  {
    id: 'ingot',
    name: 'Ingot',
    hp: 22,
    speed: 0.6,
    size: 12,
    color: '#9ca3af',
    shape: 'square',
    tier: 5,
    bounty: 11,
    livesCost: 4,
    traits: { immune: ['sharp'] },
    child: 'runner',
    desc: 'A slab of dead metal, sharp attacks bounce right off.'
  },
  {
    id: 'leech',
    name: 'Leech',
    hp: 24,
    speed: 1.0,
    size: 11,
    color: '#a78bfa',
    shape: 'square',
    tier: 5,
    bounty: 12,
    livesCost: 5,
    traits: { regen: 2 },
    child: 'bolt',
    desc: 'Knits itself back together unless you finish it fast.'
  },
  {
    id: 'aegis',
    name: 'Aegis',
    hp: 20,
    speed: 1.0,
    size: 11,
    color: '#8b5cf6',
    shape: 'square',
    tier: 5,
    bounty: 10,
    livesCost: 5,
    traits: { shield: 3 },
    child: 'bolt',
    desc: 'Carries a plate shield that soaks the first three hits.'
  },
  {
    id: 'geode',
    name: 'Geode',
    hp: 26,
    speed: 0.9,
    size: 12,
    color: '#7c3aed',
    shape: 'square',
    tier: 5,
    bounty: 13,
    livesCost: 5,
    traits: { immune: ['blast'] },
    child: 'bolt',
    desc: 'Crystal lattice shrugs off every explosion.'
  },
  {
    id: 'phantom',
    name: 'Phantom',
    hp: 22,
    speed: 1.4,
    size: 11,
    color: '#c4b5fd',
    shape: 'square',
    tier: 5,
    bounty: 11,
    livesCost: 4,
    traits: { camo: true },
    child: 'wisp',
    desc: 'Fast, half seen, and hiding a Wisp underneath.'
  },
  {
    id: 'husk',
    name: 'Husk',
    hp: 70,
    speed: 0.9,
    size: 15,
    color: '#fb923c',
    shape: 'pentagon',
    tier: 6,
    bounty: 35,
    livesCost: 9,
    traits: {},
    child: 'bolt',
    childCount: 2,
    desc: 'A baked ceramic shell that cracks open into two Bolts.'
  },
  {
    id: 'ravager',
    name: 'Ravager',
    hp: 60,
    speed: 1.4,
    size: 14,
    color: '#f97316',
    shape: 'pentagon',
    tier: 6,
    bounty: 30,
    livesCost: 9,
    traits: {},
    child: 'bolt',
    childCount: 2,
    desc: 'A sprinting Husk, lighter shell but frightening pace.'
  },
  {
    id: 'onyx',
    name: 'Onyx',
    hp: 120,
    speed: 0.7,
    size: 17,
    color: '#c2410c',
    shape: 'pentagon',
    tier: 6,
    bounty: 60,
    livesCost: 13,
    traits: {},
    child: 'bolt',
    childCount: 3,
    desc: 'Dense black ceramic, shatters into a trio of Bolts.'
  },
  {
    id: 'colossus',
    name: 'Colossus',
    hp: 700,
    speed: 0.6,
    size: 22,
    color: '#d1d5db',
    shape: 'hex',
    tier: 7,
    bounty: 350,
    livesCost: 37,
    traits: {},
    child: 'husk',
    childCount: 4,
    desc: 'A slow armored hulk that bursts into four Husks.'
  },
  {
    id: 'mb_healer',
    name: 'The Mender',
    hp: 800,
    speed: 0.7,
    size: 24,
    color: '#f472b6',
    shape: 'hex',
    tier: 7,
    bounty: 400,
    livesCost: 50,
    traits: { regen: 4 },
    desc: 'Miniboss: pulses every 3s, healing all enemies within 120px for 8 hp.'
  },
  {
    id: 'mb_splitter',
    name: 'The Brood',
    hp: 1400,
    speed: 0.65,
    size: 25,
    color: '#fb7185',
    shape: 'hex',
    tier: 7,
    bounty: 700,
    livesCost: 55,
    traits: {},
    desc: 'Miniboss: each time it loses 25% hp it emits a wave of 6 Swarmlings.'
  },
  {
    id: 'mb_warden',
    name: 'The Bulwark',
    hp: 2200,
    speed: 0.6,
    size: 26,
    color: '#38bdf8',
    shape: 'hex',
    tier: 7,
    bounty: 1100,
    livesCost: 60,
    traits: { shield: 40 },
    desc: 'Miniboss: heavily shielded, grants shield 2 to enemies within 140px.'
  },
  {
    id: 'boss_overlord',
    name: 'The Overlord',
    hp: 25000,
    speed: 0.5,
    size: 34,
    color: '#991b1b',
    shape: 'hex',
    tier: 8,
    bounty: 4000,
    livesCost: 150,
    traits: { boss: true },
    desc: 'Boss: at 75/50/25% hp spawns an escort wave of 4 Husks and 6 Bolts and gains speed x1.6 for 5s.'
  }
];

// ---- validation (throws at import time so bad data never ships) ----

const VALID_TRAITS = new Set(['camo', 'regen', 'shield', 'immune', 'split', 'boss']);
const VALID_DAMAGE_TYPES = new Set(['sharp', 'blast', 'energy', 'cold', 'toxic']);
const VALID_SHAPES = new Set(['circle', 'triangle', 'square', 'pentagon', 'hex']);
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const ids = new Set(enemies.map((e) => e.id));
if (ids.size !== enemies.length) {
  throw new Error('enemies.js: duplicate enemy ids');
}

for (const e of enemies) {
  if (!HEX_COLOR.test(e.color)) {
    throw new Error('enemies.js: invalid hex color "' + e.color + '" on enemy "' + e.id + '"');
  }
  if (!VALID_SHAPES.has(e.shape)) {
    throw new Error('enemies.js: invalid shape "' + e.shape + '" on enemy "' + e.id + '"');
  }
  if (e.child !== undefined && !ids.has(e.child)) {
    throw new Error('enemies.js: unknown child id "' + e.child + '" on enemy "' + e.id + '"');
  }
  for (const key of Object.keys(e.traits)) {
    if (!VALID_TRAITS.has(key)) {
      throw new Error('enemies.js: unknown trait "' + key + '" on enemy "' + e.id + '"');
    }
  }
  if (e.traits.immune) {
    for (const t of e.traits.immune) {
      if (!VALID_DAMAGE_TYPES.has(t)) {
        throw new Error('enemies.js: unknown damage type "' + t + '" in immune list of "' + e.id + '"');
      }
    }
  }
  if (e.traits.split) {
    if (!ids.has(e.traits.split.id)) {
      throw new Error('enemies.js: unknown split id "' + e.traits.split.id + '" on enemy "' + e.id + '"');
    }
  }
}

export default enemies;
