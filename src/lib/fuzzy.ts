/**
 * Fuzzy matching for the command palette.
 *
 * Written for Urdu first. A reader types "سلام" without harakat even when the
 * stored title carries them, so matching runs over a normalised copy of the
 * string — diacritics and invisible bidi/joiner characters removed — while the
 * highlight ranges it returns are indices into the *original* string. The
 * index map is what keeps those two views aligned; without it, highlighting
 * silently drifts by one character per stripped diacritic.
 */

const DIACRITIC = /[ً-ٰٟۖ-ۭؐ-ؚ]/;
const INVISIBLE = /[​-‏‪-‮⁦-⁩﻿­]/;
const BOUNDARY = /[\s\-–—_/،,.:؛;()[\]"'“”]/;

type Normalized = { text: string; map: number[] };

function normalize(input: string): Normalized {
  const chars: string[] = [];
  const map: number[] = [];

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (DIACRITIC.test(ch) || INVISIBLE.test(ch)) continue;

    const lower = ch.toLowerCase();
    // Some codepoints grow when lowercased; keeping the original preserves the
    // 1:1 correspondence the map depends on.
    chars.push(lower.length === 1 ? lower : ch);
    map.push(i);
  }

  return { text: chars.join(""), map };
}

export function normalizeQuery(query: string): string {
  return normalize(query.trim()).text;
}

/** Half-open [start, end) ranges into the ORIGINAL string. */
export type MatchRange = [number, number];

export type MatchResult = {
  score: number;
  ranges: MatchRange[];
};

/**
 * Returns null when the haystack does not match at all. Higher scores are
 * better; a prefix match always outranks a mid-word one, and any contiguous
 * match outranks a scattered subsequence.
 */
export function fuzzyMatch(
  haystack: string,
  normalizedQuery: string,
): MatchResult | null {
  if (!normalizedQuery) return { score: 0, ranges: [] };

  const { text, map } = normalize(haystack);
  if (!text) return null;

  const idx = text.indexOf(normalizedQuery);

  if (idx !== -1) {
    const atStart = idx === 0;
    const atBoundary = idx > 0 && BOUNDARY.test(text[idx - 1]);

    const base = atStart ? 1000 : atBoundary ? 820 : 640;
    const end = idx + normalizedQuery.length - 1;

    return {
      // Earlier and more complete matches win the tiebreak.
      score:
        base - Math.min(idx, 60) + Math.round((normalizedQuery.length / text.length) * 60),
      ranges: [[map[idx], map[end] + 1]],
    };
  }

  // Scattered subsequence — every query character present, in order.
  const ranges: MatchRange[] = [];
  let cursor = 0;
  let gaps = 0;
  let lastHit = -1;

  for (const ch of normalizedQuery) {
    const hit = text.indexOf(ch, cursor);
    if (hit === -1) return null;

    if (lastHit !== -1 && hit > lastHit + 1) gaps += hit - lastHit - 1;

    const from = map[hit];
    const previous = ranges[ranges.length - 1];
    // Merge characters that ended up adjacent so highlighting stays readable.
    if (previous && previous[1] === from) previous[1] = from + 1;
    else ranges.push([from, from + 1]);

    lastHit = hit;
    cursor = hit + 1;
  }

  return { score: Math.max(40, 300 - gaps * 4), ranges };
}

/** Best score across several fields, e.g. title and author. */
export function bestMatch(
  fields: string[],
  normalizedQuery: string,
): { score: number; fieldIndex: number; ranges: MatchRange[] } | null {
  let best: { score: number; fieldIndex: number; ranges: MatchRange[] } | null =
    null;

  fields.forEach((field, fieldIndex) => {
    const result = fuzzyMatch(field, normalizedQuery);
    if (!result) return;
    // Later fields are worth slightly less, so a title hit beats an author hit.
    const score = result.score - fieldIndex * 30;
    if (!best || score > best.score) {
      best = { score, fieldIndex, ranges: result.ranges };
    }
  });

  return best;
}
