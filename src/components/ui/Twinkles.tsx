export type Star = { left: string; top: string; size: number };

const STAR_PATH =
  "M20 3c1.6 9.4 7.6 15.4 17 17-9.4 1.6-15.4 7.6-17 17-1.6-9.4-7.6-15.4-17-17 9.4-1.6 15.4-7.6 17-17z";

export function Sparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden="true">
      <path d={STAR_PATH} fill="currentColor" />
    </svg>
  );
}

/** A field of gently twinkling four-point stars. */
export function Twinkles({
  stars,
  className = "text-honey",
  step = 0.4,
}: {
  stars: Star[];
  className?: string;
  step?: number;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {stars.map((s, i) => (
        <Sparkle
          key={i}
          className={`tp-twinkle absolute ${className}`}
          style={{ left: s.left, top: s.top, width: `${s.size}px`, animationDelay: `${(i * step).toFixed(2)}s` }}
        />
      ))}
    </div>
  );
}
