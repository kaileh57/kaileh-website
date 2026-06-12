// RUSH TD round definitions. Pure data plus scaleRound(), importable in Node.
// 45 handcrafted rounds. Minibosses at 18, 28, 36. Boss at 45.
// Group fields: enemy (id), count, spacing (s between spawns), delay (s after round start).
// Rounds 46+ are procedural via scaleRound(n): late-game templates (rounds 38-44)
// in rotation with an hp multiplier of 1.18^(n-45) set on round.hpMult (the sim
// multiplies enemy hp by it) plus growing counts. Bounty does not scale, so threat
// compounds while income flattens and everyone dies by about round 60.

import enemies from './enemies.js';

const rounds = [
  {
    n: 1,
    groups: [{ enemy: 'mite', count: 10, spacing: 1.7, delay: 0 }],
    note: 'Teaching round. Place your first tower.'
  },
  {
    n: 2,
    groups: [{ enemy: 'mite', count: 16, spacing: 1.1, delay: 0 }]
  },
  {
    n: 3,
    groups: [
      { enemy: 'mite', count: 10, spacing: 1.0, delay: 0 },
      { enemy: 'drone', count: 6, spacing: 1.6, delay: 8 }
    ],
    note: 'Drones layer into Mites when popped.'
  },
  {
    n: 4,
    groups: [{ enemy: 'drone', count: 14, spacing: 1.2, delay: 0 }]
  },
  {
    n: 5,
    groups: [
      { enemy: 'mite', count: 20, spacing: 0.7, delay: 0 },
      { enemy: 'drone', count: 10, spacing: 1.2, delay: 6 }
    ],
    note: 'First paced rush.'
  },
  {
    n: 6,
    groups: [
      { enemy: 'drone', count: 12, spacing: 1.0, delay: 0 },
      { enemy: 'runner', count: 6, spacing: 1.6, delay: 9 }
    ],
    note: 'Runners are quick. Watch your coverage.'
  },
  {
    n: 7,
    groups: [{ enemy: 'runner', count: 14, spacing: 1.3, delay: 0 }]
  },
  {
    n: 8,
    groups: [
      { enemy: 'runner', count: 8, spacing: 1.0, delay: 0 },
      { enemy: 'drone', count: 14, spacing: 0.8, delay: 4 },
      { enemy: 'runner', count: 8, spacing: 1.0, delay: 14 }
    ],
    note: 'Sandwich: fast, slow filler, fast again.'
  },
  {
    n: 9,
    groups: [
      { enemy: 'runner', count: 12, spacing: 1.4, delay: 0 },
      { enemy: 'bolt', count: 6, spacing: 2.2, delay: 2 }
    ],
    note: 'Bolts outrun your aim. Lead them.'
  },
  {
    n: 10,
    groups: [
      { enemy: 'runner', count: 12, spacing: 1.2, delay: 0 },
      { enemy: 'wisp', count: 8, spacing: 1.7, delay: 4 }
    ],
    note: 'First camo. You need camo detection.'
  },
  {
    n: 11,
    groups: [
      { enemy: 'bolt', count: 10, spacing: 1.3, delay: 0 },
      { enemy: 'swarmling', count: 12, spacing: 0.7, delay: 9 }
    ],
    note: 'Swarmlings: tiny, fragile, blisteringly fast.'
  },
  {
    n: 12,
    groups: [
      { enemy: 'runner', count: 14, spacing: 1.1, delay: 0 },
      { enemy: 'ingot', count: 4, spacing: 4.5, delay: 2 }
    ],
    note: 'First lead. Ingots are immune to sharp damage.'
  },
  {
    n: 13,
    groups: [{ enemy: 'bolt', count: 16, spacing: 1.4, delay: 0 }],
    note: 'Breather. Bank some eco.'
  },
  {
    n: 14,
    groups: [
      { enemy: 'leech', count: 6, spacing: 3.0, delay: 2 },
      { enemy: 'wisp', count: 10, spacing: 1.5, delay: 4 }
    ],
    note: 'First regen. Leeches heal if you tickle them.'
  },
  {
    n: 15,
    groups: [
      { enemy: 'bolt', count: 12, spacing: 1.1, delay: 0 },
      { enemy: 'aegis', count: 6, spacing: 2.6, delay: 3 }
    ],
    note: 'Aegis shields absorb hits, not damage. Use fast attackers.'
  },
  {
    n: 16,
    groups: [
      { enemy: 'wisp', count: 14, spacing: 0.9, delay: 0 },
      { enemy: 'phantom', count: 6, spacing: 2.2, delay: 7 }
    ],
    note: 'Camo rush. Phantoms hide a Wisp inside.'
  },
  {
    n: 17,
    groups: [
      { enemy: 'swarmling', count: 20, spacing: 0.7, delay: 0 },
      { enemy: 'ingot', count: 8, spacing: 2.4, delay: 4 }
    ],
    note: 'Speed up front, lead in the back.'
  },
  {
    n: 18,
    groups: [
      { enemy: 'leech', count: 10, spacing: 2.0, delay: 0 },
      { enemy: 'bolt', count: 12, spacing: 1.3, delay: 4 },
      { enemy: 'mb_healer', count: 1, spacing: 1.0, delay: 6 }
    ],
    note: 'MINIBOSS: The Mender heals everything near it. Kill it first.'
  },
  {
    n: 19,
    groups: [
      { enemy: 'bolt', count: 14, spacing: 1.2, delay: 0 },
      { enemy: 'aegis', count: 8, spacing: 2.0, delay: 3 }
    ],
    note: 'Breather after the Mender.'
  },
  {
    n: 20,
    groups: [
      { enemy: 'bolt', count: 12, spacing: 1.2, delay: 0 },
      { enemy: 'geode', count: 6, spacing: 2.6, delay: 3 }
    ],
    note: 'Geodes are immune to blast. Diversify damage types.'
  },
  {
    n: 21,
    groups: [
      { enemy: 'phantom', count: 10, spacing: 1.6, delay: 0 },
      { enemy: 'ingot', count: 10, spacing: 1.9, delay: 1 }
    ],
    note: 'Camo and lead at once. Coverage check.'
  },
  {
    n: 22,
    groups: [
      { enemy: 'swarmling', count: 14, spacing: 0.8, delay: 0 },
      { enemy: 'husk', count: 3, spacing: 5.5, delay: 4 }
    ],
    note: 'First ceramics. Husks crack into Bolts.'
  },
  {
    n: 23,
    groups: [{ enemy: 'leech', count: 16, spacing: 1.3, delay: 0 }],
    note: 'Regen rush. Focus fire or they walk it off.'
  },
  {
    n: 24,
    groups: [
      { enemy: 'geode', count: 10, spacing: 1.9, delay: 0 },
      { enemy: 'husk', count: 5, spacing: 4.0, delay: 2 }
    ]
  },
  {
    n: 25,
    groups: [
      { enemy: 'aegis', count: 10, spacing: 1.6, delay: 0 },
      { enemy: 'phantom', count: 8, spacing: 1.6, delay: 6 },
      { enemy: 'ingot', count: 6, spacing: 2.2, delay: 12 }
    ],
    note: 'Halfway. Every tier 5 trait in one wave.'
  },
  {
    n: 26,
    groups: [
      { enemy: 'wisp', count: 12, spacing: 1.0, delay: 0 },
      { enemy: 'ravager', count: 6, spacing: 3.0, delay: 3 }
    ],
    note: 'Ravagers: ceramics that sprint.'
  },
  {
    n: 27,
    groups: [
      { enemy: 'bolt', count: 20, spacing: 0.9, delay: 0 },
      { enemy: 'husk', count: 6, spacing: 3.2, delay: 6 }
    ]
  },
  {
    n: 28,
    groups: [
      { enemy: 'swarmling', count: 16, spacing: 0.8, delay: 0 },
      { enemy: 'mb_splitter', count: 1, spacing: 1.0, delay: 6 },
      { enemy: 'leech', count: 8, spacing: 1.8, delay: 10 }
    ],
    note: 'MINIBOSS: The Brood vomits Swarmlings every quarter of its hp.'
  },
  {
    n: 29,
    groups: [
      { enemy: 'geode', count: 12, spacing: 1.6, delay: 0 },
      { enemy: 'aegis', count: 12, spacing: 1.6, delay: 2 }
    ],
    note: 'Breather. Shore up your damage mix.'
  },
  {
    n: 30,
    groups: [
      { enemy: 'phantom', count: 10, spacing: 1.6, delay: 2 },
      { enemy: 'onyx', count: 4, spacing: 5.0, delay: 3 }
    ],
    note: 'Onyx: dense ceramic, triple Bolt core.'
  },
  {
    n: 31,
    groups: [
      { enemy: 'ravager', count: 8, spacing: 2.2, delay: 2 },
      { enemy: 'husk', count: 8, spacing: 2.6, delay: 4 }
    ]
  },
  {
    n: 32,
    groups: [
      { enemy: 'bolt', count: 14, spacing: 1.1, delay: 0 },
      { enemy: 'colossus', count: 1, spacing: 1.0, delay: 8 },
      { enemy: 'leech', count: 8, spacing: 1.6, delay: 12 }
    ],
    note: 'First Colossus. 700 hp and four Husks inside.'
  },
  {
    n: 33,
    groups: [
      { enemy: 'phantom', count: 18, spacing: 1.0, delay: 0 },
      { enemy: 'wisp', count: 12, spacing: 0.8, delay: 6 }
    ],
    note: 'Camo storm. Detection or defeat.'
  },
  {
    n: 34,
    groups: [
      { enemy: 'onyx', count: 6, spacing: 3.6, delay: 2 },
      { enemy: 'ingot', count: 10, spacing: 1.9, delay: 3 }
    ]
  },
  {
    n: 35,
    groups: [
      { enemy: 'swarmling', count: 24, spacing: 0.6, delay: 0 },
      { enemy: 'husk', count: 10, spacing: 2.2, delay: 6 }
    ]
  },
  {
    n: 36,
    groups: [
      { enemy: 'aegis', count: 12, spacing: 1.6, delay: 0 },
      { enemy: 'mb_warden', count: 1, spacing: 1.0, delay: 6 },
      { enemy: 'geode', count: 8, spacing: 2.0, delay: 8 }
    ],
    note: 'MINIBOSS: The Bulwark shields its escort. Strip or burn through.'
  },
  {
    n: 37,
    groups: [
      { enemy: 'ravager', count: 12, spacing: 1.5, delay: 2 },
      { enemy: 'colossus', count: 2, spacing: 12.0, delay: 4 }
    ]
  },
  {
    n: 38,
    groups: [
      { enemy: 'phantom', count: 16, spacing: 1.1, delay: 0 },
      { enemy: 'onyx', count: 8, spacing: 2.6, delay: 4 }
    ]
  },
  {
    n: 39,
    groups: [{ enemy: 'husk', count: 20, spacing: 1.3, delay: 0 }],
    note: 'Ceramic wall. Last calm before the ramp.'
  },
  {
    n: 40,
    groups: [
      { enemy: 'onyx', count: 10, spacing: 2.2, delay: 2 },
      { enemy: 'colossus', count: 3, spacing: 8.0, delay: 4 }
    ],
    note: 'The brutal ramp begins.'
  },
  {
    n: 41,
    groups: [
      { enemy: 'ravager', count: 24, spacing: 0.9, delay: 0 },
      { enemy: 'leech', count: 12, spacing: 1.3, delay: 6 },
      { enemy: 'geode', count: 12, spacing: 1.3, delay: 12 }
    ]
  },
  {
    n: 42,
    groups: [
      { enemy: 'husk', count: 12, spacing: 1.5, delay: 2 },
      { enemy: 'colossus', count: 4, spacing: 6.0, delay: 3 },
      { enemy: 'phantom', count: 12, spacing: 1.2, delay: 8 }
    ]
  },
  {
    n: 43,
    groups: [
      { enemy: 'onyx', count: 12, spacing: 2.0, delay: 2 },
      { enemy: 'swarmling', count: 24, spacing: 0.5, delay: 6 },
      { enemy: 'aegis', count: 10, spacing: 1.5, delay: 10 }
    ]
  },
  {
    n: 44,
    groups: [
      { enemy: 'colossus', count: 5, spacing: 5.0, delay: 4 },
      { enemy: 'onyx', count: 10, spacing: 2.0, delay: 6 },
      { enemy: 'ravager', count: 16, spacing: 0.9, delay: 12 }
    ],
    note: 'The final gauntlet. Spend everything.'
  },
  {
    n: 45,
    groups: [
      { enemy: 'husk', count: 12, spacing: 1.6, delay: 0 },
      { enemy: 'boss_overlord', count: 1, spacing: 1.0, delay: 8 },
      { enemy: 'phantom', count: 10, spacing: 1.5, delay: 14 }
    ],
    note: 'BOSS: The Overlord. Escort waves and a speed burst at 75/50/25% hp.'
  }
];

