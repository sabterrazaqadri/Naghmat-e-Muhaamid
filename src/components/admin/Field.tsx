import type { ReactNode } from "react";

/** Shared label + error scaffolding so every admin input behaves the same. */
export function Field({
  id,
  label,
  hint,
  error,
  required = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>

      <div className="mt-2">{children}</div>

      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}

      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "h-11 w-full rounded-xl border border-hairline bg-elevated px-3 text-base text-foreground outline-none transition-colors placeholder:text-muted focus:border-gold";

export const inputErrorClass =
  "h-11 w-full rounded-xl border border-destructive bg-elevated px-3 text-base text-foreground outline-none transition-colors placeholder:text-muted focus:border-gold";
