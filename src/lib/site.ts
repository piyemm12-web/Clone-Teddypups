export const site = {
  name: "TeddyPups U.A.E.",
  shortName: "TeddyPups",
  url: "https://puppy.instabizweb.com",
  tagline: "every puppy is family",
  description:
    "TeddyPups U.A.E. is a Dubai-based brand specializing in miniature puppies, offering premium services and worldwide shipping.",
  phone: "+971541676733",
  phoneDisplay: "+971 54 167 6733",
  email: "teddypupsadmin@gmail.com",
  address: "Downtown Dubai, United Arab Emirates",
  copyrightYear: 2026,
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/teddypups.worldwide/" },
    { label: "TikTok", href: "https://www.tiktok.com/@teddypupsuae" },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61567496944539" },
  ],
} as const;

/** Build a wa.me deep link with a pre-filled message. */
export function whatsappHref(message = "Hi TeddyPups! I'd love to know more about your puppies.") {
  return `https://wa.me/${site.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/puppies", label: "Puppies" },
  { href: "/happy-families", label: "Happy families" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Visit & contact" },
] as const;

export const footerNav = [
  { href: "/puppies", label: "Available puppies" },
  { href: "/gone-home", label: "Gone home" },
  { href: "/happy-families", label: "Happy families" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/how-it-works#delivery", label: "Delivery & collection" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Visit & contact" },
] as const;
