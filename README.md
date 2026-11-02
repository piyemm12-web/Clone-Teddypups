# TeddyPups U.A.E. — Website Clone

A clone of [puppy.instabizweb.com](https://puppy.instabizweb.com/) built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Motion (Framer Motion v12), and Lenis.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Create optimized production build & start
npm run build
npm start
```

---

## Development Process and Project Structure

### Development Process

1. **Architecture & Deconstruction:**
   * Audited the reference platform (`puppy.instabizweb.com`) to extract route hierarchy, interactive patterns, micro-interactions, and visual assets.
   * Modeled data structures around puppies, family reviews, and delivery paths before starting UI coding.

2. **Data-First Modeling:**
   * Generated strongly typed JSON databases (`src/data/puppies.json` and `src/data/family-photos.json`) encompassing 42 detailed puppy profiles (breed, gender, origin, microchip status, dimensions, story, and image/video sets).

3. **Component-Driven Assembly:**
   * Implemented modular domain folders under `src/components/` with dedicated stylesheets to isolate complex visual interactions (e.g. Polaroid stacks, envelope letter animations, passport flip).

4. **Physics & Animation Engineering:**
   * Developed a procedural SVG mascot rig ("Teddy") driven by mathematical lerping and scroll velocity.
   * Synchronized Lenis momentum scrolling with Motion timeline triggers and an HTML5 Canvas paw-trail cursor.

---

### Project Structure

```
insta-assignement/
├── public/
│   ├── brand/               # Brand logos and vector assets
│   ├── cursor/              # Custom cursor SVGs (paw, paw-press)
│   └── media/               # Optimized image and video assets
├── src/
│   ├── app/                 # Next.js 16 App Router
│   │   ├── actions/         # Server Actions (enquiry.ts with honeypot validation)
│   │   ├── contact/         # /contact page with envelope post animation
│   │   ├── faq/             # /faq page with dynamic keyword highlighter
│   │   ├── gone-home/       # /gone-home tickets for adopted puppies
│   │   ├── happy-families/  # /happy-families Polaroid memory wall
│   │   ├── how-it-works/    # /how-it-works multi-step journey & flight map
│   │   ├── puppies/         # /puppies catalog with URL-synced filters
│   │   │   └── [slug]/      # /puppies/[slug] pre-rendered static puppy pages
│   │   ├── globals.css      # Core Tailwind v4 setup & theme design tokens
│   │   ├── layout.tsx       # Root layout with Curtain, SmoothScroll, & Header/Footer
│   │   └── page.tsx         # Homepage with hero, doors, chat, and mascot
│   ├── components/
│   │   ├── buddy/           # "Teddy" mascot procedural SVG rig, physics driver & tricks
│   │   ├── contact/         # LetterForm, PostScene, VisitCard
│   │   ├── faq/             # NoticeBoard & searchable accordion
│   │   ├── gone-home/       # TicketCard components
│   │   ├── happy-families/  # MemoryWall & polaroid lightbox integration
│   │   ├── home/            # Hero, Meet doors, Paths, Dusk, WhatsApp Chat, Passport
│   │   ├── how-it-works/    # Journeys, interactive tabs, flight postcard
│   │   ├── layout/          # Header, Footer, Curtain, PawTrailCanvas, SmoothScroll
│   │   ├── lightbox/        # Fullscreen swipeable image lightbox
│   │   ├── puppies/         # Sketchbook listing, book page-turn gallery, story ribbon
│   │   └── ui/              # Shared primitives (Media, RevealScope, Twinkles)
│   ├── data/                # Static JSON databases (puppies.json, family-photos.json)
│   ├── lib/                 # Site configuration, type definitions, and media-query hooks
│   └── styles/              # Component-scoped CSS modules imported into globals.css
├── next.config.mjs          # Next.js configuration (Turbopack, image optimization)
├── package.json             # Dependencies and project scripts
└── tsconfig.json            # Strict TypeScript configuration
```

---

### Page Directory Overview

| Route | Highlights & Features |
|---|---|
| `/` | Hero lineup, pinned horizontal "Meet the pups" doors, interactive paths, scroll-driven WhatsApp typing simulation, passport flip, photo wall, and procedural mascot. |
| `/puppies` | Sketchbook-style catalog with instant URL-synced multi-attribute filtering (origin, breed, gender, collection). |
| `/puppies/[slug]` | 42 statically pre-rendered (`generateStaticParams`) puppy profiles featuring realistic page-turn book gallery, fullscreen lightbox, story ribbon, and adoption enquiry form. |
| `/how-it-works` | Dual journey tabs (local pickup vs. international import), flight path timeline, and delivery guarantee cards. |
| `/faq` | Notice-board accordion with live keyword search and highlight matching. |
| `/contact` | Letter-style enquiry form with physical envelope sealing → posting → sent animation, plus location visit card. |
| `/gone-home` | Vintage boarding-pass tickets for rehomed puppies. |
| `/happy-families` | Polaroid memory wall with fullscreen interactive lightbox. |

---

## Technologies and Tools Used

* **Next.js 16 (App Router):** Modern React framework leveraging Turbopack, Static Site Generation (SSG) for 42 puppy pages, Partial Prerendering (PPR), and React Server Actions.
* **React 19:** Utilizing concurrent features, `<Suspense>` boundaries, and the latest server/client component paradigm.
* **TypeScript 5:** Strict type definitions across puppy schemas, filter states, and component properties.
* **Tailwind CSS v4:** Built with `@tailwindcss/turbopack` and CSS custom properties (`@theme`) for instantaneous build speeds and zero runtime CSS overhead.
* **Motion (Framer Motion v12):** Orchestrates timeline reveals, page transition curtains, and scroll progress bindings (`useScroll`).
* **Lenis (`lenis`):** Momentum-based smooth scrolling, scoped exclusively to desktop pointer devices to avoid mobile touch conflicts.
* **HTML5 Canvas API:** Custom particle rendering engine for the interactive paw-trail cursor (`PawTrailCanvas.tsx`).
* **ESLint 9 & Turbopack:** Code quality enforcement and sub-millisecond local Fast Refresh.

---

## AI Tools Used and Exact Prompts Provided

Development was accelerated using AI pair-programming (Antigravity / Claude / Cursor). Below are the exact prompts used across the core development stages:

### Prompt 1: Architectural Scoping & Data Modeling
> *"Analyze the reference website puppy.instabizweb.com. Structure a modern Next.js 16 App Router project with React 19, TypeScript, and Tailwind CSS v4. Create a comprehensive TypeScript interface for a puppy profile—covering breed, gender, origin, microchip status, health certifications, media assets (cover and gallery images), and SEO metadata. Generate a strongly typed JSON dataset for 42 puppies matching this schema."*

### Prompt 2: Procedural SVG Mascot & Physics Driver
> *"Create a procedural SVG mascot named 'Teddy' in React and TypeScript that tracks user scroll velocity and mouse position. Break it down into geometry constants (`head`, `ears`, `eyes`, `tail`, `shadow`) and an exponential smoothing physics loop (`driver.ts`) that smoothly lerps between poses like idle, peek, wag, and excited without using external 3D libraries."*

### Prompt 3: Scroll-Synchronized WhatsApp Chat Simulation
> *"Build a mobile mock chat component simulating a real WhatsApp conversation between an adopter and TeddyPups. Link message typing speed and bubble reveal directly to scroll progress using Motion `useScroll`, so each message types out and appears organically as the user scrolls through the section."*

### Prompt 4: Static Site Generation & Server Action Honeypot
> *"Implement Next.js 16 dynamic routing for `/puppies/[slug]` using `generateStaticParams` for build-time static generation of all 42 puppy pages. Add an adoption enquiry form using React Server Actions (`use server`) with strict regex validation for phone and email, plus a hidden honeypot `website` field to quietly drop bot spam submissions."*

### Prompt 5: Accessibility & Reduced Motion Handling
> *"Create a unified accessibility layer that detects `prefers-reduced-motion` and pointer precision. When reduced motion is preferred or on touch screens, cleanly disable smooth scrolling, page curtains, cursor particle trails, and procedural physics loops while keeping all content 100% functional."*

---

## Key Implementation Decisions & Challenges Faced

### Key Decisions
1. **SSG over Client-Side Fetching:** Pre-rendering all 42 puppy routes (`/puppies/[slug]`) at build time ensures instantaneous page loads, zero database latency, and optimal SEO ranking.
2. **Procedural SVG Mascot vs. Heavy 3D/Lottie:** Using pure SVG geometry and mathematical lerping (`driver.ts`) avoids multi-megabyte 3D bundles, keeping initial load times fast.
3. **Server-Side Honeypot Validation:** The `sendEnquiry` Server Action validates form input server-side and checks a hidden `website` field to eliminate spam bots without requiring third-party captcha dependencies.

### Challenges Faced & Solutions
* **Lenis Smooth Scroll & Motion Desync:** Smooth scroll libraries can interfere with native scroll coordinates used by Motion's `useScroll`. Resolved by binding Lenis updates to Motion's frame loop and strictly limiting smooth scroll to fine-pointer (mouse) devices.
* **CSS & Asset Organization:** Tailwind v4 utility classes were paired with component-scoped CSS files (`src/styles/`) to keep complex CSS keyframe animations (like envelope fold-and-post) maintainable and modular.

---

## Testing and Deployment

### Testing Strategy
* **Static Build Audit:** Verified that `npm run build` generates 53 static routes (including all 42 puppy pages) with zero TypeScript or ESLint warnings.
* **Cross-Browser & Responsive Audits:** Tested touch navigation, responsive drawer menus, and dynamic viewports across iOS Safari, Android Chrome, and Desktop browsers.
* **Server Action Validation:** Verified that malformed inputs, empty fields, and honeypot submissions are correctly handled.
* **Accessibility:** Verified keyboard navigation across tabs and confirmed that `prefers-reduced-motion` disables heavy animations.

### Deployment
* Optimized for one-click deployment on Vercel with automatic edge caching, Turbopack bundling, and CDN media delivery.
