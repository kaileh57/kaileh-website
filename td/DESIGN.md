# RUSH TD — multiplayer tower defense (BTD Battles style)

Served statically from https://kaileh.dev/td/ (GitHub Pages, repo root = site root, branch `stable`).
No build step. Vanilla JS ES modules + Canvas 2D. Every file ships as written.

## Core multiplayer model

Each player defends their OWN copy of the same map. A client simulates ONLY its own board,
authoritatively (towers, enemies, cash, lives). The network carries low-rate events only:

- lobby state, round start times (host is the clock)
- "send units" events targeted at a specific player
- power usage targeted at a player
- 2 Hz status digests (lives, eco, cash, round) for the scoreboard
- emotes, defeat/win events

Host = first player; runs the lobby and the shared round clock. If host leaves mid-game, the
oldest remaining player becomes clock owner (transport exposes ordered peer list).

Win: last player with lives > 0. Defeated players keep watching the scoreboard and can emote.

## Transport

`js/net/transport.js` exposes ONE factory used by the app:

```js
// createTransport(opts) -> Promise<Transport>
// opts: { code:string, isHost:boolean, name:string }
// Transport: {
//   id: string,                  // my stable peer id
//   send(toId, msg), broadcast(msg),   // msg is a JSON-able object
//   onMessage(cb(msg, fromId)), onPeerJoin(cb(id)), onPeerLeave(cb(id)),
//   peers(): string[],           // join-ordered, includes self
//   close()
// }
```

Two implementations behind the factory, tried in order:
1. `relay.js` — WebSocket to Cloudflare Worker (Durable Object per room). URL in `js/net/config.js`
   as `RELAY_URL` (empty string = skip). Reconnect with backoff, resume with same client id.
2. `peer.js` — PeerJS cloud (https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js, load via script tag).
   Host claims peer id `rushtd-<CODE>`. Clients connect to host; host re-broadcasts ("star" topology).
   For clients, broadcast(msg) wraps as {_fwd:true, msg} to host who fans out.

Room codes: 4 uppercase letters, no ambiguous chars (no I,O,0,1).

## Protocol messages (field `t` = type)

