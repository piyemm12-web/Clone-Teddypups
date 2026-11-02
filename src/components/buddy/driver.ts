import {
  EYE_Y,
  HEAD_PIVOT,
  POSES,
  REST_MOTION,
  VIEW_H,
  VIEW_W,
  frameFor,
  lerpPose,
  type Frame,
  type Motion,
  type Pose,
  type PoseName,
} from "./geometry";

/** [data-p part, attribute, frame key] written each tick. */
const WRITES: readonly [string, string, keyof Frame | "root"][] = [
  ["root", "transform", "root"],
  ["shadow", "transform", "shadow"],
  ["shadow", "opacity", "shadowOpacity"],
  ["body", "transform", "body"],
  ["body", "opacity", "side"],
  ["bf", "transform", "bf"],
  ["bf", "opacity", "backLegs"],
  ["bn", "transform", "bn"],
  ["bn", "opacity", "backLegs"],
  ["ff", "transform", "ff"],
  ["fn", "transform", "fn"],
  ["tail", "transform", "tail"],
  ["haunch", "transform", "haunch"],
  ["haunch", "opacity", "haunchOpacity"],
  ["head", "transform", "head"],
  ["earL", "transform", "earL"],
  ["earR", "transform", "earR"],
  ["eyes", "transform", "eyes"],
  ["open", "opacity", "openEyes"],
  ["blink", "transform", "blink"],
  ["happy", "opacity", "happyEyes"],
  ["shut", "opacity", "shutEyes"],
  ["tongue", "opacity", "tongue"],
  ["mouth", "opacity", "mouth"],
  ["ledge", "opacity", "ledge"],
];

/** Exponential smoothing factor for a step `dt` with time constant `tau`. */
const ease = (dt: number, tau: number) => 1 - Math.exp(-dt / tau);
const clamp = (v: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, v));

export type Dir = 1 | -1;
export type PoseInput = PoseName | Pose;
export type ScreenPoint = { x: number; y: number };

/**
 * Animates a server-rendered `PupSvg` by writing attributes straight to its
 * `[data-p]` elements. Call `tick(dt, t)` every frame; everything else sets targets.
 */
export class PupDriver {
  private svg: SVGSVGElement;
  private els = new Map<string, Element>();
  private written = new Map<string, string>();
  private pose: Pose;
  private target: Pose;
  private m: Motion = { ...REST_MOTION };
  private facing: number;
  private facingTarget: number;
  private strideTarget = 0;
  private wagTarget = 0.35;
  private gazeTarget = { x: 0, y: 0 };
  private tilt = 0;
  private tiltTarget = 0;
  private earV = 0;
  private nextBlink = 1.2;
  private blinkAt = -1;
  private woofUntil = 0;
  private bounce = 0;
  private bounceV = 0;
  private offset = 0;
  private offsetTarget = 0;
  private pet = 0;
  private petTarget = 0;
  private turn = 0.07;
  private lean = 0;

  constructor(svg: SVGSVGElement, pose: PoseName = "sit", facing: number = 1) {
    this.svg = svg;
    svg.querySelectorAll<SVGElement>("[data-p]").forEach((el) => this.els.set(el.dataset.p!, el));
    this.pose = { ...POSES[pose] };
    this.target = this.pose;
    this.facing = facing;
    this.facingTarget = facing;
  }

  setPose(pose: PoseInput) {
    this.target = typeof pose === "string" ? POSES[pose] : pose;
  }

  /** Snap to a pose (and optionally a facing) without easing. */
  jump(pose: PoseName, facing?: number) {
    this.pose = { ...POSES[pose] };
    this.target = POSES[pose];
    if (facing) this.facing = this.facingTarget = facing;
  }

  face(dir: number, turn = 0.07) {
    this.facingTarget = dir;
    this.turn = turn;
  }

  get facingDir() {
    return this.facingTarget;
  }

  stride(k: number) {
    this.strideTarget = clamp(k, 0, 1);
  }

  advance(px: number) {
    this.m.phase += (px / 46) * Math.PI;
  }

  walkedTo(px: number) {
    this.m.phase = (px / 46) * Math.PI;
  }

  wag(k: number) {
    this.wagTarget = clamp(k, 0, 1);
  }

  cock(deg: number) {
    this.tiltTarget = deg;
  }

