import type { Metadata } from "next";

import { NotFoundView } from "@/components/NotFoundView";

export const metadata: Metadata = {
  title: "صفحہ نہیں ملا",
  robots: { index: false, follow: false },
};

/** Catches URLs that match no route at all — deeper paths than /[category]. */
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col justify-center">
      <NotFoundView />
    </div>
  );
}
