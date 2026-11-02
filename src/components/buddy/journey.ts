/**
 * Layout math for `PupJourney`: measures every `[data-pup-stop]` on the page,
 * works out the scroll range in which Teddy "holds" at each stop, and places
 * him along a Bézier path between stops for any scroll position.
 */
import type { PoseName } from "./geometry";

export type Box = [number, number, number, number];
export type Range = [number, number];
type Pt = { x: number; y: number };

export type Safe = { left: number; top: number; right: number; bottom: number };

/** Where a stop sits vertically: on the page, inside a sticky (pinned) block, or fixed on screen. */
export type Track =
  | { kind: "page"; top: number }
  | { kind: "screen"; top: number }
  | { kind: "pin"; top: number; from: number; to: number };

export type Stop = {
  /** Viewport x of the svg's left edge. */
  x: number;
  track: Track;
  /** Scale relative to the 300px-wide rig. */
  s: number;
  behind: boolean;
  /** How far (rig units) the pup sinks below the screen edge (lane peeks). */
  sink: number;
  /** Visible bounding box of the pose, in rig units. */
  box: Box;
};

export type StopMeta = {
  scene: HTMLElement | null;
  pose: PoseName;
  facing: 1 | -1;
  act: string;
  looks: Element[];
  /** Treadmill element whose movement Teddy walks along with. */
  track: HTMLElement | null;
};

export type Layout = {
  lane: boolean;
  stops: Stop[];
  meta: StopMeta[];
  holds: Range[];
  blend: number;
  mainTop: number;
};

export type Place = {
  x: number;
  y: number;
  s: number;
  front: boolean;
  airborne: boolean;
  /** Index of the stop we are at / just left. */
  k: number;
  /** 0 at a stop, otherwise progress to stop k+1. */
  t: number;
  /** Path length walked since stop k. */
  walked: number;
};

/** The pup's feet in rig units. */
export const FEET = { x: 150, y: 228 };
const DEFAULT_BOX: Box = [48, 30, 288, 236];
const POSE_BOXES: Partial<Record<string, Box>> = {
  sit: [50, 26, 284, 234],
  peek: [148, 34, 280, 163],
  snug: [148, 40, 280, 163],
  bow: [58, 56, 292, 236],
};
const boxFor = (pose: string) => POSE_BOXES[pose] ?? DEFAULT_BOX;
/** A lane peek sinks so its ledge (y=159) sits on the bottom edge. */
const LANE_SINK = FEET.y - 159;
const LANE_BAND: Range = [0.6, 0.86];
const DESKTOP_BAND: Range = [0.42, 0.78];

export const LANE_QUERY = "(max-width: 767px), (pointer: coarse) and (max-height: 519px)";

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (v: number) => v * v * (3 - 2 * v);
/** Smooth 0→1 between a and b (a step when a === b). */
export const ramp = (a: number, b: number, v: number) => (b === a ? +(v >= b) : smoothstep(clamp01((v - a) / (b - a))));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Screen point of a stop's feet at scroll position `scroll`. */
function stopPoint(stop: Stop, scroll: number): Pt {
  const tr = stop.track;
  const top =
    tr.kind === "page"
      ? tr.top - scroll
      : tr.kind === "screen"
        ? tr.top
        : scroll < tr.from
          ? tr.top - (scroll - tr.from)
          : scroll > tr.to
            ? tr.top - (scroll - tr.to)
            : tr.top;
  return { x: stop.x + FEET.x * stop.s, y: top + FEET.y * stop.s };
}

/** Which stop we are at (t=0) or travelling from (0<t<1) at scroll `y`. */
export function progress(holds: Range[], y: number): { k: number; t: number } {
  if (!holds.length || y <= holds[0][1]) return { k: 0, t: 0 };
  for (let i = 0; i < holds.length - 1; i++) {
    const leave = holds[i][1];
    const arrive = holds[i + 1][0];
    if (y < arrive) return { k: i, t: clamp01((y - leave) / Math.max(1, arrive - leave)) };
    if (y <= holds[i + 1][1]) return { k: i + 1, t: 0 };
  }
  return { k: holds.length - 1, t: 0 };
}

