import { tr as translateText, localize as localizeText, trError as translateError } from "../i18n";
import { useTranslation as usePageTranslation } from "react-i18next";
import { useRef, type CSSProperties } from "react";
import { Link } from "wouter";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import "./HomeUtilityCards.css";
gsap.registerPlugin(useGSAP, ScrollTrigger);
const utilityCards = [
    { title: "Generate ID Card", href: "/generate-id-card", icon: "id" },
    { title: "Generate Certificate", href: "/generate-certificate", icon: "certificate" },
    { title: "Appointment Letter", href: "/appointment-letter", icon: "appointment" },
    { title: "Donate Us", href: "/donate", icon: "donate" },
];
function UtilityIcon({ name }: {
    name: string;
}) {
    usePageTranslation();
    if (name === "id")
        return (<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="40" height="30" rx="4" fill="currentColor"/>
      <circle cx="16" cy="20" r="5" fill="#fff"/>
      <path d="M8.5 33c.5-4.5 3-7 7.5-7s7 2.5 7.5 7H8.5Z" fill="#fff"/>
      <path d="M28 18h10M28 24h10M28 30h7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/>
    </svg>);
    if (name === "certificate")
        return (<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="m24 3 4.4 5.1 6.5-1.2.8 6.6 6.2 2.4-2.8 6 4.4 5-5.8 3.3.2 6.7-6.6-.4-3.7 5.6-4.8-4.7-5.9 3-2.4-6.2-6.6-.9 1.3-6.5-5-4.4 5.2-4.2-1.3-6.5 6.6-.8L17.9 5l6.1 2.8L24 3Z" fill="currentColor"/>
      <path d="m17 31-1 12 8-4 8 4-1-12" fill="currentColor"/>
      <path d="m19 23 3.5 3.5L30 19" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>);
    if (name === "appointment")
        return (<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M13 5h15l9 9v29H13a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M28 5v10h9M17 23h15M17 29h9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="32" cy="34" r="9" fill="#fffefa" stroke="currentColor" strokeWidth="2.5"/>
      <path d="m28.5 34 2.3 2.3 4.5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>);
    return (<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 41S5 29 5 17c0-10 13-14 19-4 6-10 19-6 19 4 0 12-19 24-19 24Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M15 24h18M24 15v18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
    </svg>);
}
export default function HomeUtilityCards() {
    usePageTranslation();
    const sectionRef = useRef<HTMLElement>(null);
    const reducedMotion = useReducedMotion();
    useGSAP(() => {
        const section = sectionRef.current;
        const cards = section?.querySelectorAll<HTMLElement>(".home-utility-card");
        if (!cards?.length)
            return;
        if (reducedMotion) {
            gsap.set(cards, { autoAlpha: 1, y: 0, rotateX: 0 });
            return;
        }
        gsap.fromTo(cards, { autoAlpha: 0, y: 36, rotateX: -5 }, {
            autoAlpha: 1,
            y: 0,
            rotateX: 0,
            duration: .78,
            stagger: .12,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 88%", once: true },
        });
        const cleanups: Array<() => void> = [];
        cards.forEach((card) => {
            const icon = card.querySelector<HTMLElement>(".home-utility-icon");
            const underline = card.querySelector<HTMLElement>(".home-utility-rule");
            const enter = () => {
                gsap.to(card, { y: -7, duration: .32, ease: "power2.out", overwrite: "auto" });
                gsap.to(icon, { y: -5, rotate: -5, scale: 1.1, duration: .42, ease: "back.out(2)", overwrite: "auto" });
                gsap.to(underline, { scaleX: 2.2, duration: .35, ease: "power2.out", overwrite: "auto" });
            };
            const leave = () => {
                gsap.to(card, { y: 0, duration: .38, ease: "power3.out", overwrite: "auto" });
                gsap.to(icon, { y: 0, rotate: 0, scale: 1, duration: .42, ease: "power3.out", overwrite: "auto" });
                gsap.to(underline, { scaleX: 1, duration: .32, ease: "power2.out", overwrite: "auto" });
            };
            card.addEventListener("pointerenter", enter);
            card.addEventListener("pointerleave", leave);
            card.addEventListener("focus", enter);
            card.addEventListener("blur", leave);
            cleanups.push(() => {
                card.removeEventListener("pointerenter", enter);
                card.removeEventListener("pointerleave", leave);
                card.removeEventListener("focus", enter);
                card.removeEventListener("blur", leave);
            });
        });
        return () => cleanups.forEach((cleanup) => cleanup());
    }, { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true });
    return (<section ref={sectionRef} className="home-utility-section" aria-label={translateText("Quick access")}>
      <div className="home-utility-grid">
        {localizeText(utilityCards.map((card, index) => (<Link className="home-utility-card" href={card.href} key={card.href} style={{ "--card-index": index } as CSSProperties}>
            <span className="home-utility-icon"><UtilityIcon name={card.icon}/></span>
            <span className="home-utility-title">{localizeText(card.title)}</span>
            <span className="home-utility-rule" aria-hidden="true"/>
            <span className="home-utility-arrow" aria-hidden="true">↗</span>
          </Link>)))}
      </div>
    </section>);
}
