import type { CSSProperties } from "react";
import { Media } from "@/components/ui/Media";
import type { Media as MediaItem } from "@/lib/types";

const TILTS = [-2.2, 1.6, -0.9, 2.4, -1.5, 0.8, -2.6, 1.2];
const TAPE_POSITIONS = ["center", "left", "right", "corners", "center", "right", "left", "center"] as const;
const TAPE_COLOURS = ["#f6d79a", "#f9cdbf", "#cfe5f6", "#f6d79a", "#e9dcc4"];

type Props = {
  media: MediaItem;
  /** Position in the wall: picks the tilt and the tape. */
  order: number;
  sizes: string;
  caption?: string;
  priority?: boolean;
};

/** A taped-up instant photo with a handwritten caption. */
export function Polaroid({ media, order, sizes, caption, priority = false }: Props) {
  const tape = TAPE_POSITIONS[order % TAPE_POSITIONS.length];
  const style = {
    "--tilt": `${TILTS[order % TILTS.length]}deg`,
    "--tape": TAPE_COLOURS[order % TAPE_COLOURS.length],
    "--i": order,
  } as CSSProperties;
  return (
    <span className="tp-polaroid" style={style}>
      {tape === "corners" ? (
        <>
          <span aria-hidden="true" className="tp-tape tp-tape--tl" />
          <span aria-hidden="true" className="tp-tape tp-tape--tr" />
        </>
      ) : (
        <span aria-hidden="true" className={`tp-tape tp-tape--${tape}`} />
      )}
      <span className="tp-polaroid__photo">
        <Media media={media} layout="natural" sizes={sizes} preload={priority} />
      </span>
      <span className="tp-polaroid__caption font-scrawl">{caption ?? media.caption}</span>
    </span>
  );
}
