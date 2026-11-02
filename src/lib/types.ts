export type Media = {
  id: string;
  url: string;
  kind: "image" | "video";
  width: number;
  height: number;
  alt: string;
  caption: string;
  focalX: number;
  focalY: number;
  color: string;
  blurDataUrl: string | null;
  durationS: number | null;
  poster: Media | null;
};

export type Gender = "male" | "female" | "male-female";
export type PuppyStatus = "available" | "reserved" | "rehomed";

export type Puppy = {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  breed: string;
  gender: Gender;
  genderLabel: string;
  age: string;
  colour: string;
  description: string;
  records: unknown[];
  status: PuppyStatus;
  featured: boolean;
  seoDescription: string;
  cover: Media;
  media: Media[];
  origin?: { slug: string; name: string };
  collections: { slug: string; name: string }[];
  breeds: { slug: string; name: string }[];
};
