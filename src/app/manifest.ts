import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * Web app manifest — this is what makes Android offer "Install app" on a
 * visit. Chrome's installability bar is: served over HTTPS, a manifest with
 * name/icons/start_url/display, and a registered service worker with a fetch
 * handler (see public/sw.js).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.nameLatin,
    short_name: site.nameLatin,
    description: site.description,

    start_url: "/",
    // Anything under the origin stays inside the installed app; a link out
    // opens in the browser instead of trapping the reader.
    scope: "/",
    id: "/",

    display: "standalone",
    orientation: "portrait-primary",

    // Matches --bg-deep, so the splash screen and the app's own background are
    // the same colour and there is no flash on launch.
    background_color: "#050506",
    theme_color: "#050506",

    // The interface is English; kalam content is Urdu.
    lang: "en",
    dir: "ltr",
    categories: ["books", "education", "lifestyle"],

    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Android crops launcher icons to its own shape; without a maskable
      // variant it falls back to a white circle around a shrunken logo.
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],

    // Long-press the installed icon to jump straight to a section.
    shortcuts: [
      {
        name: "Saved kalam",
        url: "/bookmarks",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