- `hello {name}` client->host on join; host replies `lobby` to all
- `lobby {players:[{id,name,color,ready,powers:[ids]}], mapId, hostId}` full lobby state, host broadcasts on any change
- `setReady {ready}` `setPowers {powers}` `setName {name}` client->host
- `setMap {mapId}` host only
- `start {mapId, players, seed, t0}` host broadcasts; t0 = transport clock offset handshake not needed, use countdown: gameplay starts 3s after receipt
- `roundStart {n}` host broadcasts when its own round timer fires; clients start round n immediately on receipt
- `sendUnits {to, unitId, count}` attacker->broadcast (everyone updates the attacker's eco display; the target spawns them)
- `power {to, powerId}` user->broadcast
- `status {lives, cash, eco, round}` everyone broadcasts at 2 Hz
- `defeat {}` broadcast when own lives hit 0
- `emote {emoteId, to?}` broadcast
- `gameOver {winnerId}` host broadcasts when one player remains

All gameplay randomness inside a board is local (no determinism needed across clients).

## Simulation (js/sim.js)

Fixed timestep 30 ticks/s, decoupled from render (requestAnimationFrame interpolates positions).
The sim owns: enemies (list), towers, projectiles, effects, cash, lives, eco, round state,
incoming send-queue, active powers/debuffs on me.

```js
// new Sim({ mapDef, onLeak, onPop, onCash, onRoundEnd, onDefeat })
// sim.startRound(n)               // begins spawning round n + anything in sendQueue
// sim.queueSend(unitId, count)    // enemies sent BY an opponent AT me
// sim.placeTower(towerId, x, y) -> tower | null (checks cost, placement)
// sim.upgrade(tower, pathIdx) -> bool
// sim.sellTower(tower)            // 70% refund
// sim.useAbility(tower)           // tier-4 active ability
// sim.applyPower(powerId, positive) // effect on MY board (own buff or enemy attack on me)
// sim.tick(dt)                    // fixed step
// sim.state                       // read by render + HUD
```

### Damage types & enemy traits

Damage types: `sharp, blast, energy, cold, toxic`. Towers list `damageType`.
Enemy `traits`: `{ camo, regen:hp/s, shield:n (absorbs n hits), immune:[types], split:{id,count}, boss }`.
Enemies may define `child:id` — on death spawn child at same position (bloon layering).
Camo enemies are targetable only by towers with `camoDetect`.

### Tower attack modes (sim implements exactly these)

- `projectile` — aimed shot, fields: projSpeed, pierce, optional `splash:r`, `chain:{jumps,range}`, `multishot:{count,spreadDeg}`
- `beam` — instant hit on target (sniper style), any range if range>=9000
- `pulse` — AoE around tower every shot (frost style), affects all in range
- `spray` — short cone, hits all in cone each tick-burst (flamethrower)
- `support` — never attacks; `aura:{rateMult?,rangeMult?,dmgAdd?}` buffs towers in range, or `income:{amount, interval}` generates cash

### Upgrade effect keys (specs MUST use only these)

`dmgAdd, rateMult, rangeMult, pierceAdd, projSpeedMult, splashSet, splashMult, multishotSet,
chainSet:{jumps,range}, slowSet:{mult,dur}, burnSet:{dps,dur}, camoDetect:true, leadPop:true
(removes 'sharp' immunity penalty), stripCamo:true, stripShield:true, moneyPerPop:n,
auraSet:{...}, incomeSet:{amount,interval}, abilitySet:{id, name, desc, cooldown}`

Tier-4 ability ids (sim implements): `barrage` (every tower fires 5x for 8s), `bigfreeze`
(freeze all enemies 4s), `airstrike` (900 blast dmg split over all enemies), `cashdrop` (+$1500),
`overdrive` (this tower rate x3 20s), `wallnow` (+50 lives shield), `meltdown` (all enemies burn
30 dps 10s), `headshot` (kill strongest non-boss enemy, bosses take 500), `jackpot` (income towers
trigger instantly x5), `magnet` (all enemies knocked back 150px).

### Powers (chosen 3 in lobby; cooldown seconds, uses per game)

Positive (affect own board) and negative (pick a target player) — 5 each, defined in data/powers.js
with handler ids the sim implements:
pos: `p_cash` (+$), `p_overclock` (all towers rateMult, dur), `p_frost` (slow all enemies, dur),
`p_medkit` (+lives), `p_surplus` (eco mult, dur).
neg: `n_blackout` (target's view dimmed except near towers, dur), `n_jam` (target's N random towers
disabled, dur), `n_leech` (steal % of target's eco gain, dur), `n_haste` (target's current enemies
speed x1.5, dur), `n_strike` (instant bonus wave at target, ignores send costs).
Stronger = longer cooldown + fewer uses (e.g. 2 uses).

## Economy (BTD Battles style)

- Start: $650 cash, 150 lives, eco $200.
- Eco pays `eco/10` cash every 6 s... NO — simpler and standard: every 6 s you receive `eco` dollars where eco starts at 200/6s? Use: eco starts at 200, payout = eco every 6s is too strong with $ values below; balance spec agent sets exact numbers and MUST keep a consistent sheet. Baseline guidance: start cash 650, eco 200, payout eco/6 per second displayed as +eco each 6s tick. Pops pay ~1 each, round-end bonus ~100+round.
- Sending units: each sendable unit has `{cost, ecoDelta (+), unlockRound}`. Cheap early sends give
  good eco; strong late sends cost a lot and give less relative eco (some late sends REDUCE eco like
  BTDB rushes — allowed). Send UI groups units in packs (x1, x10).
- No selling eco. Sell towers 70%.

## Content requirements (data files, js/data/*.js, each `export default`)

- `towers.js`: 10 towers, each: id, name, cost, desc (<= 60 chars), attack mode + base stats,
  exactly 2 paths x 4 upgrades (name, cost, desc <= 70 chars, effects{}, tier4 of at least 4 towers
  total has abilitySet). Crossing rule: can buy from both paths but only one path past tier 2.
- `enemies.js`: 15 regular (tiers 1-6 roughly: hp 1 -> 700, layered via `child`), 3 minibosses
  (distinct gimmicks: e.g. heal-pulse, splitter-storm, shield-bearer), 1 boss `boss_overlord`
  (multi-phase hp thresholds spawn adds, damage cap per hit allowed via trait boss).
- `rounds.js`: 45 handcrafted rounds (~20 min total; round n auto-starts 4s after board clears or
  60s cap), minibosses at 18, 28, 36; boss at 45. After 45: procedural `scaleRound(n)` that ramps
  hp multiplier ~x1.18 per round so everyone dies by ~round 60.
- `sends.js`: ~12 sendable units mapped to enemies, with cost/ecoDelta/unlockRound.
- `powers.js`: the 10 powers above with name, desc (<= 80 chars), cooldown, uses, params.
- `maps.js`: 6 maps. 4 procedural (canvas-drawn bg, varied path shapes incl. crossings), 2 "funny"
  maps using local background images (assets/monalisa.jpg etc, path winds over the image). Path =
  polyline points in 1280x720 logical space, entry off-screen left/top, exit off-screen.
- `emotes.js`: 14 emotes: short troll texts + emoji ("EZ", "nice towers lol", "💀", "send help",
  "gg go next", "thanks for the eco", ...). Displayed as a stamp card next to sender's scoreboard
  row for 2.5s, rate-limit 1 per 3s per player.

## Rendering & visual style (js/render.js)

Canvas 1280x720 logical, letterboxed scale-to-fit. Flat 2D, NO glow, NO shadows, NO gradients,
NO rounded rects in-canvas. Sharp geometric shapes. Palette:
bg `#16181c`, surface `#22252b`, path `#3a3f49`, line `#6b7280`, text `#e6e8eb`,
accent `#e2b714` (yellow), good `#4ade80`, bad `#ef4444`, blue `#60a5fa`.
Enemies: filled circles/regular polygons sized+colored by tier (data-driven `color, size, shape:
circle|triangle|square|pentagon|hex`), camo = dashed outline, shield = thin white ring, boss = big hex.

Towers are drawn procedurally from a `visual` spec composed of tokens render.js implements:
`base:square|circle|hex|diamond`, `color`, plus per-upgrade `visualAdd` tokens:
`barrel2, barrelLong, barrelWide, drum, dish, blades, ring, spikes, core, fins, scope, coil, tank,
crown, twin`. Tier raises footprint slightly. Selected tower shows range circle (1px line).

## UI (index.html + style.css + js/ui/*.js)

Minimal, dark, sharp corners (border-radius: 0 everywhere), system-ui font stack, no emoji in core
HUD (emotes only), no em dashes anywhere in copy. Screens:

1. **Title**: game name "RUSH TD", name input, "HOST" button, code input + "JOIN". Tiny footer.
2. **Lobby**: room code huge (click to copy), player list with ready state, host picks map
   (thumbnail strip), each player picks exactly 3 powers from a 10-card grid (card: name, type
   tag POS/NEG, desc, cooldown/uses), READY button. Host gets START when all ready.
3. **Game**: canvas center. Top bar: lives, cash, eco, round n/45, next-round timer.
   Bottom bar: 10 tower buttons (icon = mini procedural drawing, cost), powers (3) with cooldown
   sweep + uses count, ability buttons appear when owned.
   Right panel: player rows (name, lives, eco, round) — CLICK a row to set send target (highlight).
   Send strip above bottom bar: unlocked send units with cost/eco delta, x1/x10 toggles.
   Click tower: side card with stats, two upgrade columns (next upgrade name+cost+desc), sell.
   Emote button opens a small grid; received emotes stamp by the sender row.
4. **Game over**: winner name, simple stats table, "back to title".

Keyboard: 1-0 select tower to place, Esc cancel, E emote menu.

## Files

```
td/
  index.html  style.css  DESIGN.md
  assets/            (map background images)
  js/
    main.js          app shell, screen switching, glue (DO NOT write — integrator owns it)
    net/config.js    RELAY_URL constant
    net/transport.js net/relay.js  net/peer.js
    sim.js  path.js  (path.js: polyline length/pos utilities)
    render.js
    data/towers.js data/enemies.js data/rounds.js data/sends.js data/powers.js data/maps.js data/emotes.js
    ui/title.js ui/lobby.js ui/hud.js ui/gameover.js
  worker/            Cloudflare Worker (not served): src/index.js, wrangler.toml
  design/            JSON content specs from design phase (not served)
```

All modules: plain ES modules, no external deps except PeerJS via CDN script tag.
Data files must be importable in Node for headless balance tests (no DOM access in data or sim).
