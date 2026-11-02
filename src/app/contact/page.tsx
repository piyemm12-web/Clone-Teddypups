import type { Metadata } from "next";
import { PupBuddy } from "@/components/buddy/PupBuddy";
import { LetterForm } from "@/components/contact/LetterForm";
import { VisitCard } from "@/components/contact/VisitCard";
import { getAvailablePuppies } from "@/lib/puppies";
import { site, whatsappHref } from "@/lib/site";
import type { Puppy } from "@/lib/types";

export const metadata: Metadata = {
  title: "Visit & contact",
  description: "Visit TeddyPups in Downtown Dubai or get in touch on WhatsApp, by phone or email.",
};

const SUCCESS = {
  heading: "Message received!",
  body: "Thank you — our team will get back to you promptly. For the quickest reply, message us on WhatsApp.",
};

/** "Max (Maltipoo, boy)" for named puppies, "Shih Tzu (girl)" otherwise. */
const optionLabel = (p: Puppy) =>
  p.name ? `${p.name} (${p.breed}, ${p.genderLabel.toLowerCase()})` : `${p.displayName} (${p.genderLabel.toLowerCase()})`;

export default function ContactPage() {
  const puppies = getAvailablePuppies().map((p) => ({ id: p.id, label: optionLabel(p) }));
  const wa = whatsappHref();
  return (
    <div data-page="contact" className="tp-page">
      <section
        data-pup-scene="true"
        data-tone="light"
        className="tp-scene "
        style={{ "--sky-top": "#fff9ee", "--sky-bottom": "#f9dca4" } as React.CSSProperties}
        aria-labelledby="contact-title"
      >
        <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <h1 id="contact-title" className="font-plush text-giant max-w-[12ch] lg:col-span-7">
              Get in touch with us
            </h1>
            <p className="text-lede text-[var(--ink-soft)] lg:col-span-5 lg:pb-3">
              Have questions about our puppies or adoption process? Fill out the form, and our team will get back to
              you promptly. Whether ready to adopt or just seeking info, we&apos;d love to hear from you!
            </p>
          </header>
          <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1">
              <LetterForm puppies={puppies} success={SUCCESS} whatsappHref={wa} />
              <PupBuddy
                pose="sit"
                facing="left"
                className="ml-auto mr-6 -mt-3 w-36 md:w-40"
                label="Teddy, waiting for your letter"
              />
            </div>
            <div className="lg:col-span-5 lg:row-start-1">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp w-full sm:w-auto">
                WhatsApp {site.phoneDisplay}
              </a>
              <dl className="mt-10 space-y-6">
                <div>
                  <dt className="font-scrawl text-[var(--ink-soft)]">call us</dt>
                  <dd className="mt-1 text-lg font-semibold">
                    <a className="link-ink" href={`tel:${site.phone}`}>
                      {site.phoneDisplay}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-scrawl text-[var(--ink-soft)]">email</dt>
                  <dd className="mt-1 break-all text-lg font-semibold">
                    <a className="link-ink" href={`mailto:${site.email}`}>
                      {site.email}
                    </a>
                  </dd>
                </div>
              </dl>
              <VisitCard />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
