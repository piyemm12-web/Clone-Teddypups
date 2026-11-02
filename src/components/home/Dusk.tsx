"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { PupStop } from "@/components/buddy/PupStop";
import { Scene, type SceneTone } from "@/components/buddy/Scene";
import { Polaroid } from "@/components/lightbox/Polaroid";
import { useLightbox } from "@/components/lightbox/useLightbox";
import { RevealScope } from "@/components/ui/RevealScope";
import type { Media } from "@/lib/types";

const SIZES = "(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw";
/** Order in which the eight prints drop onto the wall. */
const DROP_ORDER = [3, 0, 5, 1, 6, 2, 7, 4];

type Props = {
  heading: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  photos: Media[];
  testimonial?: { quote: string; author: string; location?: string };
  tone: SceneTone;
};

/** Dusk: family photos pinned to a street wall; any of them opens the full photo viewer. */
export function Dusk({ heading, body, ctaLabel, ctaHref = "/happy-families", photos, testimonial, tone }: Props) {
  const { open, viewer } = useLightbox(photos, SIZES);
  if (!photos.length) return null;
  return (
    <Scene tone={tone} aria-labelledby="dusk-title" className="tp-dusk">
      <div className="tp-dusk__sky gutter">
        <div className="tp-dusk__head">
          <h2 id="dusk-title" className="font-plush text-huge">
            {heading}
          </h2>
          {body && <p className="text-lede mt-5 max-w-[50ch] text-[var(--ink-soft)]">{body}</p>}
        </div>
        {testimonial && (
          <figure className="tp-dusk__note">
            <blockquote className="font-plush-text">“{testimonial.quote}”</blockquote>
            <figcaption className="font-scrawl">
              {testimonial.author}
              {testimonial.location ? `, ${testimonial.location}` : ""}
            </figcaption>
          </figure>
        )}
      </div>
      <div className="tp-photowall">
        <RevealScope className="tp-photowall__wall">
          <ul className="tp-photowall__prints" aria-label="Photos from TeddyPups families">
            {photos.slice(0, 8).map((photo, i) => (
              <li
                key={photo.id}
                data-reveal
                data-pup-look={i === 1 || i === 4 ? "" : undefined}
                style={{ "--d": `${110 * DROP_ORDER[i]}ms` } as CSSProperties}
              >
                <button
                  type="button"
                  className="tp-photowall__print"
                  onClick={() => open(i)}
                  aria-label={`Open photo ${i + 1} of ${photos.length}${photo.caption ? `: ${photo.caption}` : ""}`}
                >
                  <Polaroid media={photo} order={i} sizes={SIZES} />
                </button>
              </li>
            ))}
          </ul>
          <div className="tp-facade__ground">
            <span aria-hidden="true" className="tp-facade__door" />
            <span aria-hidden="true" className="tp-lamp">
              <span className="tp-lamp__light" />
            </span>
            {ctaLabel && (
              <Link href={ctaHref} className="btn btn-primary tp-facade__cta">
                {ctaLabel}
              </Link>
            )}
            <PupStop pose="sit" className="tp-dusk__teddy" />
          </div>
        </RevealScope>
        <div aria-hidden="true" className="tp-street__pavement" />
      </div>
      {viewer}
    </Scene>
  );
}
