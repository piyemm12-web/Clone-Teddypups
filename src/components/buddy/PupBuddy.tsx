"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { cancelFrame, frame } from "motion/react";
import { useReducedMotion } from "@/lib/media-query";
import { PupDriver } from "./driver";
import { POSES, type PoseName } from "./geometry";
import { PupSvg, type Facing } from "./PupSvg";
import { TRICKS, pickOther, pickTrick, spawnHearts, type Timeline, type TrickCtx, type TrickName } from "./tricks";

/** Special behaviour at a stop. */
export type PupAct = "peekaboo" | "basket" | "tilt" | "treadmill";

const PEEK_TRICKS: TrickName[] = ["peekaboo", "woof", "tilt", "sneeze"];
const SNUG_TRICKS: TrickName[] = ["tilt", "love", "sneeze", "woof"];

type Props = {
  pose?: PoseName;
  facing?: Facing;
  act?: PupAct;
  label?: string;
  className?: string;
  style?: CSSProperties;
  /** Part of the homepage journey: pause while the travelling actor is out. */
  asStop?: boolean;
};

const now = () => performance.now() / 1000;

/** Interactive Teddy: idles (breathes, blinks, wags), follows the mouse, does tricks on click, loves pets. */
export function PupBuddy({ pose = "sit", facing = "right", act, label, className = "", style, asStop = false }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current!;
    const bubble = bubbleRef.current!;
    const dir = facing === "left" ? -1 : 1;
    const d = new PupDriver(root.querySelector("svg")!, pose, dir);
    d.wag(0.6);

    let timeline: Timeline = [];
    let last = now();
    let idleSince = last;
    let bubbleUntil = 0;
    let mouse: { x: number; y: number; t: number } | null = null;
    let lastTrick: TrickName | null = null;
    let clicks = 0;
    let lastClick = 0;
    const ctx: TrickCtx = {
      d,
      rest: POSES[pose],
      facing: dir,
      say: (text, secs = 1.4) => {
        bubble.textContent = text;
        bubble.dataset.show = "true";
        bubbleUntil = now() + secs;
      },
      hearts: () => spawnHearts(root, root.clientWidth * (dir > 0 ? 0.7 : 0.3), 0.25 * root.clientHeight),
    };

    let playing = false;
    let playingUntil = 0;
    const tick = () => {
      const t = now();
      const dt = Math.min(0.05, t - last);
      last = t;
      while (timeline.length && timeline[0][0] <= t) timeline.shift()![1](t);
      if (playing !== t < playingUntil) {
        playing = !playing;
        root.toggleAttribute("data-playing", playing);
      }
      d.lookAt(mouse && t - mouse.t < 3 ? mouse : null);
      if (act === "tilt" && !timeline.length) {
        const s = Math.sin(0.9 * t);
        d.cock(s > 0.35 ? 13 : s < -0.35 ? -10 : 0);
      }
      if (!timeline.length && t - idleSince > 9) {
        idleSince = t;
        timeline =
          Math.random() < 0.5
            ? TRICKS.tilt(ctx, t)
            : [
                [t, () => d.wag(1)],
                [t + 2.2, () => d.wag(0.6)],
              ];
      }
      if (bubble.dataset.show === "true" && t > bubbleUntil) bubble.dataset.show = "false";
      d.tick(dt, t);
    };

    let running = false;
    const run = (on: boolean) => {
      // The travelling homepage actor stands in for stop pups while it is active.
      if (asStop && document.documentElement.dataset.pup) on = false;
      if (on === running) return;
      running = on;
      if (on) {
        last = now();
        frame.update(tick, true);
      } else cancelFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => run(entry.isIntersecting));
    io.observe(root);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") mouse = { x: e.clientX, y: e.clientY, t: now() };
    };
    const onClick = () => {
      const t = now();
      clicks = t - lastClick < 0.7 ? clicks + 1 : 1;
      lastClick = t;
      const set = pose === "peek" ? PEEK_TRICKS : pose === "snug" ? SNUG_TRICKS : null;
      const trick = set ? pickOther(set, lastTrick) : pickTrick(lastTrick, clicks);
      lastTrick = trick;
      d.reset();
      timeline = TRICKS[trick](ctx, t);
      playingUntil = timeline[timeline.length - 1][0] + 0.4;
      idleSince = t;
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        d.petting(true);
        d.wag(1);
      }
    };
    const onLeave = () => {
      d.petting(false);
      d.wag(0.6);
    };

    addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("click", onClick);
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      run(false);
      root.removeAttribute("data-playing");
      io.disconnect();
      removeEventListener("pointermove", onMove);
      root.removeEventListener("click", onClick);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, pose, facing, act, asStop]);

  return (
    <div
      ref={rootRef}
      className={`pup-buddy ${className}`}
      style={style}
      data-live={reduced ? undefined : ""}
      data-facing={facing}
    >
      <PupSvg key={String(reduced)} pose={pose} facing={facing} label={label} />
      <span ref={bubbleRef} aria-hidden="true" className="pup-bubble" data-show="false" />
    </div>
  );
}
