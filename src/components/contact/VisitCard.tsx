import { Paw } from "@/components/icons/Paw";
import { Media } from "@/components/ui/Media";
import { site } from "@/lib/site";
import type { Media as MediaItem } from "@/lib/types";

const MAPS_HREF = "https://maps.app.goo.gl/ZdJvwHBSQWWZT54s7";

const SHOWROOM_PHOTO: MediaItem = {
  id: "skvodl2NZiKq",
  url: "/media/skvodl2NZiKq/cefab5eee9/27b888_323008bb0f6a41d4bde2a0da7206cd98f003.jpg",
  kind: "image",
  width: 1080,
  height: 1920,
  alt: "The apricot teddy bear puppy from our showroom, held up to say hello",
  caption: "",
  focalX: 0.453,
  focalY: 0.444,
  color: "#685848",
  blurDataUrl:
    "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAAAwAgCdASoJABAAA4BaJbACdAYtza4BbcHsAADiF1VEqDVt16ac+uAmdBB2LI4q3G/6Bl/9tetZIF+8zMdSr3JKQa/JOA7nZQIC4SJVG9giEvNF2iUQveGdBkyGxtAA",
  durationS: null,
  poster: null,
};

/** "Visit us" shopfront card with the Downtown skyline sketched behind it. */
export function VisitCard() {
  return (
    <section aria-labelledby="visit-title" className="tp-shopfront mt-12">
      <svg viewBox="0 0 300 120" className="absolute -bottom-1 right-0 w-3/4 text-toffee/30" aria-hidden="true">
        <path
          d="M4 116h292M20 116V78h16v38M44 116V60h18v56M70 116V84h12v32M150 116V36l4-6v-14l3-4 3 4v14l4 6v80M118 116V70l12-8v54M174 116V64l14 8v44M200 116V82h18v34M226 116V56h14v60M248 116V88h22v28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="tp-visit relative p-7 pt-6">
        <div>
          <h2 id="visit-title" className="font-plush text-[2rem] leading-tight">
            Visit us in Downtown Dubai
          </h2>
          <p className="mt-3 max-w-[38ch] text-cocoa-soft">
            Step into our Downtown Dubai showroom and experience the joy of choosing your puppy face-to-face.
          </p>
          <p className="mt-4 flex items-center gap-2 font-semibold">
            <Paw className="size-5 shrink-0 text-toffee-deep" />
            {site.address}
          </p>
          <a href={MAPS_HREF} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-6 !bg-milk">
            Open in Google Maps
          </a>
        </div>
        <figure className="tp-visit__photo">
          <Media media={SHOWROOM_PHOTO} sizes="(min-width: 640px) 11rem, 90vw" />
        </figure>
      </div>
    </section>
  );
}
