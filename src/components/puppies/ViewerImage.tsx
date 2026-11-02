"use client";

import Image from "next/image";
import { useState } from "react";
import { Media } from "@/components/ui/Media";
import type { Media as MediaItem } from "@/lib/types";

/** Width (CSS px) a photo occupies when contained in the full-screen viewer. */
const fitWidth = (media: MediaItem) =>
  Math.ceil(Math.min(innerWidth, Math.max(1, innerHeight - 150) * (media.width / media.height)));

/**
 * Full-screen photo with a blur-up: the page-sized image (already cached by
 * the browser) shows at once, then a sharp, viewport-sized one fades over it.
 */
export function ViewerImage({ media, pageSizes, quality = 75 }: { media: MediaItem; pageSizes: string; quality?: number }) {
  const [sharp, setSharp] = useState(false);
  return (
    <>
      <Media
        media={media}
        sizes={pageSizes}
        quality={quality}
        alt=""
        eager
        className={sharp ? "tp-viewer__first tp-viewer__first--done" : "tp-viewer__first"}
        style={{ objectFit: "contain", objectPosition: "50% 50%", backgroundColor: "transparent" }}
      />
      <Image
        src={media.url}
        alt={media.alt}
        fill
        sizes={`${fitWidth(media)}px`}
        quality={quality}
        loading="eager"
        className="tp-viewer__sharp object-contain"
        data-sharp={sharp || undefined}
        onLoad={(e) => {
          e.currentTarget
            .decode()
            .catch(() => {})
            .then(() => setSharp(true));
        }}
      />
    </>
  );
}

/** Warms the cache with the neighbouring photos so swiping feels instant. */
export function Prefetch({ photos, at, quality = 75 }: { photos: MediaItem[]; at: number; quality?: number }) {
  const n = photos.length;
  if (n < 2) return null;
  const around = [...new Set([(at - 1 + n) % n, (at + 1) % n])].filter((i) => photos[i].kind === "image");
  return (
    <span aria-hidden className="sr-only">
      {around.map((i) => (
        <Image
          key={photos[i].id}
          src={photos[i].url}
          alt=""
          fill
          sizes={`${fitWidth(photos[i])}px`}
          quality={quality}
          loading="eager"
        />
      ))}
    </span>
  );
}
