"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: this replaces the root layout, so it cannot rely on
 * anything the layout provides — no fonts, no theme tokens, no globals.css.
 * Everything here is inline and self-sufficient by necessity.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="ur" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "linear-gradient(to bottom, #050506, #0a0a0c)",
          color: "#f5f1e8",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <h1 style={{ fontSize: "1.75rem", lineHeight: 1.9, margin: 0 }}>
            کچھ غلط ہو گیا
          </h1>
          <p style={{ lineHeight: 2, color: "#9c9689" }}>
            ایپ لوڈ کرتے ہوئے سنگین مسئلہ پیش آیا۔ صفحہ دوبارہ لوڈ کریں۔
          </p>
          {error.digest ? (
            <p style={{ fontSize: "0.75rem", color: "#9c9689" }}>
              حوالہ: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              minHeight: "2.75rem",
              padding: "0 1.5rem",
              borderRadius: "0.75rem",
              border: "none",
              background: "#d4af37",
              color: "#0a0a0c",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            دوبارہ کوشش کریں
          </button>
        </div>
      </body>
    </html>
  );
}
