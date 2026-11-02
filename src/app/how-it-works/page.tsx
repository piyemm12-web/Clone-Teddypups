import type { Metadata } from "next";
import Link from "next/link";
import { PupBuddy } from "@/components/buddy/PupBuddy";
import { Flight } from "@/components/home/Flight";
import { Journeys } from "@/components/how-it-works/Journeys";
import { BADGE_ICONS, Skyline } from "@/components/how-it-works/icons";
import {
  DELIVERY_OPTIONS,
  JOURNEYS,
  PAGE_SECTIONS,
  PROMISES,
  REASONS,
} from "@/components/how-it-works/content";
import { whatsappHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Meet a local puppy in our Downtown Dubai showroom or reserve a premium teacup breed imported for you — every step, from choosing to coming home.",
};

export default function HowItWorksPage() {
  return (
    <div data-page="how" className="tp-page">
      <section
        data-pup-scene="true"
        data-tone="light"
        className="tp-scene "
        style={{ "--sky-top": "#fffbf3", "--sky-bottom": "#f6cc85" } as React.CSSProperties}
        aria-labelledby="how-title"
      >
        <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <header className="grid gap-8 md:grid-cols-12 md:items-end">
            <h1 id="how-title" className="font-plush text-giant md:col-span-7">
              How it works
            </h1>
            <p className="text-lede text-[var(--ink-soft)] md:col-span-5 md:pb-4">
              Whether you choose to visit us locally or order a premium breed from overseas, TeddyPups is here to make
              the experience unforgettable.
            </p>
          </header>

          <nav aria-label="On this page" className="mt-10 flex flex-wrap gap-2">
            {PAGE_SECTIONS.map((s, i) => (
              <a key={s.href} href={s.href} className="chip h-11 border-2 border-cocoa !bg-milk px-4 hover:!bg-honey-soft">
                <span className="font-plush text-toffee">{i + 1}</span>
                {s.label}
              </a>
            ))}
          </nav>

          <div id="two-ways">
            <Journeys journeys={JOURNEYS} />
          </div>

          <section id="promise" aria-labelledby="promise-title" className="tp-paper mt-24 -rotate-[0.6deg]">
            <p aria-hidden="true" className="font-scrawl text-lg text-toffee-ink">
              puppy passport
            </p>
            <h2 id="promise-title" className="font-plush text-huge mt-1 max-w-[16ch]">
              Our premium puppy promise
            </h2>
            <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {PROMISES.map((p, i) => (
                <li
                  key={p.title}
                  className="tp-entry"
                  style={{ "--ink-stamp": p.ink, "--tilt": `${p.tilt}deg`, "--i": i } as React.CSSProperties}
                >
                  <span className={`tp-stamp tp-stamp--${p.shape}`}>
                    <svg viewBox="0 0 64 64" className="tp-stamp__icon" aria-hidden="true">
                      {BADGE_ICONS[p.icon]}
                    </svg>
                    <span className="tp-stamp__title font-plush">{p.title}</span>
                  </span>
                  <p className="tp-entry__text">{p.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="delivery" aria-labelledby="delivery-title" className="mt-24 grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 id="delivery-title" className="font-plush text-huge">
                Delivery &amp; collection
              </h2>
              <p className="text-lede mt-5 text-[var(--ink-soft)]">
                From a same-day visit in Downtown Dubai to a flight from Korea, every puppy travels comfortably and
                arrives safely.
              </p>
              <ul className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                {DELIVERY_OPTIONS.map((d) => (
                  <li key={d.title}>
                    <h3 className="font-plush-text text-[1.3rem] font-bold leading-snug">{d.title}</h3>
                    <p className="mt-1.5 text-[var(--ink-soft)]">{d.text}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[clamp(14rem,30vw,22rem)] lg:col-span-6">
              <Skyline className="absolute inset-x-0 bottom-0 w-full text-cocoa/25" />
              <Flight photo={null} label="A plane flying puppies from Korea to Dubai" />
            </div>
          </section>

          <section id="why" aria-labelledby="why-title" className="mt-24 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="why-title" className="font-plush text-huge">
                Why choose us
              </h2>
              <p className="text-lede mt-6 text-[var(--ink-soft)]">
                We&apos;re here to help you find a new family member. From the moment you visit our site to the joyful
                day your puppy arrives at your door, we&apos;re with you every step of the way. Our mission is to make
                the entire adoption process smooth, transparent, and full of love.
              </p>
            </div>
            <ul className="space-y-8 lg:col-span-6 lg:col-start-7">
              {REASONS.map((r) => (
                <li key={r.title} className="flex gap-5">
                  <svg viewBox="0 0 64 64" className="size-14 shrink-0 text-toffee-deep" aria-hidden="true">
                    {BADGE_ICONS[r.icon]}
                  </svg>
                  <div>
                    <h3 className="font-plush text-[1.7rem]">{r.title}</h3>
                    <p className="mt-2 text-[var(--ink-soft)]">{r.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="care-title"
            className="tp-board mt-24 grid items-center gap-8 md:grid-cols-[1fr_auto] md:!p-12"
          >
            <div>
              <h2 id="care-title" className="font-plush text-big">
                Unique and high quality puppies
              </h2>
              <p className="text-lede measure mt-5 text-cocoa-soft">
                When you choose TeddyPups, you can trust that you&apos;re getting a puppy of the highest quality. We also
                provide guidance and support to new pet owners, offering advice on training, nutrition, and general care
                to ensure a smooth transition for you and your new furry friend.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                  Ask us on WhatsApp
                </a>
                <Link className="btn btn-ghost" href="/puppies">
                  See available puppies
                </Link>
              </div>
            </div>
            <PupBuddy pose="bow" facing="left" className="mx-auto w-48 md:w-56" label="Teddy, ready to play" />
          </section>
        </div>
      </section>
    </div>
  );
}
