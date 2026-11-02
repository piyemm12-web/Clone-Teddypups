"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PAW_PATH } from "@/components/icons/Paw";
import { prefersReducedMotion } from "@/lib/media-query";
import { Runner } from "./Runner";

type CurtainState = "intro" | "idle" | "covering" | "covered" | "lifting" | "snap";

/** Paw prints that stamp across the blanket: [left %, top px, rotation deg]. */
const PRINTS: [number, number, number][] = [
  [18, 6, 14],
  [27, -4, 6],
  [36, 7, 18],
  [45, -3, 4],
  [54, 6, 16],
];

function curtainEl() {
  return document.querySelector<HTMLElement>(".tp-curtain");
}

/** Milliseconds since the intro started, read off the CSS animation clock. */
function introElapsed() {
  const anim = curtainEl()
    ?.getAnimations()
    .find((a) => (a as CSSAnimation).animationName === "tp-curtain-rest");
  return anim && anim.playState !== "finished" && typeof anim.currentTime === "number"
    ? anim.currentTime
    : Infinity;
}

/** True while the blanket covers the page (reveals wait for it to lift). */
export function curtainDown() {
  const s = curtainEl()?.dataset.state;
  return (s === "intro" && introElapsed() < 560) || s === "covering" || s === "covered" || s === "snap";
}

/**
 * The cream blanket that drops over the page while Teddy runs across it.
 * Plays once on load (pure CSS) and again on every internal navigation.
 */
export function Curtain() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  const coveredAt = useRef(0);
  const liftRef = useRef<() => void>(() => {});

  useEffect(() => {
    const curtain = ref.current;
    if (!curtain) return;
    const html = document.documentElement;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let pendingHref: string | null = null;
    let kbNav = false;

    const getState = () => curtain.dataset.state as CurtainState;
    const setState = (s: CurtainState) => {
      curtain.dataset.state = s;
      if (s === "idle") delete html.dataset.curtain;
      else html.dataset.curtain = s;
    };
    const after = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));
    const clearAll = () => timers.splice(0).forEach(clearTimeout);

    const lift = () => {
      const s = getState();
      if (s === "idle" || s === "lifting") return;
      clearAll();
      pendingHref = null;
      setState("lifting");
      dispatchEvent(new Event("tp:arrived"));
      if (kbNav) {
        kbNav = false;
        document.getElementById("main")?.focus({ preventScroll: true });
      }
      after(() => setState("idle"), 460);
    };
    liftRef.current = lift;

    const go = (href: string) => {
      const u = new URL(href, location.href);
      if (u.pathname === location.pathname && u.search === location.search) {
        pendingHref = null;
        scrollTo({ top: 0, behavior: "instant" });
        after(lift, 120);
        return;
      }
      router.push(u.pathname + u.search + u.hash);
      after(lift, 6000); // safety net if the route never settles
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download") || a.dataset.noCurtain !== undefined) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || /^\/(admin|api|media|_next)(\/|$)/.test(u.pathname)) return;
      if (!(u.pathname !== location.pathname || (!u.hash && u.search === location.search))) return;
      if (prefersReducedMotion()) return;
      e.preventDefault();
      e.stopPropagation();
      kbNav = e.detail === 0;
      router.prefetch(u.pathname + u.search);
      dispatchEvent(new Event("tp:navigate"));
      pendingHref = u.href;
      const s = getState();
      if (s === "covered" || s === "snap") go(u.href);
      else if (s !== "covering") {
        clearAll();
        if (s === "intro" && introElapsed() < 1080) {
          setState("covered");
          coveredAt.current = performance.now();
          go(u.href);
        } else {
          setState("covering");
          after(() => {
            setState("covered");
            coveredAt.current = performance.now();
            if (pendingHref) go(pendingHref);
          }, 300);
        }
      }
    };

    const onPop = () => {
      if (prefersReducedMotion() || location.pathname === lastPath.current) return;
      clearAll();
      setState("snap");
      coveredAt.current = performance.now();
      after(lift, 1400);
    };

    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        clearAll();
        setState("idle");
      }
    };

    addEventListener("click", onClick, true);
    addEventListener("popstate", onPop);
    addEventListener("pageshow", onShow);

    if (getState() === "intro") {
      const t = introElapsed();
      after(() => dispatchEvent(new Event("tp:arrived")), Math.max(0, 560 - t));
      after(() => getState() === "intro" && setState("idle"), Math.max(0, 1080 - t));
    }
    if (prefersReducedMotion()) setState("idle");

    return () => {
      clearAll();
      delete html.dataset.curtain;
      removeEventListener("click", onClick, true);
      removeEventListener("popstate", onPop);
      removeEventListener("pageshow", onShow);
    };
  }, [router]);

  // Once the new route has rendered, lift the blanket (kept down >= 140ms).
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    const s = ref.current?.dataset.state;
    if (s !== "covered" && s !== "snap" && s !== "covering") return;
    const wait = Math.max(0, 140 - (performance.now() - coveredAt.current));
    const id = setTimeout(() => requestAnimationFrame(() => liftRef.current()), s === "covering" ? 340 : wait);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <div ref={ref} className="tp-curtain" data-state="intro" aria-hidden="true" suppressHydrationWarning>
      <div className="tp-curtain__blanket">
        <svg className="tp-curtain__edge tp-curtain__edge--top" width="100%" height="40" preserveAspectRatio="none">
          <defs>
            <pattern id="tp-curtain-scallop" width="76" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40V27A38 25 0 0 1 76 27V40Z" fill="#fbe3b4" />
              <path d="M0 27A38 25 0 0 1 76 27" fill="none" stroke="#2a170e" strokeWidth="3" />
              <path
                d="M11 33A27 19 0 0 1 65 33"
                fill="none"
                stroke="#2a170e"
                strokeWidth="1.6"
                strokeDasharray="3.5 5.5"
                strokeLinecap="round"
                opacity=".42"
              />
            </pattern>
          </defs>
          <rect width="100%" height="40" fill="url(#tp-curtain-scallop)" />
        </svg>
        <div className="tp-curtain__stage">
          <div className="tp-curtain__prints">
            {PRINTS.map(([left, top, rot], i) => (
              <svg
                key={i}
                viewBox="0 0 64 64"
                className="tp-curtain__print"
                style={{ left: `${left}%`, top: `${top}px`, rotate: `${rot}deg`, animationDelay: `${+(0.16 + 0.12 * i).toFixed(2)}s` }}
              >
                <path d={PAW_PATH} />
              </svg>
            ))}
          </div>
          <div className="tp-curtain__runner">
            <Runner />
          </div>
          <p className="tp-curtain__note font-scrawl">every puppy is family</p>
        </div>
        <svg className="tp-curtain__edge tp-curtain__edge--bottom" width="100%" height="40" preserveAspectRatio="none">
          <rect width="100%" height="40" fill="url(#tp-curtain-scallop)" />
        </svg>
      </div>
    </div>
  );
}
