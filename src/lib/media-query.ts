"use client";

import { useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCED).matches;
}

function subscribeTo(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

/** Reports `true` on the server and during hydration so motion only starts on the client. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribeTo(REDUCED), () => window.matchMedia(REDUCED).matches, () => true);
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(subscribeTo(query), () => window.matchMedia(query).matches, () => false);
}

export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
