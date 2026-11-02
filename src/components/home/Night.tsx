import Link from "next/link";
import { PupStop } from "@/components/buddy/PupStop";
import { Scene } from "@/components/buddy/Scene";
import { Sparkle } from "@/components/ui/Twinkles";
import { questions, TONES } from "./data";

/** Night: a few common questions under the stars, with a puzzled Teddy. */
export function Night() {
  return (
    <Scene tone={TONES.night} className="tp-night" aria-labelledby="questions-title">
      <div aria-hidden="true" className="pointer-events-none tp-night__stars">
        {questions.stars.map(([left, top, size], i) => (
          <Sparkle
            key={i}
            className="tp-twinkle absolute text-honey"
            style={{ left: `${left}%`, top: `${top}%`, width: `${size}px`, animationDelay: `${(i * 0.4).toFixed(2)}s` }}
          />
        ))}
      </div>
      <div className="tp-night__grid gutter">
        <div className="tp-night__intro">
          <h2 id="questions-title" className="font-plush text-huge">
            {questions.heading}
          </h2>
          <Link href={questions.cta.href} className="btn btn-ghost tp-night__cta">
            {questions.cta.label}
          </Link>
          <div className="tp-night__pup">
            <span aria-hidden="true" className="tp-night__wonder font-plush">
              ?
            </span>
            <PupStop pose="sit" act="tilt" className="tp-night__teddy" />
          </div>
        </div>
        <dl className="tp-night__list">
          {questions.items.map((item) => (
            <div key={item.q} className="tp-qa" data-pup-look={item.look ? "" : undefined}>
              <dt className="font-plush tp-qa__q">
                <Sparkle className="tp-qa__star" />
                {item.q}
              </dt>
              <dd className="tp-qa__a">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Scene>
  );
}
