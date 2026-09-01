import {
  Cormorant_Garamond,
  Inter,
  Noto_Nastaliq_Urdu,
  Noto_Sans_Arabic,
} from "next/font/google";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * WHY NASTALIQ, NOT NASKH.
 *
 * The original brief said to avoid nastaliq because its tall ligatures clip
 * at tight line-heights. That is true, and it led to naskh — first Noto Naskh,
 * then Amiri. Both are handsome faces and both were the wrong answer: naskh is
 * the *Arabic* tradition. Urdu poetry has been set in nastaliq for four
 * centuries, and a naat rendered in naskh reads to an Urdu eye as Arabic text
 * in the wrong register — technically legible, culturally off. Setting the
 * lyrics in a humanist sans was worse still: it read as a UI label, not verse.
 *
 * Clipping is an engineering problem, so it is solved as one — generous
 * line-height and vertical padding on every nastaliq utility in globals.css —
 * rather than by choosing a script that does not clip.
 *
 * The division of labour: nastaliq carries the poetry, a clean sans carries
 * the interface. Buttons, counts and nav chips stay in Noto Sans Arabic, where
 * nastaliq's cascading baseline would fight tight UI boxes.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Wordmark, headings, and lyrics — everything that IS the poetry. */
export const notoNastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  // Distinct from the `--font-nastaliq` theme token in globals.css, which
  // points at this one — same name in both places would be circular.
  variable: "--font-nastaliq-urdu",
  display: "swap",
});

/** Interface chrome — buttons, counts, chips, admin labels, placeholders. */
export const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans-arabic",
  display: "swap",
});

/** Latin display — numerals, the romanised wordmark, editorial flourishes. */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

/** Latin UI — keyboard hints, admin controls. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const fontVariables = [
  notoNastaliq.variable,
  notoSansArabic.variable,
  cormorant.variable,
  inter.variable,
].join(" ");
