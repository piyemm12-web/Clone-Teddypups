"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cuePup } from "@/components/buddy/PupJourney";
import { PupStop } from "@/components/buddy/PupStop";
import { Scene, type SceneTone } from "@/components/buddy/Scene";
import { PAW_PATH } from "@/components/icons/Paw";
import { Media } from "@/components/ui/Media";
import { useMediaQuery, useReducedMotion } from "@/lib/media-query";
import type { Media as MediaItem } from "@/lib/types";

type Step = { title: string; text: string };

type Props = {
  heading: string;
  body?: string;
  items: Step[];
  ctaLabel?: string;
  ctaHref?: string;
  media: MediaItem[];
  tone: SceneTone;
  business: string;
  /** The visitor's opening message. */
  greeting: string;
  whatsappHref: string;
  breeds: { slug: string; name: string }[];
};

/**
 * "Your puppy journey": the steps on the left, and a WhatsApp chat on the right
 * that types out each step's reply as you scroll down to it (desktop only;
 * on small screens and with reduced motion the whole chat is shown).
 */
export function Chat({
  heading,
  body,
  items,
  ctaLabel,
  ctaHref = "/how-it-works",
  media,
  tone,
  business,
  greeting,
  whatsappHref,
  breeds,
}: Props) {
  const images = media.filter((item) => item.kind === "image").slice(0, 4);
  const video = media.find((item) => item.kind === "video") ?? null;
  const desktop = useMediaQuery("(min-width: 1024px)");
  const still = useReducedMotion() || !desktop;
  const [active, setActive] = useState(-1);
  const [typing, setTyping] = useState(false);
  const stepsRef = useRef<HTMLOListElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const shown = still ? items.length - 1 : active;

  // The step crossing the upper-middle of the screen is the active one.
  useEffect(() => {
    if (still || !stepsRef.current) return;
    const steps = [...stepsRef.current.children];
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) setActive(steps.indexOf(en.target));
      },
      { rootMargin: "-28% 0px -62% 0px" },
    );
    steps.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [still, items.length]);

  // Moving forward: show "typing…" briefly, then the reply, and point Teddy at it.
  const last = useRef(-1);
  useEffect(() => {
    if (still) return;
    const forward = active > last.current;
    last.current = active;
    if (!forward || active < 0) return;
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      const group = screenRef.current?.querySelector(`[data-step="${active}"]`);
      if (group)
        cuePup({
          look: group,
          secs: 1.4,
          say: active === 1 ? "ooh, photos!" : active === 2 ? "home soon!" : undefined,
        });
    }, 750);
    return () => clearTimeout(t);
  }, [active, still]);

  return (
    <Scene tone={tone} aria-labelledby="journey-title" className="tp-chat">
      <div className="tp-chat__grid gutter" data-pin-range>
        <div className="tp-chat__story">
          <h2 id="journey-title" className="font-plush text-huge">
            {heading}
          </h2>
          {body && <p className="text-lede mt-5 max-w-[42ch] text-[var(--ink-soft)]">{body}</p>}
          <ol ref={stepsRef} className="tp-chat__steps">
            {items.map((item, i) => (
              <li
                key={item.title}
                className="tp-chat__step"
                data-active={i === shown || undefined}
                data-done={i < shown || undefined}
              >
                <span className="tp-chat__num font-plush" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="font-plush tp-chat__title">{item.title}</h3>
                <p className="tp-chat__text">{item.text}</p>
              </li>
            ))}
          </ol>
          {ctaLabel && (
            <Link href={ctaHref} className="btn btn-ghost tp-chat__cta">
              {ctaLabel}
            </Link>
          )}
        </div>
        <div className="tp-chat__side">
          <div className="tp-phone" role="group" aria-label={`A WhatsApp conversation with ${business}`}>
            <div className="tp-phone__bar">
              <Image src="/brand/logo.png" alt="" width={40} height={40} className="tp-phone__avatar" />
              <span>
                <span className="tp-phone__name">{business}</span>
                <span className="tp-phone__status">{typing ? "typing…" : "online"}</span>
              </span>
            </div>
            <div ref={screenRef} className="tp-phone__screen">
              <p className="tp-msg tp-msg--me">{greeting}</p>
              {items.map((item, i) => (
                <div
                  key={item.title}
                  className="tp-msg-group"
                  data-step={i}
                  data-show={i < shown || (i === shown && !typing) ? "true" : "false"}
                >
                  <Reply step={i} text={item.text} images={images} video={video} breeds={breeds} />
                </div>
              ))}
              <p className="tp-typing" data-show={typing ? "true" : "false"} aria-hidden="true">
                <span />
                <span />
                <span />
              </p>
            </div>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="tp-phone__compose">
              <span>Say hello on WhatsApp</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 20l18-8L3 4v6l12 2-12 2z" />
              </svg>
            </a>
          </div>
          <PupStop pose="sit" className="tp-chat__teddy" />
        </div>
      </div>
    </Scene>
  );
}

