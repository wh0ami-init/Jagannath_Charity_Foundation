import { tr as translateText, localize as localizeText, trError as translateError } from "../i18n";
import { useTranslation as usePageTranslation } from "react-i18next";
import { ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import { Link } from "wouter";
import type { HeroMotif } from "../lib/comingSoonSections";
import "./PageHero.css";
gsap.registerPlugin(useGSAP);
type Theme = "about" | "work" | "impact" | "team" | "donate" | "contact" | "volunteer" | "privacy" | "certificates";
type Fact = {
    value: string;
    label: string;
};
type Motif = "origin" | "programmes" | "measure" | "leadership" | "giving" | "place" | "volunteers" | "privacy" | "projects" | "partners" | "services" | "documents" | HeroMotif;
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
export default function PageHero({ theme, eyebrow, title, description, motif, actions, facts, }: PageHeroProps) {
    usePageTranslation();
    const scope = useRef<HTMLElement | null>(null);
    const reducedMotion = useReducedMotion();
    useGSAP(() => {
        const hero = scope.current;
        if (!hero)
            return;
        const paths = gsap.utils.toArray<SVGPathElement>(".pagehero-art-line, .pagehero-art-accent", hero);
        const nodes = gsap.utils.toArray<SVGCircleElement>(".pagehero-art-node", hero);
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
            .fromTo(".pagehero-content", { autoAlpha: 0, y: 16, filter: "blur(5px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out" }, 0.04)
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
    return (<section ref={scope} className={`pagehero pagehero--${theme}`}>
      <div className="pagehero-atmosphere" aria-hidden="true">
        <span className="pagehero-glow pagehero-glow--one"/>
        <span className="pagehero-glow pagehero-glow--two"/>
        <span className="pagehero-glow pagehero-glow--three"/>
      </div>
      <div className="pagehero-art" aria-hidden="true">
        <svg viewBox="0 0 640 500" role="presentation">
          {localizeText(motif === "video-gallery" && <g><path className="pagehero-art-line" d="M245 164 H505 V356 H245 Z M245 204 H505 M245 316 H505 M272 164 V204 M315 164 V204 M358 164 V204 M401 164 V204 M444 164 V204 M272 316 V356 M315 316 V356 M358 316 V356 M401 316 V356 M444 316 V356"/><path className="pagehero-art-accent" d="m355 231 82 42-82 43v-85Z"/><circle className="pagehero-art-node" cx="480" cy="182" r="7"/></g>)}
          {localizeText(motif === "campaigns" && <g><path className="pagehero-art-line" d="M272 405 V112 M275 132 C350 95 417 167 500 128 V272 C417 311 350 239 275 276"/><path className="pagehero-art-accent" d="M280 143 C352 112 418 177 493 140 V257 C418 294 352 229 280 260 V143Z"/><path className="pagehero-art-line" d="M232 405 H313"/><circle className="pagehero-art-node" cx="492" cy="140" r="8"/></g>)}
          {localizeText(motif === "events" && <g><path className="pagehero-art-line" d="M258 157 H502 V374 H258 Z M258 218 H502 M312 128 V184 M448 128 V184 M299 257 H330 M365 257 H396 M431 257 H462 M299 299 H330 M365 299 H396 M431 299 H462"/><path className="pagehero-art-accent" d="m383 242 15 30 33 5-24 23 6 33-30-16-29 16 6-33-24-23 33-5 14-30Z"/><circle className="pagehero-art-node" cx="312" cy="157" r="8"/><circle className="pagehero-art-node" cx="448" cy="157" r="8"/></g>)}
          {localizeText(motif === "expenses" && <g><path className="pagehero-art-line" d="M269 112 H422 L488 178 V395 H269 Z M422 112 V180 H488 M311 221 H438 M311 263 H438 M311 305 H368 M311 359 H449"/><path className="pagehero-art-accent" d="M378 359 V328 H401 V359 M412 359 V296 H435 V359 M446 359 V264 H469 V359"/><circle className="pagehero-art-node" cx="469" cy="264" r="7"/></g>)}
          {localizeText(motif === "internships" && <g><path className="pagehero-art-line" d="M390 168 C340 140 286 148 244 170 V369 C294 345 343 350 390 380 C437 350 486 345 536 369 V170 C494 148 440 140 390 168 Z M390 168 V380 M270 211 C307 194 343 195 366 207 M270 254 C307 237 343 238 366 250 M514 211 C477 194 441 195 414 207 M514 254 C477 237 441 238 414 250"/><path className="pagehero-art-accent" d="m490 116 8 18 19 3-14 13 4 19-17-10-17 10 4-19-14-13 19-3 8-18Z"/></g>)}
          {localizeText(motif === "certificate-check" && <g><path className="pagehero-art-line" d="M282 112 H424 L489 177 V358 H282 Z M424 112 V180 H489 M318 225 H443 M318 265 H416"/><circle className="pagehero-art-orbit" cx="471" cy="350" r="74"/><path className="pagehero-art-accent" d="m435 350 25 25 48-53"/><path className="pagehero-art-line" d="m445 408-6 38 32-16 32 16-7-39"/></g>)}
          {localizeText(motif === "careers" && <g><path className="pagehero-art-line" d="M246 211 H534 V382 H246 Z M220 247 H560 V382 H220 Z M351 247 V293 H429 V247 M378 280 H402 V297 H378 Z"/><path className="pagehero-art-accent" d="M351 247 V194 C351 174 367 158 387 158 H423 C443 158 459 174 459 194 V211 M387 285 V293 H402 V285"/><circle className="pagehero-art-node" cx="405" cy="158" r="9"/></g>)}
          {localizeText(motif === "beneficiary-directory" && <g><path className="pagehero-art-line" d="M231 379 C231 322 267 288 310 288 C353 288 389 322 389 379 M372 379 C372 308 414 264 465 264 C516 264 554 308 554 379 M207 412 H579"/><circle className="pagehero-art-node" cx="310" cy="226" r="38"/><circle className="pagehero-art-node" cx="465" cy="202" r="43"/><path className="pagehero-art-accent" d="M387 358 C401 347 418 341 436 341 M406 331 C418 321 432 316 447 316"/></g>)}
          {localizeText(motif === "beneficiary-apply" && <g><path className="pagehero-art-line" d="M282 108 H429 L492 171 V388 H282 Z M429 108 V174 H492 M318 222 H420 M318 263 H389 M318 304 H389"/><circle className="pagehero-art-orbit" cx="450" cy="316" r="57"/><circle className="pagehero-art-node" cx="450" cy="293" r="17"/><path className="pagehero-art-line" d="M416 352 C421 329 436 319 450 319 C464 319 479 329 484 352"/><path className="pagehero-art-accent" d="M430 388 H470 M450 368 V408"/></g>)}
          {localizeText(motif === "id-card" && <g><rect className="pagehero-art-line" x="236" y="154" width="308" height="206" rx="24"/><path className="pagehero-art-line" d="M276 205 H504 M397 253 H492 M397 294 H470"/><circle className="pagehero-art-orbit" cx="324" cy="267" r="53"/><circle className="pagehero-art-node" cx="324" cy="250" r="17"/><path className="pagehero-art-line" d="M288 302 C293 278 306 267 324 267 C342 267 355 278 360 302"/><path className="pagehero-art-accent" d="M466 329h48"/></g>)}
          {localizeText(motif === "certificate-service" && <g><path className="pagehero-art-line" d="M270 104 H419 L493 178 V380 H270 Z M419 104 V180 H493 M311 224 H449 M311 268 H433 M311 312 H391"/><circle className="pagehero-art-orbit" cx="451" cy="346" r="54"/><path className="pagehero-art-accent" d="m425 346 18 18 35-39"/><path className="pagehero-art-line" d="m430 390-5 39 26-13 26 13-5-39"/></g>)}
          {localizeText(motif === "appointment-letter" && <g><path className="pagehero-art-line" d="M270 104 H419 L493 178 V380 H270 Z M419 104 V180 H493 M311 224 H449 M311 268 H433 M311 312 H391"/><circle className="pagehero-art-orbit" cx="455" cy="348" r="54"/><path className="pagehero-art-line" d="M455 318 V350 L477 364"/><path className="pagehero-art-accent" d="M442 389 H468 M455 376 V402"/></g>)}
          {localizeText(motif === "origin" && <g><path className="pagehero-art-line" d="M380 414 V267 M380 322 C332 300 306 260 300 206 M380 326 C433 297 463 250 472 195 M380 283 C354 248 356 212 370 172"/><circle className="pagehero-art-node" cx="300" cy="202" r="13"/><circle className="pagehero-art-node" cx="474" cy="190" r="13"/><circle className="pagehero-art-node" cx="372" cy="166" r="13"/><path className="pagehero-art-line" d="M326 414 H434"/></g>)}
          {localizeText(motif === "programmes" && <g><circle className="pagehero-art-orbit" cx="390" cy="250" r="120"/><path className="pagehero-art-line" d="M390 130 V370 M286 190 L494 310 M286 310 L494 190"/><circle className="pagehero-art-node" cx="390" cy="130" r="13"/><circle className="pagehero-art-node" cx="494" cy="190" r="13"/><circle className="pagehero-art-node" cx="494" cy="310" r="13"/><circle className="pagehero-art-node" cx="390" cy="370" r="13"/><circle className="pagehero-art-node" cx="286" cy="310" r="13"/><circle className="pagehero-art-node" cx="286" cy="190" r="13"/></g>)}
          {localizeText(motif === "measure" && <g><path className="pagehero-art-line" d="M240 382 H550 M260 382 V310 M330 382 V260 M400 382 V214 M470 382 V173 M540 382 V123"/><path className="pagehero-art-line" d="M260 282 L330 239 L400 260 L470 184 L540 145"/><circle className="pagehero-art-node" cx="330" cy="239" r="7"/><circle className="pagehero-art-node" cx="400" cy="260" r="7"/><circle className="pagehero-art-node" cx="470" cy="184" r="7"/><circle className="pagehero-art-node" cx="540" cy="145" r="7"/></g>)}
          {localizeText(motif === "leadership" && <g><path className="pagehero-art-line" d="M252 362 C252 286 334 274 390 274 C446 274 528 286 528 362 M306 213 C306 174 341 146 390 146 C439 146 474 174 474 213"/><circle className="pagehero-art-node" cx="390" cy="199" r="39"/><circle className="pagehero-art-node pagehero-art-node--small" cx="267" cy="245" r="25"/><circle className="pagehero-art-node pagehero-art-node--small" cx="513" cy="245" r="25"/></g>)}
          {localizeText(motif === "giving" && <g><path className="pagehero-art-line" d="M220 326 C278 300 321 306 369 337 L432 377 C449 389 431 414 411 404 L354 374 M223 337 L306 420 H442 C464 420 482 404 482 382 V349 C482 333 466 326 452 332 L416 349 C397 326 374 312 343 297 C307 280 265 291 220 312 Z"/><path className="pagehero-art-accent" d="M383 190 C361 163 316 174 316 213 C316 245 383 280 383 280 C383 280 450 245 450 213 C450 174 405 163 383 190 Z"/></g>)}
          {localizeText(motif === "place" && <g><path className="pagehero-art-line" d="M390 411 C390 411 272 281 272 204 C272 137 325 84 390 84 C455 84 508 137 508 204 C508 281 390 411 390 411 Z"/><circle className="pagehero-art-node" cx="390" cy="202" r="49"/><path className="pagehero-art-accent" d="M182 375 C229 405 284 422 344 425 M436 425 C496 422 547 405 592 375"/></g>)}
          {localizeText(motif === "volunteers" && <g><path className="pagehero-art-line" d="M230 388 C230 322 270 283 316 283 C362 283 402 322 402 388 M365 388 C365 307 409 259 459 259 C509 259 550 307 550 388"/><circle className="pagehero-art-node" cx="316" cy="221" r="38"/><circle className="pagehero-art-node" cx="459" cy="190" r="42"/><path className="pagehero-art-accent" d="M205 425 H574"/></g>)}
          {localizeText(motif === "privacy" && <g><path className="pagehero-art-line" d="M390 91 L520 143 V247 C520 326 469 386 390 421 C311 386 260 326 260 247 V143 Z"/><path className="pagehero-art-accent" d="M326 251 L372 297 L458 205"/></g>)}
          {localizeText(motif === "projects" && <g><path className="pagehero-art-line" d="M235 390 H545 V326 H470 V262 H405 V198 H340 V134 H275 V390"/><path className="pagehero-art-accent" d="M250 420 H565"/><circle className="pagehero-art-node" cx="308" cy="164" r="8"/><circle className="pagehero-art-node" cx="373" cy="228" r="8"/><circle className="pagehero-art-node" cx="438" cy="292" r="8"/></g>)}
          {localizeText(motif === "partners" && <g><path className="pagehero-art-line" d="M367 212 L339 184 C306 151 251 151 218 184 C185 217 185 272 218 305 L271 358 C304 391 359 391 392 358 L421 329 M413 288 L441 316 C474 349 529 349 562 316 C595 283 595 228 562 195 L509 142 C476 109 421 109 388 142 L359 171"/><path className="pagehero-art-accent" d="M319 279 L461 187"/></g>)}
          {localizeText(motif === "services" && <g><circle className="pagehero-art-orbit" cx="390" cy="252" r="69"/><path className="pagehero-art-line" d="M390 183 V112 M450 217 L513 181 M450 287 L513 323 M390 321 V392 M330 287 L267 323 M330 217 L267 181"/><circle className="pagehero-art-node" cx="390" cy="252" r="28"/><circle className="pagehero-art-node" cx="390" cy="112" r="11"/><circle className="pagehero-art-node" cx="513" cy="181" r="11"/><circle className="pagehero-art-node" cx="513" cy="323" r="11"/><circle className="pagehero-art-node" cx="390" cy="392" r="11"/><circle className="pagehero-art-node" cx="267" cy="323" r="11"/><circle className="pagehero-art-node" cx="267" cy="181" r="11"/></g>)}
          {localizeText(motif === "documents" && <g><path className="pagehero-art-line" d="M286 107 H431 L503 179 V393 H286 Z M431 107 V180 H503 M326 229 H454 M326 273 H454 M326 317 H414"/><circle className="pagehero-art-orbit" cx="482" cy="348" r="71"/><path className="pagehero-art-accent" d="M447 349 L472 374 L519 321"/></g>)}
        </svg>
      </div>

      <div className="wrap pagehero-content">
        <nav className="pagehero-crumbs" aria-label={translateText("Breadcrumb")}>
          <Link href="/">{translateText("Home")}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{localizeText(eyebrow)}</span>
        </nav>
        <h1>{localizeText(title)}</h1>
        {localizeText(description && <p className="pagehero-lede">{localizeText(description)}</p>)}
        {localizeText(actions && <div className="pagehero-actions">{localizeText(actions)}</div>)}
      </div>

      {localizeText(facts && facts.length > 0 && (<div className="pagehero-facts">
          <dl className="wrap">
            {localizeText(facts.map((f) => (<div key={f.label}>
                <dt>{localizeText(f.label)}</dt>
                <dd>{localizeText(f.value)}</dd>
              </div>)))}
          </dl>
        </div>))}
    </section>);
}
