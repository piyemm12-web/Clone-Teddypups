"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { cancelFrame, frame } from "motion/react";
import { FINE_POINTER, prefersReducedMotion, useReducedMotion } from "@/lib/media-query";

let lenis: Lenis | null = null;

/** Lenis smooth scrolling on desktop, plus smooth in-page anchor jumps everywhere. */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.detail === 0 || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href*='#']");
      if (!a || (a.target && a.target !== "_self")) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname !== location.pathname || u.search !== location.search || u.hash.length < 2) return;
      const id = decodeURIComponent(u.hash.slice(1));
      const el = [...document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`)].find((n) => n.getClientRects().length);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el);
      else el.scrollIntoView({ behavior: prefersReducedMotion() ? "instant" : "smooth" });
      history.pushState(null, "", u.hash);
    };
    addEventListener("click", onClick);
    return () => removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (reduced || !matchMedia(FINE_POINTER).matches) return;
    const root = document.documentElement;
    const l = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      wheelMultiplier: 0.85,
      prevent: (node) => !!node.closest?.("dialog, [data-lenis-prevent]"),
      virtualScroll: () => getComputedStyle(root).overflowY !== "hidden",
    });
    lenis = l;
    const resync = () => l.scrollTo(l.actualScroll, { immediate: true });
    addEventListener("tp:navigate", resync);
    addEventListener("popstate", resync);
    const tick = (data: { timestamp: number }) => l.raf(data.timestamp);
    frame.read(tick, true);
    return () => {
      cancelFrame(tick);
      removeEventListener("tp:navigate", resync);
      removeEventListener("popstate", resync);
      l.destroy();
      lenis = null;
    };
  }, [reduced]);

  return null;
}
