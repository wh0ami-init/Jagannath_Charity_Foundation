import { tr as translateText, localize as localizeText, trError as translateError } from "../i18n";
import { useTranslation as usePageTranslation } from "react-i18next";
import { useCallback, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import { useLocation } from "wouter";
import { DynamicImage } from "../lib/ImagesContext";
import "./WelcomeScreen.css";

gsap.registerPlugin(useGSAP);
const welcomeDuration = 8.2;
const welcomePhotos = [
  "gallery-extra-president-murmu-5",
  "gallery-pm-modi",
  "gallery-extra-president-kovind-5",
  "gallery-extra-president-mukherjee-2",
  "gallery-extra-dharmendra-pradhan-2",
  "gallery-extra-embassy-thimphu",
  "gallery-amit-shah",
  "gallery-anna-hazare",
  "gallery-baba-ramdev",
  "gallery-cm-sikkim",
  "gallery-extra-arjun-ram-meghwal",
  "gallery-extra-hemant-soren-2",
  "gallery-extra-international-guest",
  "gallery-extra-jp-nadda-2",
  "gallery-extra-rajnath-2",
];

// Real facts from the Impact page (no invented beneficiary numbers)
const stats = [
  {
    value: 22.85,
    decimals: 2,
    suffix: "%",
    label: "of Odisha is Scheduled Tribe",
  },
  {
    value: 1759,
    decimals: 0,
    suffix: "",
    label: "PVTG habitations identified",
  },
  { value: 13, decimals: 0, suffix: "", label: "PVTG groups, most in India" },
];
const format = (n: number, d: number) =>
  n.toLocaleString("en-IN", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

export default function WelcomeScreen({
  onExitStart,
  onComplete,
}: {
  onExitStart: () => void;
  onComplete: () => void;
}) {
  usePageTranslation();
  const scope = useRef<HTMLElement | null>(null);
  const isClosing = useRef(false);
  const reducedMotion = useReducedMotion();
  const [, setLocation] = useLocation();

  useGSAP(
    () => {
      if (reducedMotion) return;

      const tl = gsap.timeline();
      tl.fromTo(
        ".welcome-photo-tile",
        { autoAlpha: 0, y: 70, scale: 0.76, rotate: (i) => (i % 2 ? 4 : -4) },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          duration: 1.2,
          stagger: { amount: 0.85, from: "random" },
          ease: "power3.out",
        },
        0,
      );
      tl.fromTo(
        ".welcome-gradient-wash",
        { scaleY: 0 },
        { scaleY: 1, duration: 1.35, ease: "power2.out" },
        1.05,
      );
      tl.fromTo(
        ".welcome-top",
        { autoAlpha: 0, y: 20, filter: "blur(8px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.95, ease: "power3.out" },
        2.3,
      )
        .fromTo(
          ".welcome-heading-text",
          { yPercent: 110, rotateX: -9 },
          {
            yPercent: 0,
            rotateX: 0,
            duration: 1.15,
            stagger: 0.19,
            ease: "power3.out",
          },
          2.55,
        )
        .fromTo(
          ".welcome-intro-copy",
          { autoAlpha: 0, y: 18, filter: "blur(5px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.95, ease: "power3.out" },
          2.75,
        )
        .fromTo(
          ".welcome-actions > *",
          { autoAlpha: 0, y: 18, scale: 0.97 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.16,
            ease: "power3.out",
          },
          3.1,
        )
        .fromTo(
          ".welcome-stats",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.85, ease: "power3.out" },
          4.2,
        )
        .fromTo(
          ".welcome-stat",
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.13, ease: "power3.out" },
          4.42,
        )
        .fromTo(
          ".welcome-trust",
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
          5.8,
        );

      // Draw the hands and hearts together, then let the artwork breathe softly.
      const hearts = gsap.utils.toArray<SVGPathElement>(".giving-heart");
      const hands = gsap.utils.toArray<SVGPathElement>(".giving-hand");
      const palms = gsap.utils.toArray<SVGPathElement>(".giving-palm");
      [...hearts, ...hands, ...palms].forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });

      const artTl = gsap.timeline();
      gsap.utils.toArray<SVGSVGElement>(".welcome-giving-art").forEach((art, i) => {
        const opacity = Number(window.getComputedStyle(art).opacity);
        artTl.fromTo(
          art,
          { autoAlpha: 0, y: 8 },
          { autoAlpha: opacity, y: 0, duration: 1.1, ease: "power2.out" },
          0.2 + i * 0.14,
        );
      });
      artTl
        .to(hearts, { strokeDashoffset: 0, duration: 1.45, stagger: 0.16, ease: "power2.out" }, 0.45)
        .to(hands, { strokeDashoffset: 0, duration: 1.9, stagger: 0.18, ease: "power2.inOut" }, 0.85)
        .to(palms, { strokeDashoffset: 0, duration: 1.65, stagger: 0.16, ease: "power2.out" }, 1.08);

      gsap.to(".welcome-giving-art", {
        y: -7,
        duration: 4.5,
        stagger: 1.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".giving-heart", {
        scale: 1.035,
        transformOrigin: "center center",
        duration: 0.65,
        delay: 3.1,
        repeat: -1,
        repeatDelay: 2.1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".welcome-glow--one", {
        x: 46,
        y: -26,
        scale: 1.12,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".welcome-glow--two", {
        x: -42,
        y: 24,
        scale: 1.1,
        duration: 12,
        delay: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".welcome-glow--center", {
        x: 18,
        scale: 1.1,
        duration: 14,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Count up the real numbers
      stats.forEach((s, i) => {
        const el = scope.current?.querySelector<HTMLElement>(
          `[data-stat="${i}"]`,
        );
        if (!el) return;
        const c = { n: 0 };
        el.textContent = format(0, s.decimals) + s.suffix;
        tl.to(
          c,
          {
            n: s.value,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = format(c.n, s.decimals) + s.suffix;
            },
          },
          4.3 + i * 0.13,
        );
      });

      gsap.fromTo(
        ".welcome-progress-fill",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: welcomeDuration,
          ease: "none",
          transformOrigin: "left center",
        },
      );

    },
    { scope, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  // Stop the page behind from scrolling (removes the extra scrollbar)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Apply subtle pointer movement to the background glow.
  useEffect(() => {
    const screen = scope.current;
    if (!screen || reducedMotion) return;
    const glow = screen.querySelector<HTMLElement>(".welcome-glow--one");
    if (!glow) return;
    const gx = gsap.quickTo(glow, "xPercent", {
      duration: 1.4,
      ease: "power3.out",
    });
    const gy = gsap.quickTo(glow, "yPercent", {
      duration: 1.4,
      ease: "power3.out",
    });
    const move = (e: MouseEvent) => {
      const px = e.clientX / window.innerWidth - 0.5;
      const py = e.clientY / window.innerHeight - 0.5;
      gx(px * 30);
      gy(py * 30);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [reducedMotion]);

  const dismiss = useCallback(
    (to?: string) => {
      if (isClosing.current) return;
      isClosing.current = true;
      onExitStart();
      if (to) setLocation(to);
      const screen = scope.current;
      if (reducedMotion || !screen) {
        onComplete();
        return;
      }
      // Fade the collage away as the website is revealed.
      const exit = gsap.timeline({ onComplete });
      exit
        .to(
          ".welcome-content, .welcome-photo-collage, .welcome-gradient-wash, .welcome-progress",
          { autoAlpha: 0, y: -12, filter: "blur(4px)", duration: 0.55, ease: "power2.in" },
        )
        .set(screen, { autoAlpha: 0 });
    },
    [onComplete, onExitStart, reducedMotion, setLocation],
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => dismiss(),
      reducedMotion ? 5200 : welcomeDuration * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [dismiss, reducedMotion]);

  return (
    <section
      ref={scope}
      className="welcome-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-heading"
    >
      <span className="welcome-door welcome-door--left" aria-hidden="true" />
      <span className="welcome-door welcome-door--right" aria-hidden="true" />

      <div className="welcome-atmosphere" aria-hidden="true">
        <span className="welcome-glow welcome-glow--one" />
        <span className="welcome-glow welcome-glow--two" />
        <span className="welcome-glow welcome-glow--center" />
        <span className="welcome-grid" />
        <span className="welcome-grain" />
        <svg className="welcome-giving-art" viewBox="0 0 500 500">
          <path className="giving-heart" d="M250 190 C222 167 193 147 193 120 C193 98 210 83 231 83 C243 83 253 90 260 101 C267 90 277 83 289 83 C310 83 327 98 327 120 C327 147 298 167 270 190 L260 198 Z" />
          <path className="giving-hand" d="M99 302 C128 282 151 272 172 281 L222 303 C235 309 246 321 241 332 C237 342 225 346 213 341 L181 328 C202 343 224 357 248 365 C279 376 308 366 328 344 L365 304 C376 292 393 292 402 303 C410 313 407 326 399 336 L360 382 C332 414 289 429 248 416 C213 405 183 384 157 366 L105 335 C92 328 88 311 99 302 Z" />
          <path className="giving-palm" d="M218 300 L198 260 C193 249 198 237 209 233 C220 229 229 235 234 245 L254 282 M254 282 L244 239 C241 227 248 217 260 216 C272 215 280 223 282 235 L291 280 M291 280 L291 251 C291 239 300 231 311 233 C322 235 328 244 326 256 L322 305" />
        </svg>
        <svg className="welcome-giving-art welcome-giving-art--left" viewBox="0 0 500 500">
          <path className="giving-heart" d="M250 190 C222 167 193 147 193 120 C193 98 210 83 231 83 C243 83 253 90 260 101 C267 90 277 83 289 83 C310 83 327 98 327 120 C327 147 298 167 270 190 L260 198 Z" />
          <path className="giving-hand" d="M99 302 C128 282 151 272 172 281 L222 303 C235 309 246 321 241 332 C237 342 225 346 213 341 L181 328 C202 343 224 357 248 365 C279 376 308 366 328 344 L365 304 C376 292 393 292 402 303 C410 313 407 326 399 336 L360 382 C332 414 289 429 248 416 C213 405 183 384 157 366 L105 335 C92 328 88 311 99 302 Z" />
          <path className="giving-palm" d="M218 300 L198 260 C193 249 198 237 209 233 C220 229 229 235 234 245 L254 282 M254 282 L244 239 C241 227 248 217 260 216 C272 215 280 223 282 235 L291 280 M291 280 L291 251 C291 239 300 231 311 233 C322 235 328 244 326 256 L322 305" />
        </svg>
      </div>

      <div className="welcome-photo-collage" aria-hidden="true">
        {welcomePhotos.map((slot) => (
          <div className="welcome-photo-tile" key={slot}>
            <DynamicImage slotKey={slot} alt="" className="welcome-photo" preferLocal loading="eager" />
          </div>
        ))}
      </div>
      <div className="welcome-gradient-wash" aria-hidden="true" />

      <div className="welcome-layout">
        <div className="welcome-content">
          <div className="welcome-top">
            <div className="welcome-emblem">
              <img
                src="/images/logo-mark.png"
                alt={translateText("Jagannath Foundation logo")}
              />
            </div>
            <p className="welcome-kicker">{translateText("A charitable trust · Odisha, India")}</p>
          </div>
          <h1 id="welcome-heading">
            <span className="welcome-heading-line"><span className="welcome-heading-text">{translateText("Welcome to")}</span></span>
            <span className="welcome-heading-line welcome-foundation-name">
              <span className="welcome-heading-text">{translateText("Jagannath Foundation")}</span>
            </span>
          </h1>
          <p className="welcome-intro-copy"> {translateText("Helping hands. Positive living.")} <br /> {translateText("Every gift, big or small, plants a seed of dignity.")} </p>

          <div className="welcome-actions">
            <button
              className="welcome-donate"
              type="button"
              onClick={() => dismiss("/donate")}
            > {translateText("Donate Now")} </button>
            <button
              className="welcome-enter"
              type="button"
              onClick={() => dismiss()}
              autoFocus
            > {translateText("Enter the website")} <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="welcome-stats">
            <p className="welcome-stats-title">{translateText("Why your gift matters")}</p>
            <div className="welcome-stats-row">
              {localizeText(stats.map((s, i) => (
                <div key={s.label} className="welcome-stat">
                  <strong data-stat={i}>
                    {localizeText(format(s.value, s.decimals) + s.suffix)}
                  </strong>
                  <span>{localizeText(s.label)}</span>
                </div>
              )))}
            </div>
          </div>

          <p className="welcome-trust"> {translateText("Provisional registration u/s 12A & 80G · Odisha, India")} </p>
        </div>
      </div>

      <div className="welcome-progress" aria-hidden="true">
        <span className="welcome-progress-fill" />
      </div>
    </section>
  );
}
