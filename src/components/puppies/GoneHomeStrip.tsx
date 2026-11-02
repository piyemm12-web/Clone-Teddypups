import Link from "next/link";
import { RevealScope } from "@/components/ui/RevealScope";
import type { Puppy } from "@/lib/types";
import { SketchCard } from "./SketchCard";

/** "Already gone home" teaser row shown under the available puppies. */
export function GoneHomeStrip({ puppies }: { puppies: Puppy[] }) {
  if (!puppies.length) return null;
  return (
    <section className="tp-gone-strip" aria-labelledby="gone-title">
      <RevealScope className="gutter mx-auto flex max-w-[110rem] flex-col gap-10 md:flex-row md:items-center">
        <div className="md:w-1/3" data-reveal>
          <h2 id="gone-title" className="font-plush text-big">
            Already gone home
          </h2>
          <p className="mt-3 text-cocoa-soft">These puppies have found their families.</p>
          <Link href="/gone-home" className="btn btn-primary mt-6">
            See the puppies who&apos;ve gone home
          </Link>
        </div>
        <ul className="tp-gone-strip__row" aria-label="Some puppies who have gone home">
          {puppies.map((p, i) => (
            <li key={p.id}>
              <SketchCard pup={p} index={i} sizes="9rem" small />
            </li>
          ))}
        </ul>
      </RevealScope>
    </section>
  );
}
