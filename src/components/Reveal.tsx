"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger the direct children instead of animating the container. */
  group?: boolean;
  delay?: number;
  /** Travel distance in px. Kept inside the 12–24px band from §4. */
  y?: number;
};

/**
 * Scroll-entrance animation.
 *
 * Reduced motion is handled by `gsap.matchMedia` here and by a matching CSS
 * guard in globals.css — the pre-animation `opacity: 0` is only applied when
 * motion is welcome, so a visitor who asked for stillness sees the content
 * laid out normally rather than blank. That is also why `matchMedia` wraps the
 * whole block: nothing to disable per-component, nothing to forget.
 */
export function Reveal({
  children,
  className,
  group = false,
  delay = 0,
  y = 18,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = group
          ? gsap.utils.toArray<HTMLElement>(el.children)
          : [el];
        if (targets.length === 0) return;

        // Long grids get a fixed total stagger window rather than a fixed
        // per-item delay, which keeps roughly 8 items in flight at once
        // instead of letting a 40-card list animate for three seconds.
        const stagger = group
          ? targets.length > 12
            ? { amount: 0.7 }
            : { each: 0.06 }
          : 0;

        gsap.fromTo(
          targets,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            delay,
            ease: "power2.out",
            stagger,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [group, delay, y] },
  );

  return (
    <div
      ref={ref}
      className={className}
      {...(group ? { "data-reveal-group": "" } : { "data-reveal": "" })}
    >
      {children}
    </div>
  );
}
