// path.js - polyline utilities for RUSH TD
// Pure math, no DOM. Importable in Node.

function toXY(p) {
  if (Array.isArray(p)) return { x: p[0], y: p[1] };
  return { x: p.x, y: p.y };
}

// buildPath(points) -> { points, length, posAt(d), distToPath(x,y) }
// points: array of {x,y} or [x,y]. posAt clamps d to [0, length] and returns
// {x, y, angle} where angle is the heading of the segment in radians.
export function buildPath(points) {
  const pts = points.map(toXY);
  if (pts.length < 2) throw new Error('buildPath needs at least 2 points');

  const segLen = [];
  const cum = [0];
  let length = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const dy = pts[i + 1].y - pts[i].y;
    const l = Math.hypot(dx, dy);
    segLen.push(l);
    length += l;
    cum.push(length);
  }

  function posAt(d) {
    if (d <= 0) {
      const a = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
      return { x: pts[0].x, y: pts[0].y, angle: a };
    }
    if (d >= length) {
      const n = pts.length;
      const a = Math.atan2(pts[n - 1].y - pts[n - 2].y, pts[n - 1].x - pts[n - 2].x);
      return { x: pts[n - 1].x, y: pts[n - 1].y, angle: a };
    }
    // binary search for segment containing d
    let lo = 0;
    let hi = segLen.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid + 1] < d) lo = mid + 1;
      else hi = mid;
    }
    const i = lo;
    const t = segLen[i] > 0 ? (d - cum[i]) / segLen[i] : 0;
    const a = pts[i];
    const b = pts[i + 1];
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      angle: Math.atan2(b.y - a.y, b.x - a.x),
    };
  }

  function distToSegment(px, py, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    let t = 0;
    if (lenSq > 0) {
      t = ((px - a.x) * dx + (py - a.y) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
    }
    const cx = a.x + dx * t;
    const cy = a.y + dy * t;
    return Math.hypot(px - cx, py - cy);
  }

  function distToPath(x, y) {
    let best = Infinity;
    for (let i = 0; i < pts.length - 1; i++) {
      const d = distToSegment(x, y, pts[i], pts[i + 1]);
      if (d < best) best = d;
    }
    return best;
  }

  return { points: pts, length, posAt, distToPath };
}
