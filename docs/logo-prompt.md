# Logo generation prompts — نغماتِ محامد

## Read this first: AI image models cannot spell Urdu

Every current image generator (Midjourney, DALL·E, Imagen, Flux, Stable
Diffusion, Ideogram) renders Arabic-script text as **decorative gibberish**. It
will look convincingly like Nastaliq at a glance and be meaningless on
inspection — wrong letters, broken joins, invented glyphs. Ideogram and the
newest Imagen handle *Latin* text well; none of them handle Urdu.

For a devotional collection carrying a poet's name, shipping a logo with
garbled Urdu is worse than shipping no logo. So:

| Approach | Urdu is correct? | Use when |
|---|---|---|
| **A — Frame only, text composited in** | ✅ Always | Recommended. Generate ornament, add real text in a real font |
| **B — Full logo from a prompt** | ❌ Needs verification | Only as a look-and-feel reference, or if a designer will redraw it |

**Whatever you generate, have a fluent Urdu reader confirm the text reads
نغماتِ محامد before it ships.** Do not trust it because it looks right.

---

## Approach A (recommended): generate the frame, composite the text

### A1 — Prompt for the ornamental frame *only*

> A luxury emblem for an Islamic devotional poetry collection. An
> eight-pointed Khatim star (two overlapping squares, one rotated 45°) formed
> from fine interlacing girih lattice lines, enclosing a **completely empty
> circular center** with no text, no letters, no script, no calligraphy of any
> kind. Rendered in polished antique gold with subtle metallic gradient and
> soft inner glow, on a deep near-black background (#0A0A0C). Symmetrical,
> centered, flat vector emblem style, thin elegant strokes, generous negative
> space in the middle. Museum-quality Islamic geometric ornament, refined and
> restrained. Square 1:1 composition.
>
> **Negative prompt:** text, letters, words, calligraphy, arabic script, urdu,
> writing, typography, signature, watermark, human figures, faces, animals,
> photorealism, clutter, busy detail, drop shadow, 3D bevel

The empty middle is the whole point — the real Urdu goes there afterwards.

### A2 — Add the real text

Composite `نغماتِ محامد` into the empty center in **Noto Nastaliq Urdu** or
**Gulzar** (both free, both already used in this app) using Figma, Illustrator,
Inkscape, or code. Requirements:

- line-height **≥ 2.0** and vertical padding — Nastaliq's descenders sit far
  below the baseline and get clipped by tight bounding boxes
- do **not** stretch the text non-uniformly; scale proportionally
- keep the gold ramp consistent with the frame

---

## Approach B: full logo in one shot (verify the text!)

> A premium logo for "Naghmat e Muhaamid", a collection of Urdu Islamic
> devotional poetry. Centered Urdu Nastaliq calligraphy reading
> **نغماتِ محامد**, written in flowing traditional Nastaliq with authentic
> letterforms, correct letter joins and the characteristic descending
> baseline cascade. The calligraphy is polished antique gold (#D4AF37) with a
> soft warm sheen, set on a deep near-black background (#050506). Framed by a
> delicate eight-pointed Khatim star of thin girih lattice lines in darker
> muted gold. Elegant, reverent, museum-quality Islamic manuscript aesthetic.
> Flat vector, symmetrical, high contrast, generous margins so no glyph
> touches the edge. Square 1:1.
>
> **Negative prompt:** latin letters, english text, mirrored text, broken
> letterforms, disconnected strokes, random glyphs, watermark, signature,
> photorealism, harsh drop shadow, gradient background, clutter, cropped
> letters, faces, human figures

**If any letter looks wrong, it is wrong.** Regenerate or fall back to A.

---

## App-icon constraints (whichever approach)

The logo is rendered at **48px** in a browser tab. Full Nastaliq text is
illegible at that size, so the icon set needs two lockups:

| Asset | Size | Content |
|---|---|---|
| `favicon` / small icons | 48–192px | Khatim frame + a single stylised **ن**, or the frame alone |
| `icon-512.png` | 512px | Frame + full نغماتِ محامد |
| `icon-maskable-*.png` | 192 / 512 | Same, artwork inset to the middle 80% |

Maskable matters: Android crops launcher icons to its own shape. Without a
maskable variant it draws a white circle around a shrunken logo. Keep the
background bleeding to all four edges and nothing important in the outer 10%.

Export as PNG on the **#050506** background (not transparent — the maskable
variant needs an opaque field), then drop the files into `public/icons/`
replacing the current set, or point `scripts/generate-icons.mjs` at the new
source and run `npm run icons`.

---

## A third option that avoids AI entirely

The app already ships Noto Nastaliq Urdu and renders icons from
`scripts/generate-icons.mjs`. The text can be typeset directly from the real
font at build time — **guaranteed-correct Urdu**, no generation, no
verification step, and re-rendering all five sizes is one command. Say the
word and I'll build it that way.
