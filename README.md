# TeddyPups U.A.E. — website clone

A clone of [puppy.instabizweb.com](https://puppy.instabizweb.com/) built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **motion** and **Lenis**.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Pages

| Route | What's there |
|---|---|
| `/` | Hero with peeking puppy lineup, pinned horizontal "Meet the pups" doors, paths, WhatsApp chat that types on scroll, passport, photo wall + lightbox, Q&A, CTA, scroll-following mascot |
| `/puppies` | Sketchbook listing with URL-synced filters (origin, breed, gender, collection) |
| `/puppies/[slug]` | 42 statically generated puppy pages: gallery with page-turn + fullscreen swipe viewer, story ribbon, enquiry form |
| `/how-it-works` | Two journeys (local / imported) as keyboard-accessible tabs, plane flight path, delivery section |
| `/faq` | Searchable notice-board accordion with highlighted matches |
| `/contact` | Letter-style enquiry form with sealing → posting → sent animation, visit card |
| `/gone-home` | Tickets for rehomed puppies |
| `/happy-families` | Polaroid memory wall with lightbox |

## Structure

```
src/
  app/                 routes, layout, server action (actions/enquiry.ts)
  components/
    layout/            Header, Footer, Curtain (page transitions), SmoothScroll, PawTrailCanvas, MobileMenu
    buddy/             "Teddy" mascot: procedural SVG rig, physics driver, tricks, PupJourney
    home/ puppies/ faq/ contact/ how-it-works/ gone-home/ happy-families/   page sections
    lightbox/ ui/      shared pieces (useLightbox, Polaroid, Media, RevealScope, Twinkles)
  data/                puppies + family photos (JSON)
  lib/                 site config, data access, types, media-query hooks
  styles/              component CSS, one file per area (imported by app/globals.css)
public/media           images and videos
```

## Notes

- Enquiry forms post to a Next server action that validates input server-side (with a honeypot field). There is no backend, so valid enquiries are accepted and logged.
- Reduced-motion preferences are respected: no curtain, smooth scroll, mascot animation or reveals.
- Smooth scrolling and the paw cursor/trail are enabled only for fine-pointer (mouse) devices.
