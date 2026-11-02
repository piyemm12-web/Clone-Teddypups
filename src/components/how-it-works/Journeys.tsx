"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { PupBuddy } from "@/components/buddy/PupBuddy";
import { Postcard } from "./Postcard";
import { STEP_ICONS } from "./icons";
import type { Journey, JourneyKey } from "./content";

const TINTS = ["#fbe3b4", "#fde6de", "#e3f0fb", "#e6f2df"];

/**
 * "Two ways home" switch: a tablist with a sliding thumb. Before hydration
 * every panel is visible, so the content still reads without JavaScript.
 */
export function Journeys({ journeys }: { journeys: Journey[] }) {
  const [selected, setSelected] = useState<JourneyKey>(journeys[0].key);
  const [ready, setReady] = useState(false);
  const tabs = useRef(new Map<JourneyKey, HTMLButtonElement>());
  const at = journeys.findIndex((j) => j.key === selected);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = journeys[(at + step + journeys.length) % journeys.length].key;
    setSelected(next);
    tabs.current.get(next)?.focus();
  };

  return (
    <section className="tp-journeys" aria-labelledby="two-ways-title" data-ready={ready || undefined}>
      <div className="tp-journeys__top">
        <div>
          <p className="font-scrawl tp-journeys__kicker">choose your way</p>
          <h2 id="two-ways-title" className="font-plush text-big">
            Two ways home
          </h2>
        </div>
        <div className="tp-journeys__pick">
          <div
            role="tablist"
            aria-label="Ways to bring your puppy home"
            className="tp-switch"
            style={{ "--at": at, "--n": journeys.length } as React.CSSProperties}
            onKeyDown={onKeyDown}
          >
            <span aria-hidden="true" className="tp-switch__thumb" />
            {journeys.map((j) => {
              const isSelected = j.key === selected;
              return (
                <button
                  key={j.key}
                  ref={(el) => {
                    if (el) tabs.current.set(j.key, el);
                    else tabs.current.delete(j.key);
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${j.key}`}
                  aria-selected={isSelected}
                  aria-controls={`panel-${j.key}`}
                  tabIndex={isSelected ? 0 : -1}
                  className="tp-switch__tab"
                  onClick={() => setSelected(j.key)}
                >
                  <span className="font-plush tp-switch__label">{j.label}</span>
                  <span className="tp-switch__hint">{j.hint}</span>
                </button>
              );
            })}
          </div>
          <PupBuddy
            pose="sit"
            act="tilt"
            className="tp-journeys__teddy"
            label="Teddy, waiting to see which way you pick"
          />
        </div>
      </div>
      {journeys.map((j) => (
        <div
          key={j.key}
          role="tabpanel"
          id={`panel-${j.key}`}
          aria-labelledby={`tab-${j.key}`}
          className="tp-journey"
          hidden={ready && selected !== j.key}
        >
          <div className="tp-journey__head">
            <div>
              <h3 className="font-plush tp-journey__title">{j.heading}</h3>
              <p className="text-lede mt-4 text-[var(--ink-soft)]">{j.body}</p>
              {j.note && <p className="font-scrawl mt-4 text-toffee-ink">{j.note}</p>}
            </div>
            <Postcard journey={j.key} />
          </div>
          <ol className="tp-steps">
            {j.steps.map((step, i) => (
              <li
                key={step.title}
                className="tp-step"
                style={{ "--i": i, "--tint": TINTS[i % TINTS.length] } as React.CSSProperties}
              >
                <span aria-hidden="true" className="tp-step__icon">
                  <svg viewBox="0 0 48 48">{STEP_ICONS[step.icon]}</svg>
                </span>
                <span className="tp-step__num font-plush">Step {i + 1}</span>
                <h4 className="font-plush-text tp-step__title">{step.title}</h4>
                <p className="tp-step__text">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}
