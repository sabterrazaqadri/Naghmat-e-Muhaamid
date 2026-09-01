import type { Metadata, Viewport } from "next";

import { ServiceWorker } from "@/components/ServiceWorker";
import { fontVariables } from "@/lib/fonts";
import { site, siteUrl } from "@/lib/site";

import "./globals.css";

/**
 * Root layout holds only what every route needs — document shell, fonts, and
 * the pre-paint boot script. The public chrome (header, footer, ambient
 * backdrop, command palette) lives in the `(site)` group so the admin
 * dashboard can present its own chrome instead of inheriting a reader's.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.nameUr} — ${site.nameLatin}`,
    template: `%s — ${site.nameLatin}`,
  },
  description: site.descriptionUr,
  applicationName: site.nameLatin,
  authors: [{ name: site.poet.nameLatin }],
  openGraph: {
    type: "website",
    locale: "ur_PK",
    siteName: site.nameLatin,
    title: `${site.nameUr} — ${site.nameLatin}`,
    description: site.descriptionUr,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.nameUr} — ${site.nameLatin}`,
    description: site.descriptionUr,
  },
  alternates: { canonical: "/" },
  // iOS ignores the manifest for home-screen icons and reads this instead.
  appleWebApp: {
    capable: true,
    title: site.nameUr,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  // Matches --bg-deep in each mode so the mobile browser chrome blends in.
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050506" },
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
  ],
  colorScheme: "dark light",
};

/**
 * Runs before first paint.
 *
 * Two jobs, both of which must happen ahead of rendering:
 *  1. apply a stored theme choice, so there is no light-to-dark flash;
 *  2. mark the document as JS-capable, which is what arms the scroll-reveal
 *     `opacity: 0` rule in globals.css. Gating it on this flag means a visitor
 *     whose JS never loads sees the content rather than a blank column.
 */
const bootScript = `(function(){try{var t=localStorage.getItem('nem:theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}document.documentElement.dataset.js='on';})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* The next/font variable classes MUST sit on <html>, not <body>.
       globals.css builds its font tokens at :root — `--font-nastaliq:
       var(--font-nastaliq-urdu), …` — and a var() nested inside a custom
       property is substituted at the element that DECLARES it. With the font
       classes on <body>, `--font-nastaliq-urdu` was undefined at :root, so
       every font token computed to the empty string, every `font-family:
       var(--font-…)` became invalid, and the whole site silently fell back to
       the UA sans stack. Moving them up one element is the entire fix. */
    <html
      lang="ur"
      dir="rtl"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
