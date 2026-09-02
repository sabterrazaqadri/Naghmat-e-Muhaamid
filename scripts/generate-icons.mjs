/**
 * Generates the PWA / favicon set from the master logo in docs/.
 *
 * Run after replacing the source art:
 *   npm run icons
 *
 * Two things this handles that a plain resize does not:
 *
 * 1. MASKABLE VARIANTS. Android crops launcher icons to its own shape (circle,
 *    squircle, rounded square). The khatim's eight points reach the edge of the
 *    artwork, so an un-inset icon loses them. Maskable versions scale the art
 *    into the middle ~76% — the documented safe zone — over an opaque field
 *    that bleeds to all four edges.
 *
 * 2. BRIGHTENED SMALL SIZES. The lattice is hairline-thin over a near-black
 *    field, so at favicon scale the mark sinks into a dark smudge — worst on a
 *    light tab bar. The 32/48/64 renders lift the gold; the large icons keep
 *    the original values, where the fine detail survives on its own.
 */
import { mkdir, writeFile } from "node:fs/promises";
import toIco from "png-to-ico";
import sharp from "sharp";

const SOURCE = "docs/Nagmat Logo.png";
const OUT = "public/icons";

/** Matches --bg-deep, so the icon sits flush with the app's own background. */
const BG = { r: 5, g: 5, b: 6, alpha: 1 };

await mkdir(OUT, { recursive: true });

/** The art carries ~56px of dead margin per side; drop it and re-pad to taste. */
const trimmed = await sharp(SOURCE).trim({ threshold: 12 }).toBuffer();

/**
 * @param size    output square, px
 * @param inset   fraction of the canvas the artwork occupies (1 = edge to edge)
 * @param lift    brighten the gold — see the favicon note below
 */
async function render(file, size, inset, lift = false) {
  const art = Math.round(size * inset);
  const pad = Math.round((size - art) / 2);

  let pipeline = sharp(trimmed)
    .resize(art, art, { fit: "contain", background: BG })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: BG })
    .resize(size, size);

  if (lift) pipeline = pipeline.modulate({ brightness: 1.5, saturation: 1.25 });

  await pipeline.png({ compressionLevel: 9 }).toFile(`${OUT}/${file}`);

  console.log(
    `✓ ${OUT}/${file}  ${size}×${size}  (art ${Math.round(inset * 100)}%${lift ? ", brightened" : ""})`,
  );
}

// Full lockup. A little breathing room so the star points are not flush.
await render("icon-512.png", 512, 0.92);
await render("icon-192.png", 192, 0.92);
await render("apple-touch-icon.png", 180, 0.92);

// Maskable: inset hard, because the launcher will crop this.
await render("icon-maskable-512.png", 512, 0.76);
await render("icon-maskable-192.png", 192, 0.76);

/**
 * Favicon: the whole lockup, tightened.
 *
 * The first attempt cropped to the middle of the frame on the theory that the
 * ornament would survive small sizes better than the wordmark. It does not
 * work here — the centre of this logo *is* the wordmark, so cropping sliced
 * the calligraphy mid-word and read as damaged rather than simplified.
 *
 * Scaled whole, the mark resolves at 32px as a gold eight-point star with
 * script inside it. The text is not readable at that size and does not need to
 * be: a favicon's job is to be recognisable in a strip of tabs.
 *
 * The gold is brightened for these sizes only. The lattice is hairline-thin
 * over a near-black field, and at 32px on a light tab bar the whole thing
 * otherwise sinks into a dark smudge. The large icons keep the original
 * values, where the fine detail survives on its own.
 */
for (const size of [32, 48, 64]) {
  await render(`favicon-${size}.png`, size, 0.96, true);
}

/**
 * favicon.ico last.
 *
 * `src/app/favicon.ico` is a Next.js *file convention*: when the file exists it
 * wins over anything declared in `metadata.icons`. So it has to be the real
 * mark, not the leftover create-next-app default — otherwise the browser tab
 * keeps showing the Next.js logo however the metadata is configured.
 *
 * Multi-resolution, so browsers and the Windows taskbar each take their size.
 */
await writeFile(
  "src/app/favicon.ico",
  await toIco([
    `${OUT}/favicon-32.png`,
    `${OUT}/favicon-48.png`,
    `${OUT}/favicon-64.png`,
  ]),
);
console.log("✓ src/app/favicon.ico  (32/48/64 multi-resolution)");

console.log("\nDone. Icons written to public/icons/");
