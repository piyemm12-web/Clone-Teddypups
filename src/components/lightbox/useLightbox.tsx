"use client";

import Image from "next/image";
import { AnimatePresence, m, type Variants } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Media } from "@/components/ui/Media";
import type { Media as MediaItem } from "@/lib/types";

/** Width (px) a photo is shown at in the viewer: fits the screen minus the toolbars. */
const fitWidth = (media: MediaItem) =>
  Math.ceil(Math.min(innerWidth, Math.max(1, innerHeight - 150) * (media.width / media.height)));

const slide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: 70 * dir, rotate: 5 * dir, scale: 0.92 }),
  center: { opacity: 1, x: 0, rotate: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 26 } },
  exit: (dir: number) => ({ opacity: 0, x: -70 * dir, rotate: -5 * dir, scale: 0.92, transition: { duration: 0.22 } }),
};

/**
 * Blur-up: first shows the image already cached by the page (same `sizes`),
 * then swaps in a sharp copy sized for the viewer once it has decoded.
 */
function ViewerImage({ media, pageSizes, quality = 75 }: { media: MediaItem; pageSizes: string; quality?: number }) {
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

/** Warms the cache with the previous and next photos. */
function Prefetch({ photos, at, quality = 75 }: { photos: MediaItem[]; at: number; quality?: number }) {
  const n = photos.length;
  if (n < 2) return null;
  const around = [...new Set([(at - 1 + n) % n, (at + 1) % n])].filter((i) => photos[i].kind === "image");
  return (
    <span aria-hidden="true" className="sr-only">
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

/**
 * A full-screen photo viewer (native `<dialog>`) with swipe, arrow keys and
 * previous/next buttons. Render `viewer` once and call `open(i)` from a thumbnail.
 *
 * @param photos    every photo the viewer can page through
 * @param pageSizes the `sizes` the thumbnails use on the page, so the first frame comes from cache
 */
export function useLightbox(photos: MediaItem[], pageSizes: string): { open: (index: number) => void; viewer: ReactNode } {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const n = photos.length;

  const wrap = useCallback((i: number) => ((i % n) + n) % n, [n]);
  const go = useCallback(
    (i: number, d: number) => {
      setDir(d);
      setIndex(wrap(i));
    },
    [wrap],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1, 1);
      if (e.key === "ArrowLeft") go(index - 1, -1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [index, go]);

  const open = useCallback((i: number) => {
    setDir(1);
    setIndex(i);
    dialog.current?.showModal();
  }, []);

  const item = index === null ? null : photos[index];
  const close = () => dialog.current?.close();

  const viewer = (
    <dialog
      ref={dialog}
      aria-label="Photo viewer"
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-cocoa/95 p-0 text-milk backdrop:bg-cocoa/70"
      onClose={() => setIndex(null)}
      onClick={(e) => e.target === dialog.current && close()}
      data-lenis-prevent
    >
      {item && index !== null && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="font-scrawl text-lg">
              {index + 1} / {n}
              {item.caption ? ` — ${item.caption}` : ""}
            </p>
            <button type="button" onClick={close} className="h-11 rounded-full bg-milk px-5 font-semibold text-cocoa">
              Close
            </button>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={dir}>
              <m.div
                key={item.id}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 touch-pan-y"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) go(index + 1, 1);
                  else if (info.offset.x > 80) go(index - 1, -1);
                }}
              >
                <ViewerImage media={item} pageSizes={pageSizes} />
              </m.div>
            </AnimatePresence>
            <Prefetch photos={photos} at={index} />
          </div>
          <div className="flex justify-center gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
            <button
              type="button"
              onClick={() => go(index - 1, -1)}
              className="h-12 rounded-full border-2 border-milk px-6 font-semibold"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => go(index + 1, 1)}
              className="h-12 rounded-full bg-honey px-6 font-semibold text-cocoa"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </dialog>
  );

  return { open, viewer };
}
