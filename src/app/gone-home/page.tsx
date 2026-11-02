import type { Metadata } from "next";
import Link from "next/link";
import { RevealScope } from "@/components/ui/RevealScope";
import { PupBuddy } from "@/components/buddy/PupBuddy";
import { TicketCard } from "@/components/gone-home/TicketCard";
import { getAllPuppies } from "@/lib/puppies";

export const metadata: Metadata = {
  title: "Gone home",
  description: "TeddyPups puppies who have already joined their families.",
};

export default function GoneHomePage() {
  const rehomed = getAllPuppies().filter((p) => p.status === "rehomed");
  return (
    <div data-page="gone" className="tp-page">
      <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
        <header className="tp-boothhead">
          <div className="max-w-3xl">
            <h1 className="font-plush text-giant">
              Gone home
              <svg
                viewBox="0 0 48 44"
                className="ml-3 inline-block w-[0.45em] -translate-y-[0.15em] text-toffee"
                aria-hidden="true"
              >
                <path
                  d="M24 40C10 30 4 22 4 14.5 4 8.7 8.6 4 14.3 4c4.1 0 7.6 2.4 9.7 6 2.1-3.6 5.6-6 9.7-6C39.4 4 44 8.7 44 14.5 44 22 38 30 24 40z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </h1>
            <p className="text-lede mt-6 text-cocoa-soft">
              Every puppy here has already joined a loving family. Looking for one just like them? Tell us — we&apos;ll
              help you find your match.
            </p>
            <Link className="btn btn-primary mt-8" href="/puppies">
              See available puppies
            </Link>
          </div>
          <div aria-hidden="true" className="tp-booth">
            <PupBuddy pose="peek" className="tp-booth__teddy" />
            <div className="tp-booth__counter">
              <span className="font-plush">tickets home</span>
            </div>
          </div>
        </header>
        <RevealScope>
          <ul className="tp-tickets" aria-label="Puppies who have gone home">
            {rehomed.map((p, i) => (
              <TicketCard key={p.id} puppy={p} index={i} />
            ))}
          </ul>
        </RevealScope>
      </div>
    </div>
  );
}
