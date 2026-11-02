/**
 * Deterministic "hand-drawn" frame geometry for a puppy card, seeded by the
 * puppy's slug so the same puppy always gets the same wobbly outline, wash
 * and doodles (on the server and the client alike).
 *
 * The PRNG call order matters: it is kept identical to the original so the
 * shapes match the reference site exactly.
 */

type Rand = () => number;
type Point = [number, number];

export type DoodleKind = "sparkle" | "heart" | "dashes" | "swirl" | "dots" | "paw";

export type Doodle = {
  kind: DoodleKind;
  x: number;
  y: number;
  rot: number;
  size: number;
  ink: string;
};

export type Sketch = {
  mask: string;
  outline: string;
  retrace: string;
  wash: { d: string; dx: number; dy: number; color: string };
  tilt: number;
  doodles: Doodle[];
};

const WASHES = ["#f2be6b", "#f9cdbf", "#bfddf5", "#fbe3b4", "#e8c39a"];
const INKS = ["#c2622b", "#a24a1a", "#2a170e", "#d4893f"];
const KINDS: DoodleKind[] = ["sparkle", "heart", "dashes", "swirl", "dots", "paw"];
/** Angular zones (in units of π) where doodles may sit around the frame. */
const ZONES: Point[] = [
  [0.86, 1.08],
  [1.16, 1.42],
  [-0.08, 0.16],
];

const f2 = (n: number) => n.toFixed(2);

/** FNV-1a hash of the seed feeding a mulberry32 generator. */
function seeded(seed: string): Rand {
  let h = 0x811c9dc5;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 0x1000193);
  let a = h >>> 0;
  return () => {
    let t = (a = (a + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

/** Points on a wobbly circle (or arc) centred in a 100×100 box. */
function blob(rand: Rand, r: number, amp: number, n = 40, start = 0, span = 2 * Math.PI): Point[] {
  const phase = [6.28 * rand(), 6.28 * rand(), 6.28 * rand()];
  const squash = 1 + (rand() - 0.5) * 0.05;
  const closed = span >= 2 * Math.PI;
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const t = start + (i / (closed ? n : n - 1)) * span;
    const d =
      r +
      amp *
        (0.55 * Math.sin(2 * t + phase[0]) +
          0.3 * Math.sin(3 * t + phase[1]) +
          0.15 * Math.sin(5 * t + phase[2]));
    pts.push([50 + Math.cos(t) * d * squash, 50 + (Math.sin(t) * d) / squash]);
  }
  return pts;
}

/** Smooth Catmull-Rom curve through the points, as an SVG path. */
function curve(pts: Point[], closed: boolean): string {
  const n = pts.length;
  const at = (i: number) => pts[closed ? (i + n) % n : Math.min(n - 1, Math.max(0, i))];
  let d = `M${f2(pts[0][0])} ${f2(pts[0][1])}`;
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f2(c1[0])} ${f2(c1[1])} ${f2(c2[0])} ${f2(c2[1])} ${f2(p2[0])} ${f2(p2[1])}`;
  }
  return closed ? `${d}Z` : d;
}

export function sketchFor(slug: string): Sketch {
  const rand = seeded(slug);
  const mask = curve(blob(rand, 45.5, 2.6), true);
  const outline = curve(blob(rand, 47.8, 3.1), true);
  const retraceStart = rand() * Math.PI * 2;
  const retrace = curve(blob(rand, 49, 3.4, 30, retraceStart, Math.PI * (1.15 + 0.5 * rand())), false);
  const wash = {
    d: curve(blob(rand, 46.5, 3.6), true),
    dx: (rand() - 0.5) * 9,
    dy: 3 + 4 * rand(),
    color: WASHES[Math.floor(rand() * WASHES.length)],
  };
  const tilt = (rand() - 0.5) * 5;
  const zones = ZONES.map((z) => ({ z, k: rand() }))
    .sort((a, b) => a.k - b.k)
    .map((e) => e.z);
  const count = 2 + Math.floor(2 * rand());
  const used = new Set<DoodleKind>();
  const doodles: Doodle[] = [];
  for (let i = 0; i < count; i++) {
    let kind = KINDS[Math.floor(rand() * KINDS.length)];
    if (used.has(kind)) kind = KINDS.find((k) => !used.has(k)) ?? kind;
    used.add(kind);
    const [lo, hi] = zones[i];
    const angle = Math.PI * (lo + rand() * (hi - lo));
    const radius = 55 + 4 * rand();
    doodles.push({
      kind,
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
      rot: (rand() - 0.5) * 50,
      size: 0.85 + 0.35 * rand(),
      ink: INKS[Math.floor(rand() * INKS.length)],
    });
  }
  return { mask, outline, retrace, wash, tilt, doodles };
}

/** CSS `mask-image` value cutting a photo to the given path. */
export function maskUrl(d: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${d}" fill="#000"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
