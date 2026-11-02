import Link from "next/link";
import { PupStop } from "@/components/buddy/PupStop";
import { Scene } from "@/components/buddy/Scene";
import { Media } from "@/components/ui/Media";
import type { Puppy } from "@/lib/types";
import { paths, TONES } from "./data";
import { Flight } from "./Flight";

/** A next/image URL for a small (128px) version of a picture. */
const thumb = (url: string) => `/_next/image?url=${encodeURIComponent(url)}&w=128&q=75`;

/** "Two ways to meet your puppy": a signpost between the showroom and the import flight. */
export function Paths({ flyer }: { flyer?: Puppy }) {
  const { local, imported } = paths;
  return (
    <Scene tone={TONES.paths} className="tp-paths" aria-labelledby="paths-title">
      <div className="gutter mx-auto max-w-[110rem]">
        <h2 id="paths-title" className="tp-paths__title font-plush text-huge">
          {paths.heading}
        </h2>
        <div className="tp-fork">
          <div aria-hidden="true" className="tp-fork__post" />
          <article className="tp-way tp-way--left" aria-labelledby="way-local">
            <h3 id="way-local" className="tp-sign tp-sign--left font-plush">
              {local.sign}
            </h3>
            <div className="tp-way__scene" data-pup-look>
              <svg viewBox="0 0 300 120" className="tp-way__skyline" aria-hidden="true">
                <path
                  d="M4 116h292M20 116V78h16v38M44 116V60h18v56M70 116V84h12v32M150 116V36l4-6v-14l3-4 3 4v14l4 6v80M118 116V70l12-8v54M174 116V64l14 8v44M200 116V82h18v34M226 116V56h14v60M248 116V88h22v28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <figure className="tp-window">
                <span className="tp-window__glass">
                  <Media media={local.photo} sizes="(min-width: 1024px) 16rem, 60vw" />
                </span>
                <figcaption className="font-scrawl">{local.caption}</figcaption>
              </figure>
            </div>
            <p className="tp-way__text">{local.text}</p>
            <Link href={local.cta.href} className="btn btn-primary">
              {local.cta.label}
            </Link>
          </article>
          <article className="tp-way tp-way--right" aria-labelledby="way-imported">
            <h3 id="way-imported" className="tp-sign tp-sign--right font-plush">
              {imported.sign}
            </h3>
            <div className="tp-way__scene" data-pup-look>
              <Flight
                photo={flyer ? thumb(flyer.cover.url) : null}
                label={`A plane bringing a ${flyer?.breed ?? "puppy"}${flyer ? " puppy" : ""} from Korea to Dubai`}
              />
            </div>
            <p className="tp-way__text">{imported.text}</p>
            <Link href={imported.cta.href} className="btn btn-primary">
              {imported.cta.label}
            </Link>
          </article>
          <PupStop pose="sit" className="tp-fork__teddy" />
        </div>
      </div>
    </Scene>
  );
}
