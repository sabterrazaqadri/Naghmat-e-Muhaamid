# Android — installable app and APK

Two different things, and it is worth being clear about which one you want.

| | PWA install | APK (TWA) |
|---|---|---|
| How the user gets it | Visits the site, taps **Install** | Installs a `.apk`, or from Play Store |
| Works today | ✅ Yes, once deployed | Needs a build step |
| Needs Play Store | No | Only if you want Play distribution |
| Updates | Instantly, with the site | Web content updates instantly; the shell needs a new APK |

**Both require the site to be live on HTTPS.** Android will not offer to
install from `http://localhost`, and a TWA cannot verify ownership of an origin
that does not exist yet. So deploy first — everything below assumes that.

---

## 1. PWA install (already working)

Nothing left to do in the code. Once deployed, opening the site in Chrome on
Android shows an **Install app** prompt — the app's own invitation appears at
the bottom of the screen (`InstallPrompt`), and Chrome's menu offers
*Add to Home screen* as well.

What makes it installable, all verified in an emulated Android Chrome:

- `src/app/manifest.ts` → served at `/manifest.webmanifest` with name, icons,
  `start_url`, `display: standalone`, theme colours, and `lang: ur` / `dir: rtl`
- `public/sw.js` → a service worker with a real fetch handler, which is a hard
  requirement for installability
- Icons in `public/icons/` at 192 and 512, in both `any` and `maskable`
  variants — **the maskable ones matter**: without them Android draws a white
  circle around a shrunken logo instead of your icon
- `/offline` → shown when a navigation fails with nothing cached

Regenerate the icons after editing the mark in `scripts/generate-icons.mjs`:

```bash
npm run icons
```

---

## 2. APK via Bubblewrap (TWA)

A Trusted Web Activity wraps the live site in a real Android app with no
browser UI. The web content is still served from your origin, so content
updates need no new APK.

### Prerequisites (not currently installed on this machine)

- **JDK 17+** — `java` and `keytool` are both absent right now
- **Android SDK** command-line tools — `ANDROID_HOME` is unset
- The site deployed at a stable HTTPS origin

### Steps

```bash
npm install -g @bubblewrap/cli

# Point it at the deployed manifest, not localhost.
bubblewrap init --manifest https://YOUR-DOMAIN/manifest.webmanifest

bubblewrap build
```

`bubblewrap build` produces `app-release-signed.apk` and prints the signing
key's **SHA-256 fingerprint**.

### Then complete the trust link — this is the step people miss

Set the fingerprint in your hosting environment:

```
TWA_SHA256_FINGERPRINT=AA:BB:CC:…:FF
TWA_PACKAGE_NAME=com.naghmatemuhaamid.twa
```

Redeploy, then confirm:

```bash
curl https://YOUR-DOMAIN/.well-known/assetlinks.json
```

It must list your package name and fingerprint. Until it does, the app opens
**with Chrome's address bar visible** — that is the symptom of a broken asset
link, not a bug in the app.

> The route returns an empty `[]` when `TWA_SHA256_FINGERPRINT` is unset,
> rather than a fake fingerprint. An empty list is the honest "no app is
> trusted yet" answer; a placeholder would claim a trust relationship that
> does not exist.

### No local toolchain? Use PWABuilder

[pwabuilder.com](https://www.pwabuilder.com) takes the deployed URL and returns
a signed APK plus the exact `assetlinks.json` to publish — same result, no JDK
or Android SDK needed locally.

---

## Deploy first

```bash
# Vercel — set the five env vars from .env.example in the dashboard,
# and NEXT_PUBLIC_SITE_URL to the real origin so the manifest,
# OpenGraph URLs and sitemap are absolute.
vercel --prod
```

Then run `npm run db:migrate` once against the production database.
