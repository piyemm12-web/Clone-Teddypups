import type { Media } from "@/lib/types";

/** Sky gradient (and mood) of each homepage scene, from morning to night. */
export const TONES = {
  hero: { top: "#fffdf8", bottom: "#fff1d8" },
  meet: { top: "#fff1d8", bottom: "#fbe3b4" },
  paths: { top: "#fbe3b4", bottom: "#f7d18d" },
  chat: { top: "#f7d18d", bottom: "#f0b866" },
  passport: { top: "#f0b866", bottom: "#a65a30", sunset: true },
  dusk: { top: "#a65a30", bottom: "#4d2b19", dark: true },
  night: { top: "#4d2b19", bottom: "#2f1a10", dark: true },
  home: { top: "#2f1a10", bottom: "#24130b", dark: true },
} as const;

export const hero = {
  note: "every puppy is family",
  lines: ["Premium teacup", "puppies in Dubai"],
  lede: "Meet your new best friend in our Dubai showroom, or order a rare miniature breed from trusted breeders worldwide.",
  primary: { href: "/puppies", label: "View available puppies" },
  whatsappLabel: "Enquire on WhatsApp",
};

export const meet = {
  heading: "Meet the pups",
  body: "Real puppies, real photos, looking for their families right now.",
  ctaLabel: "See all available puppies",
  ctaHref: "/puppies",
};

const showroomPhoto: Media = {
  id: "FHyoHcIosLZE",
  url: "/media/FHyoHcIosLZE/60f6e7e00a/27b888_323008bb0f6a41d4bde2a0da7206cd98f000.jpg",
  kind: "image",
  width: 1080,
  height: 1920,
  alt: "A tiny apricot teddy bear puppy held up in the TeddyPups showroom",
  caption: "",
  focalX: 0.543,
  focalY: 0.483,
  color: "#685848",
  blurDataUrl:
    "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAAAwAgCdASoJABAAA4BaJagCdAYsPa/VDxL9UAD3ijFiguQB2eFNqPYWHG7xQl6qNka061mi/fjBYY8RZf3XsP1kS88Rn71djwmYWvypWKajnQAPamia5Uxpl7StGuPRQAA=",
  durationS: null,
  poster: null,
};

export const paths = {
  heading: "Two ways to meet your puppy",
  local: {
    sign: "Puppies in Dubai",
    photo: showroomPhoto,
    caption: "In our showroom",
    text: "See them, love them, take them home. Come meet our locally available puppies before you decide.",
    cta: { href: "/puppies?origin=local", label: "Meet local puppies" },
  },
  imported: {
    sign: "Imported for you",
    text: "Exclusive Korean teacup puppies, delivered. Order from the world's most reputable breeders and let us handle the import.",
    cta: { href: "/puppies?origin=imported", label: "See imported puppies" },
  },
};

export const journey = {
  heading: "Your puppy journey",
  body: "A premium, step-by-step concierge experience. We make adoption simple, secure, and purely joyful.",
  ctaLabel: "How it works",
  ctaHref: "/how-it-works",
  items: [
    {
      title: "Choose your breed",
      text: "Select your preferred breed or tell us what you're looking for. We'll guide you based on availability and your lifestyle.",
    },
    {
      title: "Get photos & details",
      text: "Our team will share real photos, health details, and all necessary information directly on WhatsApp.",
    },
    {
      title: "Secure & safe delivery",
      text: "Once confirmed, we handle everything professionally and ensure your puppy reaches you safely and stress-free.",
    },
  ],
  media: [
    showroomPhoto,
    {
      id: "Vi-kzyvemRl4",
      url: "/media/Vi-kzyvemRl4/e740ed8a24/27b888_323008bb0f6a41d4bde2a0da7206cd98f001.jpg",
      kind: "image",
      width: 1080,
      height: 1920,
      alt: "The apricot teddy bear puppy from our showroom, close up",
      caption: "",
      focalX: 0.46,
      focalY: 0.444,
      color: "#685848",
      blurDataUrl:
        "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAAAwAgCdASoJABAAA4BaJbACdAYulaXCmQDQAADfhiF+Ktn7reztFQp53jgf/NMeaIMaQ509IW5fc59BS8HJxLDTXLbfTZv6eU+nlZ8rte63C1bCNZrnQSnGo8AAAA==",
      durationS: null,
      poster: null,
    },
    {
      id: "g_e4ebbc7fyG",
      url: "/media/g_e4ebbc7fyG/8276289ae7/27b888_323008bb0f6a41d4bde2a0da7206cd98f002.jpg",
      kind: "image",
      width: 1080,
      height: 1920,
      alt: "The apricot teddy bear puppy from our showroom, looking up",
      caption: "",
      focalX: 0.437,
      focalY: 0.402,
      color: "#080818",
      blurDataUrl:
        "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAADwAQCdASoJABAAA4BaJbACdADcV8YgXoAA/IlXZyFLf/thAj7OWEY0SeDLuiZIyZ9j3rjOwzrKQHktciqrqLiqs+3bHHqiIi4ewyT8UjeAM0NGWglOcDueIQIAAA==",
      durationS: null,
      poster: null,
    },
    {
      id: "skvodl2NZiKq",
      url: "/media/skvodl2NZiKq/cefab5eee9/27b888_323008bb0f6a41d4bde2a0da7206cd98f003.jpg",
      kind: "image",
      width: 1080,
      height: 1920,
      alt: "The apricot teddy bear puppy from our showroom, held up to say hello",
      caption: "",
      focalX: 0.453,
      focalY: 0.444,
      color: "#685848",
      blurDataUrl:
        "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAAAwAgCdASoJABAAA4BaJbACdAYtza4BbcHsAADiF1VEqDVt16ac+uAmdBB2LI4q3G/6Bl/9tetZIF+8zMdSr3JKQa/JOA7nZQIC4SJVG9giEvNF2iUQveGdBkyGxtAA",
      durationS: null,
      poster: null,
    },
    {
      id: "dSAUmXs8Qai9",
      url: "/media/dSAUmXs8Qai9/ef39cbea20/27b888_323008bb0f6a41d4bde2a0da7206cd98-720p.mp4",
      kind: "video",
      width: 406,
      height: 720,
      alt: "Video of a tiny apricot teddy bear puppy in the TeddyPups showroom",
      caption: "",
      focalX: 0.5,
      focalY: 0.4,
      color: "#f2be6b",
      blurDataUrl: null,
      durationS: 15.581,
      poster: showroomPhoto,
    },
  ] satisfies Media[],
};

