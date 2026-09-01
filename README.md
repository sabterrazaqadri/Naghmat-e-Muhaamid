# نغماتِ محامد — Naghmat e Muhaamid

A premium Islamic devotional poetry platform for the kalam of
**ثنا خوانِ رسول، گدائے اہلِ بیت، قادری فقیر، محمد سبطر رضا قادری اختری**.

Next.js 16 (App Router) · Neon Postgres · Drizzle ORM · Tailwind v4 · GSAP.

---

## Setup

### 1. Create the Neon database

Create a project at [neon.tech](https://neon.tech), then create **two roles**:

| Role      | Grants                                  | Env var              |
| --------- | --------------------------------------- | -------------------- |
| owner     | full DDL + DML                          | `DATABASE_URL_ADMIN` |
| read-only | `SELECT` on `categories`, `kalam`       | `DATABASE_URL`       |

The split matters: every public page runs on the read-only credential, so a
bug on the public site cannot write to the database. Create the read-only role
**after** running migrations, then grant it:

```sql
CREATE ROLE site_reader WITH LOGIN PASSWORD '…';
GRANT CONNECT ON DATABASE neondb TO site_reader;
GRANT USAGE ON SCHEMA public TO site_reader;
GRANT SELECT ON categories, kalam TO site_reader;
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in both connection strings, then generate the two secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # SESSION_SECRET
```

Set `ADMIN_PASSWORD` to something long. All five variables are server-only —
none is prefixed `NEXT_PUBLIC_`, so none is ever sent to the browser.

### 3. Migrate and seed

```bash
npm run db:migrate   # applies ./drizzle/*.sql
npm run db:seed      # 6 categories + 13 placeholder kalam
```

### 4. Run

```bash
npm run dev
```

Public site at `/`, admin at `/admin`.

> **On the seed content.** The seeded kalam are **placeholders** — deliberately
> generic filler ("نمونہ نعت ۔ اول" and so on) written only so the UI can be
> reviewed with realistic Urdu text lengths and stanza breaks. Since the app
> presents the whole diwan as one poet's work, the seed must not contain
> anyone else's verse: an earlier version seeded famous classical works, which
> would have appeared as this poet's own once per-kalam attribution was
> removed. Replace it all through `/admin`, then delete `src/db/seed.ts`.

---

## Commands

| Command              | What it does                                  |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Dev server                                    |
| `npm run build`      | Production build                              |
| `npm run lint`       | ESLint                                        |
| `npm run db:generate`| Generate a migration from `src/db/schema.ts`  |
| `npm run db:migrate` | Apply pending migrations                      |
| `npm run db:seed`    | Seed categories + placeholder kalam (idempotent) |
| `npm run db:studio`  | Drizzle Studio                                |

---

## Architecture notes

**Two database clients, both lazy.** `src/db/read.ts` (public, SELECT-only) and
`src/db/admin.ts` (privileged). Both build their client on first *call*, never
at module load, so `next build` compiles every route even with no environment
configured — importing the actions file cannot crash a page build. The read
path returns `null` when `DATABASE_URL` is absent and queries degrade to empty
results; the admin path throws, because a silently no-op mutation is worse than
a clear error. Both carry `server-only`, so an accidental client import is a
build error rather than a leaked connection string.

**Three independent auth gates.** `src/proxy.ts` (Next 16's replacement for
`middleware.ts` — the file is `(?:src/)?proxy.ts` and the export is `proxy`)
redirects unauthenticated browsers. `admin/(protected)/layout.tsx` re-checks
before rendering. Every mutating server action re-checks again, because a
server action is an RPC endpoint that a proxy never sees.

**Categories are extensible with zero code changes.** The single `/[category]`
dynamic segment resolves against the database, so a category created in
`/admin` gets a live public route, a header nav entry, and generated cover art
immediately. Static segments (`/kalam`, `/bookmarks`, `/admin`) take precedence
and are never shadowed.

**Generative cover art.** `src/lib/gradient.ts` hashes a category's slug (or
its `cover_gradient_seed` override) into a hue drawn from a constrained set of
bands, rendered as pure CSS. Same input, same output — server and client agree,
so there is no hydration mismatch and no asset pipeline.

**One poet, credited once.** This diwan is the work of a single poet, so
`kalam` has no `author` column and no page carries a per-poem byline.
Attribution lives in `src/lib/site.ts` and surfaces as a colophon after each
poem (`PoetCredit`), in the share/copy payload, and in each page's JSON-LD and
meta description. Repeating a name per row would imply an anthology and let the
row disagree with the collection.

**Urdu-safe slugs.** `src/lib/slugify.ts` keeps every Unicode letter and strips
only harakat, bidi/zero-width controls, and punctuation. A naive
`strip non-ASCII` would reduce every Urdu title to the same empty slug.

**Typography: nastaliq carries the poetry, a sans carries the interface.**
Urdu verse has been set in nastaliq for four centuries; naskh is the Arabic
tradition, and a naat in naskh reads to an Urdu eye as the wrong register. So
`heading-ur`, `wordmark-ur` and `poetry-ur` are all **Noto Nastaliq Urdu**,
while `body-ur` (buttons, counts, chips, placeholders) is **Noto Sans Arabic**
— nastaliq's stepped baseline fights tight UI boxes.

Nastaliq's real hazard is clipping, and that is solved as an engineering
problem rather than by picking a different script: every nastaliq utility
carries generous leading plus vertical padding (`poetry-ur` needs 2.6, since
stacked misra collide at 2.0), a global rule floors Arabic-script headings at
`line-height: 2`, and `truncate` is never applied to nastaliq because
`overflow: hidden` crops its descenders.

One trap worth knowing: the `next/font` variable classes **must** sit on
`<html>`, not `<body>`. The font tokens are composed at `:root`, and a `var()`
nested inside a custom property resolves at the element that declares it — with
the classes on `<body>` every token computed to the empty string and the whole
site silently fell back to the UA sans stack, while the compiled CSS still
looked perfectly correct.

**Reduced motion is one switch.** `globals.css` neutralises animation and hides
the ambient blobs; GSAP reads the same query via `gsap.matchMedia()`. The
scroll-reveal `opacity: 0` is gated on both `prefers-reduced-motion:
no-preference` **and** a `data-js="on"` flag set by an inline boot script — so a
visitor whose JS fails sees content, never a blank column.

---

## Android

The app is an installable PWA: on Android, visiting the deployed site offers
**Install app**, and it then runs standalone with offline access to any kalam
already read. For a real `.apk` (Trusted Web Activity) — and for the
`assetlinks.json` step that is easy to get wrong — see **[ANDROID.md](ANDROID.md)**.

---

## Deploying to Vercel

1. Push to a Git remote and import the project.
2. Add all five variables from `.env.example` under **Settings → Environment
   Variables** (Production + Preview). Set `NEXT_PUBLIC_SITE_URL` to the real
   origin so OpenGraph URLs and `sitemap.xml` are absolute.
3. Deploy, then run `npm run db:migrate` once against the production database.
