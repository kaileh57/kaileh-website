# RUSH TD

Multiplayer tower defense (BTD Battles style). Each player defends their own copy
of the map; you send units and powers at opponents. Last player alive wins. No
build step: vanilla JS ES modules + Canvas 2D, served statically.

Play: https://kaileh.dev/td/

## Networking

Two interchangeable transports behind `js/net/transport.js`:

1. Cloudflare Worker relay (default): a Durable Object per room over WebSocket.
   Robust on shared/hotel wifi, reconnects with backoff. URL in `js/net/config.js`.
2. PeerJS star fallback (no infra) if the relay is unreachable.

Room codes are 4 characters (A-Z, 2-9). No player cap.

### Deploying the relay

```
cd worker
npx wrangler deploy
```

Then set `RELAY_URL` in `js/net/config.js` to the deployed `wss://...workers.dev`
origin.

## Content

- 10 towers, 2 upgrade paths x 4 each, several with tier-4 active abilities
- 19 enemies (15 regular tiers with bloon-style layering, 3 minibosses, 1 boss)
- 45 handcrafted rounds (~20 min) then procedural scaling until everyone dies
- 10 powers (5 buffs, 5 attacks), pick 3 in the lobby
- 6 maps including two image-backed joke maps
- Host-tweakable match settings (economy, enemy scaling, costs, and more)

## Tests

```
node test/validate.mjs      # data integrity + sim smoke + balance checks
```

Image credits: cat photo by Von.grzanka (CC BY-SA), Mona Lisa public domain.
