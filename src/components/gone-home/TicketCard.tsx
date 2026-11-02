import Link from "next/link";
import { Media } from "@/components/ui/Media";
import type { Puppy } from "@/lib/types";

const TILTS = [-1.4, 1.1, -0.6, 1.6, -1.1, 0.8];

/** A "one ticket home" stub for a puppy who has found a family. */
export function TicketCard({ puppy, index }: { puppy: Puppy; index: number }) {
  const meta = puppy.name ? `${puppy.breed}, ${puppy.genderLabel.toLowerCase()}` : puppy.genderLabel;
  const from = puppy.origin?.slug === "local" ? "Dubai showroom" : "TeddyPups";
  return (
    <li
      className="tp-ticket"
      data-reveal="true"
      style={{ "--tilt": `${TILTS[index % TILTS.length]}deg`, "--i": index } as React.CSSProperties}
    >
      <Link className="tp-ticket__link" href={`/puppies/${puppy.slug}`}>
        <span className="tp-ticket__main">
          <span className="tp-ticket__photo">
            <Media media={puppy.cover} sizes="7rem" />
          </span>
          <span className="tp-ticket__body">
            <span className="font-scrawl tp-ticket__kicker">one ticket home</span>
            <span className="font-plush tp-ticket__name">{puppy.displayName}</span>
            <span className="tp-ticket__meta">{meta}</span>
            <span className="tp-ticket__route">
              <span>{from}</span>
              <svg viewBox="0 0 60 12" aria-hidden="true">
                <path d="M2 6h46" />
                <path d="M44 2l6 4-6 4" />
              </svg>
              <span>home ♥</span>
            </span>
          </span>
        </span>
        <span aria-hidden="true" className="tp-ticket__stub">
          <span className="font-plush">admit one</span>
        </span>
      </Link>
    </li>
  );
}
