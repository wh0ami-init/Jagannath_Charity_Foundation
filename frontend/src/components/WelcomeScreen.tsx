import {
  tr as translateText,
  localize as localizeText,
  trError as translateError,
} from "../i18n";
import { useTranslation as usePageTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import { useLocation } from "wouter";
import { DynamicImage, useImages } from "../lib/ImagesContext";
import "./WelcomeScreen.css";

gsap.registerPlugin(useGSAP);
const founderPreludeDuration = 9.2;
const welcomeDuration = 37;
const maxWelcomePhotos = 15;
const offlineWelcomePhotos = [
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
const founderBackdropPhotos = [
  {
    slot: "president-murmu",
    src: "/images/gallery-extra-president-murmu-5.webp",
    caption: "With President Droupadi Murmu",
  },
  {
    slot: "dharmendra-pradhan",
    src: "/images/gallery-extra-dharmendra-pradhan-2.webp",
    caption: "With Shri Dharmendra Pradhan",
  },
  {
    slot: "international-guest",
    src: "/images/gallery-extra-international-guest.webp",
    caption: "With an international guest",
  },
  {
    slot: "vice-president-dhankhar",
    src: "/images/gallery-vp-dhankhar.webp",
    caption: "With Shri Jagdeep Dhankhar",
  },
];
const founderMontageStart = founderPreludeDuration;
const founderPhotoFlightStep = 2.45;
const founderMontageEnd =
  founderMontageStart + (founderBackdropPhotos.length - 1) * founderPhotoFlightStep + 4;
const founderBlackoutStart = founderMontageEnd - 0.1;
const welcomeMomentStart = founderMontageEnd + 0.7;
const welcomeContentStart = welcomeMomentStart + 3.4;

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
  const [showFounderWithoutMotion, setShowFounderWithoutMotion] = useState(true);
  const reducedMotion = useReducedMotion();
  const { images, loading: imagesLoading, error: imagesError } = useImages();
  const [, setLocation] = useLocation();
  const galleryPhotoKeys = useMemo(() => {
    const galleryImages = Object.values(images)
      .filter((image) => image.page === "Gallery" && image.slot_key !== "gallery-cover")
      .sort((a, b) => {
        const updatedDifference = Date.parse(b.updated_at) - Date.parse(a.updated_at);
        return Number.isNaN(updatedDifference) || updatedDifference === 0
          ? a.slot_key.localeCompare(b.slot_key)
          : updatedDifference;
      })
      .slice(0, maxWelcomePhotos);
    return imagesError
      ? offlineWelcomePhotos.slice(0, maxWelcomePhotos)
      : galleryImages.map((image) => image.slot_key);
  }, [images, imagesError]);
  const photoCount = galleryPhotoKeys.length;
  const desktopColumns = photoCount ? Math.min(6, Math.ceil(Math.sqrt(photoCount * 1.5))) : 1;
  const mobileColumns = photoCount ? Math.min(3, Math.ceil(Math.sqrt(photoCount * 0.58))) : 1;
  const collageStyle = {
    "--welcome-photo-columns": desktopColumns,
    "--welcome-photo-rows": Math.ceil(photoCount / desktopColumns) || 1,
    "--welcome-mobile-columns": mobileColumns,
    "--welcome-mobile-rows": Math.ceil(photoCount / mobileColumns) || 1,
  } as CSSProperties;

  useGSAP(
    () => {
      if (reducedMotion || imagesLoading) return;

      const tl = gsap.timeline();
      gsap.to(".welcome-founder-ambient", {
        xPercent: 8,
        yPercent: -5,
        scale: 1.12,
        duration: 7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      tl.fromTo(
        ".welcome-founder-photo",
        { scale: 1.08 },
        { scale: 1.02, duration: founderPreludeDuration + 0.8, ease: "none" },
        0,
      );
      tl.fromTo(
        ".welcome-founder-photo-frame",
        { autoAlpha: 0, x: -30, scale: 1.045, clipPath: "inset(0 0 100% 0 round 24px)" },
        {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          clipPath: "inset(0 0 0% 0 round 24px)",
          duration: 1.1,
          ease: "power3.out",
        },
        0,
      )
        .fromTo(
          ".welcome-founder-kicker",
          { autoAlpha: 0, y: 12, letterSpacing: "0.32em" },
          { autoAlpha: 1, y: 0, letterSpacing: "0.2em", duration: 0.75, ease: "power3.out" },
          0.35,
        )
        .fromTo(
          ".welcome-founder-name",
          { autoAlpha: 0, y: 24, filter: "blur(8px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out" },
          0.55,
        )
        .fromTo(
          ".welcome-founder-role, .welcome-founder-foundation, .welcome-founder-copy",
          { autoAlpha: 0, y: 15 },
          { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.14, ease: "power3.out" },
          1.05,
        )
        .to(
          ".welcome-founder-photo-frame, .welcome-founder-copy-block",
          { autoAlpha: 0, y: -14, duration: 0.75, stagger: 0.04, ease: "power2.inOut" },
          founderPreludeDuration - 0.85,
        )
        .to(
          ".welcome-founder-scene",
          { autoAlpha: 0, duration: 0.45, ease: "power2.out" },
          founderPreludeDuration - 0.1,
        );

      const montageSlides = gsap.utils.toArray<HTMLElement>(
        ".welcome-founder-montage-slide",
      );
      tl.fromTo(
        ".welcome-founder-montage",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.45, ease: "power1.out" },
        founderMontageStart,
      );
      const montage = scope.current?.querySelector<HTMLElement>(
        ".welcome-founder-montage",
      );
      const montageBounds = montage?.getBoundingClientRect();
      const montageFlights = gsap.utils.toArray<HTMLElement>(
        ".welcome-founder-montage-flight",
      );
      montageSlides.forEach((slide, index) => {
        const flight = montageFlights[index];
        const targetBounds = slide.getBoundingClientRect();
        const start = founderMontageStart + index * founderPhotoFlightStep;
        const target = {
          left: targetBounds.left - (montageBounds?.left ?? 0),
          top: targetBounds.top - (montageBounds?.top ?? 0),
          width: targetBounds.width,
          height: targetBounds.height,
          borderRadius: getComputedStyle(slide).borderRadius,
        };
        const caption = flight?.querySelector<HTMLElement>(
          ".welcome-founder-flight-caption",
        );
        if (!flight) return;

        tl.fromTo(
          flight,
          { autoAlpha: 0, left: 0, top: 0, width: "100%", height: "100%", scale: 1.015 },
          { autoAlpha: 1, scale: 1, duration: 0.38, ease: "power2.out" },
          start,
        )
          .to(
            flight,
            { scale: 1.035, duration: 0.95, ease: "none" },
            start + 0.38,
          )
          .to(
            flight,
            { ...target, scale: 1, duration: 1, ease: "power3.inOut" },
            start + 1.35,
          )
          .to(
            slide,
            { autoAlpha: 1, duration: 0.18, ease: "power1.out" },
            start + 2.17,
          )
          .to(
            flight,
            { autoAlpha: 0, duration: 0.16, ease: "power1.out" },
            start + 2.17,
          );
        if (caption) {
          tl.fromTo(
            caption,
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
            start + 0.2,
          ).to(
            caption,
            { autoAlpha: 0, y: -10, duration: 0.22, ease: "power2.in" },
            start + 1.18,
          );
        }
      });
      tl.fromTo(
        ".welcome-founder-montage-heading",
        { autoAlpha: 0, y: 18, filter: "blur(6px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
        founderMontageEnd - 1.05,
      );
      tl.to(
        ".welcome-founder-montage",
        { autoAlpha: 0, duration: 0.42, ease: "power1.in" },
        founderMontageEnd,
      );
      tl.fromTo(
        ".welcome-blackout",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.25, ease: "none" },
        founderBlackoutStart,
      ).to(
        ".welcome-blackout",
        { autoAlpha: 0, duration: 0.35, ease: "power1.out" },
        founderBlackoutStart + 0.37,
      );
      tl.fromTo(
        ".welcome-moment",
        { autoAlpha: 0, y: 18, filter: "blur(8px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.75,
          ease: "power3.out",
        },
        welcomeMomentStart,
      ).to(".welcome-moment", {
        autoAlpha: 0,
        y: -12,
        filter: "blur(5px)",
        duration: 0.65,
        ease: "power2.in",
      }, welcomeMomentStart + 2.65);
      tl.fromTo(
        ".welcome-photo-tile",
        { autoAlpha: 0, y: 70, scale: 0.76, rotate: (i) => (i % 2 ? 4 : -4) },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          duration: 1.45,
          stagger: { amount: 0.85, from: "random" },
          ease: "power3.out",
        },
        welcomeContentStart + 0.2,
      );
      tl.fromTo(
        ".welcome-gradient-wash",
        { scaleY: 0 },
        { scaleY: 1, duration: 1.6, ease: "power2.out" },
        welcomeContentStart + 1.1,
      );
      tl.fromTo(
        ".welcome-top",
        { autoAlpha: 0, y: 20, filter: "blur(8px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.95,
          ease: "power3.out",
        },
        welcomeContentStart + 1.5,
      )
        .fromTo(
          ".welcome-heading-text",
          { yPercent: 110, rotateX: -9 },
          {
            yPercent: 0,
            rotateX: 0,
            duration: 1.3,
            stagger: 0.16,
            ease: "power3.out",
          },
          welcomeContentStart + 1.8,
        )
        .fromTo(
          ".welcome-intro-copy",
          { autoAlpha: 0, y: 18, filter: "blur(5px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.95,
            ease: "power3.out",
          },
          welcomeContentStart + 2.2,
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
          welcomeContentStart + 2.55,
        )
        .fromTo(
          ".welcome-stats",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.85, ease: "power3.out" },
          welcomeContentStart + 3.35,
        )
        .fromTo(
          ".welcome-stat",
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.13,
            ease: "power3.out",
          },
          welcomeContentStart + 3.58,
        )
        .fromTo(
          ".welcome-trust",
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
          welcomeContentStart + 4.9,
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
      gsap.utils
        .toArray<SVGSVGElement>(".welcome-giving-art")
        .forEach((art, i) => {
          const opacity = Number(window.getComputedStyle(art).opacity);
          artTl.fromTo(
            art,
            { autoAlpha: 0, y: 8 },
            { autoAlpha: opacity, y: 0, duration: 1.1, ease: "power2.out" },
            0.2 + i * 0.14,
          );
        });
      artTl
        .to(
          hearts,
          {
            strokeDashoffset: 0,
            duration: 1.45,
            stagger: 0.16,
            ease: "power2.out",
          },
          0.45,
        )
        .to(
          hands,
          {
            strokeDashoffset: 0,
            duration: 1.9,
            stagger: 0.18,
            ease: "power2.inOut",
          },
          0.85,
        )
        .to(
          palms,
          {
            strokeDashoffset: 0,
            duration: 1.65,
            stagger: 0.16,
            ease: "power2.out",
          },
          1.08,
        );

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
          welcomeContentStart + 3.7 + i * 0.13,
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
    {
      scope,
      dependencies: [reducedMotion, imagesLoading, galleryPhotoKeys.join("|")],
      revertOnUpdate: true,
    },
  );

  useEffect(() => {
    if (!reducedMotion || imagesLoading) return;
    const timer = window.setTimeout(
      () => setShowFounderWithoutMotion(false),
      founderPreludeDuration * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [imagesLoading, reducedMotion]);

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
      const exit = gsap.timeline({ onComplete });
      const portal = document.querySelector<HTMLElement>(".welcome-portal");
      if (portal) {
        exit.fromTo(
          portal,
          { autoAlpha: 0, scale: 1.035, filter: "blur(14px)" },
          {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 2.8,
            ease: "power2.out",
          },
          0,
        );
      }
      exit
        .to(
          ".welcome-content, .welcome-moment, .welcome-founder-scene",
          {
            autoAlpha: 0,
            y: -22,
            filter: "blur(5px)",
            duration: 0.95,
            stagger: 0.08,
            ease: "power2.inOut",
          },
          1.15,
        )
        .to(
          ".welcome-photo-collage",
          {
            autoAlpha: 0,
            scale: 1.1,
            filter: "blur(5px)",
            duration: 2.0,
            ease: "power2.inOut",
          },
          0.48,
        )
        .to(
          ".welcome-gradient-wash, .welcome-atmosphere, .welcome-progress",
          { autoAlpha: 0, duration: 1.75, ease: "power2.inOut" },
          0.5,
        )
        .to(
          screen,
          {
            autoAlpha: 0,
            scale: 1.012,
            duration: 0.9,
            ease: "power2.inOut",
          },
          1.9,
        );
    },
    [onComplete, onExitStart, reducedMotion, setLocation],
  );

  useEffect(() => {
    if (imagesLoading) return;
    const timer = window.setTimeout(
      () => dismiss(),
      welcomeDuration * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [dismiss, reducedMotion, imagesLoading]);

  return (
    <section
      ref={scope}
      className={`welcome-screen${imagesLoading ? " is-loading" : ""}`}
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
          <path
            className="giving-heart"
            d="M250 190 C222 167 193 147 193 120 C193 98 210 83 231 83 C243 83 253 90 260 101 C267 90 277 83 289 83 C310 83 327 98 327 120 C327 147 298 167 270 190 L260 198 Z"
          />
          <path
            className="giving-hand"
            d="M99 302 C128 282 151 272 172 281 L222 303 C235 309 246 321 241 332 C237 342 225 346 213 341 L181 328 C202 343 224 357 248 365 C279 376 308 366 328 344 L365 304 C376 292 393 292 402 303 C410 313 407 326 399 336 L360 382 C332 414 289 429 248 416 C213 405 183 384 157 366 L105 335 C92 328 88 311 99 302 Z"
          />
          <path
            className="giving-palm"
            d="M218 300 L198 260 C193 249 198 237 209 233 C220 229 229 235 234 245 L254 282 M254 282 L244 239 C241 227 248 217 260 216 C272 215 280 223 282 235 L291 280 M291 280 L291 251 C291 239 300 231 311 233 C322 235 328 244 326 256 L322 305"
          />
        </svg>
        <svg
          className="welcome-giving-art welcome-giving-art--left"
          viewBox="0 0 500 500"
        >
          <path
            className="giving-heart"
            d="M250 190 C222 167 193 147 193 120 C193 98 210 83 231 83 C243 83 253 90 260 101 C267 90 277 83 289 83 C310 83 327 98 327 120 C327 147 298 167 270 190 L260 198 Z"
          />
          <path
            className="giving-hand"
            d="M99 302 C128 282 151 272 172 281 L222 303 C235 309 246 321 241 332 C237 342 225 346 213 341 L181 328 C202 343 224 357 248 365 C279 376 308 366 328 344 L365 304 C376 292 393 292 402 303 C410 313 407 326 399 336 L360 382 C332 414 289 429 248 416 C213 405 183 384 157 366 L105 335 C92 328 88 311 99 302 Z"
          />
          <path
            className="giving-palm"
            d="M218 300 L198 260 C193 249 198 237 209 233 C220 229 229 235 234 245 L254 282 M254 282 L244 239 C241 227 248 217 260 216 C272 215 280 223 282 235 L291 280 M291 280 L291 251 C291 239 300 231 311 233 C322 235 328 244 326 256 L322 305"
          />
        </svg>
      </div>

      <div className="welcome-photo-collage" style={collageStyle} aria-hidden="true">
        {galleryPhotoKeys.map((slot) => (
          <div className="welcome-photo-tile" key={slot}>
            <DynamicImage
              slotKey={slot}
              alt={images[slot]?.alt_text ?? ""}
              className="welcome-photo"
              preferLocal={imagesError}
              loading="eager"
            />
          </div>
        ))}
      </div>
      <div className="welcome-gradient-wash" aria-hidden="true" />
      {(!reducedMotion || showFounderWithoutMotion) && (
        <div className="welcome-founder-scene">
          <div className="welcome-founder-ambient" aria-hidden="true" />
          <div className="welcome-founder-photo-frame">
            <DynamicImage
              slotKey="home-founder-photo"
              alt={translateText("Dr Jagannath Patnaik")}
              className="welcome-founder-photo"
              preferLocal={imagesError}
              loading="eager"
            />
          </div>
          <div className="welcome-founder-copy-block">
            <p className="welcome-founder-kicker">
              {translateText("Meet our founder")}
            </p>
            <h2 className="welcome-founder-name">
              {translateText("Dr Jagannath Patnaik")}
            </h2>
            <p className="welcome-founder-role">
              {translateText("Vice Chancellor, The ICFAI University Sikkim")}
            </p>
            <p className="welcome-founder-foundation">
              {translateText("Founder, Settlor & Managing Trustee")}
              <span aria-hidden="true"> · </span>
              {translateText("Jagannath Foundation")}
            </p>
            <p className="welcome-founder-copy">
              {translateText("His guiding belief: Manav seva is Ishwar seva—service to people is service to God.")}
            </p>
          </div>
        </div>
      )}
      {!reducedMotion && (
        <div className="welcome-founder-montage">
          <p className="welcome-founder-gallery-note">
            {translateText("Just a few highlights · explore our full photo gallery")}
          </p>
          <div className="welcome-founder-montage-content">
            <header className="welcome-founder-montage-heading">
              <p>{translateText("A record of service")}</p>
              <h2>{translateText("Moments of leadership")}</h2>
            </header>
            <div className="welcome-founder-montage-grid">
              {founderBackdropPhotos.map(({ slot, src, caption }) => (
                <figure className="welcome-founder-montage-slide" key={slot}>
                  <img
                    src={src}
                    alt=""
                    className="welcome-founder-montage-image"
                    loading="eager"
                  />
                  <figcaption className="welcome-founder-backdrop-caption">
                    {translateText(caption)}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="welcome-founder-montage-flights" aria-hidden="true">
            {founderBackdropPhotos.map(({ slot, src, caption }) => (
              <figure className="welcome-founder-montage-flight" key={slot}>
                <img src={src} alt="" className="welcome-founder-montage-image" loading="eager" />
                <figcaption className="welcome-founder-flight-caption">
                  {translateText(caption)}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
      {!reducedMotion && <div className="welcome-blackout" aria-hidden="true" />}
      <button
        className="welcome-skip"
        type="button"
        onClick={() => dismiss()}
        autoFocus
      >
        {translateText("Skip intro")}
        <span aria-hidden="true">↗</span>
      </button>
      {!reducedMotion && (
        <p className="welcome-moment" aria-hidden="true">
          {translateText("Moments that make a difference")}
        </p>
      )}

      <div className="welcome-layout">
        <div className="welcome-content">
          <div className="welcome-top">
            <div className="welcome-emblem">
              <img
                src="/images/logo-mark.png"
                alt={translateText("Jagannath Foundation logo")}
              />
            </div>
            <p className="welcome-kicker">
              {translateText("A charitable trust · Odisha, India")}
            </p>
          </div>
          <h1 id="welcome-heading">
            <span className="welcome-heading-line">
              <span className="welcome-heading-text">
                {translateText("Welcome to")}
              </span>
            </span>
            <span className="welcome-heading-line welcome-foundation-name">
              <span className="welcome-heading-text">
                {translateText("Jagannath Foundation")}
              </span>
            </span>
          </h1>
          <p className="welcome-intro-copy">
            {" "}
            {translateText("Helping hands. Positive living.")} <br />{" "}
            {translateText(
              "Every gift, big or small, plants a seed of dignity.",
            )}{" "}
          </p>

          <div className="welcome-actions">
            <button
              className="welcome-donate"
              type="button"
              onClick={() => dismiss("/donate")}
            >
              {" "}
              {translateText("Donate Now")}{" "}
            </button>
            <button
              className="welcome-enter"
              type="button"
              onClick={() => dismiss()}
            >
              {" "}
              {translateText("Enter the website")}{" "}
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="welcome-stats">
            <p className="welcome-stats-title">
              {translateText("Why your gift matters")}
            </p>
            <div className="welcome-stats-row">
              {localizeText(
                stats.map((s, i) => (
                  <div key={s.label} className="welcome-stat">
                    <strong data-stat={i}>
                      {localizeText(format(s.value, s.decimals) + s.suffix)}
                    </strong>
                    <span>{localizeText(s.label)}</span>
                  </div>
                )),
              )}
            </div>
          </div>

          <p className="welcome-trust">
            {" "}
            {translateText(
              "Provisional registration u/s 12A & 80G · Odisha, India",
            )}{" "}
          </p>
        </div>
      </div>

      <div className="welcome-progress" aria-hidden="true">
        <span className="welcome-progress-fill" />
      </div>
    </section>
  );
}
