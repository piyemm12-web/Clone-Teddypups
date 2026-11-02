"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Fixed header that tucks away while scrolling down and returns on scroll up. */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = scrollY;
    let ticking = false;
    const update = () => {
      const y = scrollY;
      el.dataset.scrolled = y > 8 ? "true" : "false";
      if (Math.abs(y - last) > 6) {
        el.dataset.hidden = y > last && y > 220 ? "true" : "false";
        last = y;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    const onFocus = () => (el.dataset.hidden = "false");
    update();
    addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("focusin", onFocus);
    return () => {
      removeEventListener("scroll", onScroll);
      el.removeEventListener("focusin", onFocus);
    };
  }, []);

  return (
    <header
      ref={ref}
      id="site-header"
      data-scrolled="false"
      data-hidden="false"
      data-home={pathname === "/" || undefined}
      className="tp-header fixed inset-x-0 top-0 z-50"
      suppressHydrationWarning
    >
      {children}
    </header>
  );
}
