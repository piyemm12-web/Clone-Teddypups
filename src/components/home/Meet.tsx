"use client";

import Link from "next/link";
import { m, useScroll, useSpring, useTransform } from "motion/react";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { cuePup } from "@/components/buddy/PupJourney";
import { PupStop } from "@/components/buddy/PupStop";
import { Scene, type SceneTone } from "@/components/buddy/Scene";
import { Paw } from "@/components/icons/Paw";
import { Media } from "@/components/ui/Media";
import { useReducedMotion } from "@/lib/media-query";
import { STATUS_LABEL } from "@/lib/puppies";
import type { Puppy } from "@/lib/types";

const DOOR_COLOURS = ["#a24a1a", "#5a3a28", "#d4893f", "#b8644a", "#7a4a2e"];
const DOOR_SIZES = "(min-width: 1024px) 15rem, 44vw";

type Props = {
  heading: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  puppies: Puppy[];
  tone: SceneTone;
};

/**
 * "Meet the pups": a row of front doors, one per puppy. On desktop the
 * section pins while you scroll and the row slides past Teddy, who walks
 * on the spot; each door swings open as it reaches him.
 */
export function Meet({ heading, body, ctaLabel, ctaHref = "/puppies", puppies, tone }: Props) {
  const rangeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const hallRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [travel, setTravel] = useState(0);
  const [pinned, setPinned] = useState(false);

  // Size the doors to fit the pinned stage, and measure how far the row travels.
  useLayoutEffect(() => {
    const measure = () => {
      const desktop = matchMedia("(min-width: 1024px)").matches;
      setPinned(desktop && !reduced);
      const track = trackRef.current;
      const hall = hallRef.current;
      if (hall && track && desktop && !reduced) {
        const stage = hall.parentElement!;
        const head = stage.querySelector<HTMLElement>(".tp-meet__head");
        const plate = Math.max(
          64,
          ...[...track.querySelectorAll<HTMLElement>(".tp-door__plate")].map((el) => el.offsetHeight),
        );
        const floor = hall.querySelector<HTMLElement>(".tp-meet__floor")?.offsetHeight ?? 0;
        const room = stage.clientHeight - (head ? head.offsetTop + head.offsetHeight : 0) - floor - plate - 40;
        const width = Math.max(128, Math.min(256, 0.15 * innerWidth, room / 1.3));
        hall.style.setProperty("--door-w", `${width.toFixed(0)}px`);
      } else hall?.style.removeProperty("--door-w");
      setTravel(track ? Math.max(0, track.scrollWidth - innerWidth) : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    if (hallRef.current?.parentElement) ro.observe(hallRef.current.parentElement);
    addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      removeEventListener("resize", measure);
    };
  }, [reduced]);

  const { scrollYProgress } = useScroll({ target: rangeRef, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 170, damping: 32, mass: 0.35 });
  const x = useTransform(smooth, [0, 1], [0, -travel]);

  // Open each door once it slides past ~a third of the screen; parallax the floor.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!pinned || !track) return;
    const update = (xv: number, cue: boolean) => {
      hallRef.current?.style.setProperty("--floor-x", `${xv.toFixed(1)}px`);
      const threshold = 0.36 * innerWidth;
      for (const li of track.children as HTMLCollectionOf<HTMLElement>) {
        const open = li.offsetLeft + xv < threshold;
        if ((li.dataset.open === "true") !== open) {
          li.dataset.open = String(open);
          if (open && cue) cuePup({ look: li, secs: 0.9 });
        }
      }
    };
    update(x.get(), false);
    return x.on("change", (v) => update(v, true));
  }, [pinned, x]);

  if (!puppies.length) return null;

  return (
    <Scene tone={tone} aria-labelledby="meet-title" className="tp-meet" data-pinned={pinned || undefined}>
      <div
        ref={rangeRef}
        data-pin-range
        style={
          {
            height: pinned ? `calc(100vh + ${Math.round(0.8 * travel)}px)` : undefined,
            "--pinned": pinned ? 1 : 0,
          } as CSSProperties
        }
      >
        <div className="tp-meet__stage">
          <header className="tp-meet__head gutter">
            <div>
              <h2 id="meet-title" className="font-plush text-huge">
                {heading}
              </h2>
              {body && <p className="text-lede mt-3 max-w-[44ch] text-[var(--ink-soft)]">{body}</p>}
            </div>
            {ctaLabel && (
              <Link href={ctaHref} className="btn btn-primary shrink-0">
                {ctaLabel}
              </Link>
            )}
          </header>
          <div ref={hallRef} className="tp-meet__hall">
            <m.ol
              ref={trackRef}
              style={pinned ? { x } : undefined}
              className="tp-meet__track"
              data-treadmill
              aria-label="Puppies looking for a family"
            >
              {puppies.map((pup, i) => (
                <li key={pup.id} className="tp-door" data-open={pinned ? "false" : "true"}>
                  <Door pup={pup} index={i} />
                </li>
              ))}
              <li className="tp-door tp-door--all" data-open="true">
                <Link href={ctaHref} className="tp-door__link">
                  <span className="tp-door__frame tp-door__frame--all">
                    <span className="font-plush tp-door__all">Meet them all</span>
                  </span>
                </Link>
              </li>
            </m.ol>
            <div aria-hidden="true" className="tp-meet__floor" />
            <PupStop
              pose={pinned ? "walk" : "sit"}
              act={pinned ? "treadmill" : undefined}
              className="tp-meet__teddy"
            />
          </div>
        </div>
      </div>
    </Scene>
  );
}

function Door({ pup, index }: { pup: Puppy; index: number }) {
  const hasVideo = pup.media.some((item) => item.kind === "video");
  return (
    <Link
      href={`/puppies/${pup.slug}`}
      className="tp-door__link"
      style={{ "--door": DOOR_COLOURS[index % DOOR_COLOURS.length] } as CSSProperties}
    >
      <span className="tp-door__plate">
        <span className="font-plush tp-door__name">{pup.displayName}</span>
        <span className="tp-door__meta">
          {pup.name ? `${pup.breed}, ` : ""}
          {pup.genderLabel.toLowerCase()}
          {pup.age ? `, ${pup.age}` : ""}
          {hasVideo ? ", with video" : ""}
        </span>
      </span>
      <span className="tp-door__frame">
        <span className="tp-door__room">{pup.cover && <Media media={pup.cover} sizes={DOOR_SIZES} />}</span>
        <span aria-hidden="true" className="tp-door__way">
          <span className="tp-door__leaf">
            <Paw className="tp-door__peephole" />
            <span className="tp-door__knob" />
          </span>
        </span>
        <span className="tp-door__tag font-scrawl">{STATUS_LABEL[pup.status]}</span>
      </span>
    </Link>
  );
}