  lookAt(p: ScreenPoint | null) {
    if (!p) {
      this.gazeTarget = { x: 0, y: 0 };
      return;
    }
    const r = this.svg.getBoundingClientRect();
    const headX = this.facingTarget > 0 ? HEAD_PIVOT[0] : VIEW_W - HEAD_PIVOT[0];
    const ex = r.left + (headX / VIEW_W) * r.width;
    const ey = r.top + (EYE_Y / VIEW_H) * r.height;
    const dx = p.x - ex;
    const dy = p.y - ey;
    const dist = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, dist / 160);
    this.gazeTarget = { x: (dx / dist) * k * this.facingTarget, y: (dy / dist) * k };
  }

  woof(t: number) {
    this.woofUntil = t + 0.34;
    this.bounceV = -150;
    this.earV += 260;
  }

  jolt(k = 1) {
    this.earV += 220 * k;
  }

  hop(k = 1) {
    this.bounceV = -230 * k;
    this.earV += 200 * k;
  }

  yawn(t: number, dur = 0.9) {
    this.woofUntil = t + dur;
  }

  dash(px: number) {
    this.offsetTarget = px;
  }

  petting(on: boolean) {
    this.petTarget = +!!on;
  }

  reset() {
    this.offsetTarget = 0;
    this.tiltTarget = 0;
    this.petTarget = 0;
  }

  tick(dt: number, t: number) {
    dt = Math.min(dt, 0.05);
    const m = this.m;
    m.time = t;
    this.pose = lerpPose(this.pose, this.target, ease(dt, 0.16));
    this.facing += (this.facingTarget - this.facing) * ease(dt, this.turn);
    m.stride += (this.strideTarget - m.stride) * ease(dt, 0.12);
    if (m.stride < 0.012 && this.strideTarget === 0) m.stride = 0;
    m.wag += (this.wagTarget - m.wag) * ease(dt, 0.4);
    m.gazeX += (this.gazeTarget.x - m.gazeX) * ease(dt, 0.07);
    m.gazeY += (this.gazeTarget.y - m.gazeY) * ease(dt, 0.07);
    this.tilt += (this.tiltTarget + 3 * m.gazeX - this.tilt) * ease(dt, 0.18);
    // Floppy ears: damped spring, clamped.
    this.earV += (-150 * m.ear - 10 * this.earV) * dt;
    m.ear = clamp(m.ear + this.earV * dt, -28, 28);
    // Body bounce spring (woof / hop).
    this.bounceV += (-260 * this.bounce - 16 * this.bounceV) * dt;
    this.bounce += this.bounceV * dt;

    const prevOffset = this.offset;
    this.offset += (this.offsetTarget - this.offset) * ease(dt, 0.2);
    if (Math.abs(this.offsetTarget - this.offset) < 0.05) this.offset = this.offsetTarget;
    const moved = Math.abs(this.offset - prevOffset);
    if (moved) this.advance(moved);
    const dashStride = dt > 0 ? Math.min(1, moved / dt / 180) : 0;

    this.pet += (this.petTarget - this.pet) * ease(dt, 0.15);
    if (t > this.nextBlink && this.pose.eyes > 0.6) {
      this.blinkAt = t;
      this.nextBlink = t + 2.2 + 3.8 * Math.random();
      if (Math.random() < 0.18) this.nextBlink = t + 0.32;
    }
    const b = (t - this.blinkAt) / 0.15;
    m.blink = b >= 0 && b <= 1 ? Math.sin(b * Math.PI) : 0;

    const live: Pose = {
      ...this.pose,
      headRot: this.pose.headRot + this.tilt,
      bodyRot: this.pose.bodyRot + this.lean,
      bodyY: this.pose.bodyY + this.bounce,
      headY: this.pose.headY + 1.15 * this.bounce,
      mouth: t < this.woofUntil ? 1 : this.pose.mouth,
      happy: Math.max(this.pose.happy, this.pet),
    };
    const f = frameFor(live, dashStride > m.stride ? { ...m, stride: dashStride } : m);
    // Never collapse to a zero-width scale while turning around.
    const sx = Math.abs(this.facing) < 0.02 ? 0.02 * Math.sign(this.facing || 1) : this.facing;
    const root = `translate(${this.offset.toFixed(1)} 0) translate(${VIEW_W / 2} 0) scale(${sx.toFixed(3)} 1) translate(${-VIEW_W / 2} 0)`;
    for (const [part, attr, key] of WRITES) {
      const el = this.els.get(part);
      if (!el) continue;
      const value = key === "root" ? root : String(f[key]);
      const id = `${part}:${attr}`;
      if (this.written.get(id) !== value) {
        el.setAttribute(attr, value);
        this.written.set(id, value);
      }
    }
  }
}
