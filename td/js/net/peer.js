// PeerJS transport, star topology. window.Peer comes from a CDN script tag
// (https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js); it is NOT imported here.
//
// Host claims peer id 'rushtd-<CODE>'. Clients connect to it with reliable
// DataConnections. All client traffic goes through the host:
//
//   client -> host: {_fwd:true, msg}   broadcast, host fans out to everyone else
//   client -> host: {_to:id, msg}      targeted, host forwards (or delivers to itself)
//   host -> client: {from, msg}        app payload with original sender id
//   host -> client: {_peers:[ids]}     join-ordered roster, sent on every change
//
// Events match relay.js exactly so the app cannot tell the transports apart.

const CONNECT_TIMEOUT_MS = 15000;

function hostPeerId(code) {
  return 'rushtd-' + String(code).toUpperCase();
}

function makeEmitter() {
  const msgCbs = [];
  const joinCbs = [];
  const leaveCbs = [];
  function emit(cbs, ...args) {
    for (const cb of cbs) {
      try { cb(...args); } catch (e) { console.error('peer callback error', e); }
    }
  }
  return { msgCbs, joinCbs, leaveCbs, emit };
}

export function createPeerTransport({ code, isHost, name }) {
  if (typeof window === 'undefined' || !window.Peer) {
    return Promise.reject(new Error('PeerJS is not loaded (window.Peer missing)'));
  }
  return isHost ? createHost(code) : createClient(code, name);
}

function createHost(code) {
  return new Promise((resolve, reject) => {
    const Peer = window.Peer;
    const myId = hostPeerId(code);
    const peer = new Peer(myId);
    const conns = new Map(); // clientId -> DataConnection, insertion order = join order
    const { msgCbs, joinCbs, leaveCbs, emit } = makeEmitter();
    let resolved = false;
    let destroyed = false;

    const timer = setTimeout(() => {
      if (!resolved) { destroyed = true; peer.destroy(); reject(new Error('PeerJS host open timed out')); }
    }, CONNECT_TIMEOUT_MS);

    function roster() {
      return [myId, ...conns.keys()];
    }

    function sendPeersToAll() {
      const m = { _peers: roster() };
      for (const c of conns.values()) c.send(m);
    }

    function dropClient(clientId, which) {
      // a reconnected client replaces its conn; ignore the stale close event
      if (which && conns.get(clientId) !== which) return;
      if (!conns.has(clientId)) return;
      conns.delete(clientId);
      emit(leaveCbs, clientId);
      sendPeersToAll();
    }

    peer.on('open', () => {
      if (resolved || destroyed) return;
      resolved = true;
      clearTimeout(timer);
      resolve(transport);
    });

    peer.on('error', (err) => {
      if (!resolved) {
        destroyed = true;
        clearTimeout(timer);
        try { peer.destroy(); } catch (e) { /* ignore */ }
        reject(err);
      } else {
        console.warn('PeerJS host error', err);
      }
    });

    peer.on('disconnected', () => {
      if (!destroyed) { try { peer.reconnect(); } catch (e) { /* ignore */ } }
    });

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        if (destroyed) { conn.close(); return; }
        conns.set(conn.peer, conn);
        emit(joinCbs, conn.peer);
        sendPeersToAll();
      });
      conn.on('data', (d) => {
        if (destroyed || !d || typeof d !== 'object') return;
        const from = conn.peer;
        if (d._fwd) {
          // client broadcast: fan out to every other client, deliver locally
          for (const [pid, c] of conns) {
            if (pid !== from) c.send({ from, msg: d.msg });
          }
          emit(msgCbs, d.msg, from);
        } else if (d._to !== undefined) {
          if (d._to === myId) {
            emit(msgCbs, d.msg, from);
          } else {
            const c = conns.get(d._to);
            if (c) c.send({ from, msg: d.msg });
          }
        }
      });
      conn.on('close', () => dropClient(conn.peer, conn));
      conn.on('error', () => dropClient(conn.peer, conn));
    });

    const transport = {
      id: myId,
      send(toId, msg) {
        const c = conns.get(toId);
        if (c) c.send({ from: myId, msg });
      },
      broadcast(msg) {
        const m = { from: myId, msg };
        for (const c of conns.values()) c.send(m);
      },
      onMessage(cb) { msgCbs.push(cb); },
      onPeerJoin(cb) { joinCbs.push(cb); },
      onPeerLeave(cb) { leaveCbs.push(cb); },
      peers() { return roster(); },
      close() {
        destroyed = true;
        try { peer.destroy(); } catch (e) { /* ignore */ }
      },
    };
  });
}

