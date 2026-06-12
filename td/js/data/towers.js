// RUSH TD tower data. Pure data module, Node-importable, no functions.
// @abilities-used: airstrike,barrage,bigfreeze,cashdrop,headshot,jackpot,meltdown,overdrive
// @towers: gunner,cannon,frostcaster,marksman,market,tesla,pyro,mortar,beacon,alchemist
// @schema: id,name,cost,desc,mode,damageType,base,visual,paths[2].upgrades[4]{name,cost,desc,effects,visualAdd}
export default [
  {
    "id": "gunner",
    "name": "Gunner",
    "cost": 170,
    "desc": "Reliable rifle turret. Cheap, fast, single target.",
    "mode": "projectile",
    "damageType": "sharp",
    "base": {
      "range": 130,
      "fireRate": 1.8,
      "damage": 1,
      "pierce": 1,
      "projSpeed": 360
    },
    "visual": {
      "base": "square",
      "color": "#9aa3b2"
    },
    "paths": [
      {
        "name": "Sharpshooter",
        "upgrades": [
          {
            "name": "Full Metal Rounds",
            "cost": 120,
            "desc": "Hardened slugs deal +1 damage and fly 30% faster",
            "effects": {
              "dmgAdd": 1,
              "projSpeedMult": 1.3
            },
            "visualAdd": "core"
          },
          {
            "name": "Double Tap",
            "cost": 180,
            "desc": "Reworked trigger fires 60% faster",
            "effects": {
              "rateMult": 1.6
            },
            "visualAdd": "drum"
          },
          {
            "name": "Tungsten Core",
            "cost": 450,
            "desc": "+2 damage and rounds punch through lead plating",
            "effects": {
              "dmgAdd": 2,
              "leadPop": true
            },
            "visualAdd": "barrelWide"
          },
          {
            "name": "Overdrive Engine",
            "cost": 1600,
            "desc": "+2 dmg, 80% faster. Ability: triple fire rate for 20s",
            "effects": {
              "dmgAdd": 2,
              "rateMult": 1.8,
              "abilitySet": {
                "id": "overdrive",
                "name": "Overdrive",
                "desc": "This tower fires 3x faster for 20s",
                "cooldown": 45
              }
            },
            "visualAdd": "blades"
          }
        ]
      },
      {
        "name": "Suppression",
        "upgrades": [
          {
            "name": "Extended Barrel",
            "cost": 100,
            "desc": "Longer barrel extends reach 25%",
            "effects": {
              "rangeMult": 1.25
            },
            "visualAdd": "barrelLong"
          },
          {
            "name": "Split Shot",
            "cost": 260,
            "desc": "Fires 2 bullets in a 14 degree spread",
            "effects": {
              "multishotSet": {
                "count": 2,
                "spreadDeg": 14
              }
            },
            "visualAdd": "twin"
          },
          {
            "name": "Ricochet Rounds",
            "cost": 500,
            "desc": "Bullets bounce to 2 extra enemies within 80px",
            "effects": {
              "chainSet": {
                "jumps": 2,
                "range": 80
              }
            },
            "visualAdd": "ring"
          },
          {
            "name": "Lead Storm",
            "cost": 1500,
            "desc": "4 bullets per shot, +1 pierce, 25% faster fire",
            "effects": {
              "multishotSet": {
                "count": 4,
                "spreadDeg": 24
              },
              "pierceAdd": 1,
              "rateMult": 1.25
            },
            "visualAdd": "spikes"
          }
        ]
      }
    ]
  },
  {
    "id": "cannon",
    "name": "Cannon",
    "cost": 320,
    "desc": "Explosive shells hit groups. Blast-immune enemies resist.",
    "mode": "projectile",
    "damageType": "blast",
    "base": {
      "range": 120,
      "fireRate": 0.6,
      "damage": 4,
      "pierce": 8,
      "projSpeed": 280,
      "splash": 40
    },
    "visual": {
      "base": "circle",
      "color": "#b06a3b"
    },
    "paths": [
      {
        "name": "Demolition",
        "upgrades": [
          {
            "name": "Heavy Payload",
            "cost": 240,
            "desc": "Heavier shells deal 7 damage each",
            "effects": {
              "dmgAdd": 3
            },
            "visualAdd": "barrelWide"
          },
          {
            "name": "Wide Blast",
            "cost": 300,
            "desc": "Blast radius grows 50% and hits up to 12 enemies",
            "effects": {
              "splashMult": 1.5,
              "pierceAdd": 4
            },
            "visualAdd": "ring"
          },
          {
            "name": "Napalm Shells",
            "cost": 650,
            "desc": "Shells ignite targets: 4 burn damage per second for 3s",
            "effects": {
              "burnSet": {
                "dps": 4,
                "dur": 3
              }
            },
            "visualAdd": "tank"
          },
          {
            "name": "Airstrike Command",
            "cost": 1900,
            "desc": "+6 dmg. Ability: 900 blast damage split across all enemies",
            "effects": {
              "dmgAdd": 6,
              "abilitySet": {
                "id": "airstrike",
                "name": "Airstrike",
                "desc": "900 blast damage split across all enemies on screen",
                "cooldown": 60
              }
            },
            "visualAdd": "dish"
          }
        ]
      },
      {
        "name": "Artillery",
        "upgrades": [
          {
            "name": "Reinforced Carriage",
            "cost": 200,
            "desc": "+30% range and shells travel 30% faster",
            "effects": {
              "rangeMult": 1.3,
              "projSpeedMult": 1.3
            },
            "visualAdd": "fins"
          },
          {
            "name": "Quick Loader",
            "cost": 340,
            "desc": "Autoloader fires 50% faster",
            "effects": {
              "rateMult": 1.5
            },
            "visualAdd": "drum"
          },
          {
            "name": "Cluster Volley",
            "cost": 750,
            "desc": "Each shot lobs 3 shells in a 30 degree fan",
            "effects": {
              "multishotSet": {
                "count": 3,
                "spreadDeg": 30
              }
            },
            "visualAdd": "twin"
          },
          {
            "name": "Siege Howitzer",
            "cost": 1600,
            "desc": "+10 dmg, +40% range, 30% wider blast. Built for bosses",
            "effects": {
              "dmgAdd": 10,
              "rangeMult": 1.4,
              "splashMult": 1.3
            },
            "visualAdd": "barrelLong"
          }
        ]
      }
    ]
  },
  {
    "id": "frostcaster",
    "name": "Frostcaster",
    "cost": 280,
    "desc": "Cold pulses chill every enemy in range.",
    "mode": "pulse",
    "damageType": "cold",
    "base": {
      "range": 95,
      "fireRate": 0.9,
      "damage": 1,
      "pierce": 99,
      "slow": {
        "mult": 0.7,
        "dur": 1.5
      }
    },
    "visual": {
      "base": "hex",
      "color": "#6fa8c9"
    },
    "paths": [
      {
        "name": "Deep Winter",
        "upgrades": [
          {
            "name": "Wider Chill",
            "cost": 140,
            "desc": "Pulse reaches 30% farther",
            "effects": {
              "rangeMult": 1.3
            },
            "visualAdd": "ring"
          },
          {
            "name": "Biting Cold",
            "cost": 260,
            "desc": "Chill deepens: enemies move at 55% speed for 2s",
            "effects": {
              "slowSet": {
                "mult": 0.55,
                "dur": 2
              }
            },
            "visualAdd": "spikes"
          },
          {
            "name": "Permafrost",
            "cost": 550,
            "desc": "Sees camo and freezes it off; slows enemies to 40% for 2.5s",
            "effects": {
              "camoDetect": true,
              "stripCamo": true,
              "slowSet": {
                "mult": 0.4,
                "dur": 2.5
              }
            },
            "visualAdd": "core"
          },
          {
            "name": "Absolute Zero",
            "cost": 1400,
            "desc": "+2 dmg. Ability: freeze every enemy solid for 4s",
            "effects": {
              "dmgAdd": 2,
              "abilitySet": {
                "id": "bigfreeze",
                "name": "Big Freeze",
                "desc": "All enemies frozen in place for 4s",
                "cooldown": 50
              }
            },
            "visualAdd": "crown"
          }
        ]
      },
      {
        "name": "Shatterfrost",
        "upgrades": [
          {
            "name": "Ice Shards",
            "cost": 180,
            "desc": "Razor ice raises pulse damage to 3",
            "effects": {
              "dmgAdd": 2
            },
            "visualAdd": "blades"
          },
          {
            "name": "Quickened Pulse",
            "cost": 280,
            "desc": "Pulses 50% more often",
            "effects": {
              "rateMult": 1.5
            },
            "visualAdd": "coil"
          },
          {
            "name": "Shatter Field",
            "cost": 600,
            "desc": "+2 dmg and each pulse rips one shield layer away",
            "effects": {
              "dmgAdd": 2,
              "stripShield": true
            },
            "visualAdd": "fins"
          },
          {
            "name": "Glacier Heart",
            "cost": 1500,
            "desc": "Pulses hit for 11, fire 40% faster, reach 20% farther",
            "effects": {
              "dmgAdd": 6,
              "rateMult": 1.4,
              "rangeMult": 1.2
            },
            "visualAdd": "core"
          }
        ]
      }
    ]
  },
  {
    "id": "marksman",
    "name": "Marksman",
    "cost": 350,
    "desc": "Instant precision shots from unlimited range.",
    "mode": "beam",
    "damageType": "sharp",
    "base": {
      "range": 9000,
      "fireRate": 0.4,
      "damage": 6,
      "pierce": 1
    },
    "visual": {
      "base": "diamond",
      "color": "#7d9c6a"
    },
    "paths": [
      {
        "name": "Deadeye",
        "upgrades": [
          {
            "name": ".50 Caliber",
            "cost": 340,
            "desc": "Heavy rounds deal 14 damage per shot",
            "effects": {
              "dmgAdd": 8
            },
            "visualAdd": "barrelLong"
          },
          {
            "name": "Full Metal Jacket",
            "cost": 300,
            "desc": "+4 dmg (18 total) and shots punch through lead",
            "effects": {
              "dmgAdd": 4,
              "leadPop": true
            },
            "visualAdd": "core"
          },
          {
            "name": "Penetrator Rounds",
            "cost": 700,
            "desc": "+8 dmg; each bullet drills through 3 enemies in a line",
            "effects": {
              "dmgAdd": 8,
              "pierceAdd": 2
            },
            "visualAdd": "fins"
          },
          {
            "name": "One Shot Protocol",
            "cost": 2200,
            "desc": "50 dmg. Ability: execute strongest enemy, bosses take 500",
            "effects": {
              "dmgAdd": 24,
              "abilitySet": {
                "id": "headshot",
                "name": "Headshot",
                "desc": "Kill the strongest non-boss enemy; bosses take 500",
                "cooldown": 45
              }
            },
            "visualAdd": "crown"
          }
        ]
      },
      {
        "name": "Overwatch",
        "upgrades": [
          {
            "name": "Spotter Scope",
            "cost": 220,
            "desc": "Thermal optics reveal camo to this tower",
            "effects": {
              "camoDetect": true
            },
            "visualAdd": "scope"
          },
          {
            "name": "Rapid Cycling",
            "cost": 380,
            "desc": "Practiced bolt work fires 60% faster",
            "effects": {
              "rateMult": 1.6
            },
            "visualAdd": "drum"
          },
          {
            "name": "Bounty Marks",
            "cost": 650,
            "desc": "Each pop pays +$2 and the mark burns camo off for everyone",
            "effects": {
              "moneyPerPop": 2,
              "stripCamo": true
            },
            "visualAdd": "ring"
          },
          {
            "name": "Overwatch Protocol",
            "cost": 1400,
            "desc": "70% faster, +6 dmg, every hit tears a shield layer off",
            "effects": {
              "rateMult": 1.7,
              "dmgAdd": 6,
              "stripShield": true
            },
            "visualAdd": "dish"
          }
        ]
      }
    ]
  },
  {
    "id": "market",
    "name": "Market",
    "cost": 400,
    "desc": "Generates cash over time. Buffs allies on one path.",
    "mode": "support",
    "damageType": "energy",
    "base": {
      "range": 90,
      "fireRate": 0,
      "damage": 0,
      "pierce": 0,
      "income": {
        "amount": 18,
        "interval": 6
      }
    },
    "visual": {
      "base": "square",
      "color": "#c2973e"
    },
    "paths": [
      {
        "name": "Trade Empire",
        "upgrades": [
          {
            "name": "Extra Stock",
            "cost": 300,
            "desc": "Fuller shelves raise payout to $30 every 6s",
            "effects": {
              "incomeSet": {
                "amount": 30,
                "interval": 6
              }
            },
            "visualAdd": "tank"
          },
          {
            "name": "Export Contracts",
            "cost": 550,
            "desc": "Overseas buyers raise payout to $50 every 6s",
            "effects": {
              "incomeSet": {
                "amount": 50,
                "interval": 6
              }
            },
            "visualAdd": "ring"
          },
          {
            "name": "Stock Exchange",
            "cost": 900,
            "desc": "High frequency trading pays $40 every 3s",
            "effects": {
              "incomeSet": {
                "amount": 40,
                "interval": 3
              }
            },
            "visualAdd": "core"
          },
          {
            "name": "Federal Reserve",
            "cost": 1800,
            "desc": "Pays $120 per 6s. Ability: income pays out 5x instantly",
            "effects": {
              "incomeSet": {
                "amount": 120,
                "interval": 6
              },
              "abilitySet": {
                "id": "jackpot",
                "name": "Jackpot",
                "desc": "All income towers trigger instantly at 5x value",
                "cooldown": 60
              }
            },
            "visualAdd": "crown"
          }
        ]
      },
      {
        "name": "Logistics",
        "upgrades": [
          {
            "name": "Supply Crates",
            "cost": 250,
            "desc": "Towers in range fire 10% faster",
            "effects": {
              "auraSet": {
                "rateMult": 1.1
              }
            },
            "visualAdd": "drum"
          },
          {
            "name": "Field Workshop",
            "cost": 450,
            "desc": "Aura now grants 15% faster fire and +1 damage",
            "effects": {
              "auraSet": {
                "rateMult": 1.15,
                "dmgAdd": 1
              }
            },
            "visualAdd": "coil"
          },
          {
            "name": "Command Post",
            "cost": 800,
            "desc": "Aura reaches 25% farther: 20% rate, +1 dmg, +15% range",
            "effects": {
              "rangeMult": 1.25,
              "auraSet": {
                "rateMult": 1.2,
                "dmgAdd": 1,
                "rangeMult": 1.15
              }
            },
            "visualAdd": "dish"
          },
          {
            "name": "War Economy",
            "cost": 2000,
            "desc": "Aura: 25% rate, +2 dmg. Ability: every tower fires 5x for 8s",
            "effects": {
              "auraSet": {
                "rateMult": 1.25,
                "dmgAdd": 2,
                "rangeMult": 1.15
              },
              "abilitySet": {
                "id": "barrage",
                "name": "Barrage",
                "desc": "Every tower fires 5 shots per shot for 8s",
                "cooldown": 70
              }
            },
            "visualAdd": "fins"
          }
        ]
      }
    ]
  },
  {
    "id": "tesla",
    "name": "Tesla Coil",
    "cost": 350,
    "desc": "Arcs of lightning chain between nearby enemies.",
    "mode": "projectile",
    "damageType": "energy",
    "base": {
      "range": 120,
      "fireRate": 1.2,
      "damage": 2,
      "pierce": 1,
      "projSpeed": 480,
      "chain": {
        "jumps": 2,
        "range": 70
      }
    },
    "visual": {
      "base": "circle",
      "color": "#6e8db3"
    },
    "paths": [
      {
        "name": "High Voltage",
        "upgrades": [
          {
            "name": "Copper Windings",
            "cost": 180,
            "desc": "Thicker windings: +2 damage per arc.",
            "effects": {
              "dmgAdd": 2
            },
            "visualAdd": "coil"
          },
          {
            "name": "Capacitor Bank",
            "cost": 320,
            "desc": "Capacitors cycle 50% faster between shots.",
            "effects": {
              "rateMult": 1.5
            },
            "visualAdd": "drum"
          },
          {
            "name": "Superconductor",
            "cost": 900,
            "desc": "+8 damage and arcs instantly blow out enemy shields.",
            "effects": {
              "dmgAdd": 8,
              "stripShield": true
            },
            "visualAdd": "core"
          },
          {
            "name": "Tesla Prime",
            "cost": 1700,
            "desc": "+12 damage. Ability: Overdrive, this tower fires 3x faster for 20s.",
            "effects": {
              "dmgAdd": 12,
              "abilitySet": {
                "id": "overdrive",
                "name": "Overdrive",
                "desc": "This tower fires 3x faster for 20s",
                "cooldown": 45
              }
            },
            "visualAdd": "crown"
          }
        ]
      },
      {
        "name": "Storm Grid",
        "upgrades": [
          {
            "name": "Long Arcs",
            "cost": 200,
            "desc": "Arcs now jump to 4 targets within 90px.",
            "effects": {
              "chainSet": {
                "jumps": 4,
                "range": 90
              }
            },
            "visualAdd": "fins"
          },
          {
            "name": "Static Cling",
            "cost": 340,
            "desc": "Zapped enemies are slowed 25% for 0.8s.",
            "effects": {
              "slowSet": {
                "mult": 0.75,
                "dur": 0.8
              }
            },
            "visualAdd": "ring"
          },
          {
            "name": "Storm Lattice",
            "cost": 950,
            "desc": "7 arc jumps over 120px, +2 dmg; ionized air reveals camo.",
            "effects": {
              "chainSet": {
                "jumps": 7,
                "range": 120
              },
              "dmgAdd": 2,
              "camoDetect": true
            },
            "visualAdd": "spikes"
          },
          {
            "name": "Thunderhead",
            "cost": 1500,
            "desc": "10 jumps over 140px; every arc slows 45% for 1.5s, +4 dmg.",
            "effects": {
              "chainSet": {
                "jumps": 10,
                "range": 140
              },
              "slowSet": {
                "mult": 0.55,
                "dur": 1.5
              },
              "dmgAdd": 4
            },
            "visualAdd": "twin"
          }
        ]
      }
    ]
  },
  {
    "id": "pyro",
    "name": "Pyro",
    "cost": 300,
    "desc": "Sprays a cone of flame that roasts everything inside.",
    "mode": "spray",
    "damageType": "energy",
    "base": {
      "range": 90,
      "fireRate": 6,
      "damage": 0.35,
      "pierce": 0
    },
    "visual": {
      "base": "square",
      "color": "#c0703f"
    },
    "paths": [
      {
        "name": "Inferno",
        "upgrades": [
          {
            "name": "Hotter Fuel",
            "cost": 160,
            "desc": "Refined fuel burns hotter: +0.25 damage per flame tick.",
            "effects": {
              "dmgAdd": 0.25
            },
            "visualAdd": "tank"
          },
          {
            "name": "Sticky Fire",
            "cost": 300,
            "desc": "Flames cling: enemies keep burning for 2 dps over 2s.",
            "effects": {
              "burnSet": {
                "dps": 2,
                "dur": 2
              }
            },
            "visualAdd": "barrelWide"
          },
          {
            "name": "Blue Flame",
            "cost": 800,
            "desc": "Blue heat: +0.6 dmg, burn rises to 5 dps for 3s, +15% range.",
            "effects": {
              "dmgAdd": 0.6,
              "burnSet": {
                "dps": 5,
                "dur": 3
              },
              "rangeMult": 1.15
            },
            "visualAdd": "core"
          },
          {
            "name": "Firestorm",
            "cost": 1600,
            "desc": "Ability: Meltdown, every enemy burns 30 dps for 10s. +0.8 dmg.",
            "effects": {
              "dmgAdd": 0.8,
              "rateMult": 1.3,
              "abilitySet": {
                "id": "meltdown",
                "name": "Meltdown",
                "desc": "All enemies on screen burn for 30 dps over 10s",
                "cooldown": 60
              }
            },
            "visualAdd": "crown"
          }
        ]
      },
      {
        "name": "Flash Burner",
        "upgrades": [
          {
            "name": "Pressure Tank",
            "cost": 180,
            "desc": "Compressed propellant throws the cone 35% farther.",
            "effects": {
              "rangeMult": 1.35
            },
            "visualAdd": "barrel2"
          },
          {
            "name": "Flare Mix",
            "cost": 320,
            "desc": "Flare compound lights up camo; this tower can target camo.",
            "effects": {
              "camoDetect": true,
              "dmgAdd": 0.15
            },
            "visualAdd": "fins"
          },
          {
            "name": "Scouring Jet",
            "cost": 850,
            "desc": "Burns camo coating off enemies for good; sprays 40% faster.",
            "effects": {
              "stripCamo": true,
              "rateMult": 1.4
            },
            "visualAdd": "blades"
          },
          {
            "name": "Choke Smoke",
            "cost": 1300,
            "desc": "Thick smoke slows enemies 30% for 0.8s; +0.4 dmg, 3 dps burn.",
            "effects": {
              "slowSet": {
                "mult": 0.7,
                "dur": 0.8
              },
              "burnSet": {
                "dps": 3,
                "dur": 2
              },
              "dmgAdd": 0.4
            },
            "visualAdd": "spikes"
          }
        ]
      }
    ]
  },
  {
    "id": "mortar",
    "name": "Mortar",
    "cost": 425,
    "desc": "Slow long range shells that blast a wide area.",
    "mode": "projectile",
    "damageType": "blast",
    "base": {
      "range": 300,
      "fireRate": 0.4,
      "damage": 8,
      "pierce": 1,
      "projSpeed": 220,
      "splash": 40
    },
    "visual": {
      "base": "hex",
      "color": "#8b8e79"
    },
    "paths": [
      {
        "name": "Siege Battery",
        "upgrades": [
          {
            "name": "Heavy Shells",
            "cost": 240,
            "desc": "Dense 14 damage shells for hardened targets.",
            "effects": {
              "dmgAdd": 6
            },
            "visualAdd": "barrelWide"
          },
          {
            "name": "Reinforced Charge",
            "cost": 420,
            "desc": "Bigger powder charge: shells now hit for 24.",
            "effects": {
              "dmgAdd": 10
            },
            "visualAdd": "drum"
          },
          {
            "name": "Shell Shock",
            "cost": 1100,
            "desc": "44 dmg concussion shells; survivors stagger at half speed for 1s.",
            "effects": {
              "dmgAdd": 20,
              "slowSet": {
                "mult": 0.5,
                "dur": 1
              }
            },
            "visualAdd": "barrelLong"
          },
          {
            "name": "Fire Mission",
            "cost": 2000,
            "desc": "Ability: Air Strike, 900 blast dmg split over all enemies. +30 dmg.",
            "effects": {
              "dmgAdd": 30,
              "rateMult": 1.25,
              "abilitySet": {
                "id": "airstrike",
                "name": "Air Strike",
                "desc": "900 blast damage split across every enemy on screen",
                "cooldown": 75
              }
            },
            "visualAdd": "crown"
          }
        ]
      },
      {
        "name": "Carpet Bomber",
        "upgrades": [
          {
            "name": "Bigger Blast",
            "cost": 220,
            "desc": "Blast radius grows 50% to 60px.",
            "effects": {
              "splashMult": 1.5
            },
            "visualAdd": "twin"
          },
          {
            "name": "Rapid Reload",
            "cost": 400,
            "desc": "Autoloader drops shells 50% faster.",
            "effects": {
              "rateMult": 1.5
            },
            "visualAdd": "drum"
          },
          {
            "name": "Napalm Shells",
            "cost": 1000,
            "desc": "Shells ignite everything hit: 4 dps burn for 3s; +25% radius.",
            "effects": {
              "burnSet": {
                "dps": 4,
                "dur": 3
              },
              "splashMult": 1.25
            },
            "visualAdd": "tank"
          },
          {
            "name": "Cluster Barrage",
            "cost": 1900,
            "desc": "Each volley lobs 3 shells in a 12 degree spread; +4 dmg.",
            "effects": {
              "multishotSet": {
                "count": 3,
                "spreadDeg": 12
              },
              "dmgAdd": 4
            },
            "visualAdd": "barrel2"
          }
        ]
      }
    ]
  },
  {
    "id": "beacon",
    "name": "Beacon",
    "cost": 400,
    "desc": "Buffs nearby towers; never attacks on its own.",
    "mode": "support",
    "damageType": "energy",
    "base": {
      "range": 130,
      "fireRate": 0,
      "damage": 0,
      "pierce": 0,
      "aura": {
        "rateMult": 1.15
      }
    },
    "visual": {
      "base": "diamond",
      "color": "#c9a85c"
    },
    "paths": [
      {
        "name": "War Banner",
        "upgrades": [
          {
            "name": "Drill Sergeant",
            "cost": 250,
            "desc": "Aura now grants +20% fire rate and +10% range.",
            "effects": {
              "auraSet": {
                "rateMult": 1.2,
                "rangeMult": 1.1
              }
            },
            "visualAdd": "dish"
          },
          {
            "name": "Targeting Array",
            "cost": 450,
            "desc": "Dish relays target data: aura gives +25% rate, +20% range.",
            "effects": {
              "auraSet": {
                "rateMult": 1.25,
                "rangeMult": 1.2
              }
            },
            "visualAdd": "scope"
          },
          {
            "name": "Arsenal",
            "cost": 1000,
            "desc": "Armory issues hot loads: towers in range gain +2 damage per shot.",
            "effects": {
              "auraSet": {
                "rateMult": 1.3,
                "rangeMult": 1.2,
                "dmgAdd": 2
              }
            },
            "visualAdd": "ring"
          },
          {
            "name": "Battle Standard",
            "cost": 1800,
            "desc": "Ability: Battle Cry, every tower fires 5x for 8s. Aura +40% rate.",
            "effects": {
              "auraSet": {
                "rateMult": 1.4,
                "rangeMult": 1.25,
                "dmgAdd": 3
              },
              "abilitySet": {
                "id": "barrage",
                "name": "Battle Cry",
                "desc": "Every tower on the board fires 5x for 8s",
                "cooldown": 70
              }
            },
            "visualAdd": "crown"
          }
        ]
      },
      {
        "name": "Trade Post",
        "upgrades": [
          {
            "name": "Supply Crates",
            "cost": 300,
            "desc": "Sells surplus supplies: +$20 every 6s.",
            "effects": {
              "incomeSet": {
                "amount": 20,
                "interval": 6
              }
            },
            "visualAdd": "tank"
          },
          {
            "name": "Marketplace",
            "cost": 550,
            "desc": "A small bazaar forms: income rises to $45 every 6s.",
            "effects": {
              "incomeSet": {
                "amount": 45,
                "interval": 6
              }
            },
            "visualAdd": "core"
          },
          {
            "name": "Mint",
            "cost": 1200,
            "desc": "Stamps coin on site: income rises to $110 every 6s.",
            "effects": {
              "incomeSet": {
                "amount": 110,
                "interval": 6
              }
            },
            "visualAdd": "drum"
          },
          {
            "name": "Royal Treasury",
            "cost": 2200,
            "desc": "$230 per 6s. Ability: Jackpot, income towers pay 5 ticks at once.",
            "effects": {
              "incomeSet": {
                "amount": 230,
                "interval": 6
              },
              "abilitySet": {
                "id": "jackpot",
                "name": "Jackpot",
                "desc": "All income towers instantly pay 5 ticks of income",
                "cooldown": 60
              }
            },
            "visualAdd": "crown"
          }
        ]
      }
    ]
  },
  {
    "id": "alchemist",
    "name": "Alchemist",
    "cost": 320,
    "desc": "Toxic pulses that can strip shields and camo.",
    "mode": "pulse",
    "damageType": "toxic",
    "base": {
      "range": 100,
      "fireRate": 1,
      "damage": 2,
      "pierce": 99
    },
    "visual": {
      "base": "circle",
      "color": "#7fa05f"
    },
    "paths": [
      {
        "name": "Plague Doctor",
        "upgrades": [
          {
            "name": "Strong Acid",
            "cost": 180,
            "desc": "Concentrated acid: pulse damage rises to 4.",
            "effects": {
              "dmgAdd": 2
            },
            "visualAdd": "tank"
          },
          {
            "name": "Lingering Rot",
            "cost": 350,
            "desc": "Pulsed enemies keep rotting for 3 dps over 2s.",
            "effects": {
              "burnSet": {
                "dps": 3,
                "dur": 2
              }
            },
            "visualAdd": "ring"
          },
          {
            "name": "Nerve Agent",
            "cost": 850,
            "desc": "Numbing toxin: +3 dmg, enemies move 25% slower for 1.5s.",
            "effects": {
              "dmgAdd": 3,
              "slowSet": {
                "mult": 0.75,
                "dur": 1.5
              }
            },
            "visualAdd": "spikes"
          },
          {
            "name": "Plague Engine",
            "cost": 1700,
            "desc": "Endless plague: 10 dps rot for 4s, +5 dmg, pulses 30% faster.",
            "effects": {
              "dmgAdd": 5,
              "burnSet": {
                "dps": 10,
                "dur": 4
              },
              "rateMult": 1.3
            },
            "visualAdd": "core"
          }
        ]
      },
      {
        "name": "Transmuter",
        "upgrades": [
          {
            "name": "Solvent Spray",
            "cost": 200,
            "desc": "Solvent dissolves camo coating; reveals them for every tower.",
            "effects": {
              "stripCamo": true,
              "camoDetect": true
            },
            "visualAdd": "dish"
          },
          {
            "name": "Shield Breaker",
            "cost": 420,
            "desc": "Acid pulse shatters whole shields instead of chipping them.",
            "effects": {
              "stripShield": true
            },
            "visualAdd": "blades"
          },
          {
            "name": "Transmute",
            "cost": 900,
            "desc": "Lead into gold: +$2 for each enemy this tower pops; +2 dmg.",
            "effects": {
              "moneyPerPop": 2,
              "dmgAdd": 2
            },
            "visualAdd": "drum"
          },
          {
            "name": "Midas Vat",
            "cost": 1600,
            "desc": "$5 per pop. Ability: Transmute Gold, conjure $1500 instantly.",
            "effects": {
              "moneyPerPop": 5,
              "rangeMult": 1.25,
              "abilitySet": {
                "id": "cashdrop",
                "name": "Transmute Gold",
                "desc": "Conjure $1500 instantly",
                "cooldown": 90
              }
            },
            "visualAdd": "crown"
          }
        ]
      }
    ]
  }
];