// ---- validation (throws at import time) ----

const enemyIds = new Set(enemies.map((e) => e.id));

if (rounds.length !== 45) {
  throw new Error('rounds.js: expected 45 handcrafted rounds, got ' + rounds.length);
}
rounds.forEach((r, i) => {
  if (r.n !== i + 1) {
    throw new Error('rounds.js: round at index ' + i + ' has n=' + r.n + ', expected ' + (i + 1));
  }
  if (!Array.isArray(r.groups) || r.groups.length === 0) {
    throw new Error('rounds.js: round ' + r.n + ' has no groups');
  }
  for (const g of r.groups) {
    if (!enemyIds.has(g.enemy)) {
      throw new Error('rounds.js: round ' + r.n + ' references unknown enemy id "' + g.enemy + '"');
    }
    if (!(g.count >= 1) || !(g.spacing > 0) || !(g.delay >= 0)) {
      throw new Error('rounds.js: round ' + r.n + ' group "' + g.enemy + '" has invalid count/spacing/delay');
    }
  }
});

// ---- procedural scaling for rounds 46+ ----

// Late-game templates: rounds 38-44 reused in rotation. Round 45 (the boss round)
// is intentionally excluded so the Overlord stays a one-time event.
const TEMPLATE_START = 38;
const TEMPLATE_END = 44;
const templates = rounds.slice(TEMPLATE_START - 1, TEMPLATE_END);
const minibossIds = ['mb_healer', 'mb_splitter', 'mb_warden'];

