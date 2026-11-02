"use client";

import { useEffect, useRef } from "react";
import { cancelFrame, frame } from "motion/react";
import { PAW_PATH } from "@/components/icons/Paw";
import { prefersReducedMotion } from "@/lib/media-query";
import { PupDriver, type ScreenPoint } from "./driver";
import { POSES, VIEW_W } from "./geometry";
import { FEET, barTop, measure, placeAt, snapScroll, type Layout, type Place, type Safe, type StopMeta } from "./journey";
import { PupSvg } from "./PupSvg";
import { TRICKS, pickOther, pickTrick, spawnHearts, type Timeline, type TrickCtx, type TrickName } from "./tricks";

export type PupCue = { look?: Element; secs?: number; say?: string };

/** Ask the journey pup (if it is sitting in the scene of `look`) to look at something and/or say something. */
export function cuePup(detail: PupCue) {
  dispatchEvent(new CustomEvent<PupCue>("pup:cue", { detail }));
}

type TravelTrick = "jump" | "woof" | "love" | "sneeze";
const TRAVEL_TRICKS: TravelTrick[] = ["jump", "woof", "love", "sneeze"];
const PRINTS = 24;

const now = () => performance.now() / 1000;
const setData = (el: HTMLElement, key: string, value: string) => {
  if (el.dataset[key] !== value) el.dataset[key] = value;
};

/** Only one journey may drive the page at a time. */
let activeTeardown: (() => void) | null = null;

/**
 * Homepage mascot: a single Teddy in a fixed layer that walks, hops and sits
 * between every `[data-pup-stop]` as the page scrolls, leaving paw prints.
 */
