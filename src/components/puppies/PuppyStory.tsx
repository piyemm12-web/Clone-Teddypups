import Link from "next/link";
import type { CSSProperties } from "react";
import { PupBuddy } from "@/components/buddy/PupBuddy";
import { Paw } from "@/components/icons/Paw";
import { Media } from "@/components/ui/Media";
import { RevealScope } from "@/components/ui/RevealScope";
import { getAllPuppies } from "@/lib/puppies";
import { site } from "@/lib/site";
import type { Puppy } from "@/lib/types";
import { STATUS, enquiryLabel, puppyUrl, puppyWhatsappHref, referTo } from "./copy";
import { EnquiryForm } from "./EnquiryForm";
import { PuppyGallery } from "./PuppyGallery";
import { StoryRibbon } from "./StoryRibbon";

const INCLUDED = [
  "Vaccinated",
  "Dewormed",
  "Verified health certificate from licensed vets",
  "Thoroughly checked before joining your family",
];

const STEPS = {
  imported: {
    heading: "Coming home from abroad",
    steps: [
      { title: "Reserve your puppy", text: "Tell us which puppy has captured your heart." },
      {
        title: "Personalized consultation",
        text: "We finalize details with you and share updates on your puppy's journey.",
      },
      { title: "Import and arrival", text: "We manage health checks, travel arrangements, and documentation." },
      {
        title: "Welcome home",
        text: "We help your new puppy settle in and ensure a smooth transition into your home.",
      },
    ],
  },
  // No local puppy is listed on the reference site; these follow its "In Dubai" journey.
  local: {
    heading: "Meet them in Dubai",
    steps: [
      { title: "Choose your puppy", text: "Open their profile for more information or to enquire further." },
      { title: "Meet before you choose", text: "Spend time bonding in our Downtown Dubai showroom." },
      { title: "Pick-up or delivery", text: "Collect your puppy from us or have them delivered within Dubai." },
      {
        title: "Welcome home",
        text: "We help your new puppy settle in and ensure a smooth transition into your home.",
      },
    ],
  },
};

const ENQUIRY_SUCCESS = {
  heading: "Message received!",
  body: "Thank you — our team will get back to you promptly. For the quickest reply, message us on WhatsApp.",
};

