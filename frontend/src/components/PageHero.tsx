import { ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import { Link } from "wouter";
import "./PageHero.css";

gsap.registerPlugin(useGSAP);

type Theme =
  | "about"
  | "work"
  | "impact"
  | "team"
  | "donate"
  | "contact"
  | "volunteer"
  | "privacy"
  | "certificates";

type Fact = { value: string; label: string };
type Motif = "origin" | "programmes" | "measure" | "leadership" | "giving" | "place" | "volunteers" | "privacy" | "projects" | "partners" | "services" | "documents";

type PageHeroProps = {
  theme: Theme;
  /** Short page name for the breadcrumb, e.g. "Our work". */
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  motif: Motif;
  /** Buttons shown under the text. */
  actions?: ReactNode;
  /** Up to 4 short facts shown in a bar at the bottom of the banner. */
  facts?: Fact[];
};

export default function PageHero({
  theme,
  eyebrow,
  title,
  description,
  motif,
  actions,
  facts,
}: PageHeroProps) {
  const scope = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    const hero = scope.current;
    if (!hero) return;

    const paths = gsap.utils.toArray<SVGPathElement>(
      ".pagehero-art-line, .pagehero-art-accent",
      hero,
    );
    const nodes = gsap.utils.toArray<SVGCircleElement>(
      ".pagehero-art-node",
      hero,
    );

    if (reducedMotion) {
      gsap.set(paths, { strokeDashoffset: 0 });
      gsap.set(nodes, { autoAlpha: 1, scale: 1 });
      return;
    }

    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });
    gsap.set(nodes, { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" });

    const entrance = gsap.timeline();
    entrance
      .fromTo(
        ".pagehero-content",
        { autoAlpha: 0, y: 16, filter: "blur(5px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out" },
        0.04,
      )
      .to(paths, {
        strokeDashoffset: 0,
        duration: 1.25,
        stagger: 0.1,
        ease: "power2.inOut",
      }, 0.12)
      .to(nodes, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.07,
        ease: "back.out(1.6)",
      }, 0.78);

    gsap.to(".pagehero-art", {
      y: -8,
      duration: 5.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(".pagehero-glow--one", {
      x: 34,
      y: 18,
      scale: 1.08,
      duration: 13,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(".pagehero-glow--two", {
      x: -28,
      y: -16,
      scale: 1.06,
      duration: 15,
      delay: 0.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, { scope, dependencies: [reducedMotion], revertOnUpdate: true });

  return (
    <section ref={scope} className={`pagehero pagehero--${theme}`}>
      <div className="pagehero-atmosphere" aria-hidden="true">
        <span className="pagehero-glow pagehero-glow--one" />
        <span className="pagehero-glow pagehero-glow--two" />
        <span className="pagehero-glow pagehero-glow--three" />
      </div>
      <div className="pagehero-art" aria-hidden="true">
        <svg viewBox="0 0 640 500" role="presentation">
          {motif === "origin" && <g><path className="pagehero-art-line" d="M380 414 V267 M380 322 C332 300 306 260 300 206 M380 326 C433 297 463 250 472 195 M380 283 C354 248 356 212 370 172" /><circle className="pagehero-art-node" cx="300" cy="202" r="13" /><circle className="pagehero-art-node" cx="474" cy="190" r="13" /><circle className="pagehero-art-node" cx="372" cy="166" r="13" /><path className="pagehero-art-line" d="M326 414 H434" /></g>}
          {motif === "programmes" && <g><circle className="pagehero-art-orbit" cx="390" cy="250" r="120" /><path className="pagehero-art-line" d="M390 130 V370 M286 190 L494 310 M286 310 L494 190" /><circle className="pagehero-art-node" cx="390" cy="130" r="13" /><circle className="pagehero-art-node" cx="494" cy="190" r="13" /><circle className="pagehero-art-node" cx="494" cy="310" r="13" /><circle className="pagehero-art-node" cx="390" cy="370" r="13" /><circle className="pagehero-art-node" cx="286" cy="310" r="13" /><circle className="pagehero-art-node" cx="286" cy="190" r="13" /></g>}
          {motif === "measure" && <g><path className="pagehero-art-line" d="M240 382 H550 M260 382 V310 M330 382 V260 M400 382 V214 M470 382 V173 M540 382 V123" /><path className="pagehero-art-line" d="M260 282 L330 239 L400 260 L470 184 L540 145" /><circle className="pagehero-art-node" cx="330" cy="239" r="7" /><circle className="pagehero-art-node" cx="400" cy="260" r="7" /><circle className="pagehero-art-node" cx="470" cy="184" r="7" /><circle className="pagehero-art-node" cx="540" cy="145" r="7" /></g>}
          {motif === "leadership" && <g><path className="pagehero-art-line" d="M252 362 C252 286 334 274 390 274 C446 274 528 286 528 362 M306 213 C306 174 341 146 390 146 C439 146 474 174 474 213" /><circle className="pagehero-art-node" cx="390" cy="199" r="39" /><circle className="pagehero-art-node pagehero-art-node--small" cx="267" cy="245" r="25" /><circle className="pagehero-art-node pagehero-art-node--small" cx="513" cy="245" r="25" /></g>}
          {motif === "giving" && <g><path className="pagehero-art-line" d="M220 326 C278 300 321 306 369 337 L432 377 C449 389 431 414 411 404 L354 374 M223 337 L306 420 H442 C464 420 482 404 482 382 V349 C482 333 466 326 452 332 L416 349 C397 326 374 312 343 297 C307 280 265 291 220 312 Z" /><path className="pagehero-art-accent" d="M383 190 C361 163 316 174 316 213 C316 245 383 280 383 280 C383 280 450 245 450 213 C450 174 405 163 383 190 Z" /></g>}
          {motif === "place" && <g><path className="pagehero-art-line" d="M390 411 C390 411 272 281 272 204 C272 137 325 84 390 84 C455 84 508 137 508 204 C508 281 390 411 390 411 Z" /><circle className="pagehero-art-node" cx="390" cy="202" r="49" /><path className="pagehero-art-accent" d="M182 375 C229 405 284 422 344 425 M436 425 C496 422 547 405 592 375" /></g>}
          {motif === "volunteers" && <g><path className="pagehero-art-line" d="M230 388 C230 322 270 283 316 283 C362 283 402 322 402 388 M365 388 C365 307 409 259 459 259 C509 259 550 307 550 388" /><circle className="pagehero-art-node" cx="316" cy="221" r="38" /><circle className="pagehero-art-node" cx="459" cy="190" r="42" /><path className="pagehero-art-accent" d="M205 425 H574" /></g>}
          {motif === "privacy" && <g><path className="pagehero-art-line" d="M390 91 L520 143 V247 C520 326 469 386 390 421 C311 386 260 326 260 247 V143 Z" /><path className="pagehero-art-accent" d="M326 251 L372 297 L458 205" /></g>}
          {motif === "projects" && <g><path className="pagehero-art-line" d="M235 390 H545 V326 H470 V262 H405 V198 H340 V134 H275 V390" /><path className="pagehero-art-accent" d="M250 420 H565" /><circle className="pagehero-art-node" cx="308" cy="164" r="8" /><circle className="pagehero-art-node" cx="373" cy="228" r="8" /><circle className="pagehero-art-node" cx="438" cy="292" r="8" /></g>}
          {motif === "partners" && <g><path className="pagehero-art-line" d="M367 212 L339 184 C306 151 251 151 218 184 C185 217 185 272 218 305 L271 358 C304 391 359 391 392 358 L421 329 M413 288 L441 316 C474 349 529 349 562 316 C595 283 595 228 562 195 L509 142 C476 109 421 109 388 142 L359 171" /><path className="pagehero-art-accent" d="M319 279 L461 187" /></g>}
          {motif === "services" && <g><circle className="pagehero-art-orbit" cx="390" cy="252" r="69" /><path className="pagehero-art-line" d="M390 183 V112 M450 217 L513 181 M450 287 L513 323 M390 321 V392 M330 287 L267 323 M330 217 L267 181" /><circle className="pagehero-art-node" cx="390" cy="252" r="28" /><circle className="pagehero-art-node" cx="390" cy="112" r="11" /><circle className="pagehero-art-node" cx="513" cy="181" r="11" /><circle className="pagehero-art-node" cx="513" cy="323" r="11" /><circle className="pagehero-art-node" cx="390" cy="392" r="11" /><circle className="pagehero-art-node" cx="267" cy="323" r="11" /><circle className="pagehero-art-node" cx="267" cy="181" r="11" /></g>}
          {motif === "documents" && <g><path className="pagehero-art-line" d="M286 107 H431 L503 179 V393 H286 Z M431 107 V180 H503 M326 229 H454 M326 273 H454 M326 317 H414" /><circle className="pagehero-art-orbit" cx="482" cy="348" r="71" /><path className="pagehero-art-accent" d="M447 349 L472 374 L519 321" /></g>}
        </svg>
      </div>

      <div className="wrap pagehero-content">
        <nav className="pagehero-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{eyebrow}</span>
        </nav>
        <h1>{title}</h1>
        {description && <p className="pagehero-lede">{description}</p>}
        {actions && <div className="pagehero-actions">{actions}</div>}
      </div>

      {facts && facts.length > 0 && (
        <div className="pagehero-facts">
          <dl className="wrap">
            {facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
