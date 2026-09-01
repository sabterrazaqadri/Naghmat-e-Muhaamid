/**
 * Khatim — the eight-pointed star formed by two overlapping squares, one
 * rotated 45°. It is the most common unit in Islamic geometric ornament, so it
 * carries the right visual register here without being decorative noise.
 *
 * Drawn as inline SVG rather than an image: it inherits `currentColor`, scales
 * without an asset, and costs nothing to load.
 */
export function Khatim({
  size = 18,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect
        x="4.5"
        y="4.5"
        width="15"
        height="15"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <rect
        x="4.5"
        y="4.5"
        width="15"
        height="15"
        stroke="currentColor"
        strokeWidth="1.1"
        transform="rotate(45 12 12)"
      />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

/**
 * A centred khatim with a rule fading away on each side. Used to separate the
 * ceremonial parts of a page — a plain <hr> would read as a form divider.
 */
export function OrnamentDivider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center gap-4 text-gold ${className}`}
    >
      <span className="rule-fade flex-1" />
      <Khatim size={16} className="shrink-0 opacity-80" />
      <span className="rule-fade flex-1" />
    </div>
  );
}

/**
 * Section heading rule: khatim, label, then a rule running to the far edge.
 * Reads as a chapter opening rather than a UI header.
 */
export function SectionRule({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center gap-3 ${className}`}>
      <Khatim size={13} className="shrink-0 text-gold opacity-70" />
      <span className="rule-fade flex-1" />
    </div>
  );
}
