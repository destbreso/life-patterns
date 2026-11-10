// What a pattern does, found by running it: it stays still, oscillates with a period, travels (a ship, its period and
// how far), dies, fires a gun's stream (its core coming back while its population climbs by the same amount every
// period), or is still changing when the run ends. A plain sparse engine for any Life-like rule (births and survivals
// by count of the eight neighbours), as destbreso.com's lib/sim/life/analyze.ts reads a selection.

const K = 1 << 20;
const key = (x, y) => (x + K) * 2 * K + (y + K);
const X = (k) => Math.floor(k / (2 * K)) - K;
const Y = (k) => (k % (2 * K)) - K;

/** a rule as sets of counts: "B36/S23" */
export function parseRule(rule) {
  const m = /^B([0-8]*)\/S([0-8]*)$/.exec(rule);
  if (!m) return null;
  return { birth: new Set([...m[1]].map(Number)), survival: new Set([...m[2]].map(Number)) };
}

function step(live, rule) {
  const n = new Map();
  for (const k of live) {
    const x = X(k),
      y = Y(k);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const q = key(x + dx, y + dy);
        n.set(q, (n.get(q) ?? 0) + 1);
      }
  }
  const next = new Set();
  for (const [k, c] of n) if (live.has(k) ? rule.survival.has(c) : rule.birth.has(c)) next.add(k);
  return next;
}

/** a generation's shape wherever it is, as a string, and its box's corner */
function shapeOf(live) {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity;
  for (const k of live) {
    const x = X(k),
      y = Y(k);
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
  }
  const w = x1 - x0 + 1;
  const cells = [];
  for (const k of live) cells.push((Y(k) - y0) * w + (X(k) - x0));
  cells.sort((a, b) => a - b);
  return { key: `${w}:${cells.join(",")}`, x0, y0 };
}

/**
 * Runs the cells up to `maxGen` generations, or until the live cells pass `maxCells`, and says what they do.
 * kinds: still, oscillator (period, from), ship (period, dx, dy, from), gun (period, growth), dies (at), evolving.
 */
export function behaviour(cells, ruleText, { maxGen = 1024, maxCells = 20000, gunMaxPeriod = 400 } = {}) {
  const rule = parseRule(ruleText);
  if (!rule) return null;
  let live = new Set(cells.map(([x, y]) => key(x, y)));
  if (!live.size) return { kind: "dies", at: 0 };
  const seen = new Map();
  const first = shapeOf(live);
  seen.set(first.key, { g: 0, x0: first.x0, y0: first.y0 });
  const pops = [live.size];
  for (let g = 1; g <= maxGen; g++) {
    live = step(live, rule);
    pops.push(live.size);
    if (!live.size) return { kind: "dies", at: g };
    if (live.size > maxCells) break;
    const s = shapeOf(live);
    const prev = seen.get(s.key);
    if (prev) {
      const period = g - prev.g,
        dx = s.x0 - prev.x0,
        dy = s.y0 - prev.y0;
      if (dx || dy) return { kind: "ship", period, dx, dy, from: prev.g };
      if (period === 1) return prev.g === 0 ? { kind: "still" } : { kind: "still", from: prev.g };
      return { kind: "oscillator", period, from: prev.g };
    }
    seen.set(s.key, { g, x0: s.x0, y0: s.y0 });
  }
  // (a gun: the population climbs by the same amount every period, over the run's second half)
  const tail = pops.slice(Math.floor(pops.length / 2));
  for (let p = 1; p <= Math.min(gunMaxPeriod, Math.floor(tail.length / 3)); p++) {
    const d = tail[tail.length - 1] - tail[tail.length - 1 - p];
    if (d <= 0) continue;
    let ok = true;
    for (let i = tail.length - 1; i - p >= 0; i--)
      if (tail[i] - tail[i - p] !== d) {
        ok = false;
        break;
      }
    if (ok) return { kind: "gun", period: p, growth: d };
  }
  return { kind: "evolving", population: live.size, gens: pops.length - 1 };
}
