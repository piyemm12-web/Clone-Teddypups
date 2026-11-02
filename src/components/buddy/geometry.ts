/**
 * Teddy's procedural rig: palette, part outlines, poses, and the function that
 * turns a pose plus a motion state into SVG transforms / opacities per part.
 * Everything here is pure, so the server render and the live driver agree.
 */

export const INK = "#2a170e";
export const FUR = "#f2be6b";
export const FUR_FAR = "#e4a352";
export const CREAM = "#fbe3b4";
export const COLLAR = "#a24a1a";
export const CHEEK = "#f9b9a6";

/** SVG viewBox width / height. */
export const VIEW_W = 300;
export const VIEW_H = 240;
/** Eye line and ground line (viewBox units). */
export const EYE_Y = 98;
export const GROUND_Y = 228;

type Point = readonly [number, number];

/** Pivots for body and head rotation. */
const BODY_PIVOT: Point = [196, 206];
export const HEAD_PIVOT: Point = [212, 100];
const SHOULDER_N: Point = [186, 194];
const SHOULDER_F: Point = [168, 192];
const HIP_N: Point = [110, 194];
const HIP_F: Point = [94, 192];
const TAIL_BASE: Point = [84, 150];
const EAR_L_PIVOT: Point = [174, 82];
const EAR_R_PIVOT: Point = [250, 82];

export const ANCHORS = {
  shoulderN: SHOULDER_N,
  shoulderF: SHOULDER_F,
  hipN: HIP_N,
  hipF: HIP_F,
  tailBase: TAIL_BASE,
} as const;

/**
 * A "fluffy" closed outline: an ellipse split into `lobes` quadratic bumps
 * that bulge out by `puff`, optionally rotated by `deg`.
 */
function fluff(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  lobes: number,
  puff: number,
  start = -Math.PI / 2,
  deg = 0,
): string {
  const rot = (deg * Math.PI) / 180;
  const at = (angle: number, out: number) => {
    const px = Math.cos(angle) * (rx + out);
    const py = Math.sin(angle) * (ry + (ry / rx) * out);
    return `${(cx + px * Math.cos(rot) - py * Math.sin(rot)).toFixed(1)} ${(cy + px * Math.sin(rot) + py * Math.cos(rot)).toFixed(1)}`;
  };
  let d = "";
  for (let i = 0; i < lobes; i++) {
    const a0 = start + (i / lobes) * Math.PI * 2;
    const a1 = start + ((i + 1) / lobes) * Math.PI * 2;
    const mid = (a0 + a1) / 2;
    d += `${i === 0 ? `M${at(a0, 0)}` : ""}Q${at(mid, 2.1 * puff)} ${at(a1, 0)}`;
  }
  return `${d}Z`;
}

export const PARTS = {
  body: fluff(140, 170, 64, 36, 15, 3.4, 0.95 * Math.PI),
  chest: fluff(192, 166, 30, 32, 9, 3.2, 0.6 * Math.PI),
  tail: fluff(70, 126, 17, 16, 9, 3.2),
  tailStem: "M86 152 C80 146 76 140 74 136",
  haunch: fluff(110, 204, 30, 24, 10, 3.2, Math.PI),
  haunchPaw: "M112 214 C126 212 142 214 146 221 C148 226 144 229 136 229 L116 229 C108 229 104 224 106 219 Z",
  head: fluff(212, 100, 51, 46, 16, 3.6),
  topknot: fluff(212, 52, 17, 12, 8, 2.9, Math.PI),
  earL: fluff(170, 112, 19, 34, 10, 3.2, -Math.PI / 2, 12),
  earR: fluff(254, 112, 19, 34, 10, 3.2, -Math.PI / 2, -12),
  muzzle: "M188 120 C188 106 200 100 212 100 C224 100 236 106 236 120 C236 133 225 140 212 140 C199 140 188 133 188 120 Z",
  nose: "M204.5 111.5 Q212 107.2 219.5 111.5 Q218.2 118.4 212 120 Q205.8 118.4 204.5 111.5 Z",
  mouth: "M212 120 V124.5 M212 124.5 Q207.2 129.6 202.8 125.2 M212 124.5 Q216.8 129.6 221.2 125.2",
  mouthOpen: "M203 126 Q212 122 221 126 Q219 138 212 139 Q205 138 203 126 Z",
  tongue: "M207.6 127.4 Q212 136.6 216.4 127.4 Z",
  collar: "M178 146 Q212 162 246 146 L246 154 Q212 170 178 154 Z",
  tag: "M212 160 C212 156 206 155 206 159.4 C206 163 212 166.6 212 168.4 C212 166.6 218 163 218 159.4 C218 155 212 156 212 160 Z",
  ledgePaws:
    "M175 159 C175 148 181 142 190 142 C199 142 205 148 205 159 Z M219 159 C219 148 225 142 234 142 C243 142 249 148 249 159 Z",
  ledgeToes: "M186 153 v-4.5 M194 153 v-4.5 M230 153 v-4.5 M238 153 v-4.5",
  shadow: { cx: 150, cy: 230, rx: 92, ry: 7 },
} as const;

