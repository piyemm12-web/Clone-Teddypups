import { POSES, type Pose } from "./geometry";
import type { PupDriver } from "./driver";

/** What a trick may do to the pup it is played on. */
export type TrickCtx = {
  d: PupDriver;
  /** Pose to return to when the trick is over. */
  rest: Pose;
  facing: number;
  say: (text: string, secs?: number) => void;
  hearts: () => void;
};

/** `[atSeconds, action(nowSeconds)]`, sorted by time. */
export type Timeline = [number, (t: number) => void][];

export type TrickName =
  | "woof"
  | "spin"
  | "beg"
  | "bow"
  | "hop"
  | "love"
  | "tilt"
  | "sneeze"
  | "zoomies"
  | "peekaboo"
  | "wake";

const flip = (dir: number) => (dir === 1 ? -1 : 1);

export const TRICKS: Record<TrickName, (ctx: TrickCtx, at: number) => Timeline> = {
  woof: ({ d, say }, s) => [
    [s, (t) => (d.woof(t), say("woof!"))],
    [s + 0.42, (t) => (d.woof(t), say("woof woof!"))],
  ],
  spin: ({ d, rest, facing, say }, s) => [
    [s, () => (d.setPose("stand"), d.hop(0.5))],
    [s + 0.14, () => d.face(flip(facing))],
    [s + 0.38, () => d.face(facing)],
    [s + 0.62, () => d.face(flip(facing))],
    [s + 0.86, () => (d.face(facing), say("wheee!"))],
    [s + 1.3, () => d.setPose(rest)],
  ],
  beg: ({ d, rest, say }, s) => [
    [s, () => (d.setPose("beg"), d.wag(1), say("treat, please?", 1.7))],
    [s + 1.9, () => (d.setPose(rest), d.wag(0.7))],
  ],
  bow: ({ d, rest, say }, s) => [
    [s, () => (d.setPose("bow"), d.wag(1), say("play with me!"))],
    [s + 0.55, () => d.hop(0.45)],
    [s + 1.7, () => (d.setPose(rest), d.wag(0.7))],
  ],
  hop: ({ d, rest, say }, s) => [
    [s, () => (d.setPose("hop"), d.hop(1.1), say("boing!"))],
    [s + 0.36, () => d.setPose(rest)],
    [s + 0.62, () => (d.setPose("hop"), d.hop(0.8))],
    [s + 0.98, () => d.setPose(rest)],
  ],
  love: ({ d, rest, say, hearts }, s) => [
    [s, () => (d.setPose({ ...rest, happy: 1, tongue: 1 }), d.wag(1), hearts(), say("I like you!", 1.5))],
    [s + 1.9, () => (d.setPose(rest), d.wag(0.7))],
  ],
  tilt: ({ d, say }, s) => [
    [s, () => (d.cock(-14), say("hm?"))],
    [s + 0.8, () => d.cock(12)],
    [s + 1.6, () => d.cock(0)],
  ],
  sneeze: ({ d, say }, s) => [
    [s, () => d.cock(-8)],
    [s + 0.32, (t) => (d.cock(10), d.jolt(1.4), d.hop(0.35), d.yawn(t, 0.22), say("achoo!"))],
    [s + 0.8, () => d.cock(0)],
  ],
  zoomies: ({ d, rest, facing, say }, s) => [
    [s, () => (d.setPose("walk"), d.wag(1), say("zoomies!", 2))],
    [s + 0.05, () => (d.face(1), d.dash(70))],
    [s + 0.5, () => (d.face(-1), d.dash(-70))],
    [s + 0.98, () => (d.face(1), d.dash(50))],
    [s + 1.4, () => (d.face(-1), d.dash(-30))],
    [s + 1.78, () => (d.face(1), d.dash(0))],
    [s + 2.25, () => (d.face(facing), d.setPose(rest), d.wag(0.7))],
  ],
  peekaboo: ({ d, say }, s) => [
    [s, () => d.setPose({ ...POSES.peek, headY: 120 })],
    [s + 0.55, () => (d.setPose("peek"), d.jolt(1.2), say("peekaboo!"))],
  ],
  wake: ({ d, rest, say }, s) => [
    [s, (t) => (d.setPose("settle"), d.yawn(t, 0.9), say("*yaaawn*"))],
    [s + 1.25, () => (d.setPose({ ...POSES.settle, happy: 1 }), d.wag(0.8), say("five more minutes…", 1.6))],
    [s + 3.1, () => (d.setPose(rest), d.wag(0), say("zzz", 2))],
  ],
};

/** Five little hearts float up from (x, y) inside `container`. */
export function spawnHearts(container: HTMLElement, x: number, y: number) {
  for (let i = 0; i < 5; i++) {
    const heart = document.createElement("span");
    heart.className = "pup-heart";
    heart.textContent = "♥";
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    container.append(heart);
    const dx = (Math.random() - 0.5) * 90;
    const dy = -70 - 60 * Math.random();
    heart
      .animate(
        [
          { transform: "translate(-50%, 0) scale(0.4)", opacity: 0 },
          { opacity: 1, offset: 0.2 },
          { transform: `translate(calc(-50% + ${dx.toFixed(0)}px), ${dy.toFixed(0)}px) scale(1.1)`, opacity: 0 },
        ],
        { duration: 1150 + 110 * i, delay: 80 * i, easing: "cubic-bezier(.2,.7,.3,1)", fill: "backwards" },
      )
      .finished.then(
        () => heart.remove(),
        () => heart.remove(),
      );
  }
}

const CLICK_TRICKS: TrickName[] = ["woof", "spin", "beg", "bow", "hop", "love", "tilt", "sneeze"];
let bag: TrickName[] = [];

/** Next click trick: zoomies after a rapid burst of clicks, otherwise a shuffled bag. */
export function pickTrick(last: TrickName | null, clickCount: number): TrickName {
  if (clickCount >= 4) return "zoomies";
  if (!bag.length) bag = CLICK_TRICKS.filter((t) => t !== last).sort(() => Math.random() - 0.5);
  return bag.pop()!;
}

/** Uniform random pick from `list`, avoiding `last`. */
export function pickOther<T>(list: readonly T[], last: T | null): T {
  const pool = list.filter((x) => x !== last);
  return pool[Math.floor(Math.random() * pool.length)];
}
