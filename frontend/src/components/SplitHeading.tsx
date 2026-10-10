import { createElement, HTMLAttributes, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type SplitHeadingProps = HTMLAttributes<HTMLElement> & {
  as?: "h1" | "h2" | "h3" | "p";
  children: string; // plain text only, and it should not change while the page is open
  delay?: number;
  start?: string;
};

/** Heading whose lines slide up from behind an invisible mask. */
export default function SplitHeading({
  as = "h2",
  children,
  delay = 0,
  start = "top 88%",
  ...props
}: SplitHeadingProps) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion) return;

      SplitText.create(el, {
        type: "lines",
        mask: "lines", // each line gets its own "window" so text appears from below it
        autoSplit: true, // splits again after fonts load / width changes
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.4,
            ease: "power4.out",
            stagger: 0.18,
            delay,
            scrollTrigger: { trigger: el, start, once: true },
          }),
      });
    },
    { scope: ref, dependencies: [reducedMotion, delay, start] },
  );

  return createElement(as, { ...props, ref }, children);
}
