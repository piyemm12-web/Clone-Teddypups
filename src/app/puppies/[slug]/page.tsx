import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PuppyStory } from "@/components/puppies/PuppyStory";
import { puppySeo } from "@/components/puppies/copy";
import { getAllPuppies, getPuppy } from "@/lib/puppies";

export function generateStaticParams() {
  return getAllPuppies().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/puppies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pup = getPuppy(slug);
  if (!pup) return {};
  const { title, description } = puppySeo(pup);
  const image = pup.cover && {
    url: pup.cover.url,
    width: pup.cover.width,
    height: pup.cover.height,
    alt: pup.cover.alt,
  };
  return {
    title,
    description,
    alternates: { canonical: `/puppies/${pup.slug}` },
    openGraph: { title, description, images: image ? [image] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

async function Story({ params }: { params: PageProps<"/puppies/[slug]">["params"] }) {
  const { slug } = await params;
  const pup = getPuppy(slug);
  if (!pup) notFound();
  return <PuppyStory pup={pup} />;
}

export default function PuppyPage({ params }: PageProps<"/puppies/[slug]">) {
  return (
    <div data-page="pup" className="tp-page">
      <Suspense fallback={<div className="gutter mx-auto min-h-[80vh] max-w-[110rem] pt-16" aria-busy="true" />}>
        <Story params={params} />
      </Suspense>
    </div>
  );
}
