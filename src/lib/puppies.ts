import data from "@/data/puppies.json";
import type { Puppy, PuppyStatus } from "./types";

const puppies = data as unknown as Puppy[];

export const STATUS_LABEL: Record<PuppyStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  rehomed: "Gone home",
};

/** All breeds offered in the filters, in display order. */
export const BREEDS = [
  { slug: "maltipoo", name: "Maltipoo" },
  { slug: "pomeranian", name: "Pomeranian" },
  { slug: "poodle", name: "Poodle" },
  { slug: "cavapoo", name: "Cavapoo" },
  { slug: "shih-tzu", name: "Shih Tzu" },
  { slug: "maltese", name: "Maltese" },
  { slug: "bichon", name: "Bichon" },
  { slug: "pomsky", name: "Pomsky" },
];

export function getAvailablePuppies() {
  return puppies.filter((p) => p.status !== "rehomed");
}

export function getPuppy(slug: string) {
  return puppies.find((p) => p.slug === slug);
}

export function getAllPuppies() {
  return puppies;
}
