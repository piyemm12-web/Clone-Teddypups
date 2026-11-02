"use client";

import { useMemo, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { PupBuddy } from "@/components/buddy/PupBuddy";
import { RevealScope } from "@/components/ui/RevealScope";
import type { Puppy } from "@/lib/types";
import { SKETCH_SIZES, SketchCard } from "./SketchCard";

type Breed = { slug: string; name: string };
type FilterKey = "origin" | "breed" | "gender" | "collection";
const KEYS: FilterKey[] = ["origin", "breed", "gender", "collection"];

type Props = {
  puppies: Puppy[];
  breeds: Breed[];
  /** Used by the "no matches" state. */
  whatsappHref: string;
};

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className="tp-sticker-chip">
      {children}
    </button>
  );
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-scrawl mr-1 w-full shrink-0 text-cocoa-soft sm:w-28">{label}</span>
      {children}
    </div>
  );
}

/**
 * Filterable puppy listing. Filters live in the query string (`?breed=…`) and
 * are updated with `history.replaceState`, so there is no navigation or scroll.
 */
export function PuppyBrowser({ puppies, breeds, whatsappHref }: Props) {
  const params = useSearchParams();
  const pathname = usePathname();
  const f: Record<FilterKey, string> = {
    origin: params.get("origin") ?? "",
    breed: params.get("breed") ?? "",
    gender: params.get("gender") ?? "",
    collection: params.get("collection") ?? "",
  };

  /** Toggle a filter: set it, or clear it if it is already the active value. */
  const toggle = (key: FilterKey, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && f[key] !== value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  };
  const clearAll = () => window.history.replaceState(null, "", pathname);

  const list = useMemo(
    () =>
      puppies.filter(
        (p) =>
          (!f.origin || p.origin?.slug === f.origin) &&
          (!f.breed || p.breeds.some((b) => b.slug === f.breed)) &&
          (!f.gender || p.gender === f.gender || p.gender === "male-female") &&
          (!f.collection || p.collections.some((c) => c.slug === f.collection)),
      ),
    [puppies, f.origin, f.breed, f.gender, f.collection],
  );

  const filtered = KEYS.some((k) => f[k]);
  const shownBreeds = breeds.filter((b) => puppies.some((p) => p.breeds.some((pb) => pb.slug === b.slug)));
  const hasKorean = puppies.some((p) => p.collections.some((c) => c.slug === "korean-teacup"));
  const hasLocal = puppies.some((p) => p.origin?.slug === "local");

  return (
    <div>
      <div role="group" aria-label="Filter puppies" className="tp-sketchpad flex flex-col gap-4">
        <FilterRow label="where">
          <Chip active={!f.origin && !f.collection} onClick={clearAll}>
            Everywhere
          </Chip>
          {hasLocal && (
            <Chip active={f.origin === "local"} onClick={() => toggle("origin", "local")}>
              In Dubai
            </Chip>
          )}
          <Chip active={f.origin === "imported"} onClick={() => toggle("origin", "imported")}>
            Imported
          </Chip>
          {hasKorean && (
            <Chip active={f.collection === "korean-teacup"} onClick={() => toggle("collection", "korean-teacup")}>
              Korean Teacup
            </Chip>
          )}
        </FilterRow>
        <FilterRow label="breed">
          {shownBreeds.map((b) => (
            <Chip key={b.slug} active={f.breed === b.slug} onClick={() => toggle("breed", b.slug)}>
              {b.name}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="boy or girl">
          <Chip active={f.gender === "male"} onClick={() => toggle("gender", "male")}>
            Boys
          </Chip>
          <Chip active={f.gender === "female"} onClick={() => toggle("gender", "female")}>
            Girls
          </Chip>
          {filtered && (
            <button type="button" onClick={clearAll} className="link-ink ml-auto text-[0.95rem] font-semibold">
              Clear filters
            </button>
          )}
        </FilterRow>
      </div>

      <p className="font-scrawl mt-10 text-lg text-[var(--ink-soft)]" aria-live="polite">
        {list.length === 1 ? "1 puppy" : `${list.length} puppies`} {filtered ? "match" : "looking for a home"}
      </p>

      {list.length ? (
        <RevealScope>
          <m.ul layout className="tp-sketches mt-8">
            <AnimatePresence mode="popLayout">
              {list.map((p, i) => (
                <m.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.86 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.86, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                >
                  <SketchCard pup={p} index={i} sizes={SKETCH_SIZES} preload={i < 3} />
                </m.li>
              ))}
            </AnimatePresence>
          </m.ul>
        </RevealScope>
      ) : (
        <div className="tp-sketchpad mt-10 grid items-center gap-6 md:grid-cols-[auto_1fr] md:gap-10">
          <PupBuddy pose="sit" act="tilt" className="mx-auto w-44 md:w-52" label="Teddy, tilting his head" />
          <div>
            <p className="font-plush text-big">No puppies match just now.</p>
            <p className="mt-3 max-w-[48ch] text-cocoa-soft">
              Tell us what you&apos;re hoping for and we&apos;ll let you know what&apos;s in our showroom or what we
              can bring in for you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                Ask on WhatsApp
              </a>
              <button type="button" onClick={clearAll} className="btn btn-ghost">
                Show all puppies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
