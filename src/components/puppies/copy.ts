import { site, whatsappHref } from "@/lib/site";
import type { Puppy, PuppyStatus } from "@/lib/types";

/**
 * Same labels as `STATUS_LABEL` in `@/lib/puppies`, repeated here so client
 * components using this module don't pull the whole puppy dataset into the bundle.
 */
export const STATUS: Record<PuppyStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  rehomed: "Gone home",
};

/** Screen-reader label for a puppy card, e.g. "Copper, Cavapoo, boy, 2 months, available". */
export function cardLabel(p: Puppy) {
  return `${p.displayName}${p.name ? `, ${p.breed}` : ""}, ${p.genderLabel.toLowerCase()}${
    p.age ? `, ${p.age}` : ""
  }, ${STATUS[p.status].toLowerCase()}`;
}

/** "Copper (Cavapoo)" for named puppies, otherwise the display name. */
export function enquiryLabel(p: Puppy) {
  return p.name ? `${p.name} (${p.breed})` : p.displayName;
}

/** "Copper" or "this Korean Teacup Maltipoo". */
export function referTo(p: Puppy) {
  return p.name || `this ${p.displayName}`;
}

export function puppyUrl(p: Puppy) {
  return `${site.url}/puppies/${p.slug}`;
}

export function puppyWhatsappHref(p: Puppy) {
  const url = puppyUrl(p);
  if (p.status === "rehomed") {
    const who = p.name || `the ${p.displayName}`;
    return whatsappHref(`Hi TeddyPups! I loved ${who} (${url}). Do you have a puppy like them?`);
  }
  const who = p.name
    ? `${p.name}, the ${p.breed}`
    : `the ${p.displayName} (${p.genderLabel.toLowerCase()})`;
  return whatsappHref(`Hi TeddyPups! I'm interested in ${who}: ${url}`);
}

export function hasVideo(p: Puppy) {
  return p.media.some((m) => m.kind === "video");
}

/** SEO title and description, matching the reference wording. */
export function puppySeo(p: Puppy) {
  const title = p.name
    ? `${p.name}, ${p.breed} puppy`
    : `${p.displayName} puppy (${p.genderLabel.toLowerCase()})`;
  const where = p.origin?.slug === "local" ? "in Dubai" : "imported";
  const facts = [p.breed, p.genderLabel.toLowerCase(), p.age && `${p.age} old`, where]
    .filter(Boolean)
    .join(", ");
  const description =
    p.seoDescription ||
    `Meet ${referTo(p)}: ${facts}. Real photos${hasVideo(p) ? " and video" : ""} from ${site.name}`;
  return { title, description };
}
