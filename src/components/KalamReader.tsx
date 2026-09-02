"use client";

import {
  Check,
  Copy,
  Minus,
  Plus,
  ShareNetwork,
  TextAa,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { BookmarkButton } from "@/components/BookmarkButton";
import { site } from "@/lib/site";
import {
  MAX_SIZE,
  MIN_SIZE,
  SIZE_STEP,
  getLyricsSize,
  getServerLyricsSize,
  setLyricsSize,
  subscribeToLyricsSize,
} from "@/lib/lyrics-size";

type Props = {
  title: string;
  slug: string;
  lyrics: string;
  categoryName: string;
  categorySlug: string;
  shareUrl: string;
};

export function KalamReader({
  title,
  slug,
  lyrics,
  categoryName,
  categorySlug,
  shareUrl,
}: Props) {
  // The stored preference is an external store, so it is read directly rather
  // than copied into state by an effect — and it stays in step across pages.
  const size = useSyncExternalStore(
    subscribeToLyricsSize,
    getLyricsSize,
    getServerLyricsSize,
  );

  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2400);
    return () => clearTimeout(timer);
  }, [notice]);

  /** Blank lines separate stanzas; single newlines separate misra. */
  const stanzas = useMemo(
    () =>
      lyrics
        .replace(/\r\n/g, "\n")
        .split(/\n\s*\n/)
        .map((block) => block.split("\n").map((l) => l.trim()).filter(Boolean))
        .filter((block) => block.length > 0),
    [lyrics],
  );

  async function writeToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Older Safari and any non-secure context land here.
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(area);
        return ok;
      } catch {
        return false;
      }
    }
  }

  async function onCopy() {
    // Shared text carries the collection's attribution, so a copied kalam
    // never travels without the poet's name attached to it.
    const payload = `${title}\n\n${lyrics}\n\n${site.credit}\n${shareUrl}`;
    setNotice(
      (await writeToClipboard(payload))
        ? "Kalam copied"
        : "Could not copy — select the text and copy manually",
    );
  }

  async function onShare() {
    // Web Share where it exists; clipboard everywhere else.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: title, url: shareUrl });
        return;
      } catch (error) {
        // A user-cancelled share is not a failure — say nothing.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    setNotice(
      (await writeToClipboard(shareUrl))
        ? "Link copied"
        : "Could not copy the link",
    );
  }

  const atMin = size <= MIN_SIZE;
  const atMax = size >= MAX_SIZE;

  return (
    <div>
      <div className="glass flex flex-wrap items-center gap-2 p-2">
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label="Text size"
        >
          <TextAa size={20} aria-hidden="true" className="mx-1 text-muted" />
          <button
            type="button"
            onClick={() => setLyricsSize(size - SIZE_STEP)}
            disabled={atMin}
            aria-label="Decrease text size"
            className="tap grid place-items-center rounded-lg border border-hairline text-muted transition-colors hover:border-hairline-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={16} aria-hidden="true" />
          </button>
          {/* Announced so a keyboard/screen-reader user hears the new size. */}
          <span aria-live="polite" className="w-12 text-center text-xs text-muted">
            {size}px
          </span>
          <button
            type="button"
            onClick={() => setLyricsSize(size + SIZE_STEP)}
            disabled={atMax}
            aria-label="Increase text size"
            className="tap grid place-items-center rounded-lg border border-hairline text-muted transition-colors hover:border-hairline-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="ms-auto flex items-center gap-1">
          <BookmarkButton
            entry={{ slug, title, categoryName, categorySlug }}
            className="border border-hairline"
          />

          <button
            type="button"
            onClick={onCopy}
            className="tap flex items-center gap-2 rounded-xl border border-hairline px-3 text-sm text-muted transition-colors hover:border-hairline-strong hover:text-foreground"
          >
            <Copy size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Copy</span>
          </button>

          <button
            type="button"
            onClick={onShare}
            className="tap flex items-center gap-2 rounded-xl border border-hairline px-3 text-sm text-muted transition-colors hover:border-hairline-strong hover:text-foreground"
          >
            <ShareNetwork size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Assertive: the reader pressed a button and is owed confirmation. */}
      <p role="status" aria-live="polite" className="min-h-6">
        {notice ? (
          <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-gold">
            <Check size={16} aria-hidden="true" />
            {notice}
          </span>
        ) : null}
      </p>

      <article
        lang="ur"
        dir="rtl"
        className="glass mt-2 px-5 py-8 sm:px-10 sm:py-12"
        style={{ fontSize: `${size}px` }}
      >
        {stanzas.map((lines, blockIndex) => (
          <div key={blockIndex} className={blockIndex > 0 ? "mt-9" : undefined}>
            {lines.map((line, lineIndex) => (
              <p
                key={lineIndex}
                className="poetry-ur text-foreground"
                // Leading 2.6 comes from `poetry-ur`; the size scales with the
                // reader's choice while the ratio stays comfortable.
                style={{ fontSize: "1em" }}
              >
                {line}
              </p>
            ))}
          </div>
        ))}
      </article>
    </div>
  );
}
