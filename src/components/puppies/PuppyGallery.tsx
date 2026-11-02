"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Media } from "@/components/ui/Media";
import type { Media as MediaItem } from "@/lib/types";
import { Prefetch, ViewerImage } from "./ViewerImage";

const SIZES = "(min-width: 1024px) 55vw, 92vw";
const ARROW = "grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold";

/**
 * The puppy's photo book: a page-turn main stage with thumbnails, plus a
 * full-screen viewer (swipe or arrow keys) in a modal `<dialog>`.
 */
export function PuppyGallery({ name, media }: { name: string; media: MediaItem[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const n = media.length;
  const item = media[index];

  const go = useCallback(
    (i: number) => {
      setDir(i > index ? 1 : -1);
      setIndex(((i % n) + n) % n);
    },
    [index, n],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open, index, go]);

  if (!item) return null;

  const label = (i: number) => `${name}, ${media[i].kind === "video" ? "video" : "photo"} ${i + 1} of ${n}`;

  return (
    <div>
      <div className="tp-storypage relative aspect-[4/5] md:aspect-[5/6]">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <m.button
            key={item.id}
            type="button"
            custom={dir}
            className="absolute inset-0 block size-full"
            initial={{
              clipPath: dir > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)",
              rotateY: -14 * dir,
              transformPerspective: 1400,
            }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", rotateY: 0 }}
            exit={{ opacity: 0.4, scale: 0.97 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: dir > 0 ? "0% 50%" : "100% 50%" }}
            onClick={() => {
              dialog.current?.showModal();
              setOpen(true);
            }}
            aria-label={`Open ${label(index)} full screen`}
          >
            {item.kind === "video" ? (
              <video
                src={item.url}
                poster={item.poster?.url}
                className="size-full object-cover"
                muted
                loop
                playsInline
                autoPlay
                aria-label={item.alt}
              />
            ) : (
              <Media media={item} sizes={SIZES} preload={index === 0} quality={85} />
            )}
          </m.button>
        </AnimatePresence>
        {n > 1 && (
          <div className="absolute inset-x-4 bottom-4 flex justify-between">
            <button type="button" onClick={() => go(index - 1)} className={ARROW} aria-label="Previous photo">
              ‹
            </button>
            <span className="self-center rounded-full bg-cocoa/80 px-3 py-1 text-sm font-semibold text-milk">
              {index + 1} / {n}
            </span>
            <button type="button" onClick={() => go(index + 1)} className={ARROW} aria-label="Next photo">
              ›
            </button>
          </div>
        )}
      </div>

      {n > 1 && (
        <ul
          className="mt-3 flex gap-3 overflow-x-auto px-1 pb-2 pt-2 [scrollbar-width:thin]"
          aria-label={`All photos of ${name}`}
        >
          {media.map((it, i) => {
            const thumb = it.kind === "video" ? it.poster : it;
            const active = i === index;
            return (
              <li key={it.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={label(i)}
                  aria-current={active}
                  className={`relative block h-24 w-20 overflow-hidden rounded-[0.9rem] border-[3px] transition-transform duration-300 md:h-28 md:w-24 ${
                    active ? "-rotate-3 -translate-y-1 border-toffee-deep" : "border-cocoa/30 hover:-rotate-2 hover:border-cocoa"
                  }`}
                >
                  {thumb && <Media media={thumb} sizes="96px" alt="" />}
                  {it.kind === "video" && (
                    <span className="absolute inset-0 grid place-items-center bg-cocoa/30 text-lg text-milk">▶</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <dialog
        ref={dialog}
        aria-label={`${name} photos`}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-cocoa/95 p-0 text-milk backdrop:bg-cocoa/70"
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        data-lenis-prevent
      >
        {open && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="font-scrawl text-lg">{label(index)}</p>
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                className="h-11 rounded-full bg-milk px-5 font-semibold text-cocoa"
              >
                Close
              </button>
            </div>
            <div className="relative flex-1 touch-pan-y">
              <m.div
                key={item.id}
                // Images ignore the pointer so the browser's native image drag can't hijack the swipe.
                className="absolute inset-0 [&_img]:pointer-events-none"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) go(index + 1);
                  else if (info.offset.x > 80) go(index - 1);
                }}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {item.kind === "video" ? (
                  <video
                    src={item.url}
                    poster={item.poster?.url}
                    controls
                    autoPlay
                    playsInline
                    className="size-full object-contain"
                  />
                ) : (
                  <ViewerImage media={item} pageSizes={SIZES} quality={85} />
                )}
              </m.div>
              <Prefetch photos={media} at={index} quality={85} />
            </div>
            {n > 1 && (
              <div className="flex justify-center gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  className="h-12 rounded-full border-2 border-milk px-6 font-semibold"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  className="h-12 rounded-full bg-honey px-6 font-semibold text-cocoa"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