/** The business's reply for one step: breed chips, then photos + video, then a delivery route. */
function Reply({
  step,
  text,
  images,
  video,
  breeds,
}: {
  step: number;
  text: string;
  images: MediaItem[];
  video: MediaItem | null;
  breeds: Props["breeds"];
}) {
  if (step === 0 && breeds.length)
    return (
      <div className="tp-msg tp-msg--them">
        <p>{text}</p>
        <ul className="tp-chips" aria-label="Breeds we have now">
          {breeds.slice(0, 6).map((b) => (
            <li key={b.slug}>
              <Link href={`/puppies?breed=${b.slug}`}>{b.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    );
  if (step === 1)
    return (
      <>
        {images.length > 0 && (
          <div className="tp-msg tp-msg--them tp-msg--media">
            <div className="tp-snaps">
              {images.map((img) => (
                <span key={img.id} className="tp-snaps__one">
                  <Media media={img} sizes="9rem" />
                </span>
              ))}
            </div>
          </div>
        )}
        {video && <VideoClip media={video} />}
        <p className="tp-msg tp-msg--them">{text}</p>
      </>
    );
  if (step === 2)
    return (
      <div className="tp-msg tp-msg--them">
        <p>{text}</p>
        <svg viewBox="0 0 220 70" className="tp-route" aria-hidden="true">
          <path d="M14 52 C 60 6, 120 70, 170 28" className="tp-route__line" />
          <circle cx="14" cy="52" r="5" className="tp-route__dot" />
          <path d="M164 32 l12 -12 l12 12 v14 h-24 z" className="tp-route__home" />
          <path d="M176 42 c-2-3-7-2-6 2c1 3 6 5 6 5s5-2 6-5c1-4-4-5-6-2z" className="tp-route__heart" />
          <path d={PAW_PATH} transform="translate(70 22) scale(.3) rotate(70 32 32)" className="tp-route__paw" />
          <path d={PAW_PATH} transform="translate(104 38) scale(.3) rotate(100 32 32)" className="tp-route__paw" />
        </svg>
      </div>
    );
  return <p className="tp-msg tp-msg--them">{text}</p>;
}

function VideoClip({ media }: { media: MediaItem }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused)
      video
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    else {
      video.pause();
      setPlaying(false);
    }
  };
  return (
    <div className="tp-msg tp-msg--them tp-msg--media">
      <div className="tp-clip">
        <video
          ref={ref}
          src={media.url}
          poster={media.poster?.url}
          muted
          loop
          playsInline
          preload="none"
          aria-label={media.alt || "A puppy video"}
          onEnded={() => setPlaying(false)}
        />
        <button
          type="button"
          className="tp-clip__play"
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? "Pause video" : "Play video"}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={playing ? "M7 5h3v14H7zM14 5h3v14h-3z" : "M8 5v14l11-7z"} />
          </svg>
        </button>
      </div>
    </div>
  );
}
