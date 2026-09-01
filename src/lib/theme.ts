/**
 * Theme as an external store.
 *
 * The source of truth is the DOM attribute the boot script sets before first
 * paint, falling back to the OS preference — not React state. Modelling it as
 * a store (rather than syncing it into state inside an effect) means the
 * toggle reads the same value the CSS is already using, and every mounted
 * toggle stays in step.
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "nem:theme";
const EVENT = "nem:theme-change";

export function getTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/** The server cannot know the visitor's preference; the control stays neutral. */
export function getServerTheme(): Theme | null {
  return null;
}

export function subscribeToTheme(onChange: () => void): () => void {
  const query = window.matchMedia("(prefers-color-scheme: light)");

  window.addEventListener(EVENT, onChange);
  query.addEventListener("change", onChange);

  return () => {
    window.removeEventListener(EVENT, onChange);
    query.removeEventListener("change", onChange);
  };
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable — the choice still applies for this session.
  }
  window.dispatchEvent(new Event(EVENT));
}
