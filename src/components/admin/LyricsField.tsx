"use client";

import { useId, useState } from "react";

/**
 * Lyrics editor.
 *
 * Plain textarea by choice — a rich editor would fight RTL input and mangle
 * line breaks, and line breaks are the whole structure of a kalam. `dir="rtl"`
 * puts the caret where an Urdu typist expects it, and the live counts let the
 * poet see stanza structure without counting by eye.
 */
export function LyricsField({
  defaultValue = "",
  error,
}: {
  defaultValue?: string;
  error?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const id = useId();
  const errorId = `${id}-error`;

  const lines = value.split("\n").filter((line) => line.trim()).length;
  const stanzas = value
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .filter((block) => block.trim()).length;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm text-foreground">
          Kalam text <span className="text-destructive">*</span>
        </label>
        <p className="text-xs text-muted" aria-live="polite">
          {value.length} characters · {lines} lines · {stanzas} stanzas
        </p>
      </div>

      {/* dir="auto", not "rtl": the placeholder is English UI copy, and a hard
          RTL throws its trailing punctuation to the front (".One misra per
          line"). `auto` keeps the empty field LTR for the English hint and
          flips to RTL the moment Urdu is typed — which is the behaviour an
          Urdu typist expects anyway. */}
      <textarea
        id={id}
        name="lyrics"
        lang="ur"
        dir="auto"
        rows={18}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        placeholder={"One misra per line\n\nA blank line starts a new stanza"}
        className={`body-ur mt-2 w-full resize-y rounded-xl border bg-elevated px-4 py-3 text-lg text-foreground outline-none transition-colors placeholder:text-muted focus:border-gold ${
          error ? "border-destructive" : "border-hairline"
        }`}
      />

      <p className="mt-1 text-xs text-muted">
        A blank line renders as a stanza break on the site.
      </p>

      {error ? (
        <p id={errorId} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
