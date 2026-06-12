// WebSocket relay transport (Cloudflare Worker + Durable Object per room).
//
// Wire protocol (server -> client):
//   {t:'_peers', peers:[ids in join order]}   full roster (on connect / reconnect)
//   {t:'_join', id}                           a peer joined
//   {t:'_leave', id}                          a peer left
//   {t:'_pong'}                               heartbeat reply (auto-response, ignored)
//   {from, msg}                               relayed app payload from another peer
//
// Wire protocol (client -> server):
//   {t:'_ping'}            heartbeat, answered by the server without waking the room
//   {_to:id, msg}          targeted message (receivers other than `id` drop it)
//   anything else          broadcast app payload, relayed to all other sockets
//
// Reconnect: exponential backoff capped at 5s, resuming with the SAME client id so
// the room treats it as the same peer (join order preserved, no join/leave churn).

import { RELAY_URL } from './config.js';

const HEARTBEAT_MS = 10000;
const BACKOFF_BASE_MS = 500;
const BACKOFF_CAP_MS = 5000;

function randomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += chars[b % chars.length];
  return s;
}

// createRelayTransport(opts, timeoutMs) -> Promise<Transport>
// Rejects (and cleans up) if the first connection does not become ready within
// timeoutMs or fails outright; after the first success it reconnects forever.
export function createRelayTransport({ code, isHost, name }, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    if (!RELAY_URL) {
      reject(new Error('RELAY_URL is not configured'));
      return;
    }

    const id = randomId();
    const base = RELAY_URL.replace(/^http/, 'ws').replace(/\/+$/, '');
    const url = base + '/room/' + encodeURIComponent(String(code).toUpperCase()) +
      '?id=' + encodeURIComponent(id) +
      '&host=' + (isHost ? '1' : '0') +
      '&name=' + encodeURIComponent(name || '');

    let ws = null;
    let closed = false;       // close() was called (or startup aborted)
    let ready = false;        // first _peers received, promise resolved
    let attempts = 0;
    let peerList = [];
    const outbox = [];
    const msgCbs = [];
    const joinCbs = [];
    const leaveCbs = [];
    let hbTimer = null;
    let reTimer = null;

    const startupTimer = setTimeout(() => {
      if (!ready) abortStartup(new Error('relay connect timed out'));
    }, timeoutMs);

    function abortStartup(err) {
      if (ready || closed) return;
      closed = true;
      clearTimeout(startupTimer);
      stopHeartbeat();
      clearTimeout(reTimer);
      if (ws) { try { ws.close(1000); } catch (e) { /* ignore */ } }
      reject(err);
    }

    function emit(cbs, ...args) {
      for (const cb of cbs) {
        try { cb(...args); } catch (e) { console.error('relay callback error', e); }
      }
    }

    function setPeers(list) {
      const old = peerList;
      peerList = list.slice();
      if (!ready) return; // initial roster: no events, app reads peers()
      for (const p of peerList) {
        if (p !== id && !old.includes(p)) emit(joinCbs, p);
      }
      for (const p of old) {
        if (p !== id && !peerList.includes(p)) emit(leaveCbs, p);
      }
    }

    function sendRaw(obj) {
      const s = JSON.stringify(obj);
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(s);
      else outbox.push(s);
    }

    function startHeartbeat() {
      stopHeartbeat();
      hbTimer = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) ws.send('{"t":"_ping"}');
      }, HEARTBEAT_MS);
    }

    function stopHeartbeat() {
      if (hbTimer !== null) { clearInterval(hbTimer); hbTimer = null; }
    }

    function scheduleReconnect() {
      if (closed) return;
      const delay = Math.min(BACKOFF_CAP_MS, BACKOFF_BASE_MS * Math.pow(2, attempts));
      attempts++;
      clearTimeout(reTimer);
      reTimer = setTimeout(connect, delay);
    }

    function connect() {
      if (closed) return;
      let sock;
      try {
        sock = new WebSocket(url);
      } catch (e) {
        if (!ready) { abortStartup(e); return; }
        scheduleReconnect();
        return;
      }
      ws = sock;

      sock.onopen = () => {
        if (closed) { try { sock.close(1000); } catch (e) { /* ignore */ } return; }
        attempts = 0;
        startHeartbeat();
        while (outbox.length) sock.send(outbox.shift());
      };

      sock.onmessage = (ev) => {
        if (closed) return;
        let d;
        try { d = JSON.parse(ev.data); } catch (e) { return; }
        if (!d || typeof d !== 'object') return;
        if (d.t === '_pong') return;
        if (d.t === '_peers' && Array.isArray(d.peers)) {
          setPeers(d.peers);
          if (!ready) {
            ready = true;
            clearTimeout(startupTimer);
            resolve(transport);
          }
          return;
        }
        if (d.t === '_join' && typeof d.id === 'string') {
          if (d.id !== id && !peerList.includes(d.id)) {
            peerList.push(d.id);
            emit(joinCbs, d.id);
          }
          return;
        }
        if (d.t === '_leave' && typeof d.id === 'string') {
          const i = peerList.indexOf(d.id);
          if (i !== -1) {
            peerList.splice(i, 1);
            if (d.id !== id) emit(leaveCbs, d.id);
          }
          return;
        }
        if (d.from !== undefined) {
          let m = d.msg;
          if (m && typeof m === 'object' && m._to !== undefined) {
            if (m._to !== id) return; // targeted at someone else
            m = m.msg;
          }
          emit(msgCbs, m, d.from);
        }
      };

      sock.onclose = () => {
        stopHeartbeat();
        if (closed) return;
        if (!ready) { abortStartup(new Error('relay connection failed')); return; }
        scheduleReconnect();
      };

      sock.onerror = () => {
        // onclose follows and drives retry / abort
      };
    }

    const transport = {
      id,
      send(toId, msg) { sendRaw({ _to: toId, msg }); },
      broadcast(msg) { sendRaw(msg); },
      onMessage(cb) { msgCbs.push(cb); },
      onPeerJoin(cb) { joinCbs.push(cb); },
      onPeerLeave(cb) { leaveCbs.push(cb); },
      peers() { return peerList.slice(); },
      close() {
        closed = true;
        clearTimeout(startupTimer);
        clearTimeout(reTimer);
        stopHeartbeat();
        if (ws) { try { ws.close(1000); } catch (e) { /* ignore */ } }
        ws = null;
      },
    };

    connect();
  });
}
