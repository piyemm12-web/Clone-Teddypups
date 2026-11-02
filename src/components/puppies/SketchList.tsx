import type { Puppy } from "@/lib/types";
import { SketchCard } from "./SketchCard";

/** Static, unfiltered sketch grid: the server-rendered stand-in for `PuppyBrowser`. */
export function SketchList({ puppies, className = "tp-sketches mt-20" }: { puppies: Puppy[]; className?: string }) {
  return (
    <ul className={className}>
      {puppies.map((p, i) => (
        <li key={p.id}>
          <SketchCard pup={p} index={i} />
        </li>
      ))}
    </ul>
  );
}
