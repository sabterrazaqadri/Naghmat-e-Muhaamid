import { CloudSlash } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "آف لائن",
  robots: { index: false, follow: false },
};

/**
 * Served by the service worker when a navigation fails with no cached copy.
 *
 * Static on purpose — it must render with no network and no database, so it
 * takes no props and reads nothing.
 */
export default function OfflinePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span
        aria-hidden="true"
        className="grid size-16 place-items-center rounded-full bg-[color-mix(in_oklab,var(--accent-gold)_14%,transparent)] text-gold"
      >
        <CloudSlash size={30} />
      </span>

      <h1 className="heading-ur mt-6 text-3xl text-foreground">
        اس وقت آف لائن ہیں
      </h1>

      <p className="body-ur mt-3 max-w-md text-[0.95rem] text-muted">
        انٹرنیٹ سے رابطہ نہیں ہو سکا۔ جو کلام آپ پہلے پڑھ چکے ہیں وہ اب بھی
        کھل جائیں گے — باقی کے لیے رابطہ بحال ہونے کا انتظار کریں۔
      </p>

      <Link
        href="/"
        className="body-ur tap mt-8 inline-flex items-center rounded-full bg-gold px-5 text-sm font-medium text-gold-contrast transition-opacity hover:opacity-90"
      >
        دوبارہ کوشش کریں
      </Link>
    </div>
  );
}
