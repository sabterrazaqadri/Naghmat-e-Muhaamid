"use client";

import { CircleNotch } from "@phosphor-icons/react";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/**
 * Must be rendered *inside* the <form> it submits — `useFormStatus` reads the
 * nearest form above it in the tree, so hoisting this into the form's own
 * component would leave `pending` permanently false.
 */
export function SubmitButton({
  children,
  tone = "primary",
  icon,
  className = "",
}: {
  children: ReactNode;
  tone?: "primary" | "ghost" | "danger";
  icon?: ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  const tones = {
    primary:
      "bg-gold text-gold-contrast hover:opacity-90 disabled:opacity-60",
    ghost:
      "border border-hairline text-foreground hover:border-hairline-strong disabled:opacity-60",
    danger:
      "border border-destructive text-destructive hover:bg-[color-mix(in_oklab,var(--destructive)_12%,transparent)] disabled:opacity-60",
  } as const;

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`tap inline-flex items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-all disabled:cursor-not-allowed ${tones[tone]} ${className}`}
    >
      {pending ? (
        <CircleNotch size={16} aria-hidden="true" className="animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
