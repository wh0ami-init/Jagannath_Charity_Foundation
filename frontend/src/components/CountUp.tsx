import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// "22.85%" -> number "22.85", rest "%"   |   "3.1 lakh+" -> "3.1", " lakh+"
const PATTERN = /^([\d,]+(?:\.\d+)?)(.*)$/;

export default function CountUp({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const node = ref.current?.firstChild;
      const match = value.match(PATTERN);
      if (!node || !match || reducedMotion) return; // keep the normal text

      const target = parseFloat(match[1].replace(/,/g, ""));
      const decimals = match[1].includes(".")
        ? match[1].split(".")[1].length
        : 0;
      const suffix = match[2];
      const show = (n: number) =>
        n.toLocaleString("en-IN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) + suffix;

      const counter = { n: 0 };
      node.nodeValue = show(0);

      gsap.to(counter, {
        n: target,
        duration: 2.2,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
        onUpdate: () => {
          node.nodeValue = show(counter.n);
        },
        onComplete: () => {
          node.nodeValue = value;
        },
      });

      return () => {
        node.nodeValue = value;
      };
    },
    { scope: ref, dependencies: [value, reducedMotion], revertOnUpdate: true },
  );

  return (
    <p ref={ref} className={className}>
      {value}
    </p>
  );
}
