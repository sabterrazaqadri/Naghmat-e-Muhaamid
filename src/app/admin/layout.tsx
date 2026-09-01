import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "انتظامیہ", template: "%s — انتظامیہ" },
  // Belt and braces alongside the Disallow rule in robots.ts.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Deliberately thin. The login page and the protected pages both sit under
 * /admin but need different chrome, so the real shells live one level down —
 * in admin/login and admin/(protected).
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-svh">{children}</div>;
}
