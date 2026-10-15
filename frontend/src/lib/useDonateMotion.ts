import type { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

/**
 * Premium motion layer for the Donate page.
 * Attach to ONE wrapper element that contains all donate sections.
 */
export function useDonateMotion(scope: RefObject<HTMLElement>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const all = <T extends HTMLElement = HTMLElement>(selector: string) =>
        Array.from(root.querySelectorAll<T>(selector));
      const one = <T extends HTMLElement = HTMLElement>(selector: string) =>
        root.querySelector<T>(selector);

      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          hover: "(hover: hover) and (pointer: fine)",
          small: "(max-width: 760px)",
        },
        (ctx) => {
          const { motion, hover, small } = ctx.conditions as {
            motion: boolean;
            hover: boolean;
            small: boolean;
          };
          if (!motion) return;

          const dist = small ? 14 : 24;
          const cleanups: Array<() => void> = [];

          /* 1 ─ Section headings */
          all(".donation-choice-heading, .donation-section-heading").forEach((head) => {
            const eyebrow = head.querySelector(".donation-section-eyebrow");
            const title = head.querySelector("h2");
            const copy = head.querySelector("h2 ~ p");
            const tl = gsap.timeline({
              defaults: { ease: "power3.out" },
              scrollTrigger: { trigger: head, start: "top 88%", once: true },
            });
            if (eyebrow) tl.from(eyebrow, { autoAlpha: 0, letterSpacing: "0.4em", duration: 0.9 });
            if (title) {
              tl.fromTo(
                title,
                { clipPath: "inset(0% 0% 100% 0%)", y: dist },
                { clipPath: "inset(-10% -10% -10% -10%)", y: 0, duration: 0.9, clearProps: "clipPath" },
                "-=0.6",
              );
            }
            if (copy) tl.from(copy, { autoAlpha: 0, y: 12, duration: 0.7 }, "-=0.5");
          });

          /* 2 ─ Choice cards: cursor spotlight, icon spring, arrow nudge */
          all<HTMLAnchorElement>(".donation-choice-card").forEach((card) => {
            const icon = card.querySelector(".donation-choice-icon");
            const arrow = card.querySelector(".donation-choice-link span");
            let frame = 0;

            const enter = () => {
              gsap.to(icon, { scale: 1.1, rotate: -6, duration: 0.45, ease: "back.out(2.2)", overwrite: "auto" });
              gsap.to(arrow, { x: 7, duration: 0.35, ease: "power2.out", overwrite: "auto" });
            };
            const leave = () => {
              gsap.to(icon, { scale: 1, rotate: 0, duration: 0.45, ease: "power3.out", overwrite: "auto" });
              gsap.to(arrow, { x: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" });
            };
            const move = (event: PointerEvent) => {
              cancelAnimationFrame(frame);
              frame = requestAnimationFrame(() => {
                const box = card.getBoundingClientRect();
                card.style.setProperty("--mx", `${event.clientX - box.left}px`);
                card.style.setProperty("--my", `${event.clientY - box.top}px`);
              });
            };

            card.addEventListener("focus", enter);
            card.addEventListener("blur", leave);
            if (hover) {
              card.addEventListener("pointerenter", enter);
              card.addEventListener("pointerleave", leave);
              card.addEventListener("pointermove", move);
            }
            cleanups.push(() => {
              cancelAnimationFrame(frame);
              card.removeEventListener("focus", enter);
              card.removeEventListener("blur", leave);
              card.removeEventListener("pointerenter", enter);
              card.removeEventListener("pointerleave", leave);
              card.removeEventListener("pointermove", move);
            });
          });

          /* 3 ─ Smooth jump from a choice card to its section + gold pulse */
          const onChoiceClick = (event: MouseEvent) => {
            const link = (event.target as Element).closest<HTMLAnchorElement>("a.donation-choice-card");
            const hash = link?.getAttribute("href");
            if (!link || !hash || !hash.startsWith("#")) return;
            const target = one(hash);
            if (!target) return;
            event.preventDefault();

            const html = document.documentElement;
            const restore = () => {
              html.style.scrollBehavior = "";
            };
            html.style.scrollBehavior = "auto"; // CSS smooth-scroll fights ScrollToPlugin

            gsap.to(window, {
              scrollTo: { y: target, offsetY: 96, autoKill: true },
              duration: small ? 0.9 : 1.2,
              ease: "power3.inOut",
              onInterrupt: restore,
              onComplete: () => {
                restore();
                history.replaceState(null, "", hash);
                const card = target.querySelector<HTMLElement>(".donation-checkout-card, .monthly-autopay-card");
                if (card) {
                  gsap.fromTo(
                    card,
                    { boxShadow: "0 0 0 0 rgba(217,154,70,.6)" },
                    { boxShadow: "0 0 0 16px rgba(217,154,70,0)", duration: 1.1, ease: "power2.out", clearProps: "boxShadow" },
                  );
                }
              },
            });
          };
          root.addEventListener("click", onChoiceClick);
          cleanups.push(() => root.removeEventListener("click", onChoiceClick));

          /* 4 ─ Online-giving card: steps timeline draws itself */
          const stepsList = one(".donation-checkout-steps");
          const steps = all(".donation-checkout-steps li");
          if (stepsList && steps.length) {
            const tl = gsap.timeline({
              defaults: { ease: "power3.out" },
              scrollTrigger: { trigger: stepsList, start: "top 88%", once: true },
            });
            tl.fromTo(stepsList, { "--rail": 0 }, { "--rail": 1, duration: steps.length * 0.45, ease: "none" }, 0);
            steps.forEach((li, i) => {
              const at = i * 0.4;
              const badge = li.children[0];
              tl.from(li, { autoAlpha: 0, x: small ? 0 : -20, y: small ? 14 : 0, duration: 0.55 }, at);
              tl.from(badge, { scale: 0.4, duration: 0.55, ease: "back.out(2.4)" }, at);
              tl.fromTo(
                badge,
                { boxShadow: "0 0 0 0 rgba(240,203,131,.5)" },
                { boxShadow: "0 0 0 12px rgba(240,203,131,0)", duration: 0.9, ease: "power2.out", clearProps: "boxShadow" },
                at + 0.2,
              );
            });
          }

          /* 5 ─ Ambient glow: slow float + scroll parallax */
          const glow = one(".donation-checkout-glow");
          const checkoutCard = one(".donation-checkout-card");
          if (glow) {
            gsap.to(glow, { x: -30, y: 36, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 });
            if (checkoutCard) {
              gsap.to(glow, {
                yPercent: 35,
                ease: "none",
                scrollTrigger: { trigger: checkoutCard, start: "top bottom", end: "bottom top", scrub: true },
              });
            }
          }

          /* 6 ─ Bank-transfer rows cascade in */
          const bank = one(".bank-details");
          const bankRows = all(".bank-details .bank-row");
          if (bank && bankRows.length) {
            gsap.from(bankRows, {
              autoAlpha: 0,
              x: small ? 0 : -16,
              y: small ? 10 : 0,
              duration: 0.6,
              stagger: 0.07,
              ease: "power3.out",
              clearProps: "opacity,visibility,transform",
              scrollTrigger: { trigger: bank, start: "top 86%", once: true },
            });
          }

          /* 7 ─ Monthly AutoPay: copy slides in, then the form fields follow */
          const monthly = one(".monthly-autopay-card");
          if (monthly) {
            const copyItems = all(".monthly-autopay-copy > *");
            const formItems = all(".monthly-autopay-form > *");
            const tl = gsap.timeline({
              defaults: { ease: "power3.out" },
              scrollTrigger: { trigger: monthly, start: "top 80%", once: true },
            });
            if (copyItems.length) {
              tl.from(copyItems, {
                autoAlpha: 0,
                x: small ? 0 : -22,
                y: small ? 16 : 0,
                duration: 0.8,
                stagger: 0.1,
                clearProps: "opacity,visibility,transform",
              });
            }
            if (formItems.length) {
              tl.from(
                formItems,
                { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.07, clearProps: "opacity,visibility,transform" },
                "-=0.55",
              );
            }
          }

          return () => cleanups.forEach((fn) => fn());
        },
      );

      return () => mm.revert();
    },
    { scope },
  );
}