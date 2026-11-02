import type { ReactNode } from "react";

/** Stroke props shared by the hand-drawn line icons. */
const line = (w: number | string) =>
  ({
    fill: "none",
    stroke: "currentColor",
    strokeWidth: w,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }) as const;

const s48 = line(2.6);

/** 48×48 icons for the journey steps. */
export const STEP_ICONS = {
  find: (
    <>
      <circle cx="21" cy="21" r="12" {...s48} />
      <path d="m30 30 10 10" {...s48} />
      <path d="M21 27c-3-2-4.4-3.6-4.4-5.2a2.2 2.2 0 0 1 4.4-.4 2.2 2.2 0 0 1 4.4.4c0 1.6-1.4 3.2-4.4 5.2z" fill="currentColor" />
    </>
  ),
  choose: (
    <>
      <path
        d="M24 40C11 31 6 24.5 6 17.8 6 12.4 10.2 8 15.4 8c3.7 0 6.8 2.1 8.6 5.3C25.8 10.1 28.9 8 32.6 8 37.8 8 42 12.4 42 17.8 42 24.5 37 31 24 40z"
        {...s48}
      />
      <path d="m17 22 5 5 9-10" {...s48} />
    </>
  ),
  meet: (
    <>
      <path d="M14 18c-3-6-1-10 3-10s5 4 4 8M34 18c3-6 1-10-3-10s-5 4-4 8" {...s48} />
      <ellipse cx="24" cy="27" rx="13" ry="12" {...s48} />
      <circle cx="19.5" cy="25" r="1.6" fill="currentColor" />
      <circle cx="28.5" cy="25" r="1.6" fill="currentColor" />
      <path d="M22 31h4l-2 2z" {...line(1.6)} fill="currentColor" />
    </>
  ),
  home: (
    <>
      <path d="M5 30V18h22v12M27 22h8l6 6v2H27" {...s48} />
      <path d="M5 30h36" {...s48} />
      <circle cx="13" cy="33" r="3.4" {...s48} />
      <circle cx="34" cy="33" r="3.4" {...s48} />
      <path d="M16 26c-2.3-1.6-3.4-2.8-3.4-4a1.7 1.7 0 0 1 3.4-.4 1.7 1.7 0 0 1 3.4.4c0 1.2-1.1 2.4-3.4 4z" fill="currentColor" />
    </>
  ),
  reserve: (
    <>
      <rect x="7" y="10" width="34" height="30" rx="5" {...s48} />
      <path d="M7 19h34M16 6v8M32 6v8" {...s48} />
      <path d="m17 29 5 5 9-9" {...s48} />
    </>
  ),
  consult: (
    <>
      <path d="M6 12a5 5 0 0 1 5-5h16a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5h-9l-6 5v-5h-1a5 5 0 0 1-5-5z" {...s48} />
      <path d="M36 17h1a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5h-1v5l-6-5h-6a5 5 0 0 1-4-2" {...s48} />
    </>
  ),
  fly: (
    <path
      transform="matrix(-1 0 0 1 48 0)"
      d="M4 27l13-1.5 8-10h4l-4 9.5 9-.8 4-4.7h3l-2 6.6 2 6.6h-3l-4-4.7-9-.8 4 9.5h-4l-8-10L4 29z"
      {...s48}
    />
  ),
  welcome: (
    <>
      <path d="M6 23 24 8l18 15M11 19v21h26V19" {...s48} />
      <path d="M24 35c-4.6-3.2-6.8-5.7-6.8-8.2a3.4 3.4 0 0 1 6.8-.8 3.4 3.4 0 0 1 6.8.8c0 2.5-2.2 5-6.8 8.2z" fill="currentColor" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type StepIconName = keyof typeof STEP_ICONS;

const s64 = line(3);

/** 64×64 icons used by the promise stamps and the "why choose us" list. */
export const BADGE_ICONS = {
  health: (
    <>
      <path d="M32 54C16 43 8 34 8 24c0-7 5.4-12 12-12 5 0 9 3 12 7 3-4 7-7 12-7 6.6 0 12 5 12 12 0 10-8 19-24 30z" {...s64} />
      <path d="M22 30h7l3-7 4 13 3-6h7" {...s64} />
    </>
  ),
  plane: (
    <>
      <path d="M6 36l22-3 12-17h6l-6 17 12-1 6-7h3l-2 10 2 10h-3l-6-7-12-1 6 17h-6L28 37 6 36z" {...s64} />
      <path d="M8 50c10 4 20 4 30 0" {...s64} strokeDasharray="2 7" />
    </>
  ),
  chat: (
    <>
      <path d="M10 14h44v28H30l-12 10v-10h-8z" {...s64} />
      <path d="M22 28h0M32 28h0M42 28h0" {...line(5)} />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type BadgeIconName = keyof typeof BADGE_ICONS;

/** Downtown Dubai skyline doodle (viewBox 0 0 300 120). */
export function Skyline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 120" className={className} aria-hidden="true">
      <path
        d="M4 116h292M20 116V78h16v38M44 116V60h18v56M70 116V84h12v32M150 116V36l4-6v-14l3-4 3 4v14l4 6v80M118 116V70l12-8v54M174 116V64l14 8v44M200 116V82h18v34M226 116V56h14v60M248 116V88h22v28"
        {...line(2.6)}
      />
    </svg>
  );
}
