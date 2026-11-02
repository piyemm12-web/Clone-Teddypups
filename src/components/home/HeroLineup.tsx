"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Media } from "@/components/ui/Media";
import { prefersReducedMotion } from "@/lib/media-query";
import type { Puppy } from "@/lib/types";

export type Friend = Pick<Puppy, "id" | "slug" | "displayName" | "breed" | "cover">;
type SeatState = "duck" | "pop" | undefined;

/** Seats along the quilt: [x %, width rem, how far the photo peeks, tilt deg]. */
const SEATS = [
  [9, 8.6, 0.62, -5],
  [22.5, 10.4, 0.8, 3],
  [35, 9.2, 0.7, -2],
  [65, 9.4, 0.74, 3],
  [77.5, 10.6, 0.82, -3],
  [91, 8.4, 0.6, 4],
] as const;
/** Pause (ms) between two swaps, cycled. */
const CADENCE = [1900, 2500, 1700, 2300, 2000, 2800, 1800];

const shuffle = <T,>(items: T[]) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const seatStyle = (i: number) => {
  const [x, w, peek, tilt] = SEATS[i];
  return { "--x": `${x}%`, "--w": `${w}rem`, "--peek": peek, "--tilt": `${tilt}deg`, "--i": i } as CSSProperties;
};

/**
 * Puppies peeking over the hero quilt. Every couple of seconds one ducks down
 * and a different puppy pops up in its place, showing its name tag.
 */
export function HeroLineup({ friends }: { friends: Friend[] }) {
  const n = Math.min(SEATS.length, friends.length);
  const [seats, setSeats] = useState(() => friends.slice(0, n).map((_, i) => i));
  const [seatState, setSeatState] = useState<Record<number, SeatState>>({});
  const [popped, setPopped] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  /** The next friend to come on stage, preloaded off-screen. */
  const [wings, setWings] = useState<number | null>(friends.length > n ? n : null);
  const listRef = useRef<HTMLUListElement>(null);
  const wingsRef = useRef<HTMLSpanElement>(null);
  const seatsRef = useRef(seats);

  useEffect(() => {
    seatsRef.current = seats;
  }, [seats]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !n || prefersReducedMotion()) return;
    const extras = friends.length > n;
    const scene = list.closest<HTMLElement>("[data-pup-scene]");
    let inView = true;
    let quietUntil = 0;
    let alive = true;
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.35 });
    io.observe(list);
    const hush = () => (quietUntil = performance.now() + 1200);
    addEventListener("scroll", hush, { passive: true });
    addEventListener("pointerdown", hush, { passive: true });
    list.addEventListener("pointerover", hush, { passive: true });

    const offStage = () => friends.map((_, i) => i).filter((i) => !seatsRef.current.includes(i));
    const rest = offStage();
    let queue = rest.includes(n) ? [n, ...shuffle(rest.filter((i) => i !== n))] : shuffle(rest);
    let bag: number[] = [];
    let lastSeat = -1;
    let beat = 0;
    let tries = 0;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    const step = (): void => {
      if (document.hidden || !inView || performance.now() < quietUntil || scene?.dataset.here === "false") {
        later(step, 900);
        return;
      }
      if (!extras) return swap();
      if (!queue.length) queue = shuffle(offStage());
      const img =
        wingsRef.current?.dataset.for === String(queue[0]) ? wingsRef.current.querySelector("img") : null;
      if (!img || !img.complete || !img.naturalWidth) {
        if (++tries < 15) later(step, 400);
        else {
          queue.push(queue.shift()!);
          setWings(queue[0] ?? null);
          tries = 0;
          later(step, 800);
        }
        return;
      }
      tries = 0;
      img.decode().then(swap, swap);
    };

    const swap = () => {
      if (!bag.length) {
        const visible = [...list.children].map((el, i) => (el.getClientRects().length ? i : -1)).filter((i) => i >= 0);
        bag = shuffle(visible).filter((s, i, all) => !(i === 0 && s === lastSeat && all.length > 1));
      }
      const seat = bag.shift();
      if (seat === undefined) {
        later(step, 2000);
        return;
      }
      lastSeat = seat;
      const incoming = extras ? queue.shift()! : seatsRef.current[seat];
      setSeatState((s) => ({ ...s, [seat]: "duck" }));
      later(() => {
        if (extras) {
          const outgoing = seatsRef.current[seat];
          setSeats((s) => s.map((f, i) => (i === seat ? incoming : f)));
          queue.push(outgoing);
          setWings(queue[0] ?? null);
        }
        setSeatState((s) => ({ ...s, [seat]: "pop" }));
        setPopped(seat);
        later(() => setPopped((p) => (p === seat ? null : p)), 1800);
        later(() => setSeatState((s) => ({ ...s, [seat]: undefined })), 700);
      }, 360);
      later(step, CADENCE[beat++ % CADENCE.length]);
    };

    if (extras) setWings(queue[0] ?? null);
    // Start once the entrance "peek" animation has finished.
    const intro = [...list.querySelectorAll(".tp-lineup__pup")]
      .flatMap((el) => el.getAnimations())
      .filter((a) => (a as CSSAnimation).animationName === "tp-peek");
    const begin = () => alive && later(step, 250);
    Promise.all(intro.map((a) => a.finished)).then(begin, begin);

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      timers = [];
      io.disconnect();
      removeEventListener("scroll", hush);
      removeEventListener("pointerdown", hush);
      list.removeEventListener("pointerover", hush);
    };
  }, [friends, n]);

  if (!n) return null;
  const unhover = (i: number) => () => setHovered((h) => (h === i ? null : h));

  return (
    <>
      <ul ref={listRef} className="tp-lineup" aria-label="Some of the puppies in our showroom">
        {seats.map((f, i) => {
          const pup = friends[f];
          return (
            <li key={i} className="tp-lineup__seat" style={seatStyle(i)}>
              <Link
                href={`/puppies/${pup.slug}`}
                className="tp-lineup__pup"
                data-pup-friend
                data-state={seatState[i]}
                aria-label={`Meet ${pup.displayName}, ${pup.breed}`}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={unhover(i)}
                onFocus={() => setHovered(i)}
                onBlur={unhover(i)}
              >
                <span className="tp-lineup__photo">
                  <Media key={pup.id} media={pup.cover} sizes="11rem" preload={i < 2} eager />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <ul aria-hidden="true" className="tp-lineup tp-lineup--tags">
        {seats.map((f, i) => (
          <li key={i} className="tp-lineup__seat" style={seatStyle(i)}>
            <span
              className="tp-lineup__ghost"
              data-state={seatState[i]}
              data-tag={popped === i || hovered === i ? "show" : undefined}
            >
              <span className="tp-lineup__name font-scrawl">{friends[f].displayName}</span>
            </span>
          </li>
        ))}
      </ul>
      {wings !== null && (
        <span ref={wingsRef} aria-hidden="true" className="tp-lineup__wings" data-for={wings}>
          <Media media={friends[wings].cover} sizes="11rem" alt="" eager />
        </span>
      )}
    </>
  );
}
