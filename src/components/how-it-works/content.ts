import type { BadgeIconName, StepIconName } from "./icons";

export type JourneyKey = "local" | "imported";

export type Journey = {
  key: JourneyKey;
  label: string;
  hint: string;
  heading: string;
  body: string;
  note?: string;
  steps: { icon: StepIconName; title: string; text: string }[];
};

export const JOURNEYS: Journey[] = [
  {
    key: "local",
    label: "In Dubai",
    hint: "meet in person",
    heading: "Meet your puppy in person",
    body: "Step into our Downtown Dubai showroom and experience the joy of choosing your puppy face-to-face. We source healthy, well-socialized puppies from trusted local breeders, ensuring they're raised with care, proper nutrition, and veterinary checks.",
    steps: [
      {
        icon: "find",
        title: "Explore our puppies",
        text: "Browse our website to view the available puppies. Each listing includes photos, breed details, age, and health information.",
      },
      {
        icon: "choose",
        title: "Choose your puppy",
        text: "Once you find a puppy you love, open their profile for more information or to enquire further. You can also reach out to us directly if you have any questions.",
      },
      { icon: "meet", title: "Meet before you choose", text: "Spend time bonding before making your decision." },
      {
        icon: "home",
        title: "Pick-up or delivery",
        text: "Pick up your puppy from us or have them delivered to your home within Dubai. Our delivery service is safe and reliable, ensuring your puppy arrives comfortably.",
      },
    ],
  },
  {
    key: "imported",
    label: "Imported",
    hint: "order upon request",
    heading: "Order upon request",
    body: "Looking for a truly exceptional companion? Our Order Upon Request service gives you access to some of the world's most sought-after teacup breeds — ethically sourced from the most reputable, certified breeders across Europe, Korea, and beyond.",
    note: "From Korean teacup poodles to rare Maltese, Pom, and Yorkie lines, we bring the world's finest puppies to Dubai, just for you.",
    steps: [
      {
        icon: "reserve",
        title: "Reserve your puppy",
        text: "Browse our selection of available breeds and place a reservation for the teacup puppy that captures your heart. Our reservation-only model ensures that each puppy is specifically sourced to meet your preferences.",
      },
      {
        icon: "consult",
        title: "Personalized consultation",
        text: "Once your reservation is confirmed, we will work closely with you to finalize details and provide updates on your puppy's journey.",
      },
      {
        icon: "fly",
        title: "Import and arrival",
        text: "We manage all aspects of the import process, including health checks, travel arrangements, and necessary documentation. Your puppy will be carefully transported and will arrive ready to join your family.",
      },
      {
        icon: "welcome",
        title: "Welcome home",
        text: "Upon arrival, we provide support to help your new puppy acclimate to their new environment. Our team is available for any additional assistance and to ensure a smooth transition into your home.",
      },
    ],
  },
];

export const PAGE_SECTIONS = [
  { href: "#two-ways", label: "Two ways home" },
  { href: "#promise", label: "Our premium puppy promise" },
  { href: "#delivery", label: "Delivery & collection" },
  { href: "#why", label: "Why choose us" },
];

export const PROMISES: {
  icon: BadgeIconName;
  shape: "round" | "ticket" | "oval";
  ink: string;
  tilt: number;
  title: string;
  text: string;
}[] = [
  {
    icon: "health",
    shape: "round",
    ink: "#a24a1a",
    tilt: -8,
    title: "Hand-selected breeders",
    text: "We work only with breeders who uphold the highest ethical and health standards.",
  },
  {
    icon: "plane",
    shape: "ticket",
    ink: "#1f6b45",
    tilt: 5,
    title: "Full transparency",
    text: "Photos, videos, and health certificates are shared before your puppy travels.",
  },
  {
    icon: "chat",
    shape: "oval",
    ink: "#5a3a28",
    tilt: -4,
    title: "Safe, stress-free delivery",
    text: "We handle every detail of the import process, so your puppy arrives happy, healthy, and ready to love you.",
  },
];

export const DELIVERY_OPTIONS = [
  {
    title: "Take your puppy home the same day",
    text: "Local puppies are available immediately — visit, fall in love, and go home together.",
  },
  {
    title: "Delivery within Dubai",
    text: "Prefer to stay home? We deliver your puppy to your door within Dubai, safely and comfortably.",
  },
  {
    title: "Safe international cargo",
    text: "We handle all the paperwork and ensure comfortable travel so your puppy arrives happy and stress-free.",
  },
  {
    title: "Worldwide delivery",
    text: "We safely deliver puppies to loving homes all around the world. Our trusted international cargo partners ensure your new furry friend travels comfortably and arrives safely, no matter the distance.",
  },
];

export const REASONS: { icon: BadgeIconName; title: string; text: string }[] = [
  {
    icon: "plane",
    title: "International cargo",
    text: "We safely deliver puppies to loving homes all around the world. Our trusted international cargo partners ensure your new furry friend travels comfortably and arrives safely, no matter the distance.",
  },
  {
    icon: "chat",
    title: "Support 24/7",
    text: "Our team is available 24/7 to answer your questions and assist you through every step of the adoption process. From choosing your puppy to post-delivery support — we're just a message away.",
  },
  {
    icon: "health",
    title: "Health guarantee",
    text: "All our puppies come with a verified health certificate from licensed vets. We ensure every puppy is vaccinated, dewormed, and thoroughly checked before joining your family.",
  },
];