/** Soft max / min (softplus with width k). */
const softAbove = (v: number, lo: number, k: number) => {
  const z = (v - lo) / k;
  return z > 20 ? v : lo + k * Math.log1p(Math.exp(z));
};
const softBelow = (v: number, hi: number, k: number) => -softAbove(-v, -hi, k);

/** Keep the pup's visible box inside the safe area, softly. */
function keepInside(x: number, y: number, s: number, box: Box, safe: Safe, k = 8): Pt {
  const left = (FEET.x - box[0]) * s;
  const right = (box[2] - FEET.x) * s;
  const up = (FEET.y - box[1]) * s;
  const down = (box[3] - FEET.y) * s;
  return {
    x:
      safe.right - safe.left > left + right
        ? softBelow(softAbove(x, safe.left + left, k), safe.right - right, k)
        : (safe.left + safe.right) / 2 - (right - left) / 2,
    y: safe.bottom - safe.top > up + down ? softBelow(softAbove(y, safe.top + up, k), safe.bottom - down, k) : safe.bottom - down,
  };
}

const lerpBox = (a: Box, b: Box, k: number): Box => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)];

type Curve = { p0: Pt; c1: Pt; c2: Pt; p1: Pt };

function bezier({ p0, c1, c2, p1 }: Curve, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p0.x + b * c1.x + c * c2.x + d * p1.x, y: a * p0.y + b * c1.y + c * c2.y + d * p1.y };
}

/** A path from `a` to `b` that leaves and arrives horizontally, swinging wide on short hops. */
function curveBetween(a: Pt, b: Pt, safe: Safe): Curve {
  const dx = b.x - a.x;
  const width = safe.right - safe.left;
  const pull = Math.max(0.45 * Math.abs(dx), 0);
  const dir = dx >= 0 ? 1 : -1;
  let c1 = { x: a.x + dir * pull, y: a.y };
  let c2 = { x: b.x - dir * pull, y: b.y };
  const minSwing = 0.14 * width;
  if (Math.abs(dx) < minSwing) {
    const side = ((a.x + b.x) / 2 < (safe.left + safe.right) / 2 ? 1 : -1) * (minSwing - Math.abs(dx)) * 0.9;
    c1 = { x: c1.x + side, y: lerp(a.y, b.y, 0.2) };
    c2 = { x: c2.x + side, y: lerp(a.y, b.y, 0.8) };
  }
  const inside = (p: Pt) => ({
    x: Math.min(safe.right, Math.max(safe.left, p.x)),
    y: Math.min(safe.bottom, Math.max(safe.top, p.y)),
  });
  return { p0: a, c1: inside(c1), c2: inside(c2), p1: b };
}

