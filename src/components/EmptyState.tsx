import type { ReactNode } from "react";

/**
 * Empty states carry an icon, a plain statement of what happened, and a way
 * forward — a lone "کوئی نتیجہ نہیں" leaves the reader with nowhere to go.
 */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span
        aria-hidden="true"
        className="grid size-14 place-items-center rounded-full bg-[color-mix(in_oklab,var(--accent-gold)_14%,transparent)] text-gold"
      >
        {icon}
      </span>
      <h2 className="font-display text-2xl text-foreground">{title}</h2>
      <p className="max-w-sm text-[0.95rem] leading-7 text-muted">{body}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
