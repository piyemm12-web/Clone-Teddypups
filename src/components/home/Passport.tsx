import type { CSSProperties, ReactNode } from "react";
import { PupStop } from "@/components/buddy/PupStop";
import { Scene } from "@/components/buddy/Scene";
import { TONES, trust, type Stamp } from "./data";

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const ICONS: Record<Stamp["icon"], ReactNode> = {
  health: (
    <>
      <path
        d="M32 54C16 43 8 34 8 24c0-7 5.4-12 12-12 5 0 9 3 12 7 3-4 7-7 12-7 6.6 0 12 5 12 12 0 10-8 19-24 30z"
        {...line}
      />
      <path d="M22 30h7l3-7 4 13 3-6h7" {...line} />
    </>
  ),
  plane: (
    <>
      <path d="M6 36l22-3 12-17h6l-6 17 12-1 6-7h3l-2 10 2 10h-3l-6-7-12-1 6 17h-6L28 37 6 36z" {...line} />
      <path d="M8 50c10 4 20 4 30 0" {...line} strokeDasharray="2 7" />
    </>
  ),
  chat: (
    <>
      <path d="M10 14h44v28H30l-12 10v-10h-8z" {...line} />
      <path d="M22 28h0M32 28h0M42 28h0" {...line} strokeWidth={5} />
    </>
  ),
  globe: (
    <>
      <circle cx="32" cy="32" r="22" {...line} />
      <path d="M10 32h44M32 10c-8 8-8 36 0 44M32 10c8 8 8 36 0 44" {...line} />
    </>
  ),
};

/** Sunset: a puppy passport, its right-hand page stamped with reasons to trust us. */
export function Passport() {
  return (
    <Scene tone={TONES.passport} className="tp-passport" aria-labelledby="trust-title">
      <div className="gutter mx-auto max-w-[96rem]">
        <div className="tp-book">
          <div className="tp-book__page tp-book__page--left">
            <p aria-hidden="true" className="tp-book__kicker font-scrawl">
              {trust.kicker}
            </p>
            <h2 id="trust-title" className="font-plush tp-book__title">
              {trust.heading}
            </h2>
            <PupStop pose="sit" className="tp-book__teddy" />
          </div>
          <ul className="tp-book__page tp-book__page--right">
            {trust.stamps.map((stamp, i) => (
              <li
                key={stamp.title}
                className="tp-entry"
                style={{ "--ink-stamp": stamp.ink, "--tilt": `${stamp.tilt}deg`, "--i": i } as CSSProperties}
              >
                <span className={`tp-stamp tp-stamp--${stamp.shape}`}>
                  <svg viewBox="0 0 64 64" className="tp-stamp__icon" aria-hidden="true">
                    {ICONS[stamp.icon]}
                  </svg>
                  <span className="tp-stamp__title font-plush">{stamp.title}</span>
                </span>
                <p className="tp-entry__text">{stamp.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Scene>
  );
}