// scaleRound(n) for n > 45. Returns a round object shaped like the handcrafted
// ones plus an `hpMult` field; the sim multiplies enemy hp by round.hpMult.
// Rounds 46-55 are hard: hp ramps x1.18 per round (x1.18 at 46 up to x5.2 at 55)
// and counts grow 8% per round. Rounds 56+ are absurd: hp keeps compounding
// (x12.4 at 60, x28 at 65) and counts grow an extra 20% per round past 55,
// with bonus Colossus waves every 3rd round and a miniboss every 5th round.
// Bounty never scales, so income flattens while threat compounds and the match
// ends by attrition around round 60.
export function scaleRound(n) {
  if (!Number.isInteger(n) || n <= 45) {
    throw new Error('rounds.js: scaleRound(n) requires an integer round n > 45, got ' + n);
  }
  const k = n - 45;
  const template = templates[(n - 46) % templates.length];
  const hpMult = Math.pow(1.18, k);

  // Count growth: steady through 46-55, runaway after 55. Capped per group so a
  // single round can never spawn an absurd number of entities and stall the sim.
  let countMult = 1 + k * 0.08;
  if (n > 55) countMult += (n - 55) * 0.2;

  const groups = template.groups.map((g) => ({
    enemy: g.enemy,
    count: Math.min(80, Math.round(g.count * countMult)),
    spacing: g.spacing,
    delay: g.delay
  }));

  // Every 3rd procedural round: append an extra Colossus pack at the tail.
  if (k % 3 === 0) {
    const lastDelay = groups.reduce((m, g) => Math.max(m, g.delay), 0);
    groups.push({
      enemy: 'colossus',
      count: Math.min(12, 1 + Math.floor(k / 6)),
      spacing: 4.0,
      delay: lastDelay + 4
    });
  }

  // Every 5th procedural round: append a miniboss, rotating through all three.
  if (k % 5 === 0) {
    const lastDelay = groups.reduce((m, g) => Math.max(m, g.delay), 0);
    groups.push({
      enemy: minibossIds[(k / 5 - 1) % minibossIds.length],
      count: 1,
      spacing: 1.0,
      delay: lastDelay + 6
    });
  }

  return {
    n,
    groups,
    hpMult,
    note: n > 55 ? 'Overtime. The swarm no longer plays fair.' : 'Overtime. Hp x' + hpMult.toFixed(2) + ' and rising.'
  };
}

export default rounds;
