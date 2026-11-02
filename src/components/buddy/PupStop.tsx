import type { CSSProperties } from "react";
import type { PoseName } from "./geometry";
import { PupBuddy, type PupAct } from "./PupBuddy";
import type { Facing } from "./PupSvg";

type Props = {
  pose: PoseName;
  facing?: Facing;
  /** Special behaviour when Teddy is at this stop. */
  act?: PupAct;
  /** Teddy hides behind the scenery here (hops out of / dives into it). */
  behind?: boolean;
  /** Also a stop in the mobile "lane" journey. */
  lane?: boolean;
  className?: string;
  style?: CSSProperties;
  label?: string;
};

/**
 * A place on the page where Teddy sits. On the homepage `PupJourney` reads
 * these anchors and walks a single actor between them; elsewhere (and before
 * the journey starts) the interactive `PupBuddy` here is what you see.
 */
export function PupStop({
  pose,
  facing = "right",
  act,
  behind = false,
  lane = false,
  className = "",
  style,
  label,
}: Props) {
  return (
    <div
      data-pup-stop
      data-pose={pose}
      data-facing={facing}
      data-act={act}
      data-behind={behind || undefined}
      data-lane={lane || undefined}
      className={`pup-stop ${className}`}
      style={style}
    >
      <PupBuddy pose={pose} facing={facing} label={label} asStop />
    </div>
  );
}
