import { Skyline } from "./icons";
import type { JourneyKey } from "./content";

/** Little animated postcard beside each journey: a sky route for imports, the skyline for local. */
export function Postcard({ journey }: { journey: JourneyKey }) {
  if (journey === "imported") {
    return (
      <div aria-hidden="true" className="tp-postcard tp-postcard--sky">
        <svg viewBox="0 0 320 150" className="tp-postcard__route" preserveAspectRatio="none">
          <path d="M28 128C90 20 230 20 292 118" />
        </svg>
        <svg viewBox="0 0 64 40" className="tp-postcard__plane" aria-hidden="true">
          <path
            d="M4 22l20-2 12-14h6l-6 14 14-1 6-7h4l-3 10 3 10h-4l-6-7-14-1 6 14h-6L24 24 4 22z"
            fill="#fffdf8"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-scrawl tp-postcard__from">Europe · Korea</span>
        <span className="font-scrawl tp-postcard__to">Dubai</span>
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="tp-postcard">
      <span className="tp-postcard__sun" />
      <Skyline className="tp-postcard__city" />
      <span className="font-scrawl tp-postcard__to tp-postcard__to--left">Downtown Dubai</span>
    </div>
  );
}