function arcLength(curve: Curve, t: number) {
  let len = 0;
  let prev = curve.p0;
  const steps = Math.max(1, Math.ceil(32 * clamp01(t)));
  for (let i = 1; i <= steps; i++) {
    const p = bezier(curve, (i / steps) * clamp01(t));
    len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return len;
}

/** Where the pup is (and how it is doing) at scroll position `scroll`. */
export function placeAt(stops: Stop[], holds: Range[], scroll: number, safe: Safe, blend: number): Place {
  const { k, t } = progress(holds, scroll);
  if (t <= 0 || k >= stops.length - 1) {
    const stop = stops[k];
    const p = stopPoint(stop, scroll);
    const kept = keepInside(p.x, p.y, stop.s, stop.box, safe);
    return { x: kept.x, y: kept.y, s: stop.s, front: !stop.behind, airborne: false, k, t: 0, walked: 0 };
  }
  const from = stops[k];
  const to = stops[k + 1];
  const leave = holds[k][1];
  const arrive = holds[k + 1][0];
  const span = Math.max(1, arrive - leave);
  const v = clamp01((scroll - leave) / span);
  const a = stopPoint(from, leave);
  const b = stopPoint(to, arrive);
  const curve = curveBetween({ x: a.x, y: a.y - from.sink * from.s }, { x: b.x, y: b.y - to.sink * to.s }, safe);
  const eased = v * v * v * (v * (6 * v - 15) + 10);
  const p = bezier(curve, eased);
  const s = lerp(from.s, to.s, smoothstep(clamp01(v / 0.65)));
  // Near either end, follow the stop as it scrolls so we leave/arrive without a jump.
  const edge = Math.min(0.3, Math.max(0.06, blend / span));
  const stickFrom = 1 - ramp(0, edge, v);
  const stickTo = ramp(1 - edge, 1, v);
  let y = p.y + stickFrom * (stopPoint(from, scroll).y - a.y) + stickTo * (stopPoint(to, scroll).y - b.y);
  const x = p.x;
  y += from.sink * from.s * (1 - ramp(0, 0.22, v)) + to.sink * to.s * ramp(0.78, 1, v);
  let airborne = false;
  if (from.behind && v < 0.36) {
    y -= Math.sin((v / 0.36) * Math.PI) * Math.min(64 * from.s, 72);
    airborne = v < 0.32;
  }
  if (to.behind && v > 0.68) {
    y -= Math.sin(((v - 0.68) / 0.32) * Math.PI) * Math.min(56 * to.s, 60);
    airborne = true;
  }
  if (from.sink && v < 0.2) airborne = true;
  const front = !((from.behind && v < 0.12) || (to.behind && v > 0.92));
  const box =
    v < 0.5
      ? lerpBox(from.box, DEFAULT_BOX, ramp(0, from.sink ? 0.22 : from.behind ? 0.36 : 0.06, v))
      : lerpBox(DEFAULT_BOX, to.box, ramp(to.sink ? 0.78 : to.behind ? 0.68 : 0.94, 1, v));
  const kept = keepInside(x, y, s, box, safe);
  return { x: kept.x, y: kept.y, s, front, airborne, k, t: v, walked: arcLength(curve, eased) };
}

/** When scrolling stops mid hop-out/dive-in, settle on the nearest hold edge instead of hanging in the air. */
export function snapScroll(stops: Stop[], holds: Range[], y: number) {
  const { k, t } = progress(holds, y);
  if (t <= 0 || k >= stops.length - 1) return y;
  const from = stops[k];
  const to = stops[k + 1];
  const lo = from.sink ? 0.22 : 0.36 * +!!from.behind;
  const hi = to.sink ? 0.78 : to.behind ? 0.68 : 1;
  let snapped = t;
  if (t < lo) snapped = t < lo / 2 ? 0 : lo;
  else if (t > hi) snapped = t > (1 + hi) / 2 ? 1 : hi;
  return snapped === t ? y : holds[k][1] + snapped * (holds[k + 1][0] - holds[k][1]);
}

function stickyAncestor(el: Element): HTMLElement | null {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    if (getComputedStyle(p).position === "sticky") return p;
  }
  return null;
}

function trackOf(el: Element, rect: DOMRect): Track {
  const sticky = stickyAncestor(el);
  if (!sticky) return { kind: "page", top: rect.top + scrollY };
  const stickTop = parseFloat(getComputedStyle(sticky).top) || 0;
  const inset = rect.top - sticky.getBoundingClientRect().top;
  // Measure the unpinned position, then restore.
  const saved = sticky.style.position;
  sticky.style.position = "relative";
  const r = sticky.getBoundingClientRect();
  const parent = sticky.parentElement!;
  const parentBottom = parent.getBoundingClientRect().bottom - (parseFloat(getComputedStyle(parent).paddingBottom) || 0);
  sticky.style.position = saved;
  const from = r.top + scrollY - stickTop;
  const to = parentBottom + scrollY - r.height - stickTop;
  return to <= from ? { kind: "page", top: r.top + scrollY + inset } : { kind: "pin", top: stickTop + inset, from, to };
}

