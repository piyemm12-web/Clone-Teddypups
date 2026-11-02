import type { Metadata } from "next";
import { Suspense } from "react";
import { PupBuddy } from "@/components/buddy/PupBuddy";
import { GoneHomeStrip } from "@/components/puppies/GoneHomeStrip";
import { PuppyBrowser } from "@/components/puppies/PuppyBrowser";
import { SketchList } from "@/components/puppies/SketchList";
import { RevealScope } from "@/components/ui/RevealScope";
import { BREEDS, getAllPuppies, getAvailablePuppies } from "@/lib/puppies";
import { whatsappHref } from "@/lib/site";

const title = "Available puppies";
const description =
  "Teacup and teddy bear puppies available now in Dubai and imported from trusted breeders — every listing shows real photos of the puppy.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/puppies" },
  openGraph: { title: `${title} | TeddyPups U.A.E.`, description },
  twitter: { title: `${title} | TeddyPups U.A.E.`, description },
};

const GONE_HOME_PREVIEW = 5;

export default function PuppiesPage() {
  const puppies = getAvailablePuppies();
  const goneHome = getAllPuppies()
    .filter((p) => p.status === "rehomed")
    .slice(0, GONE_HOME_PREVIEW);

  return (
    <div data-page="pups" className="tp-page">
      <section aria-labelledby="pups-title" className="tp-sketchbook">
        <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <RevealScope className="tp-sketchbook__head">
            <div className="tp-sketchbook__words">
              <p className="font-scrawl text-lg text-toffee-ink" data-reveal>
                from Teddy&apos;s sketchbook
              </p>
              <h1 id="pups-title" className="font-plush text-giant tp-sketchbook__title" data-reveal>
                Available puppies
                <svg aria-hidden viewBox="0 0 400 24" preserveAspectRatio="none" className="tp-sketchbook__underline">
                  <path d="M4 15c40-9 70 5 112-2s70-9 112 0 74 8 116-1 38-4 52 1" pathLength={1} />
                </svg>
              </h1>
              <p className="tp-sketchbook__lede text-lede mt-6 max-w-[46ch] text-cocoa-soft" data-reveal>
                Every listing shows real photos of the actual puppy. Open a profile to see them all, then ask us about
                them on WhatsApp.
              </p>
            </div>
            <div className="tp-sketchbook__self" data-reveal>
              <PupBuddy pose="sit" facing="left" label="Teddy, the TeddyPups puppy" />
              <span className="font-scrawl tp-sketchbook__caption">self-portrait</span>
            </div>
          </RevealScope>
          <div className="mt-12">
            {/* Filters read the query string on the client; the server renders the full list. */}
            <Suspense fallback={<SketchList puppies={puppies} />}>
              <PuppyBrowser
                puppies={puppies}
                breeds={BREEDS}
                whatsappHref={whatsappHref("Hi TeddyPups! I'm looking for a puppy — what do you have at the moment?")}
              />
            </Suspense>
          </div>
        </div>
      </section>
      <GoneHomeStrip puppies={goneHome} />
    </div>
  );
}
