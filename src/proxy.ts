import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Next 16 renamed the middleware convention to `proxy` — the file is
 * `(?:src/)?proxy.ts` and the export is `proxy`. Using the old
 * `middleware.ts` / `export function middleware` pair on this version warns.
 *
 * This is the first of three independent gates, not the only one: the
 * protected layout re-checks the session server-side, and every mutating
 * server action re-checks it again. A proxy alone is a routing convenience,
 * not a security boundary — it never sees a direct server-action invocation.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  // Already signed in? The login form has nothing left to offer.
  if (pathname === "/admin/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    const url = new URL("/admin/login", request.url);
    // Send them back where they were headed once they sign in.
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
