/**
 * Generates the PWA icon set from a single inline SVG source.
 *
 * Kept as a script rather than committed binaries so the mark can be changed
 * in one place and re-rendered; run `npm run icons` after editing SOURCE.
 *
 * Two variants are produced, because Android treats them differently:
 *  - "any": the mark fills the canvas, used wherever the icon is shown as-is.
 *  - "maskable": the launcher may crop this to a circle/squircle, so the mark
 *    is inset to the safe zone (the middle 80%) and the background bleeds to
 *    every edge. Shipping only an "any" icon is what makes Android render a
 *    white circle with a shrunken logo inside it.
 */
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const GOLD = "#D4AF37";
const DEEP = "#0A0A0C";

/** `scale` shrinks the artwork inside the canvas for maskable safe-area. */
const SOURCE = (scale) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="72%">
      <stop offset="0%" stop-color="#14140f"/>
      <stop offset="100%" stop-color="${DEEP}"/>
    </radialGradient>
    <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F0D98A"/>
      <stop offset="45%" stop-color="${GOLD}"/>
      <stop offset="100%" stop-color="#A8801F"/>
    </linearGradient>
  </defs>

  <rect width="512" height="512" fill="url(#bg)"/>

  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <!-- Khatim: two squares, one rotated 45°, the site's recurring motif. -->
    <g stroke="url(#leaf)" fill="none" stroke-width="9" opacity="0.5">
      <rect x="126" y="126" width="260" height="260" rx="8"/>
      <rect x="126" y="126" width="260" height="260" rx="8"
            transform="rotate(45 256 256)"/>
    </g>
    <!-- ن — the initial of نغماتِ محامد. Drawn as a path so the render does
         not depend on a font being installed on the build machine. -->
    <path d="M150 208 C150 300, 200 350, 256 350 C312 350, 362 300, 362 208"
          stroke="url(#leaf)" stroke-width="30" fill="none" stroke-linecap="round"/>
    <circle cx="256" cy="150" r="19" fill="url(#leaf)"/>
  </g>
</svg>`;

const OUT = "public/icons";
await mkdir(OUT, { recursive: true });

const jobs = [
  { file: "icon-192.png", size: 192, scale: 1 },
  { file: "icon-512.png", size: 512, scale: 1 },
  { file: "icon-maskable-192.png", size: 192, scale: 0.8 },
  { file: "icon-maskable-512.png", size: 512, scale: 0.8 },
  { file: "apple-touch-icon.png", size: 180, scale: 1 },
];

for (const { file, size, scale } of jobs) {
  await sharp(Buffer.from(SOURCE(scale)))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/${file}`);
  console.log(`✓ ${OUT}/${file}  ${size}×${size}`);
}

// Favicon source, kept as SVG so it stays crisp at any size.
await writeFile("public/icons/icon.svg", SOURCE(1).trim());
console.log("✓ public/icons/icon.svg");
