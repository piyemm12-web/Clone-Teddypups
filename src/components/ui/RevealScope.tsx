"use client";

import { useEffect, useRef } from "react";
import { curtainDown } from "@/components/layout/Curtain";
import { prefersReducedMotion } from "@/lib/media-query";

const PENDING = "[data-reveal]:not([data-revealed])";

/**
 * Children marked `data-reveal` animate in when scrolled into view.
 * Anything already on screen at load just appears (no animation), and items
 * that come into view while the curtain is down wait for it to lift.
 */
export function RevealScope({ children, ...rest }: React.ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (prefersReducedMotion()) {
      const revealAll = () => root.querySelectorAll<HTMLElement>(PENDING).forEach((el) => (el.dataset.revealed = "true"));
      revealAll();
      const mo = new MutationObserver(revealAll);
      mo.observe(root, { childList: true, subtree: true });
      return () => mo.disconnect();
    }
    const queued = new Set<HTMLElement>();
    const reveal = (el: HTMLElement) => {
      el.dataset.revealed = "true";
      io.unobserve(el);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const el = en.target as HTMLElement;
          if (curtainDown()) queued.add(el);
          else reveal(el);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    const arm = (el: HTMLElement) => {
      if (el.dataset.armed) return io.observe(el);
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0 && !curtainDown()) {
        el.dataset.revealed = "true";
        return;
      }
      el.dataset.armed = "true";
      io.observe(el);
    };
    const scan = () => root.querySelectorAll<HTMLElement>(PENDING).forEach(arm);
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    const flush = () => {
      queued.forEach(reveal);
      queued.clear();
    };
    addEventListener("tp:arrived", flush);
    let timer: ReturnType<typeof setTimeout>;
    const poll = () => (curtainDown() ? (timer = setTimeout(poll, 400)) : flush());
    timer = setTimeout(poll, 1600);
    return () => {
      io.disconnect();
      mo.disconnect();
      clearTimeout(timer);
      removeEventListener("tp:arrived", flush);
    };
  }, []);

  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
}
