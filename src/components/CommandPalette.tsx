"use client";

import {
  ArrowElbowDownLeft,
  BookOpenText,
  FolderSimple,
  MagnifyingGlass,
  WarningCircle,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Highlight } from "@/components/Highlight";
import { SkeletonResultRow } from "@/components/Skeleton";
import { bestMatch, normalizeQuery, type MatchRange } from "@/lib/fuzzy";

type SearchIndex = {
  kalam: Array<{
    id: string;
    title: string;
    slug: string;
    categoryName: string;
    categorySlug: string;
  }>;
  categories: Array<{ name: string; slug: string; kalamCount: number }>;
};

type Result = {
  id: string;
  kind: "kalam" | "category";
  href: string;
  title: string;
  subtitle: string;
  ranges: MatchRange[];
};

/** Survives close/reopen so the palette is instant after the first fetch. */
let indexCache: SearchIndex | null = null;

const PaletteContext = createContext<{ open: () => void } | null>(null);

export function useCommandPalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) {
    throw new Error("useCommandPalette must be used inside CommandPaletteProvider");
  }
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      {isOpen ? <PaletteDialog onClose={close} /> : null}
    </PaletteContext.Provider>
  );
}

function PaletteDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndex | null>(indexCache);
  const [status, setStatus] = useState<"idle" | "loading" | "error">(
    indexCache ? "idle" : "loading",
  );
  const [active, setActive] = useState(0);

  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  // Fetch once, then serve every later open from the module cache.
  useEffect(() => {
    if (indexCache) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/search");
        if (!response.ok) throw new Error(String(response.status));
        const data = (await response.json()) as SearchIndex;
        if (cancelled) return;
        indexCache = data;
        setIndex(data);
        setStatus("idle");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Take focus, remember where it came from, and freeze the page behind.
  useEffect(() => {
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
      restoreFocusTo.current?.focus?.();
    };
  }, []);

  const results = useMemo<Result[]>(() => {
    if (!index) return [];

    const normalized = normalizeQuery(query);

    const categories: Result[] = index.categories.map((c) => ({
      id: `category:${c.slug}`,
      kind: "category" as const,
      href: `/${c.slug}`,
      title: c.name,
      subtitle: `${c.kalamCount} kalam`,
      ranges: [],
    }));

    const kalam: Result[] = index.kalam.map((k) => ({
      id: `kalam:${k.id}`,
      kind: "kalam" as const,
      href: `/kalam/${encodeURIComponent(k.slug)}`,
      title: k.title,
      subtitle: k.categoryName,
      ranges: [],
    }));

    // Empty query is a browse affordance, not a dead end.
    if (!normalized) return [...categories, ...kalam.slice(0, 8)];

    const scored: Array<Result & { score: number }> = [];

    for (const c of index.categories) {
      const match = bestMatch([c.name, c.slug], normalized);
      if (!match) continue;
      scored.push({
        id: `category:${c.slug}`,
        kind: "category",
        href: `/${c.slug}`,
        title: c.name,
        subtitle: `${c.kalamCount} kalam`,
        // Only highlight when the name itself matched, not the latin slug.
        ranges: match.fieldIndex === 0 ? match.ranges : [],
        score: match.score + 40,
      });
    }

    for (const k of index.kalam) {
      const match = bestMatch([k.title, k.categoryName], normalized);
      if (!match) continue;
      scored.push({
        id: `kalam:${k.id}`,
        kind: "kalam",
        href: `/kalam/${encodeURIComponent(k.slug)}`,
        title: k.title,
        subtitle: k.categoryName,
        ranges: match.fieldIndex === 0 ? match.ranges : [],
        score: match.score,
      });
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, 24);
  }, [index, query]);

  // Reset the cursor when the query changes. Adjusting state during render is
  // React's sanctioned alternative to an effect here: it happens before the
  // browser paints, so the highlight never lands on a stale row for a frame.
  const [queryAtReset, setQueryAtReset] = useState(query);
  if (queryAtReset !== query) {
    setQueryAtReset(query);
    setActive(0);
  }

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${active}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active, results.length]);

  const go = useCallback(
    (result: Result | undefined) => {
      if (!result) return;
      onClose();
      router.push(result.href);
    },
    [onClose, router],
  );

  function onKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        onClose();
        break;
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => (results.length ? (i + 1) % results.length : 0));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) =>
          results.length ? (i - 1 + results.length) % results.length : 0,
        );
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(Math.max(0, results.length - 1));
        break;
      case "Enter":
        event.preventDefault();
        go(results[active]);
        break;
      case "Tab": {
        // Minimal focus trap: the dialog holds a handful of focusables, so
        // wrapping at the ends is enough to keep Tab from escaping to the page
        // underneath while it is inert.
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'input, button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) break;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        break;
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh] sm:pt-[16vh]"
      onKeyDown={onKeyDown}
    >
      <div
        className="absolute inset-0 bg-[color-mix(in_oklab,var(--bg-deep)_72%,transparent)] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search kalam"
        className="glass-strong relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden"
      >
        <div className="flex items-center gap-3 border-b border-hairline px-4">
          <MagnifyingGlass
            size={20}
            aria-hidden="true"
            className="shrink-0 text-muted"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            // Readers may type either script, so let the browser decide.
            dir="auto"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-autocomplete="list"
            aria-activedescendant={
              results.length ? `palette-option-${active}` : undefined
            }
            placeholder="Search kalam or topics…"
            className="h-14 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted"
          />
          <kbd className="hidden shrink-0 rounded border border-hairline px-1.5 py-0.5 font-sans text-[0.7rem] text-muted sm:block">
            Esc
          </kbd>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {status === "loading" ? (
            <div aria-live="polite" aria-busy="true">
              <span className="sr-only">Loading search index</span>
              <SkeletonResultRow />
              <SkeletonResultRow />
              <SkeletonResultRow />
              <SkeletonResultRow />
            </div>
          ) : status === "error" ? (
            <p
              role="alert"
              dir="rtl"
              className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted"
            >
              <WarningCircle size={20} aria-hidden="true" />
              Could not load the index. Please try again.
            </p>
          ) : results.length === 0 ? (
            <p
              dir="rtl"
              className="px-4 py-10 text-center text-sm text-muted"
            >
              No kalam matched “{query}”.
            </p>
          ) : (
            <ul id="palette-list" role="listbox" ref={listRef} className="py-2">
              {results.map((result, i) => (
                <li
                  key={result.id}
                  id={`palette-option-${i}`}
                  data-idx={i}
                  role="option"
                  aria-selected={i === active}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => go(result)}
                    onMouseMove={() => setActive(i)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-start transition-colors ${
                      i === active
                        ? "bg-[color-mix(in_oklab,var(--accent-gold)_14%,transparent)]"
                        : ""
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-9 shrink-0 place-items-center rounded-lg border border-hairline text-gold"
                    >
                      {result.kind === "category" ? (
                        <FolderSimple size={18} />
                      ) : (
                        <BookOpenText size={18} />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        lang="ur"
                        dir="rtl"
                        className="heading-ur block truncate text-[0.98rem] text-foreground"
                      >
                        <Highlight text={result.title} ranges={result.ranges} />
                      </span>
                      <span
                        lang="ur"
                        dir="rtl"
                        className="body-ur block truncate text-xs leading-6 text-muted"
                      >
                        {result.subtitle}
                      </span>
                    </span>

                    {i === active ? (
                      <ArrowElbowDownLeft
                        size={16}
                        aria-hidden="true"
                        className="shrink-0 text-muted"
                      />
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="hidden items-center justify-start gap-3 border-t border-hairline px-4 py-2 text-[0.7rem] text-muted sm:flex">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
        </p>
      </div>
    </div>
  );
}
