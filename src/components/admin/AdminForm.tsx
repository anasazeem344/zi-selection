"use client";

import { useActionState, useEffect, useRef, useTransition, type ReactNode } from "react";
import type { FormState } from "@/lib/actions/admin";

/** Form with pending state and an inline success / error message. */
export function AdminForm({
  action,
  submitLabel = "Save",
  children,
  className = "",
  resetOnSuccess = false,
  buttonClass = "btn btn-gold",
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  submitLabel?: string;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  buttonClass?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <p role="status" aria-live="polite" className={`text-sm ${state.error ? "text-danger" : "text-ok"}`}>
          {state.error ?? (state.ok ? (state.message ?? "Saved.") : "")}
        </p>
      </div>
    </form>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="label">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

/** Button that runs a server action on click, optionally after a confirm() prompt. */
export function ActionButton({
  action,
  confirmText,
  children,
  className = "",
  onDone,
  ariaLabel,
}: {
  action: () => Promise<FormState>;
  confirmText?: string;
  children: ReactNode;
  className?: string;
  onDone?: () => void;
  ariaLabel?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={pending}
      className={className}
      onClick={() => {
        if (confirmText && !window.confirm(confirmText)) return;
        start(async () => {
          const res = await action();
          if (res.error) window.alert(res.error);
          else onDone?.();
        });
      }}
    >
      {children}
    </button>
  );
}