/** Open leg outline (hip/shoulder at 0,-14 down to a paw at `len`). */
function leg(width: number, len: number): string {
  const h = width / 2;
  return `M${-h} -14 C${-h} 4 -12 ${len - 18} -12 ${len - 9} C-12 ${len - 2} -7 ${len} 0 ${len} C9 ${len} 13 ${len - 3} 13 ${len - 9} C13 ${len - 18} ${h} 4 ${h} -14`;
}

export const LEGS = {
  front: leg(24, GROUND_Y - SHOULDER_N[1]),
  frontFar: leg(22, GROUND_Y - SHOULDER_F[1]),
  back: leg(30, GROUND_Y - HIP_N[1]),
  backFar: leg(28, GROUND_Y - HIP_F[1]),
} as const;

/** Toe lines at the bottom of a leg of length `len`. */
export const toes = (len: number) => `M-3.5 ${len - 7} v5 M4.5 ${len - 7} v5`;

export type Pose = {
  bodyRot: number;
  bodyX: number;
  bodyY: number;
  stretch: number;
  headX: number;
  headY: number;
  headRot: number;
  earL: number;
  earR: number;
  tail: number;
  fn: number;
  ff: number;
  bn: number;
  bf: number;
  sit: number;
  eyes: number;
  happy: number;
  tongue: number;
  mouth: number;
  front: number;
};

const BASE: Pose = {
  bodyRot: 0,
  bodyX: 0,
  bodyY: 0,
  stretch: 1,
  headX: 0,
  headY: 0,
  headRot: 0,
  earL: 0,
  earR: 0,
  tail: 0,
  fn: 0,
  ff: 0,
  bn: 0,
  bf: 0,
  sit: 0,
  eyes: 1,
  happy: 0,
  tongue: 0,
  mouth: 0,
  front: 0,
};

