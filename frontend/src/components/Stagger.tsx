import { createElement, HTMLAttributes, ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type StaggerProps = HTMLAttributes<any> & {
  as?: "div" | "section" | "ul" | "ol" | "form" | "nav" | "dl";
  gap?: number; // seconds between one child and the next
  distance?: number; // how far (px) each child slides up
  start?: string;
  children: ReactNode;
};

/**
 * Wrap a group of cards/rows/fields. The DIRECT children come in one after
 * another when the group scrolls into view. A child that contains an element
 * with the attribute  data-line  also gets that line drawn left -> right.
 */
export default function Stagger({
  as = "div",
  gap = 0.14,
  distance = 22,
  start = "top 90%",
  children,
  ...props
}: StaggerProps) {
  const scope = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const root = scope.current;
      if (!root || reducedMotion) return; // reduced motion: nothing is hidden

      const items = Array.from(root.children) as HTMLElement[];
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: distance });
      gsap.set(root.querySelectorAll("[data-line]"), {
        scaleX: 0,
        transformOrigin: "left center",
      });

      const itemGap = gap;

      ScrollTrigger.batch(items, {
        start,
        once: true,
        interval: 0.1,
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            delay: 0.12,
            stagger: itemGap,
            overwrite: true,
            clearProps: "opacity,transform",
          });
          batch.forEach((item, i) => {
            const line = item.querySelector("[data-line]");
            if (line) {
              gsap.to(line, {
                scaleX: 1,
                duration: 0.55,
                ease: "power2.inOut",
                delay: 0.12 + i * itemGap + 0.25,
              });
            }
          });
        },
      });

      // A focused form control must remain visible even before its batch enters.
      if (as === "form") {
        const revealFocusedItem = (event: FocusEvent) => {
          const target = event.target;
          if (!(target instanceof Element)) return;
          let item: HTMLElement = target as HTMLElement;
          while (item.parentElement && item.parentElement !== root) {
            item = item.parentElement;
          }
          if (item.parentElement !== root) return;
          gsap.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.2,
            ease: "power1.out",
            overwrite: "auto",
            clearProps: "opacity,transform",
          });
        };

        root.addEventListener("focusin", revealFocusedItem);
        return () => root.removeEventListener("focusin", revealFocusedItem);
      }
    },
    {
      scope,
      dependencies: [reducedMotion, distance, gap, start],
      revertOnUpdate: true,
    },
  );

  return createElement(as, { ...props, ref: scope }, children);
}
