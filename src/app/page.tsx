import { PupJourney } from "@/components/buddy/PupJourney";
import { Chat } from "@/components/home/Chat";
import { Dusk } from "@/components/home/Dusk";
import { Hero } from "@/components/home/Hero";
import { HomeCta } from "@/components/home/HomeCta";
import { Meet } from "@/components/home/Meet";
import { Night } from "@/components/home/Night";
import { Passport } from "@/components/home/Passport";
import { Paths } from "@/components/home/Paths";
import { families, journey, meet, TONES } from "@/components/home/data";
import { featuredTestimonial, getFamilyPhotos } from "@/lib/families";
import { getAvailablePuppies } from "@/lib/puppies";
import { site, whatsappHref } from "@/lib/site";
import type { Puppy } from "@/lib/types";

/** Breeds we have right now, most puppies first. */
function breedsInStock(puppies: Puppy[]) {
  const counts = new Map<string, { slug: string; name: string; n: number }>();
  for (const pup of puppies)
    for (const b of pup.breeds) {
      const entry = counts.get(b.slug) ?? { ...b, n: 0 };
      entry.n++;
      counts.set(b.slug, entry);
    }
  return [...counts.values()].sort((a, b) => b.n - a.n).map(({ slug, name }) => ({ slug, name }));
}

/**
 * The homepage is one day in Teddy's life: eight "scenes" from a bright
 * morning to a cosy night, which the mascot walks through as you scroll.
 */
export default function Home() {
  const puppies = getAvailablePuppies();
  const flyer = puppies.find((p) => p.breed.startsWith("Korean")) ?? puppies[0];

  return (
    <>
      <div data-page="home" className="tp-page">
        <div data-section="hero">
          <Hero puppies={puppies} />
        </div>
        <div data-section="meet">
          <Meet {...meet} puppies={puppies} tone={TONES.meet} />
        </div>
        <div data-section="paths">
          <Paths flyer={flyer} />
        </div>
        <div data-section="journey">
          <Chat
            {...journey}
            tone={TONES.chat}
            business={site.name}
            greeting="Hi TeddyPups! I'd love to know more about your puppies."
            whatsappHref={whatsappHref()}
            breeds={breedsInStock(puppies)}
          />
        </div>
        <div data-section="trust">
          <Passport />
        </div>
        <div data-section="families">
          <Dusk {...families} photos={getFamilyPhotos()} testimonial={featuredTestimonial} tone={TONES.dusk} />
        </div>
        <div data-section="questions">
          <Night />
        </div>
        <div data-section="cta">
          <HomeCta waiting={puppies[0]} />
        </div>
      </div>
      <PupJourney />
    </>
  );
}
