"use client";

import { useRef } from "react";
import { m, useScroll } from "motion/react";

/** Bookmark ribbon down the page edge that fills in as you read the story. */
export function StoryRibbon() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 30%", "end end"] });
  return (
    <div ref={ref} aria-hidden className="tp-ribbon">
      <div className="tp-ribbon__track">
        <m.span className="tp-ribbon__band" style={{ scaleY: scrollYProgress }} />
      </div>
    </div>
  );
}
