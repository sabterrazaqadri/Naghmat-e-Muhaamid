/**
 * Generative cover art.
 *
 * Every category needs to look distinct without anyone uploading an image, so
 * the artwork is derived from a stable string (the category's slug, or its
 * `cover_gradient_seed` override) and rendered as pure CSS. Same seed always
 * yields the same art — server and client agree, so there is no hydration
 * mismatch and no asset pipeline to maintain.
 */

/** FNV-1a — small, fast, and well distributed over short strings. */
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export type CoverArt = {
  /** Full `background-image` value: geometric lattice over layered washes. */
  backgroundImage: string;
  /** Matching `background-size`, so the lattice tiles at a fixed scale while
      the gradient layers stretch to cover. */
  backgroundSize: string;
  /** Solid hue for chips, rings and count badges. */
  accent: string;
  hue: number;
};

/**
 * A girih-style lattice, as an inline SVG data URI.
 *
 * Soft radial washes alone read as out-of-focus noise — pretty for a second,
 * then obviously empty. Overlaying a real geometric tile gives the eye
 * structure to land on and puts the art in the right cultural register, which
 * is the whole point of generative covers here. Strokes are drawn in white at
 * low alpha so a single tile works over every hue; the gradients beneath
 * supply the colour.
 *
 * `PATTERNS` holds three different tilings and the seed picks one, so two
 * categories that happen to land in the same hue band still look distinct.
 */
const PATTERNS = [
  // Eight-point star grid (khatim), the motif used elsewhere in the UI.
  `<path d='M30 0L37 23L60 30L37 37L30 60L23 37L0 30L23 23Z' fill='none' stroke='%23fff' stroke-opacity='.5' stroke-width='.9'/><rect x='12' y='12' width='36' height='36' fill='none' stroke='%23fff' stroke-opacity='.28' stroke-width='.7'/><rect x='12' y='12' width='36' height='36' fill='none' stroke='%23fff' stroke-opacity='.28' stroke-width='.7' transform='rotate(45 30 30)'/>`,
  // Interlaced diamond lattice.
  `<path d='M30 2L58 30L30 58L2 30Z' fill='none' stroke='%23fff' stroke-opacity='.42' stroke-width='.9'/><path d='M30 16L44 30L30 44L16 30Z' fill='none' stroke='%23fff' stroke-opacity='.3' stroke-width='.7'/><path d='M0 0L60 60M60 0L0 60' stroke='%23fff' stroke-opacity='.14' stroke-width='.6'/>`,
  // Overlapping-circle rosette.
  `<circle cx='30' cy='30' r='20' fill='none' stroke='%23fff' stroke-opacity='.4' stroke-width='.9'/><circle cx='0' cy='30' r='20' fill='none' stroke='%23fff' stroke-opacity='.26' stroke-width='.7'/><circle cx='60' cy='30' r='20' fill='none' stroke='%23fff' stroke-opacity='.26' stroke-width='.7'/><circle cx='30' cy='0' r='20' fill='none' stroke='%23fff' stroke-opacity='.26' stroke-width='.7'/><circle cx='30' cy='60' r='20' fill='none' stroke='%23fff' stroke-opacity='.26' stroke-width='.7'/>`,
];

function lattice(index: number): string {
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E${PATTERNS[index]}%3C/svg%3E")`;
}

/**
 * Hues are pulled toward the palette's warm-gold / deep-green / indigo bands
 * rather than spanning the full wheel — an unconstrained hue lands on muddy
 * yellow-greens and clashes with the gold accent.
 */
const HUE_BANDS = [
  [38, 52], // gold
  [150, 172], // deep green
  [222, 250], // indigo
  [14, 28], // amber-copper
  [186, 200], // teal
];

export function coverArt(seed: string): CoverArt {
  const h = hash(seed);

  const band = HUE_BANDS[h % HUE_BANDS.length];
  const spread = band[1] - band[0];
  const hue = band[0] + ((h >>> 8) % (spread + 1));

  const hue2 = (hue + 28 + ((h >>> 16) % 26)) % 360;
  const angle = 110 + ((h >>> 20) % 140);
  const x1 = 12 + ((h >>> 4) % 40);
  const y1 = 8 + ((h >>> 12) % 34);
  const x2 = 58 + ((h >>> 18) % 34);
  const y2 = 62 + ((h >>> 24) % 30);

  const patternIndex = (h >>> 6) % PATTERNS.length;
  // Vary the tile scale a little so the lattice reads as drawn for this card
  // rather than as one shared wallpaper.
  const tile = 52 + ((h >>> 14) % 22);

  return {
    hue,
    accent: `oklch(0.72 0.13 ${hue})`,
    // Lattice first so it sits on top; the washes and base fill in beneath.
    backgroundImage: [
      lattice(patternIndex),
      `radial-gradient(58% 68% at ${x1}% ${y1}%, oklch(0.68 0.16 ${hue} / 0.6), transparent 66%)`,
      `radial-gradient(52% 62% at ${x2}% ${y2}%, oklch(0.5 0.13 ${hue2} / 0.5), transparent 68%)`,
      `linear-gradient(${angle}deg, oklch(0.3 0.07 ${hue} / 0.9), oklch(0.17 0.05 ${hue2} / 0.95))`,
    ].join(", "),
    backgroundSize: `${tile}px ${tile}px, cover, cover, cover`,
  };
}
