/**
 * Service worker.
 *
 * Two jobs: satisfy Chrome's installability requirement (a fetch handler must
 * exist), and let a reader open a kalam they have already read while offline —
 * which matters for a devotional text people return to on a commute or in a
 * mosque with poor signal.
 *
 * Deliberately hand-written rather than pulled from a plugin: the caching
 * rules here are only a few lines, and a generated worker would be far harder
 * to reason about when something serves stale.
 *
 * Bump CACHE_VERSION to force every client to drop its old caches.
 */
const CACHE_VERSION = "v1";
const SHELL_CACHE = `nem-shell-${CACHE_VERSION}`;
const PAGE_CACHE = `nem-pages-${CACHE_VERSION}`;
const ASSET_CACHE = `nem-assets-${CACHE_VERSION}`;

const OFFLINE_URL = "/offline";

const SHELL_ASSETS = [
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // addAll is atomic — one 404 would leave the worker uninstalled — so
      // each asset is cached independently and failures are tolerated.
      await Promise.allSettled(SHELL_ASSETS.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, PAGE_CACHE, ASSET_CACHE]);
      const names = await caches.keys();
      await Promise.all(
        names.map((name) =>
          name.startsWith("nem-") && !keep.has(name)
            ? caches.delete(name)
            : undefined,
        ),
      );
      await self.clients.claim();
    })(),
  );
});

/** Never cache anything that is private or must be fresh. */
function isBypassed(url) {
  return (
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api/") ||
    url.searchParams.has("_rsc")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Cross-origin requests are left entirely alone.
  if (url.origin !== self.location.origin) return;
  if (isBypassed(url)) return;

  // Navigations: network first, so an edited kalam shows up immediately, with
  // the cache as the offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(PAGE_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          return (
            (await caches.match(OFFLINE_URL)) ??
            new Response("آف لائن", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }
      })(),
    );
    return;
  }

  // Build output and fonts are content-hashed and immutable, so cache-first
  // is safe and makes repeat launches instant.
  const isImmutable =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/");

  if (isImmutable) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        const fresh = await fetch(request);
        if (fresh.ok) {
          const cache = await caches.open(ASSET_CACHE);
          cache.put(request, fresh.clone());
        }
        return fresh;
      })(),
    );
  }
});
