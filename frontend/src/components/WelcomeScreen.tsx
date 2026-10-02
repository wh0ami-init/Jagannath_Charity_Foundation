import { useCallback, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import { DynamicImage } from "../lib/ImagesContext";
import "./WelcomeScreen.css";

gsap.registerPlugin(useGSAP);
const welcomeDuration = import.meta.env.DEV ? 10 : 6.2;

export default function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const scope = useRef<HTMLElement | null>(null);
  const isClosing = useRef(false);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    if (reducedMotion) return;

    const timeline = gsap.timeline();
    timeline
      .fromTo(".welcome-kicker", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.15)
      .fromTo(".welcome-emblem", { autoAlpha: 0, scale: 0.82, rotate: -8 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.1, ease: "power3.out" }, 0.35)
      .fromTo(".welcome-heading-line", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.05, stagger: 0.16, ease: "power3.out" }, 0.55)
      .fromTo(".welcome-intro-copy", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 1.25)
      .fromTo(".welcome-enter", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, 1.55)
      .fromTo(".welcome-countdown", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 1.9)
      .fromTo(".welcome-giving-art", { autoAlpha: 0 }, {
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => gsap.set(".welcome-giving-art", { clearProps: "opacity,visibility" }),
      }, 2.75);

    gsap.fromTo(".welcome-progress-fill", { scaleX: 0 }, {
      scaleX: 1,
      duration: welcomeDuration,
      ease: "none",
      transformOrigin: "left center",
    });

    gsap.to(".welcome-glow--one", { x: 70, y: -24, scale: 1.12, duration: 9, ease: "sine.inOut", repeat: -1, yoyo: true });
    gsap.to(".welcome-glow--two", { x: -64, y: 28, scale: 1.14, duration: 11, delay: 0.4, ease: "sine.inOut", repeat: -1, yoyo: true });
  }, { scope, dependencies: [reducedMotion], revertOnUpdate: true });

  const dismiss = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;
    const screen = scope.current;
    if (reducedMotion || !screen) {
      onComplete();
      return;
    }
    gsap.to(screen, { autoAlpha: 0, y: -18, duration: 0.8, ease: "power2.inOut", onComplete });
  }, [onComplete, reducedMotion]);

  useEffect(() => {
    const timer = window.setTimeout(dismiss, reducedMotion ? 4200 : welcomeDuration * 1000);
    return () => window.clearTimeout(timer);
  }, [dismiss, reducedMotion]);

  return (
    <section ref={scope} className="welcome-screen" role="dialog" aria-modal="true" aria-labelledby="welcome-heading">
      <div className="welcome-atmosphere" aria-hidden="true">
        <span className="welcome-glow welcome-glow--one" />
        <span className="welcome-glow welcome-glow--two" />
        <span className="welcome-grid" />
        <svg className="welcome-giving-art" viewBox="0 0 500 500">
          <circle className="giving-orbit" cx="250" cy="250" r="190" />
          <circle className="giving-orbit giving-orbit--inner" cx="250" cy="250" r="146" />
          <path className="giving-heart" d="M250 164 C226 132 174 146 174 190 C174 229 250 276 250 276 C250 276 326 229 326 190 C326 146 274 132 250 164 Z" />
          <path className="giving-hand" d="M99 302 C128 282 151 272 172 281 L222 303 C235 309 246 321 241 332 C237 342 225 346 213 341 L181 328 C202 343 224 357 248 365 C279 376 308 366 328 344 L365 304 C376 292 393 292 402 303 C410 313 407 326 399 336 L360 382 C332 414 289 429 248 416 C213 405 183 384 157 366 L105 335 C92 328 88 311 99 302 Z" />
          <path className="giving-palm" d="M218 300 L198 260 C193 249 198 237 209 233 C220 229 229 235 234 245 L254 282 M254 282 L244 239 C241 227 248 217 260 216 C272 215 280 223 282 235 L291 280 M291 280 L291 251 C291 239 300 231 311 233 C322 235 328 244 326 256 L322 305" />
          <circle className="giving-spark giving-spark--one" cx="133" cy="185" r="5" />
          <circle className="giving-spark giving-spark--two" cx="375" cy="189" r="4" />
          <circle className="giving-spark giving-spark--three" cx="350" cy="118" r="3" />
        </svg>
        <svg className="welcome-giving-art welcome-giving-art--left" viewBox="0 0 500 500">
          <circle className="giving-orbit" cx="250" cy="250" r="190" />
          <circle className="giving-orbit giving-orbit--inner" cx="250" cy="250" r="146" />
          <path className="giving-heart" d="M250 164 C226 132 174 146 174 190 C174 229 250 276 250 276 C250 276 326 229 326 190 C326 146 274 132 250 164 Z" />
          <path className="giving-hand" d="M99 302 C128 282 151 272 172 281 L222 303 C235 309 246 321 241 332 C237 342 225 346 213 341 L181 328 C202 343 224 357 248 365 C279 376 308 366 328 344 L365 304 C376 292 393 292 402 303 C410 313 407 326 399 336 L360 382 C332 414 289 429 248 416 C213 405 183 384 157 366 L105 335 C92 328 88 311 99 302 Z" />
          <path className="giving-palm" d="M218 300 L198 260 C193 249 198 237 209 233 C220 229 229 235 234 245 L254 282 M254 282 L244 239 C241 227 248 217 260 216 C272 215 280 223 282 235 L291 280 M291 280 L291 251 C291 239 300 231 311 233 C322 235 328 244 326 256 L322 305" />
          <circle className="giving-spark giving-spark--one" cx="133" cy="185" r="5" />
          <circle className="giving-spark giving-spark--two" cx="375" cy="189" r="4" />
          <circle className="giving-spark giving-spark--three" cx="350" cy="118" r="3" />
        </svg>
      </div>

      <div className="welcome-content">
        <p className="welcome-kicker">A charitable trust · Odisha, India</p>
        <div className="welcome-emblem"><DynamicImage slotKey="site-logo" alt="Jagannath Foundation emblem" /></div>
        <h1 id="welcome-heading">
          <span className="welcome-heading-line">Welcome to</span>
          <span className="welcome-heading-line welcome-foundation-name">Jagannath Foundation</span>
        </h1>
        <p className="welcome-intro-copy">Helping hands. Positive living.<br />Building opportunity and dignity, together.</p>
        <button className="welcome-enter" type="button" onClick={dismiss} autoFocus>
          Enter the website <span aria-hidden="true">→</span>
        </button>
        <p className="welcome-countdown">Taking you to the website</p>
      </div>

      <div className="welcome-progress" aria-hidden="true"><span className="welcome-progress-fill" /></div>
    </section>
  );
}
