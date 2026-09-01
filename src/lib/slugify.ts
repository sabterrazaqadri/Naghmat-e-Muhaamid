/**
 * Urdu-safe slugify.
 *
 * The usual `latinise → strip non-ASCII` recipe reduces an Urdu title to an
 * empty string, so every kalam collapses onto the same slug. Instead we keep
 * every Unicode *letter* (Arabic script included) and only drop the things
 * that genuinely do not belong in a URL path segment:
 *
 *  - harakat / combining marks, which are invisible but break equality
 *  - zero-width joiners and bidi control characters, which are invisible
 *    AND survive percent-encoding, producing two slugs that look identical
 *  - punctuation and whitespace, which become a single hyphen
 *
 * The result is percent-encoded by the browser but stays human-readable in
 * the address bar and round-trips exactly. Escapes are spelled out rather
 * than written literally so the ranges survive copy-paste and diffing.
 */

/** Arabic harakat, superscript alef, and Qur'anic annotation marks. */
const DIACRITICS = /[ً-ٰٟۖ-ۭؐ-ؚ]/g;
/** Zero-width joiners, bidi embedding/isolate controls, BOM, soft hyphen. */
const INVISIBLES = /[​-‏‪-‮⁦-⁩﻿­]/g;
/** Straight and curly quotes are dropped outright rather than hyphenated. */
const QUOTES = /['‘’"“”`]/g;
/** Everything that is not a Unicode letter or digit collapses to one hyphen. */
const NON_WORD = /[^\p{L}\p{N}]+/gu;

export function slugify(input: string): string {
  const slug = input
    .normalize("NFKC")
    .replace(DIACRITICS, "")
    .replace(INVISIBLES, "")
    .replace(QUOTES, "")
    .toLowerCase()
    .replace(NON_WORD, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/^-+|-+$/g, "");

  return slug || "kalam";
}

/**
 * Appends -2, -3, … until the slug is free.
 *
 * `isTaken` is async so the caller can hit the database; the loop is bounded
 * so a misbehaving predicate can never spin forever.
 */
export async function uniqueSlug(
  input: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(input);

  if (!(await isTaken(base))) return base;

  for (let n = 2; n < 500; n++) {
    const candidate = `${base}-${n}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  // Practically unreachable; keeps the return type honest.
  return `${base}-${Date.now().toString(36)}`;
}
