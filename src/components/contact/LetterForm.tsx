"use client";

import { useEffect, useId, useRef, useState, type ComponentProps } from "react";
import { sendEnquiry, type EnquiryField } from "@/app/actions/enquiry";
import { Paw } from "@/components/icons/Paw";
import { prefersReducedMotion } from "@/lib/media-query";
import { PostScene, SentPostbox } from "./PostScene";
import { useEnquiryAction } from "./useEnquiryAction";

type Phase = "writing" | "sealing" | "posting" | "sent";

type Props = {
  puppies: { id: string; label: string }[];
  success: { heading: string; body: string };
  whatsappHref: string;
};

type BlankProps = Omit<ComponentProps<"input">, "size"> & {
  name: EnquiryField;
  label: string;
  error?: string;
  /** Width of the blank, in characters. */
  size?: number;
};

/** An inline fill-in-the-blank input on the letter. */
function Blank({ name, label, error, size = 14, ...rest }: BlankProps) {
  return (
    <span className="tp-blank" style={{ "--size": `${size}ch` } as React.CSSProperties}>
      <input
        name={name}
        aria-label={label}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${name}-err` : undefined}
        {...rest}
      />
    </span>
  );
}

/** The contact enquiry, written as a letter that gets sealed and posted on success. */
export function LetterForm({ puppies, success, whatsappHref }: Props) {
  const { state, pending, onSubmit, ref: formRef } = useEnquiryAction(sendEnquiry);
  const ok = state.status === "success";
  const [phase, setPhase] = useState<Phase>("writing");
  const [minHeight, setMinHeight] = useState<number>();
  const wrapRef = useRef<HTMLDivElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const selectId = useId();
  const noteId = useId();

  useEffect(() => {
    if (!ok) return;
    const ids = prefersReducedMotion()
      ? [setTimeout(() => setPhase("sent"), 0)]
      : [
          // Lock the height so the page doesn't jump while the letter folds away.
          setTimeout(() => {
            setMinHeight(wrapRef.current?.offsetHeight);
            setPhase("sealing");
          }, 0),
          setTimeout(() => setPhase("posting"), 750),
          setTimeout(() => {
            setMinHeight(undefined);
            setPhase("sent");
          }, 1750),
        ];
    return () => ids.forEach(clearTimeout);
  }, [ok]);

  useEffect(() => {
    const el = sentRef.current;
    if (phase !== "sent" || !el) return;
    el.focus({ preventScroll: true });
    const top = el.getBoundingClientRect().top;
    const header =
      16 * parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 76;
    if (top < header + 8) {
      scrollBy({ top: top - header - 24, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  }, [phase]);

  useEffect(() => {
    if (state.status === "error" && state.errors) {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    }
  }, [state, formRef]);

  const errors = state.errors ?? {};
  const errorList = Object.entries(errors).filter(([field]) => field !== "website");

  return (
    <div ref={wrapRef} className="tp-post" data-phase={phase} style={{ minHeight }}>
      {phase !== "sent" && (
        <form
          ref={formRef}
          onSubmit={onSubmit}
          noValidate
          className="tp-letterform"
          aria-hidden={phase !== "writing" || undefined}
          inert={phase !== "writing"}
        >
          <span aria-hidden="true" className="tp-letter__stamp">
            <Paw className="size-9" />
          </span>
          <p className="font-scrawl tp-letterform__greeting">Dear TeddyPups,</p>
          {state.message && !ok && (
            <div role="alert" className="tp-letterform__alert">
              <p className="font-semibold">{state.message}</p>
              {errorList.length > 0 && (
                <ul>
                  {errorList.map(([field, msg]) => (
                    <li key={field} id={`${field}-err`}>
                      {msg}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <p className="tp-letterform__line">
            my name is{" "}
            <Blank
              name="name"
              label="Your name (required)"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              size={16}
              error={errors.name}
            />
            , and you can reach me on{" "}
            <Blank
              name="phone"
              label="Phone or WhatsApp number with country code (required)"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              size={15}
              placeholder="+971 50 123 4567"
              error={errors.phone}
            />{" "}
            or by email at{" "}
            <Blank
              name="email"
              label="Email (optional)"
              type="email"
              autoComplete="email"
              size={20}
              placeholder="optional"
              error={errors.email}
            />
            .
          </p>
          <p className="tp-letterform__line">
            I live in{" "}
            <Blank
              name="area"
              label="Your area (optional)"
              autoComplete="address-level2"
              maxLength={80}
              size={13}
              placeholder="e.g. Dubai Marina"
              error={errors.area}
            />
            , and I&apos;m curious about{" "}
            <span className="tp-blank tp-blank--select">
              <label htmlFor={selectId} className="sr-only">
                Puppy you&apos;re interested in (optional)
              </label>
              <select id={selectId} name="puppyId" defaultValue="">
                <option value="">any puppy (not sure yet)</option>
                {puppies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </span>
            .
          </p>
          <label htmlFor={noteId} className="sr-only">
            Your message (optional)
          </label>
          <textarea
            id={noteId}
            name="message"
            rows={4}
            maxLength={2000}
            placeholder="Anything else you'd like to tell us…"
            className="tp-letterform__note"
            aria-invalid={!!errors.message || undefined}
          />
          {/* Honeypot: hidden from people, irresistible to bots. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>
          <div className="tp-letterform__sign">
            <p className="font-scrawl">with love, a future puppy parent</p>
            <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-70">
              {pending ? "Sealing the envelope…" : "Post my letter"}
            </button>
          </div>
        </form>
      )}
      {(phase === "sealing" || phase === "posting") && <PostScene />}
      {phase === "sent" && (
        <div ref={sentRef} tabIndex={-1} role="status" className="tp-post__sent">
          <SentPostbox />
          <p className="font-plush mt-4 text-[2rem]">{success.heading}</p>
          <p className="mx-auto mt-2 max-w-[40ch] text-cocoa-soft">{success.body}</p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-6">
            WhatsApp us
          </a>
        </div>
      )}
    </div>
  );
}