/** Scroll range in which the stop's box centre stays inside the `band` of the safe height. */
function holdWindow(stop: Stop, safe: Safe, band: Range): Range {
  if (stop.track.kind === "pin") return [stop.track.from, stop.track.to];
  const top = stop.track.top;
  const boxTop = top + stop.box[1] * stop.s;
  const boxBottom = top + stop.box[3] * stop.s;
  const mid = (boxTop + boxBottom) / 2;
  const h = safe.bottom - safe.top;
  let lo = mid - (safe.top + band[1] * h);
  let hi = mid - (safe.top + band[0] * h);
  lo = Math.max(lo, boxBottom - safe.bottom);
  hi = Math.min(hi, boxTop - safe.top);
  if (lo > hi) lo = hi = mid - (safe.top + h / 2);
  return [lo, hi];
}

/** Turn per-stop windows into ordered, non-overlapping holds with at least `gap[i]` of travel between them. */
function resolveHolds(windows: Range[], gap: number | number[], maxScroll: number): Range[] {
  const gapAt = (i: number) => (typeof gap === "number" ? gap : (gap[i] ?? 0));
  const holds = windows.map<Range>((w) => (w[0] <= w[1] ? [w[0], w[1]] : [(w[0] + w[1]) / 2, (w[0] + w[1]) / 2]));
  if (!holds.length) return holds;
  holds[0][0] = -Infinity;
  const last = holds[holds.length - 1];
  last[1] = Infinity;
  last[0] = Math.min(last[0], maxScroll - 1);
  for (let i = 0; i < holds.length - 1; i++) {
    const cur = holds[i];
    const next = holds[i + 1];
    if (next[0] < cur[1]) {
      const mid = (cur[1] + next[0]) / 2;
      cur[1] = Math.max(cur[0], mid);
      next[0] = Math.min(next[1], mid);
      if (next[0] < cur[1]) next[0] = cur[1];
    }
    let need = gapAt(i) - (next[0] - cur[1]);
    if (need > 0) {
      const fromCur = Math.min(need / 2, cur[1] - cur[0]);
      const fromNext = Math.min(need / 2, next[1] - next[0]);
      cur[1] -= fromCur;
      next[0] += fromNext;
      need -= fromCur + fromNext;
      const more = Math.min(need, next[1] - next[0]);
      next[0] += more;
      need -= more;
      if (need > 0) cur[1] -= Math.min(need, cur[1] - cur[0]);
    }
  }
  for (const h of holds) if (h[1] < h[0]) h[1] = h[0];
  return holds;
}

/** Viewport y of the mobile WhatsApp bar's top edge (or just above the screen bottom). */
export function barTop() {
  const bar = document.querySelector("[data-whatsapp-bar]");
  const r = bar?.getClientRects().length ? bar.getBoundingClientRect() : null;
  return r && r.height ? r.top : innerHeight - 6;
}

