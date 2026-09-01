/**
 * Reader-chosen lyrics size, persisted per device.
 *
 * An external store rather than component state so the preference survives
 * navigation between kalam and is read straight from localStorage instead of
 * being copied into React state inside an effect.
 */

const STORAGE_KEY = "nem:lyrics-size";
const EVENT = "nem:lyrics-size-change";

export const MIN_SIZE = 16;
export const MAX_SIZE = 32;
/** §4 puts lyrics at 20–22px before the reader adjusts anything. */
export const DEFAULT_SIZE = 21;
export const SIZE_STEP = 2;

export function getLyricsSize(): number {
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(stored) && stored >= MIN_SIZE && stored <= MAX_SIZE) {
      return stored;
    }
  } catch {
    // Fall through to the default.
  }
  return DEFAULT_SIZE;
}

/** Server render uses the default, so first paint is never mis-sized. */
export function getServerLyricsSize(): number {
  return DEFAULT_SIZE;
}

export function subscribeToLyricsSize(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function setLyricsSize(size: number): void {
  const clamped = Math.min(MAX_SIZE, Math.max(MIN_SIZE, size));
  try {
    window.localStorage.setItem(STORAGE_KEY, String(clamped));
  } catch {
    // Preference won't persist, but the change still applies now.
  }
  window.dispatchEvent(new Event(EVENT));
}
