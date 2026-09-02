"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";

import {
  getServerTheme,
  getTheme,
  setTheme,
  subscribeToTheme,
} from "@/lib/theme";

/**
 * The theme is applied by an inline script in <head> before first paint, so
 * this control only reports and flips what is already there. It renders
 * icon-neutral on the server — the server cannot know the visitor's OS
 * preference, and guessing would be a hydration mismatch.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getTheme,
    getServerTheme,
  );

  const label = theme === "light" ? "Switch to dark mode" : "Switch to light mode";

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={label}
      title={label}
      className="tap grid place-items-center rounded-xl border border-hairline text-muted transition-colors hover:border-hairline-strong hover:text-foreground"
    >
      {theme === "light" ? (
        <Moon size={20} aria-hidden="true" />
      ) : (
        <Sun size={20} aria-hidden="true" />
      )}
    </button>
  );
}