function createClient(code, name) {
  return new Promise((resolve, reject) => {
    const Peer = window.Peer;
    const hostId = hostPeerId(code);
    const peer = new Peer(); // random id assigned by the PeerJS cloud
    const { msgCbs, joinCbs, leaveCbs, emit } = makeEmitter();
    let conn = null;
    let resolved = false;
    let destroyed = false;
    let peerList = [];

    const timer = setTimeout(() => {
      if (!resolved) fail(new Error('PeerJS connect timed out'));
    }, CONNECT_TIMEOUT_MS);

    function fail(err) {
      if (resolved || destroyed) return;
      destroyed = true;
      clearTimeout(timer);
      try { peer.destroy(); } catch (e) { /* ignore */ }
      reject(err);
    }

    function setPeers(list) {
      const old = peerList;
      peerList = list.slice();
      if (!resolved) return; // initial roster: no events, app reads peers()
      for (const p of peerList) {
        if (p !== peer.id && !old.includes(p)) emit(joinCbs, p);
      }
      for (const p of old) {
        if (p !== peer.id && !peerList.includes(p)) emit(leaveCbs, p);
      }
    }

    // The star has a single hub: when the host is unreachable for good, the
    // whole session is lost for this client. Emit leave for EVERY other peer
    // so the app ends the game cleanly instead of stalling.
    function sessionLost() {
      if (destroyed) return;
      const others = peerList.filter((p) => p !== peer.id);
      peerList = peer.id ? [peer.id] : [];
      for (const p of others) emit(leaveCbs, p);
    }

    let retries = 0;
    function onConnDown(err) {
      if (destroyed) return;
      if (!resolved) { fail(err instanceof Error ? err : new Error('connection to host closed')); return; }
      if (retries < 3) {
        retries++;
        setTimeout(() => { if (!destroyed) connectToHost(); }, 1500);
      } else {
        sessionLost();
      }
    }

    function connectToHost() {
      const c = peer.connect(hostId, { reliable: true, metadata: { name: name || '' } });
      conn = c;

      // a connect to a dead host emits no close event; give each attempt 5s
      const attemptTimer = setTimeout(() => {
        if (conn === c && !c.open && resolved && !destroyed) onConnDown();
      }, 5000);

      c.on('open', () => { retries = 0; clearTimeout(attemptTimer); });

      c.on('data', (d) => {
        if (destroyed || !d || typeof d !== 'object') return;
        if (Array.isArray(d._peers)) {
          setPeers(d._peers);
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve(transport);
          }
          return;
        }
        if (d.from !== undefined) emit(msgCbs, d.msg, d.from);
      });

      c.on('close', () => { if (conn === c) onConnDown(); });
      c.on('error', (err) => { if (conn === c) onConnDown(err); });
    }

    peer.on('open', () => {
      if (destroyed) return;
      connectToHost();
    });

    peer.on('error', (err) => {
      if (!resolved) fail(err); // covers 'peer-unavailable' = room not found
      else console.warn('PeerJS client error', err);
    });

    peer.on('disconnected', () => {
      if (!destroyed) { try { peer.reconnect(); } catch (e) { /* ignore */ } }
    });

    const transport = {
      get id() { return peer.id; },
      send(toId, msg) {
        if (conn && conn.open) conn.send({ _to: toId, msg });
      },
      broadcast(msg) {
        if (conn && conn.open) conn.send({ _fwd: true, msg });
      },
      onMessage(cb) { msgCbs.push(cb); },
      onPeerJoin(cb) { joinCbs.push(cb); },
      onPeerLeave(cb) { leaveCbs.push(cb); },
      peers() { return peerList.slice(); },
      close() {
        destroyed = true;
        clearTimeout(timer);
        try { peer.destroy(); } catch (e) { /* ignore */ }
      },
    };
  });
}
