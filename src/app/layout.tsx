import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces, Shantell_Sans } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { Curtain } from "@/components/layout/Curtain";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { MotionProvider } from "@/components/layout/MotionProvider";
import { PawTrailCanvas } from "@/components/layout/PawTrailCanvas";
import { site } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const shantell = Shantell_Sans({
  subsets: ["latin"],
  variable: "--font-shantell",
  axes: ["BNCE", "INFM"],
  display: "swap",
});

const title = "TeddyPups U.A.E. — Premium teacup puppies in Dubai";
const description =
  "Teddy bear and teacup puppies in Dubai. Meet local puppies in our Downtown Dubai showroom or bring home a rare breed imported from trusted breeders.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s | ${site.name}` },
  description,
  applicationName: site.name,
  openGraph: { title, description, images: ["/brand/logo.png"] },
  twitter: { card: "summary_large_image", title, description, images: ["/brand/logo.png"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fffdf8",
};

const storeJsonLd = {
  "@context": "https://schema.org",
  "@type": "PetStore",
  name: site.name,
  description: site.description,
  url: site.url,
  logo: `${site.url}/brand/logo.png`,
  image: `${site.url}/brand/logo.png`,
  telephone: site.phone,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address,
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
  sameAs: site.socials.map((s) => s.href),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${figtree.variable} ${shantell.variable}`}>
      <body>
        <MotionProvider>
        <Curtain />
        <a
          href="#main"
          className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-full bg-cocoa px-5 py-3 font-semibold text-milk"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="relative pt-[var(--header-h)] outline-none">
          {children}
        </main>
        <Footer />
        <MobileActionBar />
        <SmoothScroll />
        <PawTrailCanvas />
        </MotionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
      </body>
    </html>
  );
}
