import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AdminNav } from "@/components/admin/AdminNav";
import { FlashToast } from "@/components/admin/ActionToast";
import { isAdminAuthenticated } from "@/lib/auth";

/**
 * Second gate. The proxy already redirects unauthenticated browsers, but this
 * check is what actually prevents the page from rendering — proxies can be
 * bypassed by deployment quirks and never see a direct RPC, so authorisation
 * is re-established where the data is about to be read.
 */
export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div className="flex min-h-svh flex-col">
      <AdminNav />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>

      {/* useSearchParams needs a Suspense boundary above it. */}
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
    </div>
  );
}
