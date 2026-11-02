import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type SceneTone = {
  top: string;
  bottom: string;
  dark?: boolean;
  sunset?: boolean;
};

type Props = Omit<HTMLAttributes<HTMLElement>, "style"> & {
  tone: SceneTone;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const SKYLINE =
  "M0 160V118h34v-14h22v-22h30v34h18V96h26v30h22v-18h16v-30h34v40h20V70h28v56h24V98h18v-26h30v54h20v-38h26v-40l14-6 14 6v40h22v46h18V84h26v-30h22v50h24V76h36v50h20V96h18v-58h30v44h14V96h22v-30h16v22h26v-52l6-8v-24l4-6v-30l3-18 3 18v30l4 6v24l6 8v52h26v30h22V82h30v-20h24v48h20V90h28v-36h26v56h18V74h30v36h22V94h26v-24h30v62h20V102h26v20h34v38z";

/** A homepage "sky" section; `PupJourney` tracks which scene Teddy is in. */
export function Scene({ tone, className = "", style, children, ...rest }: Props) {
  return (
    <section
      data-pup-scene
      data-tone={tone.dark ? "dark" : "light"}
      className={`tp-scene ${className}`}
      style={{ "--sky-top": tone.top, "--sky-bottom": tone.bottom, ...style } as CSSProperties}
      {...rest}
    >
      {children}
      {tone.sunset && (
        <div aria-hidden="true" className="tp-horizon">
          <span className="tp-horizon__sun" />
          <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="tp-horizon__city">
            <path d={SKYLINE} />
          </svg>
        </div>
      )}
    </section>
  );
}
