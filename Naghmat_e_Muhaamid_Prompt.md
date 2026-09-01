PROJECT: "نغماتِ محامد (Naghmat e Muhaamid)" , "شاعر: ثنا خواںِ رسول،
گدائے اہلِ بیت، قادری فقیر، محمد سبطر رضا قادری اختری" --- Premium
Islamic Devotional Poetry Platform

ROLE You are building a production-grade, top-1%-quality web app from
scratch. This is a sister project to an existing app ("Naghmat e Maroof"
--- Next.js + Supabase + custom /admin CRUD for browsing
Hamd/Naat/Manqabat/Munajaat). Match its FUNCTIONAL scope exactly, but
rebuild the DATA LAYER on Neon Postgres and elevate the UI/UX to a
premium, editorial-grade experience --- not a template-looking clone.

═══════════════════════════════════════════════════════════════ 1. TECH
STACK ═══════════════════════════════════════════════════════════════ -
Next.js 15+ (App Router, TypeScript, Server Components by default ---
only mark 'use client' on genuinely interactive leaf components) -
Database: Neon (serverless Postgres) - ORM/driver: Drizzle ORM +
@neondatabase/serverless (HTTP driver --- works in edge/serverless
runtimes, no connection pooling headaches) - Styling: Tailwind CSS v4
(CSS-based @theme tokens, no tailwind.config.ts) - Icons: Phosphor Icons
(@phosphor-icons/react), outline weight --- never emoji as UI icons -
Motion: GSAP + ScrollTrigger (+ @gsap/react's useGSAP for cleanup) -
Fonts: next/font/google (self-hosted, no external `<link>`{=html}
tags) - Deployment target: Vercel

═══════════════════════════════════════════════════════════════ 2.
FUNCTIONAL SCOPE (must match, non-negotiable)
═══════════════════════════════════════════════════════════════ Public
site: - Home page --- hero + browsable topic grid, sourced from DB (not
hardcoded) - Dynamic category pages: /\[category\] --- list of kalam in
that category, live search/filter - Kalam detail page: /kalam/\[slug\]
--- full lyrics, copy button, share (Web Share API with clipboard
fallback), author credit - Categories are fully DB-driven and extensible
--- adding a category in admin must create its public route with zero
code changes (same pattern as the sister app's \[category\] dynamic
segment) - Seed categories: تاقرفتم ،تاجانم ،مالس ،تبقنم ،تعن ،دمح

Admin (/admin): - Password-gated login (httpOnly signed session cookie),
middleware/proxy-protected route group, logout - Category CRUD (name,
slug, sort order) - Kalam CRUD (title, author, category, lyrics, slug
--- auto-slugify with uniqueness handling, Urdu-safe slugify that
doesn't mangle non-Latin script) - Dashboard with live counts

Non-negotiable engineering pattern (carried over from the sister app,
learned the hard way): - All DB writes from /admin go through a
server-only privileged client (Neon connection string with write
access), NEVER exposed to the browser. Public read queries use a
separate, narrowly-scoped read path. - Make the privileged DB client
LAZY (instantiate on first use inside a function, not at module
top-level) so a missing/unset DATABASE_URL_ADMIN doesn't crash page
builds that merely import the actions file. - Rename any middleware file
to proxy.ts / export `proxy` (Next 16+ convention) --- do NOT use the
deprecated middleware.ts / `export function middleware` if the installed
Next.js version already warns about it; check node_modules/next version
first and follow whichever convention it expects.

═══════════════════════════════════════════════════════════════ 3.
DATABASE SCHEMA (Neon + Drizzle)
═══════════════════════════════════════════════════════════════
categories: id (uuid, pk), name (text, Urdu display text), slug (text,
unique), cover_gradient_seed (text, nullable --- for generative cover
art, see §5), sort_order (int), created_at (timestamptz default now())

kalam: id (uuid, pk), title (text), lyrics (text), author (text,
nullable), category_id (uuid, fk -\> categories.id, cascade delete),
slug (text, unique), is_featured (boolean default false --- powers the
homepage "kalam of the day"), created_at (timestamptz default now())

Write a Drizzle migration, not a manually-run SQL script left
undocumented. Seed the six categories above plus 2-3 sample kalam per
category so the UI can be reviewed with real content immediately.

═══════════════════════════════════════════════════════════════ 4.
DESIGN SYSTEM --- premium "Cinematic Glass + Gold" direction (derived
from ui-ux-pro-max: Liquid Glass + Modern Dark Cinema styles)
═══════════════════════════════════════════════════════════════ Base
theme: dark-first (this is the primary experience), with a full
light-mode fallback --- never pure #000 (OLED smear), never pure white
background.

Color tokens: --bg-deep: #050506 (page background, top of gradient)
--bg-base: #0a0a0c (page background, bottom of gradient) --bg-elevated:
rgba(255,255,255,0.04) (glass card surface) --border-glass:
rgba(255,255,255,0.08) (hairline card borders) --foreground: #F5F1E8
(warm off-white, not pure #FFF) --foreground-muted:#9C9689
--accent-gold: #D4AF37 (primary accent --- CTAs, active states, active
nav) --accent-gold-glow:rgba(212,175,55,0.25) (used sparingly:
text-shadow, ring) --destructive: #DC2626 Light mode overrides: bg
#FAF9F6, elevated surface white/60% + backdrop-blur, foreground #1C1917,
accent-gold darkened to #A16207 for 4.5:1 contrast on white.

Surface treatment: frosted-glass cards (backdrop-filter: blur(16-20px),
translucent background, 1px hairline border, 16-20px radius). Sticky
header uses the same glass treatment over an ambient gradient backdrop.
Add 2-3 large, soft, slowly-drifting ambient gradient blobs (blur-radius
60-100px, opacity 0.08-0.12, gold + deep-green or gold + indigo) behind
the hero --- pure CSS/GSAP, must respect prefers-reduced-motion
(freeze/hide blobs entirely when set).

Typography: - Urdu headings (page titles, section titles): Noto Naskh
Arabic --- NOT Noto Nastaliq Urdu for body-scale headings; Nastaliq's
tall ligatures clip badly at Tailwind's default tight line-heights and
render inconsistently across browsers. If Nastaliq is used at all,
reserve it for ONE large decorative hero wordmark, and give it
line-height \>= 1.9 and vertical padding to avoid glyph clipping (this
exact bug happened on the sister app --- don't repeat it). - Urdu body /
lyrics text: Noto Sans Arabic, line-height 2, font-size 20-22px ---
lyrics are read at length, prioritize comfortable reading over
density. - Latin brand wordmark ("Naghmat e Sabter" romanized, used in
```{=html}
<title>
```
/footer): Cormorant or Playfair Display. - Latin UI chrome (buttons,
admin panel labels): Inter. - Load only the Arabic subset + needed Latin
subsets via next/font/google to keep bundle size sane.

Icons: Phosphor Icons, "regular"/outline weight, 20-24px, always with an
aria-label or visible text --- never an icon alone as the only
affordance for a critical action.

Motion (GSAP): - Scroll reveal on section entrances: opacity+y(12-24px),
power1.out/power2.out, 300-500ms, scrollTrigger start 'top 85-90%',
toggleActions 'play none none reverse' - List/grid stagger (category
grid, kalam list): stagger 0.03-0.08s, cap at \~8
simultaneously-animating items, don't stagger virtualized/long lists
beyond what's mounted - Hero headline: optional SplitText char-stagger
ONLY if short (\<8 words) --- must have a plain-fade fallback if
SplitText license unavailable - All durations 150-600ms range, respect
prefers-reduced-motion (disable/shorten globally via a single check, not
per-component)

Layout: mobile-first, breakpoints 375/768/1024/1440, no horizontal
scroll anywhere, max-width content container \~48rem for reading views,
wider for grids.

═══════════════════════════════════════════════════════════════ 5.
PREMIUM UX FEATURES (this is what separates "clone" from "top 1%")
═══════════════════════════════════════════════════════════════ -
Command-palette search (⌘K / Ctrl+K, and a visible search button) ---
fuzzy search across all kalam titles + authors, keyboard-navigable,
opens as a glass modal - "Kalam of the Day" / featured hero panel on
homepage (uses is_featured flag, falls back to random pick if none
set) - Generative cover art per category: no image uploads required ---
derive a unique subtle gradient/pattern per category from its slug
(deterministic hash → hue), rendered as CSS, so every category page/card
looks distinct without asset management (cover_gradient_seed column
feeds this, or derive purely from slug --- your call) - Adjustable
lyrics font size on the kalam detail page (A- / A+ control, persisted in
localStorage) --- real accessibility feature, not decorative
Reading-progress bar for long lyrics - Skeleton loading states for any
client-fetched content (search results) --- never a bare spinner-only
experience - Empty states with helpful copy + icon (not just "ںیہن ہجیتن
یئوک" text alone) - Properly styled 404 and error boundary pages
matching the theme - Bookmarks/favorites: localStorage-backed (no auth
needed for end users), star icon on kalam cards, a "/bookmarks" view -
SEO: per-kalam
```{=html}
<title>
```
/description/OpenGraph metadata generated from content, sitemap.xml,
robots.txt

═══════════════════════════════════════════════════════════════ 6. ADMIN
PANEL --- premium but functional (not the priority for visual polish,
correctness and speed matter more here)
═══════════════════════════════════════════════════════════════ - Same
glass-dark aesthetic, denser spacing (8-32px scale, this is a
dashboard) - Category + Kalam list/create/edit/delete via Next.js Server
Actions - Confirm-before-destructive-action on all deletes (category
delete must warn that it cascades to its kalam) - Lyrics field: plain
textarea is fine, but set dir="rtl", generous rows, and a live
character/line count - Toast/inline success-feedback after every
mutation (not just a redirect)

═══════════════════════════════════════════════════════════════ 7.
NON-FUNCTIONAL REQUIREMENTS
═══════════════════════════════════════════════════════════════ -
Accessibility: 4.5:1 text contrast minimum (verify the gold accent
against both backgrounds), visible focus rings (don't remove them for
aesthetics), all interactive targets \>= 44x44px, full keyboard
navigation including the command palette, alt text on any decorative
image, aria-labels on icon-only buttons - Performance: images (if any)
via next/image with lazy loading, avoid layout shift from web fonts
(font-display: swap + size-adjust or next/font's built-in handling),
keep the ambient blob animations GPU-cheap (transform/opacity only) -
Security: admin write path never reachable with a client-exposed key;
validate all form input server-side even though it's a single-admin app;
rate-limit or at minimum don't leak whether a login attempt failed due
to wrong password vs missing env var - Secrets: DATABASE_URL (read),
DATABASE_URL_ADMIN or equivalent privileged connection, ADMIN_PASSWORD,
session-signing secret --- all server-only env vars, .env\* gitignored
from the start

═══════════════════════════════════════════════════════════════ 8.
DELIVERABLE CHECKLIST BEFORE CALLING IT DONE
═══════════════════════════════════════════════════════════════ \[ \]
npm run build passes clean (no type errors, no crashed routes from
missing secrets --- privileged DB client must be lazy per §2) \[ \]
Every heading with Urdu/Arabic script visually verified not clipped
(line-height \>= 1.8-2 wherever bg-clip-text or tight Tailwind text-\*
sizes are used with Arabic script) \[ \] Full CRUD flow tested
end-to-end against the real Neon DB (create/update/ delete both
categories and kalam), not just "it compiled" \[ \]
prefers-reduced-motion verified --- all GSAP animation
disabled/shortened \[ \] Light AND dark mode both checked for contrast
\[ \] Mobile (375px), tablet (768px), desktop (1440px) all checked, no
horizontal scroll \[ \] Command palette keyboard-only flow works (open,
type, arrow, enter) \[ \] Deployed to Vercel with Neon connection
strings set as environment variables