/** Measure the page. `probe` is a fixed 100svh element (small viewport height). */
export function measure(probe: HTMLElement): Layout {
  const lane = matchMedia(LANE_QUERY).matches;
  const vw = document.documentElement.clientWidth;
  const vh = probe.getBoundingClientRect().height || innerHeight;
  const header = document.getElementById("site-header")?.offsetHeight ?? 76;
  const bar = document.querySelector("[data-whatsapp-bar]");
  const safe: Safe = {
    left: 10,
    top: header + 10,
    right: vw - 10,
    bottom: vh - 10 - (bar?.getClientRects().length ? bar.getBoundingClientRect().height : 0),
  };
  const main = document.getElementById("main");
  const stops: Stop[] = [];
  const meta: StopMeta[] = [];
  const windows: Range[] = [];

  const addStop = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const pose = (el.dataset.pose || "sit") as PoseName;
    const act = el.dataset.act ?? "";
    const rendered = rect.width / 300;
    const s = act === "basket" || lane ? rendered : 1.12 * rendered;
    // Grow around the feet (or the ledge, for a peek).
    const anchor = pose === "peek" ? { x: FEET.x, y: 159 } : FEET;
    const track = trackOf(el, rect);
    if (track.kind !== "screen") track.top += anchor.y * (rendered - s);
    const stop: Stop = {
      x: rect.left + anchor.x * (rendered - s),
      track,
      s,
      behind: el.dataset.behind === "true",
      sink: 0,
      box: boxFor(pose),
    };
    const scene = el.closest<HTMLElement>("[data-pup-scene]");
    stops.push(stop);
    meta.push({
      scene,
      pose,
      facing: el.dataset.facing === "left" ? -1 : 1,
      act,
      looks: scene ? [...scene.querySelectorAll("[data-pup-look]")] : [],
      track: act === "treadmill" ? (scene?.querySelector<HTMLElement>("[data-treadmill]") ?? null) : null,
    });
    let win = holdWindow(stop, safe, lane ? LANE_BAND : DESKTOP_BAND);
    // Leave a stop before its scene scrolls out from under it.
    if (!lane && scene && stop.track.kind === "page" && act !== "basket" && act !== "peekaboo") {
      const h = safe.bottom - safe.top;
      const sceneStart = scene.getBoundingClientRect().top + scrollY - safe.top + 0.08 * h;
      const firstVisible = stop.track.top + stop.box[3] * stop.s - safe.bottom;
      if (win[1] > sceneStart) {
        const end = Math.max(sceneStart, firstVisible + 0.12 * h);
        win = [Math.max(firstVisible, end - Math.max(win[1] - win[0], 0.2 * h)), end];
      }
    }
    windows.push(win);
  };

  const all = [...document.querySelectorAll<HTMLElement>("[data-pup-stop]")].filter((el) => el.getClientRects().length);
  if (lane) {
    // Mobile: first and last lane stops, and a peek from the screen edge in every scene between.
    const laneStops = all.filter((el) => el.dataset.lane === "true");
    const first = laneStops[0];
    const last = laneStops.length > 1 ? laneStops[laneStops.length - 1] : undefined;
    if (first) addStop(first);
    const firstScene = meta[0]?.scene ?? null;
    const scenes = [...document.querySelectorAll<HTMLElement>("#main [data-pup-scene]")].filter(
      (el) => el !== firstScene && el.getClientRects().length,
    );
    const s = Math.min(0.62, Math.max(0.5, vw / 650));
    const box = boxFor("peek");
    scenes.forEach((scene, i) => {
      const fromLeft = i % 2 === 0;
      stops.push({
        x: fromLeft ? safe.left + 2 - box[0] * s : safe.right - 2 - box[2] * s,
        track: { kind: "screen", top: 0 },
        s,
        behind: false,
        sink: LANE_SINK,
        box,
      });
      meta.push({ scene, pose: "peek", facing: fromLeft ? 1 : -1, act: "lane", looks: [], track: null });
      const r = scene.getBoundingClientRect();
      const lo = r.top + scrollY - 0.42 * vh;
      const hi = r.bottom + scrollY - 0.58 * vh;
      windows.push(lo <= hi ? [lo, hi] : [(lo + hi) / 2, (lo + hi) / 2]);
    });
    if (last) addStop(last);
  } else all.forEach(addStop);

  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const gaps = stops.slice(1).map((next, i) => {
    const prev = stops[i];
    const minY = (DESKTOP_BAND[1] - DESKTOP_BAND[0]) * vh;
    const floor = (lane ? 0.32 : 0.5) * vh;
    return Math.min(
      1.4 * vh,
      Math.max(floor, 1.15 * Math.hypot(Math.abs(next.x + FEET.x * next.s - (prev.x + FEET.x * prev.s)), minY)),
    );
  });
  return {
    lane,
    stops,
    meta,
    holds: resolveHolds(windows, gaps, maxScroll),
    blend: 0.12 * vh,
    mainTop: main ? main.getBoundingClientRect().top + scrollY : 0,
  };
}
