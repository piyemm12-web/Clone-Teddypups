"use client";

import { useActionState, useRef, useTransition, type FormEvent } from "react";
import type { EnquiryState } from "@/app/actions/enquiry";

type Action = (prev: EnquiryState, formData: FormData) => Promise<EnquiryState>;

/** Wires a form's submit to a server action through useActionState, without a full-page post. */
export function useEnquiryAction(action: Action) {
  const [state, dispatch, isPending] = useActionState(action, { status: "idle" });
  const [transitioning, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
  return { state, pending: isPending || transitioning, onSubmit, ref };
}
