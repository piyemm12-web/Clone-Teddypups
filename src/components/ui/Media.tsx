import Image from "next/image";
import type { CSSProperties } from "react";
import type { Media as MediaItem } from "@/lib/types";

type Props = {
  media: MediaItem;
  sizes: string;
  alt?: string;
  className?: string;
  /** Above-the-fold image: preloaded with high fetch priority. */
  preload?: boolean;
  /** Load immediately without preloading. */
  eager?: boolean;
  quality?: number;
  /** `fill` covers its positioned parent (using the focal point); `natural` keeps the intrinsic ratio. */
  layout?: "fill" | "natural";
  style?: CSSProperties;
};

/** A CMS image rendered through next/image with its blur placeholder and dominant colour. */
export function Media({
  media,
  sizes,
  alt,
  className,
  preload,
  eager,
  quality = 75,
  layout = "fill",
  style,
}: Props) {
  const common = {
    src: media.url,
    sizes,
    quality,
    preload,
    loading: preload || eager ? ("eager" as const) : ("lazy" as const),
    fetchPriority: preload ? ("high" as const) : undefined,
    placeholder: (media.blurDataUrl ?? "empty") as `data:image/${string}` | "empty",
    className,
  };
  if (layout === "natural") {
    return (
      <Image
        {...common}
        alt={alt ?? media.alt}
        width={media.width}
        height={media.height}
        style={{ width: "100%", height: "auto", backgroundColor: media.color, ...style }}
      />
    );
  }
  return (
    <Image
      {...common}
      alt={alt ?? media.alt}
      fill
      style={{
        objectFit: "cover",
        objectPosition: `${(100 * media.focalX).toFixed(1)}% ${(100 * media.focalY).toFixed(1)}%`,
        backgroundColor: media.color,
        ...style,
      }}
    />
  );
}