export function PupJourney() {
  const layerRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const bubbleAtRef = useRef<HTMLSpanElement>(null);
  const printsRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeTeardown?.();
    let remeasureTimer: ReturnType<typeof setTimeout> | undefined;
    const layer = layerRef.current!;
    const actor = actorRef.current!;
    const body = bodyRef.current!;
    const bubble = bubbleRef.current!;
    const bubbleAt = bubbleAtRef.current!;
    const prints = [...printsRef.current!.children] as SVGSVGElement[];
    const probe = probeRef.current!;
    const svg = body.querySelector("svg")!;
    const html = document.documentElement;
    const header = document.getElementById("site-header");

    let layout: Layout | null = null;
    let d: PupDriver | null = null;
    let active = false;
    let printIndex = 0;
    let bubbleUntil = 0;
    const say = (text: string, t: number, secs = 1.4) => {
      bubble.textContent = text;
      bubble.dataset.show = "true";
      bubbleUntil = t + secs;
    };

    let mouse: (ScreenPoint & { t: number }) | null = null;
    let lookTarget: { el: Element; until: number } | null = null;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") mouse = { x: e.clientX, y: e.clientY, t: now() };
    };
    const onCue = (e: Event) => {
      const cue = (e as CustomEvent<PupCue>).detail;
      const scene = atStop >= 0 ? layout?.meta[atStop]?.scene : null;
      if (!scene || (cue.look && !scene.contains(cue.look))) return;
      const t = now();
      if (cue.look) lookTarget = { el: cue.look, until: t + (cue.secs ?? 1.6) };
      if (cue.say) say(cue.say, t);
    };
    const onFocus = (e: FocusEvent) => {
      const el = e.target;
      if (el instanceof HTMLElement && el.matches("a, button, input, textarea, select, summary")) {
        lookTarget = { el, until: now() + 1.4 };
      }
    };

    let lastT = now();
    let lastScroll = scrollY;
    let lastPos: ScreenPoint | null = null;
    let lastPlace: Place | null = null;
    /** Offset that eases away after a re-measure / snap so Teddy never teleports. */
    const drift = { x: 0, y: 0, s: 0 };
    let stillFor = 0;
    let atStop = -1;
    let arrivedAt = 0;
    let idleSince = 0;
    let timeline: Timeline = [];
    let lastLook = 0;
    let lookIndex = -1;
    let treadmillLeft: number | null = null;
    let treadmillStill = 0;
    let printLeg = -1;
    let printStep = 0;
    let nextFidget = 0;
    let scrolledAt = now();
    let scrollDir = 1;
    let snapping = false;
    let laneFollow: ScreenPoint | null = null;
    let lastBarTop = 0;
    let laneWalked = 0;
    let layerTop = 0;

    const safeArea = (l: Layout): Safe => {
      const width = html.clientWidth;
      const top = (header?.offsetHeight ?? 76) + 10;
      if (l.lane) return { left: 10, top, right: width - 10, bottom: barTop() + 40 };
      const bar = document.querySelector("[data-whatsapp-bar]");
      const barY = bar?.getClientRects().length ? bar.getBoundingClientRect().top : innerHeight;
      return { left: 10, top, right: width - 10, bottom: Math.min(innerHeight, barY) - 10 };
    };

    const place = (l: Layout, scroll: number) => {
      if (l.lane) {
        const bottom = barTop();
        for (const stop of l.stops) if (stop.track.kind === "screen") stop.track.top = bottom - 159 * stop.s;
      }
      return placeAt(l.stops, l.holds, scroll, safeArea(l), l.blend);
    };

    const ctxFor = (m: StopMeta): TrickCtx => ({
      d: d!,
      rest: POSES[m.pose],
      facing: m.facing,
      say: (text, secs) => say(text, now(), secs),
      hearts: () => {
        if (!lastPlace) return;
        spawnHearts(
          layer,
          lastPlace.x - FEET.x * lastPlace.s + (d!.facingDir > 0 ? 212 : VIEW_W - 212) * lastPlace.s,
          lastPlace.y - (FEET.y - 40) * lastPlace.s - layerTop,
        );
      },
    });

    const loop = () => {
      if (!layout || !d) return;
      const l = layout;
      const pup = d;
      const t = now();
      const dt = Math.min(0.05, t - lastT);
      lastT = t;
      const scroll = scrollY;
      const scrolled = scroll - lastScroll;
      lastScroll = scroll;
      if (Math.abs(scrolled) > 0.5) {
        scrolledAt = t;
        scrollDir = scrolled > 0 ? 1 : -1;
      }
      while (timeline.length && timeline[0][0] <= t) timeline.shift()![1](t);

      const effScroll = t - scrolledAt > 0.25 ? snapScroll(l.stops, l.holds, scroll) : scroll;
      const p = place(l, effScroll);
      // Mobile: between two screen-edge peeks the pup is anchored to the bottom of the screen.
      const onScreen =
        l.lane &&
        (() => {
          const from = l.stops[p.k];
          const to = p.t > 0 ? l.stops[p.k + 1] : from;
          return from.track.kind === "screen" && to?.track.kind === "screen";
        })();

      const decay = Math.exp(-dt / 0.28);
      drift.x *= decay;
      drift.y *= decay;
      drift.s *= decay;
      if (Math.abs(drift.x) < 0.05 && Math.abs(drift.y) < 0.05) drift.x = drift.y = 0;
      const snapped = effScroll !== scroll;
      if (snapped !== snapping && lastPos && !onScreen) {
        drift.x = lastPos.x - p.x;
        drift.y = lastPos.y - p.y;
      }
      snapping = snapped;

      const s = p.s + drift.s;
      let x = p.x + drift.x;
      let y = p.y + drift.y;
      const bottom = l.lane ? barTop() : 0;
      let settled = true;
      if (onScreen) {
        laneFollow ??= lastPos ? { x: lastPos.x, y: lastPos.y - lastBarTop } : { x, y: y - bottom };
        const k = 1 - Math.exp(-dt / 0.14);
        laneFollow.x += (x - laneFollow.x) * k;
        laneFollow.y += (y - bottom - laneFollow.y) * k;
        settled = Math.hypot(x - laneFollow.x, y - bottom - laneFollow.y) < 1.5;
        x = laneFollow.x;
        y = bottom + laneFollow.y;
      } else if (laneFollow) {
        drift.x = (lastPos?.x ?? x) - p.x;
        drift.y = (lastPos?.y ?? y) - p.y;
        x = p.x + drift.x;
        y = p.y + drift.y;
        laneFollow = null;
      }
      lastBarTop = bottom;
      lastPlace = { ...p, x, y, s };
      setData(layer, "anchor", onScreen ? "bottom" : "top");
      layerTop = onScreen ? layer.getBoundingClientRect().top : 0;

      const holding = p.t === 0 && settled;
      const k = p.k;
      if (holding) {
        if (atStop !== k) {
          // Arrived at a stop.
          const m = l.meta[k];
          timeline = [];
          lookTarget = null;
          atStop = k;
          arrivedAt = t;
          idleSince = t;
          treadmillLeft = null;
          pup.reset();
          pup.setPose(m.pose);
          pup.face(m.facing, 0.14);
          pup.stride(0);
          pup.wag(m.act === "basket" ? 0.3 : 0.7);
          pup.jolt(0.4);
          nextFidget = t + 2.4;
        }
        const m = l.meta[k];
        if (m.track && !timeline.length) {
          // Treadmill: walk in place against the moving track.
          const left = m.track.getBoundingClientRect().left;
          const moved = treadmillLeft === null ? 0 : left - treadmillLeft;
          treadmillLeft = left;
          pup.walkedTo(-left / s);
          if (Math.abs(moved) > 0.15) {
            treadmillStill = 0;
            pup.setPose("walk");
            pup.stride(1);
            pup.face(moved < 0 ? 1 : -1, 0.16);
          } else if ((treadmillStill += dt) > 0.25) {
            pup.setPose("stand");
            pup.stride(0);
          }
        }
        if (m.act === "tilt" && !timeline.length && t - arrivedAt > 1.2) {
          const w = Math.sin(0.9 * t);
          pup.cock(w > 0.35 ? 13 : w < -0.35 ? -10 : 0);
        }
        if (m.act === "basket" && !timeline.length && t > nextFidget) {
          nextFidget = t + 4.5 + 3 * Math.random();
          if (Math.random() < 0.7) pup.jolt(0.55);
          else pup.yawn(t, 0.7);
        }
        const busyLooking = (lookTarget && lookTarget.until > t) || (mouse && t - mouse.t < 2.5);
        if (m.looks.length && !busyLooking && t - arrivedAt > 0.8 && t - lastLook > 1.7) {
          lastLook = t;
          lookIndex = (lookIndex + 1) % (m.looks.length + 1);
          if (lookIndex < m.looks.length) lookTarget = { el: m.looks[lookIndex], until: t + 1.4 };
        }
        if (Math.abs(scrolled) > 0.5) idleSince = t;
        if (!timeline.length && !m.track && m.act !== "basket" && t - idleSince > 9) {
          idleSince = t;
          timeline =
            Math.random() < 0.55
              ? TRICKS.tilt(ctxFor(m), t)
              : [
                  [t, () => pup.wag(1)],
                  [t + 2.4, () => pup.wag(0.7)],
                ];
        }
      } else {
        if (atStop !== -1) {
          atStop = -1;
          timeline = [];
          pup.reset();
        }
        const step = lastPos ? Math.hypot(x - lastPos.x, y - lastPos.y) : 0;
        stillFor = step > 0.25 ? 0 : stillFor + dt;
        let airborne = p.airborne;
        if (l.lane && p.t > 0) {
          const from = l.stops[k];
          const to = l.stops[k + 1];
          if (from.sink && p.t < 0.22) airborne = scrollDir > 0;
          else if (to?.sink && p.t > 0.78) airborne = scrollDir < 0;
        }
        if (airborne) {
          pup.setPose("hop");
          pup.stride(0);
        } else if (stillFor > 0.3) {
          pup.setPose("stand");
          pup.stride(0);
          if (stillFor > 2.6 && stillFor - dt <= 2.6) say("coming?", t);
        } else {
          pup.setPose("walk");
          pup.stride(1);
        }
        pup.walkedTo((onScreen ? (laneWalked += step) : p.walked) / Math.max(0.05, s));
        if (lastPos) {
          const dx = x - lastPos.x;
          if (Math.abs(dx) > 0.6 && Math.abs(dx) > 0.35 * Math.abs(y - lastPos.y)) pup.face(dx > 0 ? 1 : -1, 0.16);
        }
        if (!l.lane) {
          // Paw prints, alternating feet, every 34px (scaled) of path.
          const n = Math.floor(p.walked / (34 * s));
          if (printLeg === k && n !== printStep && !p.airborne && lastPos) {
            const near = n & 1;
            const footX = near ? 186 : 110;
            const left = x - FEET.x * s;
            const top = y - FEET.y * s;
            const px = left + (pup.facingDir > 0 ? footX : VIEW_W - footX) * s;
            const py = top + 226 * s + scroll - l.mainTop + (near ? -4 : 4) * s;
            const angle = Math.atan2(y - lastPos.y + scrolled, x - lastPos.x) + Math.PI / 2;
            const size = 14 * Math.max(0.75, 1.5 * s);
            const print = prints[printIndex++ % prints.length];
            print.style.transform = `translate(${(px - size / 2).toFixed(1)}px, ${(py - size / 2).toFixed(1)}px) rotate(${angle.toFixed(3)}rad)`;
            print.style.width = print.style.height = `${size.toFixed(1)}px`;
            print.animate(
              [{ opacity: 0 }, { opacity: 0.45, offset: 0.08 }, { opacity: 0.45, offset: 0.5 }, { opacity: 0 }],
              { duration: 2600, easing: "ease-out" },
            );
          }
          printLeg = k;
          printStep = n;
        }
      }

      lastPos = { x, y };
      l.meta.forEach((m, i) => {
        if (!m.scene) return;
        setData(m.scene, "here", String(holding && i === k));
        setData(m.scene, "visited", String(i <= k || (i === k + 1 && p.t > 0.92)));
      });
      if (lookTarget && lookTarget.until > t) {
        const r = lookTarget.el.getBoundingClientRect();
        pup.lookAt({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      } else pup.lookAt(mouse && t - mouse.t < 2.5 ? mouse : null);

      actor.style.transform = `translate3d(${(x - FEET.x * s).toFixed(2)}px, ${(y - FEET.y * s - layerTop).toFixed(2)}px, 0)`;
      body.style.transform = `scale(${s.toFixed(4)})`;
      setData(layer, "front", String(p.front));
      setData(actor, "holding", String(holding));
      if (bubble.dataset.show === "true") {
        if (t > bubbleUntil) bubble.dataset.show = "false";
        const bx = (pup.facingDir > 0 ? 214 : VIEW_W - 214) * s;
        bubbleAt.style.transform = `translate(${bx.toFixed(1)}px, ${(30 * s).toFixed(1)}px)`;
      }
      pup.tick(dt, t);
    };

    let clicks = 0;
    let lastClick = 0;
    let lastTrick: TrickName | TravelTrick | null = null;
    const onClick = () => {
      if (!d || !layout) return;
      const pup = d;
      const t = now();
      clicks = t - lastClick < 0.7 ? clicks + 1 : 1;
      lastClick = t;
      idleSince = t;
      if (atStop < 0) {
        // Tricks on the move.
        const ctx = ctxFor(layout.meta[Math.max(0, lastPlace?.k ?? 0)]);
        const trick = pickOther(TRAVEL_TRICKS, lastTrick as TravelTrick | null);
        lastTrick = trick;
        timeline =
          trick === "jump"
            ? [
                [t, () => (pup.hop(1.35), ctx.say(pickOther(["wheee!", "boing!", "yip!"], null)))],
                [t + 0.5, () => pup.hop(0.7)],
              ]
            : trick === "woof"
              ? [
                  [t, (now) => (pup.woof(now), ctx.say("woof!"))],
                  [t + 0.4, (now) => pup.woof(now)],
                ]
              : trick === "love"
                ? [[t, () => (pup.wag(1), pup.hop(0.5), ctx.hearts(), ctx.say("I like you!"))]]
                : [[t, (now) => (pup.jolt(1.4), pup.hop(0.4), pup.yawn(now, 0.22), ctx.say("achoo!"))]];
        return;
      }
      const m = layout.meta[atStop];
      const last = lastTrick as TrickName | null;
      let trick: TrickName;
      if (m.track) trick = pickOther<TrickName>(["woof", "hop", "love"], last);
      else if (m.act === "basket") trick = pickOther<TrickName>(["tilt", "love", "sneeze", "woof"], last);
      else if (m.pose === "peek") trick = pickOther<TrickName>(["peekaboo", "woof", "tilt", "sneeze"], last);
      else {
        trick = pickTrick(last, clicks);
        if (trick === "zoomies") trick = "spin";
      }
      // Don't restart a running peekaboo (e.g. the intro).
      if (trick === "peekaboo" && timeline.length) return;
      lastTrick = trick;
      pup.reset();
      timeline = TRICKS[trick](ctxFor(m), t);
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && d && atStop >= 0) {
        d.petting(true);
        d.wag(1);
      }
    };
    const onLeave = () => {
      if (!d) return;
      d.petting(false);
      if (atStop >= 0) d.wag(layout?.meta[atStop]?.act === "basket" ? 0.3 : 0.7);
    };

    const start = () => {
      if (active || prefersReducedMotion()) return;
      const l = measure(probe);
      if (l.stops.length < 2) return;
      layout = l;
      active = true;
      html.dataset.pup = l.lane ? "lane" : "live";
      layer.hidden = false;
      const first = l.meta[0];
      const pup = (d = new PupDriver(svg, first.pose, first.facing));
      lastScroll = scrollY;
      lastPos = null;
      scrolledAt = lastT = now();
      snapping = false;
      laneFollow = null;
      const t0 = lastT;
      const p = place(l, scrollY);
      if (p.k === 0 && p.t === 0 && first.act === "peekaboo") {
        // Intro: duck down, pop up, then look at the friends in the scene.
        atStop = 0;
        arrivedAt = t0;
        const hidden = { ...POSES.peek, headY: 120 };
        const friends = first.scene?.querySelectorAll("[data-pup-friend]") ?? [];
        const firstFriend = friends[0];
        const lastFriend = friends[friends.length - 1];
        timeline = [
          [t0 + 0.1, () => pup.setPose(hidden)],
          [t0 + 0.7, (t) => (pup.setPose("peek"), pup.jolt(1.2), say("peekaboo!", t, 1.6))],
          [t0 + 1.5, (t) => firstFriend && (lookTarget = { el: firstFriend, until: t + 0.8 })],
          [t0 + 2.3, (t) => lastFriend && (lookTarget = { el: lastFriend, until: t + 0.8 })],
          [t0 + 3.1, () => ((lookTarget = null), pup.wag(1))],
        ];
      } else atStop = -1;
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("pup:cue", onCue);
      addEventListener("focusin", onFocus);
      actor.addEventListener("click", onClick);
      actor.addEventListener("pointerenter", onEnter);
      actor.addEventListener("pointerleave", onLeave);
      frame.update(loop, true);
    };

    const stop = () => {
      if (!active) return;
      active = false;
      cancelFrame(loop);
      delete html.dataset.pup;
      layer.hidden = true;
      delete layer.dataset.anchor;
      layerTop = 0;
      layout?.meta.forEach((m) => {
        if (!m.scene) return;
        delete m.scene.dataset.here;
        delete m.scene.dataset.visited;
      });
      layout = null;
      d = null;
      atStop = -1;
      removeEventListener("pointermove", onMove);
      removeEventListener("pup:cue", onCue);
      removeEventListener("focusin", onFocus);
      actor.removeEventListener("click", onClick);
      actor.removeEventListener("pointerenter", onEnter);
      actor.removeEventListener("pointerleave", onLeave);
    };

    const remeasure = () => {
      clearTimeout(remeasureTimer);
      remeasureTimer = setTimeout(() => {
        if (!active || !layout) return;
        const next = measure(probe);
        if (next.stops.length < 2) return stop();
        const was = lastPlace;
        const laneChanged = next.lane !== layout.lane;
        layout = next;
        html.dataset.pup = next.lane ? "lane" : "live";
        if (laneChanged) atStop = -1;
        if (was) {
          // Keep Teddy where he is and ease to the new spot.
          const p = place(next, scrollY);
          drift.x = was.x - p.x;
          drift.y = was.y - p.y;
          drift.s = was.s - p.s;
        }
      }, 120);
    };

    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
    addEventListener("resize", remeasure);
    addEventListener("load", remeasure);
    const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const onReducedChange = () => (prefersReducedMotion() ? stop() : start());
    reducedQuery.addEventListener("change", onReducedChange);
    start();
    document.fonts?.ready.then(remeasure);

    const teardown = () => {
      stop();
      clearTimeout(remeasureTimer);
      ro.disconnect();
      removeEventListener("resize", remeasure);
      removeEventListener("load", remeasure);
      reducedQuery.removeEventListener("change", onReducedChange);
      if (activeTeardown === teardown) activeTeardown = null;
    };
    activeTeardown = teardown;
    return teardown;
  }, []);

  return (
    <>
      <div ref={probeRef} aria-hidden="true" className="pup-probe" />
      <div ref={printsRef} aria-hidden="true" className="pup-prints">
        {Array.from({ length: PRINTS }, (_, i) => (
          <svg key={i} viewBox="0 0 64 64">
            <path d={PAW_PATH} />
          </svg>
        ))}
      </div>
      <div ref={layerRef} aria-hidden="true" className="pup-layer" hidden data-front="true">
        <div ref={actorRef} className="pup-actor">
          <div ref={bodyRef} className="pup-actor__body">
            <PupSvg pose="peek" />
          </div>
          <span ref={bubbleAtRef} className="pup-bubble-at">
            <span ref={bubbleRef} className="pup-bubble" data-show="false" />
          </span>
        </div>
      </div>
    </>
  );
}
