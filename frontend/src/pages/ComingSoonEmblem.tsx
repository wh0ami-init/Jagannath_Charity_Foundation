import { tr as translateText, localize as localizeText, trError as translateError } from "../i18n";
import { useTranslation as usePageTranslation } from "react-i18next";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import type { ComingSoonSection } from "../lib/comingSoonSections";
gsap.registerPlugin(useGSAP);
export default function ComingSoonEmblem({ section }: {
    section: ComingSoonSection;
}) {
    usePageTranslation();
    const root = useRef<HTMLDivElement>(null);
    const reducedMotion = useReducedMotion();
    useGSAP(() => {
        const svg = root.current?.querySelector("svg");
        if (!svg)
            return;
        const lines = svg.querySelectorAll<SVGPathElement>(".emblem-line");
        const accents = svg.querySelectorAll<SVGElement>(".emblem-accent");
        if (reducedMotion) {
            gsap.set(lines, { strokeDashoffset: 0 });
            gsap.set(accents, { autoAlpha: 1, scale: 1, rotate: 0 });
            return;
        }
        lines.forEach((line) => {
            const length = line.getTotalLength();
            gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
        });
        gsap.set(accents, { autoAlpha: 0, transformOrigin: "50% 50%" });
        const timeline = gsap.timeline({ repeat: -1, repeatDelay: 2.8 });
        timeline.to(lines, { strokeDashoffset: 0, duration: 0.85, stagger: 0.1, ease: "power2.inOut" });
        timeline.to(accents, { autoAlpha: 1, scale: 1, rotate: section.emblem === "certificate" ? 12 : 0, duration: 0.45, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.2");
        if (section.emblem === "video") {
            timeline.to(".emblem-play", { scale: 1.17, duration: 0.5, yoyo: true, repeat: 1, transformOrigin: "50% 50%", ease: "sine.inOut" });
        }
        else if (section.emblem === "campaign") {
            timeline.to(".emblem-flag", { y: -5, duration: 0.4, yoyo: true, repeat: 1, ease: "sine.inOut" });
        }
        else if (section.emblem === "event") {
            timeline.to(".emblem-star", { rotate: 30, scale: 1.13, duration: 0.5, yoyo: true, repeat: 1, transformOrigin: "50% 50%", ease: "sine.inOut" });
        }
        else if (section.emblem === "expenses") {
            timeline.fromTo(".emblem-bar", { scaleY: 0.68, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.4, stagger: 0.12, yoyo: true, repeat: 1, ease: "sine.inOut" });
        }
        else if (section.emblem === "internship") {
            timeline.to(".emblem-spark", { y: -5, scale: 1.15, duration: 0.4, yoyo: true, repeat: 1, transformOrigin: "50% 50%", ease: "sine.inOut" });
        }
        else if (section.emblem === "certificate") {
            timeline.to(".emblem-seal", { rotate: -24, duration: 0.55, yoyo: true, repeat: 1, transformOrigin: "50% 50%", ease: "sine.inOut" });
        }
        else if (section.emblem === "beneficiary-directory") {
            timeline.to(".emblem-person", { y: -3, duration: 0.35, stagger: 0.1, yoyo: true, repeat: 1, ease: "sine.inOut" });
        }
        else if (section.emblem === "beneficiary-apply") {
            timeline.to(".emblem-plus", { scale: 1.18, duration: 0.4, yoyo: true, repeat: 1, transformOrigin: "50% 50%", ease: "sine.inOut" });
        }
        else if (section.emblem === "id-card") {
            timeline.to(".emblem-person", { y: -3, duration: 0.35, yoyo: true, repeat: 1, ease: "sine.inOut" });
        }
        else if (section.emblem === "appointment-letter") {
            timeline.to(".emblem-check", { scale: 1.16, duration: 0.4, yoyo: true, repeat: 1, transformOrigin: "50% 50%", ease: "sine.inOut" });
        }
        else {
            timeline.to(".emblem-handle", { y: -4, duration: 0.4, yoyo: true, repeat: 1, ease: "sine.inOut" });
        }
    }, { scope: root, dependencies: [reducedMotion, section.emblem], revertOnUpdate: true });
    return (<div ref={root} className={`coming-soon-mark coming-soon-mark--${section.id}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" fill="none">
        {localizeText(section.emblem === "video" && <g>
          <rect className="emblem-line" x="15" y="22" width="70" height="56" rx="9"/>
          <path className="emblem-line" d="M26 22v8m12-8v8m12-8v8m12-8v8m12-8v8M26 70v8m12-8v8m12-8v8m12-8v8m12-8v8"/>
          <path className="emblem-line emblem-play" d="m43 39 21 11-21 11V39Z"/>
          <circle className="emblem-accent" cx="76" cy="70" r="3"/>
        </g>)}
        {localizeText(section.emblem === "campaign" && <g>
          <path className="emblem-line" d="M24 78V20m1 5c18-15 34 12 52-2v35c-18 14-34-13-52 2"/>
          <path className="emblem-line emblem-flag" d="M25 25c18-15 34 12 52-2v35c-18 14-34-13-52 2V25Z"/>
          <path className="emblem-line" d="M17 79h20"/>
          <circle className="emblem-accent" cx="70" cy="34" r="4"/>
        </g>)}
        {localizeText(section.emblem === "event" && <g>
          <rect className="emblem-line" x="19" y="25" width="62" height="57" rx="7"/>
          <path className="emblem-line" d="M19 42h62M34 18v15m32-15v15"/>
          <path className="emblem-line emblem-star" d="m50 50 4.2 8.5 9.4 1.4-6.8 6.6 1.6 9.3-8.4-4.4-8.4 4.4 1.6-9.3-6.8-6.6 9.4-1.4L50 50Z"/>
          <circle className="emblem-accent" cx="74" cy="29" r="3"/>
        </g>)}
        {localizeText(section.emblem === "expenses" && <g>
          <path className="emblem-line" d="M20 78h62M25 78V53h13v25M47 78V39h13v39M69 78V24h13v54"/>
          <path className="emblem-line" d="m26 44 22-15 16 5 16-17"/>
          <circle className="emblem-accent" cx="80" cy="17" r="4"/>
          <rect className="emblem-accent emblem-bar" x="25" y="53" width="13" height="25" rx="2"/>
          <rect className="emblem-accent emblem-bar" x="47" y="39" width="13" height="39" rx="2"/>
          <rect className="emblem-accent emblem-bar" x="69" y="24" width="13" height="54" rx="2"/>
        </g>)}
        {localizeText(section.emblem === "internship" && <g>
          <path className="emblem-line" d="M18 27c12-5 22-3 32 4v48c-10-7-20-9-32-4V27Zm64 0c-12-5-22-3-32 4v48c10-7 20-9 32-4V27Z"/>
          <path className="emblem-line" d="M28 40c6-2 12-1 17 2m-17 9c6-2 12-1 17 2m27-13c-6-2-12-1-17 2m17 9c-6-2-12-1-17 2"/>
          <path className="emblem-accent emblem-spark" d="m74 15 2.3 5.7L82 23l-5.7 2.3L74 31l-2.3-5.7L66 23l5.7-2.3L74 15Z"/>
        </g>)}
        {localizeText(section.emblem === "certificate" && <g>
          <path className="emblem-line" d="M26 18h37l13 13v37H26V18Zm37 0v14h13M35 43h31M35 51h20"/>
          <circle className="emblem-line emblem-seal" cx="64" cy="68" r="15"/>
          <path className="emblem-line emblem-seal" d="m56 80-2 11 10-5 10 5-2-11"/>
          <path className="emblem-accent emblem-accent--line" d="m58 68 4 4 8-9"/>
        </g>)}
        {localizeText(section.emblem === "career" && <g>
          <rect className="emblem-line" x="17" y="35" width="66" height="43" rx="7"/>
          <path className="emblem-line emblem-handle" d="M36 35v-8a6 6 0 0 1 6-6h16a6 6 0 0 1 6 6v8m-47 14h66M43 47v9h14v-9"/>
          <path className="emblem-accent" d="M50 54v4"/>
        </g>)}
        {localizeText(section.emblem === "beneficiary-directory" && <g>
          <circle className="emblem-accent emblem-person" cx="37" cy="34" r="10"/>
          <circle className="emblem-accent emblem-person" cx="65" cy="31" r="12"/>
          <path className="emblem-line" d="M18 76c1-15 8-23 19-23s18 8 19 23m-2-7c2-15 10-23 21-23s18 8 19 23M15 81h70"/>
        </g>)}
        {localizeText(section.emblem === "beneficiary-apply" && <g>
          <path className="emblem-line" d="M27 15h34l13 13v42H27V15Zm34 0v14h13M36 41h29M36 49h18"/>
          <circle className="emblem-line" cx="59" cy="68" r="16"/>
          <path className="emblem-accent emblem-plus" d="M59 59v18m-9-9h18"/>
        </g>)}
        {localizeText(section.emblem === "id-card" && <g>
          <rect className="emblem-line" x="13" y="22" width="74" height="56" rx="8"/>
          <path className="emblem-line" d="M13 36h74"/>
          <circle className="emblem-accent emblem-person" cx="34" cy="52" r="8"/>
          <path className="emblem-line" d="M22 70c1-8 5-12 12-12s11 4 12 12m9-18h19m-19 9h19m-19 9h13"/>
        </g>)}
        {localizeText(section.emblem === "appointment-letter" && <g>
          <path className="emblem-line" d="M25 14h38l13 13v41H25V14Zm38 0v14h13M35 42h30M35 50h22"/>
          <circle className="emblem-line" cx="65" cy="69" r="15"/>
          <path className="emblem-accent emblem-accent--line emblem-check" d="m57 69 6 6 11-13"/>
        </g>)}
      </svg>
    </div>);
}
