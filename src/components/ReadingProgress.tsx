"use client";

import { useEffect, useState } from "react";

/**
 * Progress through a long kalam.
 *
 * Purely decorative, so it is hidden from assistive tech — a live-updating
 * progressbar role would announce constantly while scrolling and tell a
 * screen-reader user nothing they cannot already get from their own cursor.
 *
 * Scroll events are coalesced into one rAF per frame and the bar is driven by
 * `transform`, so nothing here triggers layout while scrolling.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    function measure() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollable > 0 ? Math.min(1, doc.scrollTop / scrollable) : 0);
    }

    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5"
    >
      <div
        className="h-full bg-gold"
        style={{
          transform: `scaleX(${progress})`,
          // The document is RTL, so reading — and therefore the fill — starts
          // at the physical right edge.
          transformOrigin: "right",
        }}
      />
    </div>
  );
}
