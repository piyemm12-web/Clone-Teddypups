"use client";

import { useEffect, useRef } from "react";
import { PAW_PATH } from "@/components/icons/Paw";
import { FINE_POINTER, useReducedMotion } from "@/lib/media-query";

type Print = { x: number; y: number; angle: number; born: number };

/** Faint toffee paw prints that trail the mouse and fade after a second. */
export function PawTrailCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced || !matchMedia(FINE_POINTER).matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let dpr = 1;
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
    };
    size();
    const paw = new Path2D(PAW_PATH);
    let prints: Print[] = [];
    let dist = 0, side = 1, lastX = NaN, lastY = NaN, raf = 0;

    const draw = (t: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      prints = prints.filter((p) => t - p.born <= 1000);
      for (let i = prints.length - 1; i >= 0; i--) {
        const p = prints[i];
        const age = t - p.born;
        const alpha = age < 600 ? 1 : 1 - (age - 600) / 400;
        ctx.globalAlpha = 0.42 * alpha * alpha;
        ctx.setTransform(0.27 * dpr, 0, 0, 0.27 * dpr, p.x * dpr, p.y * dpr);
        ctx.rotate(p.angle);
        ctx.translate(-32, -34);
        ctx.fillStyle = "#c2622b";
        ctx.fill(paw);
      }
      raf = prints.length ? requestAnimationFrame(draw) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = e.clientX, y = e.clientY;
      if (Number.isNaN(lastX)) { lastX = x; lastY = y; return; }
      const dx = x - lastX, dy = y - lastY;
      dist += Math.hypot(dx, dy);
      if (dist >= 46) {
        dist = 0;
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        const off = 7 * (side = -side);
        prints.push({ x: x + Math.cos(angle) * off + 14, y: y + Math.sin(angle) * off + 16, angle, born: performance.now() });
        if (prints.length > 14) prints.shift();
        if (!raf) raf = requestAnimationFrame(draw);
      }
      lastX = x; lastY = y;
    };

    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("resize", size);
    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", size);
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [reduced]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] size-full" />;
}
