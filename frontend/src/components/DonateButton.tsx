import { useRef, type MouseEvent } from "react";
import { Link } from "wouter";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { tr as translateText } from "../i18n";
import "./DonateButton.css";

gsap.registerPlugin(useGSAP);

type DonateButtonProps = {
  /** "nav" = header pill, "hero" = big home-page button, "compact" = small phone-header pill */
  variant?: "nav" | "hero" | "compact";
  /** Extra class names (for example "nav-donate" so old header rules still apply). */
  className?: string;
  /** Button words. Must exist in hindi.json so the language switch works. */
  label?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const HEART_PATH =
  "M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.8 6.2 4.8c2 0 3.5 1.1 4.3 2.5.3.5.7.5 1 0 .8-1.4 2.3-2.5 4.3-2.5 3.5 0 5.3 3.6 3.8 7C19.5 16.4 12 21 12 21Z";

/**
 * The one Donate button used across the site.
 *  - calm "alive" loop: heartbeat, soft ring, light sweep
 *  - on hover (mouse only): the button leans toward the cursor, heart pops
 *  - on press: a small burst of hearts (does not delay the page change)
 *  - respects "reduce motion": no animation at all, just a clear button
 */
export default function DonateButton({
  variant = "nav",
  className = "",
  label = "Donate",
  onClick,
}: DonateButtonProps) {
  const root = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const heart = el.querySelector<SVGElement>(".donate-btn-heart");
      const ring = el.querySelector<HTMLElement>(".donate-btn-ring");
      const shine = el.querySelector<HTMLElement>(".donate-btn-shine");
      const arrow = el.querySelector<HTMLElement>(".donate-btn-arrow");
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          hover: "(hover: hover) and (pointer: fine)",
        },
        (ctx) => {
          const { motion, hover } = ctx.conditions as {
            motion: boolean;
            hover: boolean;
          };
          if (!motion) return;

          /* 1 ─ Entrance: pops in so the eye finds it */
          gsap.from(el, {
            autoAlpha: 0,
            scale: 0.82,
            y: 8,
            duration: 0.7,
            delay: variant === "hero" ? 0.9 : 0.4,
            ease: "back.out(1.8)",
            clearProps: "opacity,visibility,transform",
          });

          /* 2 ─ Idle loop: heartbeat + ring + shine */
          const idle = gsap.timeline({ repeat: -1, delay: 1.6 });
          idle
            .to(heart, {
              scale: 1.22,
              duration: 0.14,
              ease: "power2.out",
              transformOrigin: "50% 55%",
            })
            .to(heart, { scale: 1, duration: 0.16, ease: "power2.in" })
            .to(heart, { scale: 1.14, duration: 0.12, ease: "power2.out" })
            .to(heart, { scale: 1, duration: 0.3, ease: "power2.in" });
          if (ring) {
            idle.fromTo(
              ring,
              { scale: 1, autoAlpha: 0.55 },
              { scale: 1.28, autoAlpha: 0, duration: 1.1, ease: "power2.out" },
              0,
            );
          }
          if (shine) {
            idle.fromTo(
              shine,
              { xPercent: -140 },
              { xPercent: 340, duration: 0.9, ease: "power2.inOut" },
              0.5,
            );
          }
          idle.to({}, { duration: 1.6 }); // rest between beats

          /* 3 ─ Hover: magnetic lean (mouse only) */
          const cleanups: Array<() => void> = [];
          if (hover) {
            const strength = variant === "hero" ? 0.28 : 0.22;
            const moveX = gsap.quickTo(el, "x", {
              duration: 0.45,
              ease: "power3.out",
            });
            const moveY = gsap.quickTo(el, "y", {
              duration: 0.45,
              ease: "power3.out",
            });

            const onMove = (event: PointerEvent) => {
              const box = el.getBoundingClientRect();
              moveX((event.clientX - (box.left + box.width / 2)) * strength);
              moveY((event.clientY - (box.top + box.height / 2)) * strength);
            };
            const onEnter = () => {
              idle.pause();
              gsap.to(heart, {
                scale: 1.3,
                rotate: -10,
                duration: 0.4,
                ease: "back.out(3)",
                overwrite: "auto",
              });
              if (arrow)
                gsap.to(arrow, {
                  x: 5,
                  duration: 0.3,
                  ease: "power2.out",
                  overwrite: "auto",
                });
            };
            const onLeave = () => {
              moveX(0);
              moveY(0);
              gsap.to(heart, {
                scale: 1,
                rotate: 0,
                duration: 0.4,
                ease: "power3.out",
                overwrite: "auto",
              });
              if (arrow)
                gsap.to(arrow, {
                  x: 0,
                  duration: 0.3,
                  ease: "power2.out",
                  overwrite: "auto",
                });
              idle.restart();
            };
            el.addEventListener("pointermove", onMove);
            el.addEventListener("pointerenter", onEnter);
            el.addEventListener("pointerleave", onLeave);
            cleanups.push(() => {
              el.removeEventListener("pointermove", onMove);
              el.removeEventListener("pointerenter", onEnter);
              el.removeEventListener("pointerleave", onLeave);
            });
          }

          /* 4 ─ Press: tiny burst of hearts. Runs beside the page change, never blocks it. */
          const onDown = () => {
            const box = el.getBoundingClientRect();
            const count = variant === "compact" ? 5 : 8;
            for (let i = 0; i < count; i += 1) {
              const piece = document.createElement("span");
              piece.className = "donate-btn-spark";
              piece.setAttribute("aria-hidden", "true");
              piece.innerHTML = `<svg viewBox="0 0 24 24"><path d="${HEART_PATH}"/></svg>`;
              el.appendChild(piece);
              const angle =
                (Math.PI * 2 * i) / count + gsap.utils.random(-0.3, 0.3);
              const dist =
                gsap.utils.random(34, 64) * (box.width > 150 ? 1 : 0.8);
              gsap.fromTo(
                piece,
                { x: 0, y: 0, scale: 0.3, autoAlpha: 1, rotate: 0 },
                {
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist - 12,
                  scale: gsap.utils.random(0.7, 1.15),
                  autoAlpha: 0,
                  rotate: gsap.utils.random(-40, 40),
                  duration: gsap.utils.random(0.6, 0.95),
                  ease: "power2.out",
                  onComplete: () => piece.remove(),
                },
              );
            }
          };
          el.addEventListener("pointerdown", onDown);
          cleanups.push(() => el.removeEventListener("pointerdown", onDown));

          return () => {
            idle.kill();
            cleanups.forEach((fn) => fn());
            el.querySelectorAll(".donate-btn-spark").forEach((n) => n.remove());
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root, dependencies: [variant] },
  );

  return (
    <Link
      href="/donate"
      ref={root}
      className={`donate-btn donate-btn-${variant} ${className}`.trim()}
      onClick={onClick}
    >
      <span className="donate-btn-ring" aria-hidden="true" />
      <span className="donate-btn-shine-wrap" aria-hidden="true">
        <span className="donate-btn-shine" />
      </span>
      <svg className="donate-btn-heart" viewBox="0 0 24 24" aria-hidden="true">
        <path d={HEART_PATH} />
      </svg>
      <span className="donate-btn-label">{translateText(label)}</span>
      {variant !== "compact" && (
        <span className="donate-btn-arrow" aria-hidden="true">
          →
        </span>
      )}
    </Link>
  );
}