export const POSES = {
  stand: BASE,
  walk: { ...BASE, tail: -6, tongue: 1 },
  sit: { ...BASE, bodyRot: -24, bodyY: -2, headX: -10, headY: -6, tail: 34, sit: 1, tongue: 1 },
  peek: { ...BASE, headY: 4, earL: -6, earR: 6, tail: -20, front: 1, tongue: 1 },
  snug: { ...BASE, headY: 9, headRot: 4, earL: 3, earR: -3, tail: -20, front: 1, tongue: 0 },
  lie: { ...BASE, bodyRot: -5, bodyY: 22, headX: 12, headY: 40, headRot: 3, fn: -84, ff: -80, sit: 1, tail: 58, tongue: 0 },
  sleep: {
    ...BASE,
    bodyRot: -5,
    bodyY: 22,
    headX: 14,
    headY: 44,
    headRot: -8,
    fn: -84,
    ff: -80,
    sit: 1,
    tail: 64,
    eyes: 0,
    earL: 4,
    earR: -4,
  },
  settle: { ...BASE, bodyRot: -5, bodyY: 22, headX: 10, headY: 16, fn: -84, ff: -80, sit: 1, tail: 40, tongue: 1 },
  hop: {
    ...BASE,
    bodyRot: -9,
    stretch: 1.06,
    headY: -6,
    fn: -42,
    ff: -32,
    bn: 40,
    bf: 30,
    earL: -26,
    earR: 26,
    tail: -24,
    tongue: 1,
  },
  sniff: { ...BASE, bodyRot: 7, headX: 16, headY: 32, headRot: 9, tail: -14, fn: 6, ff: 4 },
  bow: { ...BASE, bodyRot: 15, bodyY: 2, headX: 14, headY: 30, fn: -58, ff: -52, tail: -32, happy: 1, tongue: 1 },
  beg: {
    ...BASE,
    bodyRot: -36,
    bodyY: -6,
    headX: -18,
    headY: -18,
    sit: 1,
    fn: -70,
    ff: -64,
    tail: 30,
    happy: 1,
    tongue: 1,
  },
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;

const POSE_KEYS = Object.keys(BASE) as (keyof Pose)[];

/** Continuous motion state layered on top of a pose. */
export type Motion = {
  phase: number;
  stride: number;
  time: number;
  wag: number;
  gazeX: number;
  gazeY: number;
  blink: number;
  ear: number;
};

export const REST_MOTION: Motion = { phase: 0, stride: 0, time: 0, wag: 0, gazeX: 0, gazeY: 0, blink: 0, ear: 0 };

const r2 = (v: number) => Math.round(100 * v) / 100;
const rotate = (deg: number, [px, py]: Point) => `rotate(${r2(deg)} ${px} ${py})`;

/** Linear blend between two poses. */
export function lerpPose(a: Pose, b: Pose, k: number): Pose {
  const out = { ...a };
  for (const key of POSE_KEYS) out[key] = a[key] + (b[key] - a[key]) * k;
  return out;
}

export type Frame = ReturnType<typeof frameFor>;

/** Transforms and opacities for every rig part, given a pose and motion state. */
export function frameFor(p: Pose, m: Motion = REST_MOTION) {
  const swing = Math.sin(m.phase);
  const swingOpp = Math.sin(m.phase + Math.PI);
  const reach = 20 + 10 * m.stride;
  const bob = (1 - Math.cos(2 * m.phase)) / 2;
  const walking = +(m.stride > 0.01);
  const breathe = Math.sin(2.4 * m.time) * (1 - walking);
  const bodyY = p.bodyY - bob * (2.5 + 4 * m.stride) * walking + 0.6 * breathe;
  const bodyRot = p.bodyRot + 1.6 * Math.sin(m.phase) * walking;
  const counter = -p.bodyRot;
  const wagAmp = 5 + 17 * m.wag;
  const wagHz = 1.2 + 2.6 * m.wag;
  const tail = p.tail + Math.sin(m.time * wagHz * Math.PI * 2) * wagAmp;
  const headBob = (-(1 - Math.cos(2 * m.phase - 0.7)) / 2) * (2 + 3 * m.stride) * walking + 0.9 * breathe;
  return {
    body: `translate(${r2(p.bodyX)} ${r2(bodyY)}) ${rotate(bodyRot, BODY_PIVOT)} translate(${BODY_PIVOT[0]} 0) scale(${r2(p.stretch)} 1) translate(${-BODY_PIVOT[0]} 0)`,
    fn: `translate(${SHOULDER_N[0]} ${SHOULDER_N[1]}) rotate(${r2(p.fn + counter + swing * reach * walking)})`,
    ff: `translate(${SHOULDER_F[0]} ${SHOULDER_F[1]}) rotate(${r2(p.ff + counter + swingOpp * reach * walking)})`,
    bn: `translate(${HIP_N[0]} ${HIP_N[1]}) rotate(${r2(p.bn + swingOpp * reach * walking)})`,
    bf: `translate(${HIP_F[0]} ${HIP_F[1]}) rotate(${r2(p.bf + swing * reach * walking)})`,
    tail: rotate(tail, TAIL_BASE),
    haunch: `translate(0 ${r2(-(0.06 * p.bodyRot))})`,
    head: `translate(${r2(p.headX)} ${r2(p.headY + headBob)}) ${rotate(p.headRot + 1.4 * Math.sin(m.phase) * walking, HEAD_PIVOT)}`,
    earL: rotate(p.earL + m.ear + 4 * Math.sin(2 * m.phase) * walking, EAR_L_PIVOT),
    earR: rotate(p.earR - m.ear - 4 * Math.sin(2 * m.phase) * walking, EAR_R_PIVOT),
    eyes: `translate(${r2(3.4 * m.gazeX)} ${r2(2.6 * m.gazeY)})`,
    blink: `translate(0 ${r2(EYE_Y * m.blink * 0.92)}) scale(1 ${r2(1 - 0.92 * m.blink)})`,
    openEyes: r2(Math.max(0, p.eyes - p.happy)),
    happyEyes: r2(Math.min(p.happy, p.eyes)),
    shutEyes: r2(1 - p.eyes),
    tongue: r2(p.tongue * (1 - p.mouth)),
    mouth: r2(p.mouth),
    backLegs: r2(1 - p.sit),
    haunchOpacity: r2(p.sit * (1 - p.front)),
    side: r2(1 - p.front),
    ledge: r2(p.front),
    shadow: `translate(${r2(0.6 * p.bodyX)} 0) scale(${r2(1 - 0.05 * bob * walking)} 1)`,
    shadowOpacity: r2(0.12 * (1 - p.front)),
  };
}
