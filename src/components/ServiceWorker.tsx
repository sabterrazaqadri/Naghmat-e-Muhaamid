"use client";

import { useEffect } from "react";

/**
 * Registers the service worker.
 *
 * Registration waits for `load` so it never competes with the first paint for
 * bandwidth, and it is skipped in development — a cached shell during dev
 * makes edits appear not to take effect, which is a genuinely confusing bug to
 * chase.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        // A failed registration costs offline support, not the app.
        console.warn("[sw] registration failed:", error);
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
