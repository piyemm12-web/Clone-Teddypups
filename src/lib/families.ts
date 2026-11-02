import data from "@/data/family-photos.json";
import type { Media } from "./types";

const photos = data as unknown as Media[];

/** Photos shared by TeddyPups families, newest first (home photo wall + /happy-families). */
export function getFamilyPhotos() {
  return photos;
}

/** The featured testimonial shown next to the home photo wall. */
export const featuredTestimonial = {
  quote:
    "TeddyPups truly made our dream a reality. They supported us at every step of the import journey. Our Maltipoo arrived healthy, cheerful, and absolutely perfect. Having 24/7 support throughout the process gave us complete peace of mind.",
  author: "Sarah M.",
  location: "Dubai, UAE",
};
