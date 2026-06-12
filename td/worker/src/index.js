// rushtd-relay: Cloudflare Worker + one Durable Object (Room) per room code.
//
// Route: GET /room/:code with an Upgrade: websocket header and query params
//   ?id=<clientId>&host=0|1&name=<displayName>
//
// The Room uses the WebSocket Hibernation API (acceptWebSocket +
// serializeAttachment), so idle rooms are evicted from memory and cost nothing.
// Heartbeat pings are answered via setWebSocketAutoResponse without waking the
// object at all.
//
// Server -> client messages:
//   {t:'_peers', peers:[ids in join order]}  sent to a socket right after it joins
//   {t:'_join', id}                          sent to everyone else on a new join
//   {t:'_leave', id}                         sent to everyone else on a close
//   {from, msg}                              every client payload, relayed to all
//                                            OTHER sockets wrapped with sender id
//
// Reconnects reuse the same client id: the old socket is replaced, the original
// join order (seq) is kept, and no _join/_leave is emitted for the swap.

export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.state.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair('{"t":"_ping"}', '{"t":"_pong"}')
    );
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('websocket upgrade required', { status: 426 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id || id.length > 64) {
      return new Response('missing or invalid id', { status: 400 });
    }
    const host = url.searchParams.get('host') === '1';
    const name = (url.searchParams.get('name') || '').slice(0, 32);

    // Resume: a socket with this id may already exist (reconnect). Keep its
    // join order and replace it after the new socket is accepted.
    let seq = null;
    const olds = [];
    for (const ws of this.state.getWebSockets()) {
      const a = this.attachment(ws);
      if (a && a.id === id) {
        olds.push(ws);
        if (seq === null) seq = a.seq;
      }
    }
    let resumed = seq !== null;
    if (!resumed) {
      // resume after a full disconnect: stored seq keeps the join order and
      // suppresses the _join broadcast (peers were never told this id left
      // permanently, or will reconcile via the app-level grace period)
      const stored = await this.state.storage.get('seq:' + id);
      if (stored !== undefined) {
        seq = stored;
        resumed = true;
      }
    }
    if (!resumed) {
      // brand-new participant. Clients may only join rooms a host opened.
      const hosted = await this.state.storage.get('hosted');
      if (!host && !hosted) {
        return new Response('room not found', { status: 404 });
      }
      seq = (await this.state.storage.get('seq')) || 0;
      await this.state.storage.put('seq', seq + 1);
      await this.state.storage.put('seq:' + id, seq);
      if (host && !hosted) await this.state.storage.put('hosted', 1);
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    this.state.acceptWebSocket(server);
    server.serializeAttachment({ id, name, host, seq });

    // Replace any stale socket for the same id (accepted-new-first, so the
    // close handler sees the id still present and stays silent).
    for (const old of olds) {
      try { old.close(1000, 'resumed'); } catch (e) { /* ignore */ }
    }

    server.send(JSON.stringify({ t: '_peers', peers: this.peerIds() }));
    if (!resumed) {
      this.sendToOthers(id, JSON.stringify({ t: '_join', id }));
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  attachment(ws) {
    try { return ws.deserializeAttachment(); } catch (e) { return null; }
  }

  peerIds() {
    const atts = [];
    for (const ws of this.state.getWebSockets()) {
      const a = this.attachment(ws);
      if (a) atts.push(a);
    }
    atts.sort((a, b) => a.seq - b.seq);
    const seen = new Set();
    const ids = [];
    for (const a of atts) {
      if (!seen.has(a.id)) { seen.add(a.id); ids.push(a.id); }
    }
    return ids;
  }

  sendToOthers(excludeId, str) {
    for (const ws of this.state.getWebSockets()) {
      const a = this.attachment(ws);
      if (!a || a.id === excludeId) continue;
      try { ws.send(str); } catch (e) { /* socket is going away */ }
    }
  }

  webSocketMessage(ws, message) {
    if (typeof message !== 'string') return; // binary frames are not part of the protocol
    const a = this.attachment(ws);
    if (!a) return;
    let msg;
    try { msg = JSON.parse(message); } catch (e) { return; }
    if (msg && typeof msg.t === 'string' && msg.t.startsWith('_')) return; // control, never relayed
    this.sendToOthers(a.id, JSON.stringify({ from: a.id, msg }));
  }

  webSocketClose(ws) {
    this.dropSocket(ws);
  }

  webSocketError(ws) {
    try { ws.close(1011, 'error'); } catch (e) { /* ignore */ }
    this.dropSocket(ws);
  }

  dropSocket(ws) {
    const a = this.attachment(ws);
    if (!a) return;
    // If another live socket holds the same id, this was a resume swap: silent.
    for (const other of this.state.getWebSockets()) {
      if (other === ws) continue;
      const b = this.attachment(other);
      if (b && b.id === a.id) return;
    }
    this.sendToOthers(a.id, JSON.stringify({ t: '_leave', id: a.id }));
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/' || url.pathname === '') {
      return new Response('rushtd-relay: ok', {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }

    const m = url.pathname.match(/^\/room\/([A-Za-z0-9]{1,16})$/);
    if (m) {
      const code = m[1].toUpperCase();
      const stub = env.ROOM.get(env.ROOM.idFromName(code));
      return stub.fetch(request);
    }

    return new Response('not found', { status: 404 });
  },
};
