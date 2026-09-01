"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

/**
 * Slow ambient gradient wash behind the hero.
 *
 * Only `transform` and `opacity` are animated, so the whole thing stays on the
 * compositor — no layout, no paint, no main-thread cost while scrolling. The
 * blur is baked into a static `filter`, which the GPU rasterises once.
 *
 * Under `prefers-reduced-motion` the `.ambient-blobs` container is hidden
 * outright by globals.css and the tweens never start.
 */
export function AmbientBlobs() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const blobs = gsap.utils.toArray<HTMLElement>(".ambient-blob");

        blobs.forEach((blob, i) => {
          gsap.to(blob, {
            xPercent: i % 2 === 0 ? 14 : -12,
            yPercent: i === 1 ? 12 : -10,
            scale: 1.12,
            duration: 20 + i * 6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 1.5,
          });
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      // `clip` (not `hidden`) so the blobs cannot create a horizontal
      // scrollbar without turning this into a scroll container.
      className="ambient-blobs pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(90svh,720px)] overflow-clip"
      style={{ opacity: "var(--blob-opacity)" }}
    >
      <div
        className="ambient-blob absolute left-[-10%] top-[-18%] h-[46rem] w-[46rem] rounded-full will-change-transform"
        style={{
          background: "radial-gradient(circle, var(--blob-a), transparent 62%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="ambient-blob absolute right-[-14%] top-[-8%] h-[38rem] w-[38rem] rounded-full will-change-transform"
        style={{
          background: "radial-gradient(circle, var(--blob-b), transparent 62%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="ambient-blob absolute left-[28%] top-[24%] h-[34rem] w-[34rem] rounded-full will-change-transform"
        style={{
          background: "radial-gradient(circle, var(--blob-c), transparent 64%)",
          filter: "blur(100px)",
        }}
      />
    </div>
  );
}
