/**
 * localStorage-backed bookmarks.
 *
 * No account, no server, no auth — a reader can keep a personal list without
 * ever identifying themselves. Exposed as an external store so components can
 * read it through `useSyncExternalStore`, which keeps SSR output (always
 * empty) and the hydrated client in agreement instead of warning.
 */

export type Bookmark = {
  slug: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  /** Epoch ms, used to show most-recently-saved first. */
  savedAt: number;
};

const KEY = "nem:bookmarks";
const EVENT = "nem:bookmarks-change";
const EMPTY: Bookmark[] = [];

/** `getSnapshot` must be referentially stable or React re-renders forever. */
let cachedRaw: string | null = null;
let cachedValue: Bookmark[] = EMPTY;

function parse(raw: string | null): Bookmark[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (b): b is Bookmark =>
        typeof b === "object" &&
        b !== null &&
        typeof (b as Bookmark).slug === "string" &&
        typeof (b as Bookmark).title === "string",
    );
  } catch {
    return EMPTY;
  }
}

export function getBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return EMPTY;

  const raw = window.localStorage.getItem(KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

/** Server render and first client render must match: both see nothing. */
export function getServerBookmarks(): Bookmark[] {
  return EMPTY;
}

export function subscribeToBookmarks(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(EVENT, onChange);
  // `storage` only fires in *other* tabs, which is exactly the gap the custom
  // event fills for the tab that made the change.
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function commit(next: Bookmark[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private-browsing quota errors must not take the page down.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function isBookmarked(slug: string): boolean {
  return getBookmarks().some((b) => b.slug === slug);
}

/** Adds or removes, and reports the resulting state so the UI can announce it. */
export function toggleBookmark(entry: Omit<Bookmark, "savedAt">): boolean {
  const current = getBookmarks();
  const exists = current.some((b) => b.slug === entry.slug);

  commit(
    exists
      ? current.filter((b) => b.slug !== entry.slug)
      : [{ ...entry, savedAt: Date.now() }, ...current],
  );

  return !exists;
}

export function removeBookmark(slug: string): void {
  commit(getBookmarks().filter((b) => b.slug !== slug));
}

export function clearBookmarks(): void {
  commit([]);
}