function Chapter({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="tp-chapter">
      <span aria-hidden className="tp-chapter__n font-plush">
        {n}
      </span>
      <span className="font-scrawl">{children}</span>
    </p>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 32 32" className="mt-0.5 size-6 shrink-0 text-toffee-deep" aria-hidden>
      <path d="M5 17l7 7L27 8" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Previous / next puppy among those with the same kind of status (available or gone home). */
function neighbours(pup: Puppy) {
  const rehomed = pup.status === "rehomed";
  const group = getAllPuppies().filter((p) => (p.status === "rehomed") === rehomed);
  const i = group.findIndex((p) => p.slug === pup.slug);
  if (group.length < 2 || i < 0) return null;
  const n = group.length;
  return { prev: group[(i - 1 + n) % n], next: group[(i + 1) % n] };
}

function NeighbourLink({ pup, label }: { pup: Puppy; label: string }) {
  return (
    <Link
      href={`/puppies/${pup.slug}`}
      className="group flex items-center gap-5 rounded-[2rem] border-[3px] border-cocoa bg-milk p-4 transition-transform duration-500 hover:-rotate-1 sm:last:flex-row-reverse sm:last:text-right"
    >
      <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[999px_999px_0.6rem_0.6rem] border-[3px] border-cocoa bg-honey-soft">
        {pup.cover && <Media media={pup.cover} sizes="80px" />}
      </span>
      <span>
        <span className="font-scrawl block text-sm text-cocoa-soft">{label}</span>
        <span className="font-plush text-[1.6rem]">{pup.displayName}</span>
      </span>
    </Link>
  );
}

/** The puppy profile, told as a little storybook in chapters. */
export function PuppyStory({ pup }: { pup: Puppy }) {
  const rehomed = pup.status === "rehomed";
  const who = referTo(pup);
  const wa = puppyWhatsappHref(pup);
  const local = pup.origin?.slug === "local";
  const journey = rehomed || !pup.origin ? null : STEPS[local ? "local" : "imported"];
  const around = neighbours(pup);
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Puppies", item: `${site.url}/puppies` },
      { "@type": "ListItem", position: 2, name: pup.displayName, item: puppyUrl(pup) },
    ],
  };
  const facts = [
    { term: "Breed", value: pup.breed },
    { term: "Boy or girl", value: pup.genderLabel },
    { term: "Age", value: pup.age },
    { term: "Colour", value: pup.colour },
    { term: "Where", value: pup.origin && (local ? "In Dubai" : "Imported for you") },
  ].filter((f) => f.value);
  const tint = pup.cover?.color ?? "#f2be6b";

  return (
    <article
      className="tp-storybook"
      style={
        {
          background: `linear-gradient(180deg, color-mix(in oklab, ${tint} 24%, var(--color-milk)) 0, var(--color-milk) 85%)`,
        } as CSSProperties
      }
    >
      <StoryRibbon />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <RevealScope className="gutter mx-auto max-w-[110rem] pb-20 pt-8 md:pt-12">
        <nav aria-label="Breadcrumb" className="text-[0.95rem] font-semibold text-cocoa-soft">
          {rehomed ? (
            <Link href="/gone-home" className="link-ink">
              Gone home
            </Link>
          ) : (
            <Link href="/puppies" className="link-ink">
              Available puppies
            </Link>
          )}
          <span aria-hidden> / </span>
          <span aria-current="page">{pup.displayName}</span>
        </nav>
        <Chapter n={1}>{rehomed ? "the day they went home" : "hello, it's me"}</Chapter>

        <div className="mt-4 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 lg:col-span-7">
            <PuppyGallery name={pup.displayName} media={pup.media} />
          </div>
          <div className="min-w-0 lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+5.5rem)]">
              <div
                className="tp-tag tp-board mt-16 !rounded-[2.2rem_2.2rem_2.2rem_0.6rem] !p-7 md:!p-9 lg:mt-20"
                data-reveal
              >
                <span aria-hidden className="tp-tag__ring" />
                <PupBuddy
                  pose="peek"
                  className="absolute -top-[4.8rem] right-6 w-[9.5rem]"
                  label={`Teddy, peeking over ${pup.displayName}'s tag`}
                />
                {rehomed ? (
                  <span className="inline-grid place-items-center rounded-full border-[3px] border-current px-3 py-1 font-scrawl text-sm uppercase tracking-wide -rotate-6 text-toffee-deep">
                    Gone home ♥
                  </span>
                ) : (
                  <span className="chip">
                    <Paw className="size-4 text-toffee" />
                    {STATUS[pup.status]}
                  </span>
                )}
                <h1 className="font-plush mt-4 text-[clamp(2.6rem,5vw,4.6rem)]">{pup.displayName}</h1>
                {pup.name && <p className="mt-2 text-lg font-semibold text-cocoa-soft">{pup.breed}</p>}
                <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4">
                  {facts.map((f) => (
                    <div key={f.term}>
                      <dt className="font-scrawl text-sm text-cocoa-soft">{f.term}</dt>
                      <dd className="mt-0.5 text-[1.05rem] font-semibold">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                {pup.description && <p className="mt-6 whitespace-pre-line text-cocoa-soft">{pup.description}</p>}
                <div className="mt-8 flex flex-col gap-3">
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                    {rehomed
                      ? "Ask about a puppy like this"
                      : `Ask about ${pup.name || "this puppy"} on WhatsApp`}
                  </a>
                  <a href={`#enquire-${pup.slug}`} className="btn btn-ghost">
                    Send an enquiry
                  </a>
                </div>
              </div>
              <div className="tp-paper mt-8 -rotate-1">
                <Chapter n={2}>
                  {"what comes with "}
                  {who}
                </Chapter>
                <h2 className="font-plush mt-1 text-[1.9rem]">Every Teddy Pup comes</h2>
                <ul className="mt-4 space-y-2.5">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-start gap-3 font-semibold">
                      <Check />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {journey && (
          <section aria-labelledby={`home-steps-${pup.slug}`} className="mt-20">
            <Chapter n={3}>the way home</Chapter>
            <h2 id={`home-steps-${pup.slug}`} className="font-plush text-big mt-3">
              {journey.heading}
            </h2>
            <ol className="tp-trail tp-trail--row tp-trail--paws mt-10">
              {journey.steps.map((s, i) => (
                <li key={s.title}>
                  <span aria-hidden className="tp-trail__num font-plush">
                    {i + 1}
                  </span>
                  <h3 className="font-plush-text text-xl font-bold leading-tight">{s.title}</h3>
                  <p className="mt-2 max-w-[38ch] text-cocoa-soft">{s.text}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section
          id={`enquire-${pup.slug}`}
          aria-labelledby={`enquire-title-${pup.slug}`}
          className="tp-letter mt-20 grid gap-10 lg:grid-cols-12"
        >
          <span aria-hidden className="tp-letter__stamp">
            <Paw className="size-9" />
          </span>
          <div className="lg:col-span-4">
            <Chapter n={journey ? 4 : 3}>dear TeddyPups…</Chapter>
            <h2 id={`enquire-title-${pup.slug}`} className="font-plush text-big mt-2">
              {rehomed ? "Looking for a puppy like this?" : `Ask about ${pup.name || "this puppy"}`}
            </h2>
            <p className="mt-4 text-cocoa-soft">
              Leave your details and our team will get back to you promptly — or message us on WhatsApp for the
              quickest reply.
            </p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <EnquiryForm
              puppy={{ id: pup.id, label: enquiryLabel(pup) }}
              success={ENQUIRY_SUCCESS}
              whatsappHref={wa}
            />
          </div>
        </section>

        {around && (
          <nav aria-label="More puppies" className="mt-16 grid gap-4 sm:grid-cols-2">
            <NeighbourLink pup={around.prev} label="Previous pup" />
            <NeighbourLink pup={around.next} label="Next pup" />
          </nav>
        )}
      </RevealScope>
    </article>
  );
}
