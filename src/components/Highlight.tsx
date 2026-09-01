import { Fragment } from "react";

import type { MatchRange } from "@/lib/fuzzy";

/**
 * Renders `text` with the matched ranges emphasised. Ranges are indices into
 * the original string (fuzzy.ts keeps them aligned through normalisation), so
 * Urdu text with harakat highlights the characters the reader actually sees.
 */
export function Highlight({
  text,
  ranges,
}: {
  text: string;
  ranges: MatchRange[];
}) {
  if (ranges.length === 0) return <>{text}</>;

  const parts: Array<{ value: string; hit: boolean }> = [];
  let cursor = 0;

  for (const [start, end] of ranges) {
    if (start > cursor) parts.push({ value: text.slice(cursor, start), hit: false });
    parts.push({ value: text.slice(start, end), hit: true });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ value: text.slice(cursor), hit: false });

  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part.hit ? (
            <mark className="rounded-[3px] bg-[color-mix(in_oklab,var(--accent-gold)_28%,transparent)] text-foreground">
              {part.value}
            </mark>
          ) : (
            part.value
          )}
        </Fragment>
      ))}
    </>
  );
}
