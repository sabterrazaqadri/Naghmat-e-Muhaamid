"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";

import { useCommandPalette } from "@/components/CommandPalette";
import { useClientValue } from "@/lib/use-client-value";

/** userAgent rather than the deprecated navigator.platform. */
function shortcutLabel(): string {
  return /mac|iphone|ipad|ipod/i.test(navigator.userAgent) ? "⌘K" : "Ctrl K";
}

/**
 * Visible entry point to the palette. ⌘K alone is not an affordance — plenty
 * of readers will never discover it, and on touch there is no keyboard at all.
 * The shortcut hint is rendered only once we know the platform, and only on
 * pointer-capable widths.
 */
export function SearchButton({
  variant = "chrome",
}: {
  /** "chrome" sits in the header; "hero" is the wide CTA on the homepage. */
  variant?: "chrome" | "hero";
}) {
  const { open } = useCommandPalette();
  // Rendered as nothing on the server, resolved after hydration.
  const shortcut = useClientValue<string | null>(shortcutLabel, null);

  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={open}
        className="glass tap group flex h-14 w-full max-w-lg items-center gap-3 rounded-full px-6 text-start text-muted transition-all duration-300 ease-[var(--ease-out-soft)] hover:border-gold/40 hover:text-foreground hover:shadow-[0_20px_50px_-24px_var(--accent-gold-glow)]"
      >
        <MagnifyingGlass
          size={21}
          aria-hidden="true"
          className="shrink-0 transition-colors duration-300 group-hover:text-gold"
        />
        <span className="body-ur flex-1 text-sm sm:text-base">
          کلام یا موضوع تلاش کریں…
        </span>
        {shortcut ? (
          <kbd className="hidden shrink-0 rounded-md border border-hairline px-2 py-1 font-sans text-[0.7rem] sm:block">
            {shortcut}
          </kbd>
        ) : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      aria-label="کلام تلاش کریں"
      className="tap flex items-center gap-2 rounded-xl border border-hairline px-3 text-muted transition-colors hover:border-hairline-strong hover:text-foreground"
    >
      <MagnifyingGlass size={20} aria-hidden="true" />
      <span className="body-ur hidden text-sm sm:inline">تلاش</span>
      {shortcut ? (
        <kbd className="hidden rounded border border-hairline px-1.5 py-0.5 font-sans text-[0.7rem] md:inline">
          {shortcut}
        </kbd>
      ) : null}
    </button>
  );
}
