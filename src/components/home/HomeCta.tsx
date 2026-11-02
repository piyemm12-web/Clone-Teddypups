import Link from "next/link";
import { PupStop } from "@/components/buddy/PupStop";
import { Scene } from "@/components/buddy/Scene";
import { Media } from "@/components/ui/Media";
import { whatsappHref } from "@/lib/site";
import type { Puppy } from "@/lib/types";
import { cta, TONES } from "./data";

/** Late night: a front door left ajar with a puppy waiting inside. Teddy's last stop. */
export function HomeCta({ waiting }: { waiting?: Puppy }) {
  return (
    <Scene tone={TONES.home} className="tp-home" aria-labelledby="cta-title">
      <div className="tp-home__copy gutter">
        <h2 id="cta-title" className="font-plush text-huge">
          {cta.heading}
        </h2>
        <p className="tp-home__lede">{cta.lede}</p>
      </div>
      <div className="tp-house">
        <span aria-hidden="true" className="tp-house__plant tp-house__plant--left" />
        <span aria-hidden="true" className="tp-house__lamp" />
        <div className="tp-house__doorway">
          <span className="tp-house__inside">
            {waiting && <Media media={waiting.cover} sizes="16rem" alt={`${waiting.displayName}, waiting inside`} />}
          </span>
          <span aria-hidden="true" className="tp-house__door">
            <span className="tp-house__peep" />
            <span className="tp-house__knob" />
          </span>
        </div>
        <span aria-hidden="true" className="tp-house__plant tp-house__plant--right" />
        <span aria-hidden="true" className="tp-house__mat font-scrawl">
          {cta.mat}
        </span>
        <PupStop pose="bow" className="tp-house__teddy" />
      </div>
      <div className="tp-home__actions gutter">
        <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
          {cta.whatsappLabel}
        </a>
        <Link href={cta.contact.href} className="btn btn-ghost tp-home__ghost">
          {cta.contact.label}
        </Link>
      </div>
    </Scene>
  );
}
