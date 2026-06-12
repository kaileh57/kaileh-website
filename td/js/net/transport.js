// Transport factory. The app only ever calls createTransport(); both backends
// (relay.js over a Cloudflare Worker, peer.js over the PeerJS cloud) implement
// the exact same Transport interface and event semantics:
//
//   Transport: {
//     id: string,                        // my stable peer id
//     send(toId, msg), broadcast(msg),   // msg is a JSON-able object
//     onMessage(cb(msg, fromId)),
//     onPeerJoin(cb(id)), onPeerLeave(cb(id)),
//     peers(): string[],                 // join-ordered, includes self
//     close()
//   }
//
// Order of attempts: relay first (only if RELAY_URL is set, 4 second timeout),
// then PeerJS as fallback.

import { RELAY_URL } from './config.js';
import { createRelayTransport } from './relay.js';
import { createPeerTransport } from './peer.js';

const RELAY_TIMEOUT_MS = 4000;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1

// genCode() -> 4-char room code without lookalike characters.
export function genCode() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += CODE_CHARS[b % CODE_CHARS.length];
  return s;
}

// createTransport({code, isHost, name}) -> Promise<Transport>
export async function createTransport(opts) {
  if (RELAY_URL) {
    try {
      return await createRelayTransport(opts, RELAY_TIMEOUT_MS);
    } catch (err) {
      console.warn('relay transport unavailable, falling back to PeerJS:', err);
    }
  }
  return createPeerTransport(opts);
}
