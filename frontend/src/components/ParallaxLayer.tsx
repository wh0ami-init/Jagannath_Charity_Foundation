import { ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Put this INSIDE a box that has overflow-hidden and a fixed size.
 * The image inside moves a tiny bit slower than the page while scrolling.
 * Keep `amount` at 5 or lower, or small gaps can show at the edges.
 */
export default function ParallaxLayer({
  children,
  amount = 5,
}: {
  children: ReactNode;
  amount?: number;
}) {
  const layer = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const el = layer.current;
      const frame = el?.parentElement;
      if (!el || !frame || reducedMotion) return;

      gsap.set(el, { scale: 1.12 }); // a little bigger, so moving never shows an edge
      gsap.fromTo(
        el,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    },
    {
      scope: layer,
      dependencies: [reducedMotion, amount],
      revertOnUpdate: true,
    },
  );

  return (
    <div ref={layer} className="h-full w-full">
      {children}
    </div>
  );
}
