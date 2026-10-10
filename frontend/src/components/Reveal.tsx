import { createElement, HTMLAttributes, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type RevealTag = "div" | "section" | "article" | "h3" | "h2" | "aside" | "nav" | "address" | "form" | "button" | "a";
type RevealDirection = "up" | "down" | "left" | "right";
type RevealProps = HTMLAttributes<any> & {
  as?: RevealTag;
  delay?: number;
  duration?: number;
  delayOffset?: number;
  start?: string;
  direction?: RevealDirection;
  href?: string;
  type?: "button" | "submit" | "reset";
};

export default function Reveal({ as = "div", delay = 0, duration = 0.55, delayOffset = 0.06, start = "top 86%", direction = "up", ...props }: RevealProps) {
  const scope = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    const element = scope.current;
    if (!element) return;

    if (reducedMotion) {
      gsap.set(element, { autoAlpha: 1, x: 0, y: 0 });
      return;
    }

    const offset = direction === "left"
      ? { x: -18, y: 0 }
      : direction === "right"
        ? { x: 18, y: 0 }
        : direction === "down"
          ? { x: 0, y: -14 }
          : { x: 0, y: 14 };

    gsap.fromTo(element, { autoAlpha: 0, ...offset }, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      duration,
      delay: delay + delayOffset,
      ease: "power3.out",
      overwrite: "auto",
      scrollTrigger: {
        trigger: element,
        start,
        once: true,
      },
    });
  }, { scope, dependencies: [delay, duration, delayOffset, start, direction, reducedMotion], revertOnUpdate: true });

  return createElement(as, { ...props, ref: scope });
}