export type Stamp = {
  title: string;
  text: string;
  ink: string;
  tilt: number;
  shape: "round" | "ticket" | "oval" | "scallop";
  icon: "health" | "plane" | "chat" | "globe";
};

export const trust = {
  kicker: "puppy passport",
  heading: "Why families trust TeddyPups",
  stamps: [
    {
      title: "Vet-checked & healthy",
      text: "Every puppy comes vaccinated, dewormed, and with a verified health certificate.",
      ink: "#a24a1a",
      tilt: -8,
      shape: "round",
      icon: "health",
    },
    {
      title: "Korea to Dubai, safely",
      text: "Trusted breeders, safe travel, and premium care from start to finish.",
      ink: "#1f6b45",
      tilt: 5,
      shape: "ticket",
      icon: "plane",
    },
    {
      title: "Support 24/7",
      text: "Always here to help, from choosing your puppy to post-delivery support.",
      ink: "#5a3a28",
      tilt: -4,
      shape: "oval",
      icon: "chat",
    },
    {
      title: "Trusted by families worldwide",
      text: "Puppies delivered to loving homes all around the world.",
      ink: "#c2622b",
      tilt: 7,
      shape: "scallop",
      icon: "globe",
    },
  ] satisfies Stamp[],
};

export const families = {
  heading: "Happy families & puppies",
  body: "We are truly honored to see our puppies become cherished members of loving families. These heartwarming moments have been shared by our valued clients who welcomed a Teddy Pup into their homes and hearts.",
  ctaLabel: "See every happy family",
  ctaHref: "/happy-families",
};

export const questions = {
  heading: "Questions, answered",
  cta: { href: "/faq", label: "Read all questions" },
  /** The first two catch Teddy's eye (`data-pup-look`). */
  items: [
    {
      q: "Are your puppies vaccinated and health-checked?",
      a: "Yes. All our puppies come with a verified health certificate from licensed vets. Every puppy is vaccinated, dewormed, and thoroughly checked before joining your family.",
      look: true,
    },
    {
      q: "Can I meet a puppy before I decide?",
      a: "Yes. Come meet our locally available puppies in our Downtown Dubai showroom and spend time bonding before making your decision.",
      look: true,
    },
    {
      q: "Can I take my puppy home the same day?",
      a: "Local puppies are available immediately, so you can take your puppy home the same day.",
      look: false,
    },
  ],
  /** Night sky: [left %, top %, size px]. */
  stars: [
    [8, 12, 16.2],
    [22, 30, 9],
    [41, 8, 12.6],
    [57, 22, 8.1],
    [72, 6, 14.4],
    [88, 18, 10.8],
    [95, 42, 9],
    [4, 58, 10.8],
    [34, 70, 7.2],
    [63, 84, 9.9],
    [83, 66, 12.6],
  ] as const,
};

export const cta = {
  heading: "Ready to meet your new best friend?",
  lede: "Bring home a healthy, happy teacup or designer puppy with expert guidance every step of the way. We help you find the right match and ensure a smooth, safe delivery across the UAE.",
  whatsappLabel: "Enquire on WhatsApp",
  contact: { href: "/contact", label: "Visit & contact" },
  mat: "welcome home",
};
