"use client";

import { useLightbox } from "@/components/lightbox/useLightbox";
import { Polaroid } from "@/components/lightbox/Polaroid";
import { Paw } from "@/components/icons/Paw";
import { RevealScope } from "@/components/ui/RevealScope";
import type { Media } from "@/lib/types";

const SIZES = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw";

/** A wall of taped-up family photos; each opens in the swipeable lightbox. */
export function MemoryWall({ photos }: { photos: Media[] }) {
  const { open, viewer } = useLightbox(photos, SIZES);
  const n = photos.length;
  return (
    <>
      <RevealScope>
        <ul className="tp-wall" aria-label="Photos from TeddyPups families">
          {photos.map((m, i) => (
            <li
              key={m.id}
              className="tp-wall__item"
              data-reveal="true"
              style={{ "--d": `${(i % 4) * 60}ms` } as React.CSSProperties}
            >
              <button
                type="button"
                className="tp-wall__print"
                onClick={() => open(i)}
                aria-label={`Open photo ${i + 1} of ${n}${m.caption ? `: ${m.caption}` : ""}`}
              >
                <Polaroid media={m} order={i} sizes={SIZES} priority={i < 2} />
                <Paw className="tp-wall__paw" />
              </button>
            </li>
          ))}
        </ul>
      </RevealScope>
      {viewer}
    </>
  );
}
