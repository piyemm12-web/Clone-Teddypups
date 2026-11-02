import type { CSSProperties } from "react";
import {
  CHEEK,
  COLLAR,
  CREAM,
  EYE_Y,
  FUR,
  FUR_FAR,
  GROUND_Y,
  INK,
  LEGS,
  PARTS,
  POSES,
  VIEW_H,
  VIEW_W,
  frameFor,
  toes,
  type PoseName,
} from "./geometry";

const STROKE = {
  stroke: INK,
  strokeWidth: 3.4,
  strokeLinejoin: "round",
  strokeLinecap: "round",
} as const;
const LINE = { ...STROKE, fill: "none" } as const;

type LegProps = {
  part: string;
  d: string;
  len: number;
  fill: string;
  transform: string;
  opacity?: number;
};

function Leg({ part, d, len, fill, transform, opacity }: LegProps) {
  return (
    <g data-p={part} transform={transform} opacity={opacity}>
      <path d={`${d}Z`} fill={fill} />
      <path d={d} {...LINE} />
      <path d={toes(len)} {...LINE} strokeWidth={2.4} />
    </g>
  );
}

function Eyes() {
  return (
    <>
      <ellipse cx={194} cy={EYE_Y} rx={7.4} ry={8.6} fill={INK} />
      <ellipse cx={230} cy={EYE_Y} rx={7.4} ry={8.6} fill={INK} />
      <circle cx={196.6} cy={EYE_Y - 3.4} r={2.7} fill="#fff" />
      <circle cx={232.6} cy={EYE_Y - 3.4} r={2.7} fill="#fff" />
      <circle cx={192} cy={EYE_Y + 3.2} r={1.2} fill="#fff" />
      <circle cx={228} cy={EYE_Y + 3.2} r={1.2} fill="#fff" />
    </>
  );
}

export type Facing = "left" | "right";

type Props = {
  pose?: PoseName;
  facing?: Facing;
  className?: string;
  label?: string;
  style?: CSSProperties;
};

/**
 * Teddy, drawn as an SVG rig. Every moving part is tagged with `data-p` so
 * `PupDriver` can drive it frame by frame after hydration.
 */
export function PupSvg({ pose = "sit", facing = "right", className, label, style }: Props) {
  const f = frameFor(POSES[pose]);
  const flip = facing === "left" ? `translate(${VIEW_W} 0) scale(-1 1)` : undefined;
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={className}
      style={{ overflow: "visible", ...style }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={!label || undefined}
      focusable="false"
    >
      <g data-p="root" transform={flip}>
        <ellipse
          data-p="shadow"
          {...PARTS.shadow}
          fill={INK}
          opacity={f.shadowOpacity}
          transform={f.shadow}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
        <g data-p="body" transform={f.body} opacity={f.side}>
          <Leg part="bf" d={LEGS.backFar} len={GROUND_Y - 192} fill={FUR_FAR} transform={f.bf} opacity={f.backLegs} />
          <Leg part="ff" d={LEGS.frontFar} len={GROUND_Y - 192} fill={FUR_FAR} transform={f.ff} />
          <g data-p="tail" transform={f.tail}>
            <path d={PARTS.tailStem} {...LINE} strokeWidth={9} />
            <path d={PARTS.tailStem} stroke={FUR} strokeWidth={4} fill="none" strokeLinecap="round" />
            <path d={PARTS.tail} fill={FUR} {...STROKE} />
          </g>
          <Leg part="bn" d={LEGS.back} len={GROUND_Y - 194} fill={FUR} transform={f.bn} opacity={f.backLegs} />
          <path d={PARTS.body} fill={FUR} {...STROKE} />
          <path d={PARTS.chest} fill={FUR} {...STROKE} />
          <Leg part="fn" d={LEGS.front} len={GROUND_Y - 194} fill={FUR} transform={f.fn} />
        </g>
        <g data-p="haunch" opacity={f.haunchOpacity} transform={f.haunch}>
          <path d={PARTS.haunch} fill={FUR} {...STROKE} />
          <path d={PARTS.haunchPaw} fill={FUR} {...STROKE} />
          <path d="M132 222v5M139 222v5" {...LINE} strokeWidth={2.4} />
        </g>
        <g data-p="head" transform={f.head}>
          <path d={PARTS.collar} fill={COLLAR} {...STROKE} strokeWidth={3} />
          <path d={PARTS.tag} fill={CREAM} {...STROKE} strokeWidth={2.4} />
          <path data-p="earL" d={PARTS.earL} fill={FUR_FAR} {...STROKE} transform={f.earL} />
          <path data-p="earR" d={PARTS.earR} fill={FUR_FAR} {...STROKE} transform={f.earR} />
          <path d={PARTS.head} fill={FUR} {...STROKE} />
          <path d={PARTS.topknot} fill={FUR} {...STROKE} strokeWidth={3} />
          <path d={PARTS.muzzle} fill={CREAM} />
          <circle cx={181} cy={116} r={7} fill={CHEEK} opacity={0.85} />
          <circle cx={243} cy={116} r={7} fill={CHEEK} opacity={0.85} />
          <g data-p="eyes" transform={f.eyes}>
            <g data-p="open" opacity={f.openEyes}>
              <g data-p="blink" transform={f.blink}>
                <Eyes />
              </g>
            </g>
          </g>
          <path
            data-p="happy"
            d="M186.5 101 Q194 91.5 201.5 101 M222.5 101 Q230 91.5 237.5 101"
            {...LINE}
            opacity={f.happyEyes}
          />
          <path
            data-p="shut"
            d="M186.5 97 Q194 103.5 201.5 97 M222.5 97 Q230 103.5 237.5 97"
            {...LINE}
            opacity={f.shutEyes}
          />
          <path d={PARTS.nose} fill={INK} />
          <path d={PARTS.mouth} {...LINE} strokeWidth={3} />
          <path
            data-p="tongue"
            d={PARTS.tongue}
            fill="#e98c8c"
            stroke={INK}
            strokeWidth={2.2}
            strokeLinejoin="round"
            opacity={f.tongue}
          />
          <g data-p="mouth" opacity={f.mouth}>
            <path d={PARTS.mouthOpen} fill="#6b2a1c" {...STROKE} strokeWidth={2.6} />
            <path d="M206.5 133.5 Q212 130 217.5 133.5 Q215 138 212 138 Q209 138 206.5 133.5 Z" fill="#e98c8c" />
          </g>
        </g>
        <g data-p="ledge" opacity={f.ledge}>
          <path d={PARTS.ledgePaws} fill={FUR} {...STROKE} />
          <path d={PARTS.ledgeToes} {...LINE} strokeWidth={2.4} />
        </g>
      </g>
    </svg>
  );
}
