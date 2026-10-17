import { tr as translateText, localize as localizeText } from "../i18n";
import { useTranslation as usePageTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useReducedMotion } from "motion/react";
import { useLocation } from "wouter";
import { DynamicImage, useImages } from "../lib/ImagesContext";
import "./WelcomeScreen.css";

gsap.registerPlugin(useGSAP, SplitText);

/* ------------------------------------------------------------------ */
/*  Story map: one chapter = one scene on the master GSAP timeline.    */
/*  `starts` are the second marks where each chapter begins.           */
/* ------------------------------------------------------------------ */
const chapterNames = [
  "Welcome",
  "The need",
  "What we do",
  "The belief",
  "Our moments",
  "Your gift's journey",
  "Your turn",
];
const starts = [0, 4.4, 9.8, 16.2, 21.0, 27.2, 32.8];
const lastChapter = chapterNames.length - 1;
const crossfade = 0.55;
// After the last chapter, the website opens by itself after this many seconds.
const autoOpenSeconds = 9;

// Photo wall for the "Our moments" chapter. Each slot can be changed from the admin
// panel; if the API is offline the local /images/<slot>.webp file is used.
const momentSlots = [
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

// Same four work areas as the Home page, so the story matches the website.
const pillars = [
  {
    photo: "/images/community/education.webp",
    label: "Education & literacy",
    title: "Learning that lasts",
    body: "Learning support that helps children stay in school and thrive.",
  },
  {
    photo: "/images/community/health.webp",
    label: "Health & family welfare",
    title: "Care within reach",
    body: "Community health and family support, close to where people live.",
  },
  {
    photo: "/images/community/womens-livelihoods.webp",
    label: "Women's livelihoods",
    title: "Skills into livelihoods",
    body: "Skills, income and leadership opportunities for women and girls.",
  },
  {
    photo: "/images/community/solar-energy.webp",
    label: "Clean energy",
    title: "Energy for everyday life",
    body: "Cleaner, more reliable energy for everyday household life.",
  },
];

const journey = [
  { title: "You give", body: "Any amount, once or every month." },
  {
    title: "The trust invests",
    body: "In classrooms, health care, skills and clean energy.",
  },
  {
    title: "A life changes",
    body: "Dignity, opportunity and hope reach a family.",
  },
];

const exploreLinks = [
  { label: "Our impact", to: "/impact" },
  { label: "Volunteer", to: "/volunteer" },
  { label: "Gallery", to: "/gallery" },
];

const fleckCount = 22;

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
  const { i18n } = usePageTranslation();
  const t = translateText;
  const scope = useRef<HTMLElement | null>(null);
  const master = useRef<gsap.core.Timeline | null>(null);
  const curtain = useRef<HTMLDivElement | null>(null);
  const isClosing = useRef(false);
  const dismissRef = useRef<() => void>(() => {});
  const isJumping = useRef(false);
  const activeChapter = useRef(0);
  const reducedMotion = useReducedMotion();
  const { loading: imagesLoading, error: imagesError } = useImages();
  const [, setLocation] = useLocation();
  const [fontsReady, setFontsReady] = useState(false);
  const [compact, setCompact] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 860px)").matches,
  );

  // Wait for the web fonts, so the line-splitting measures the real text.
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        setFontsReady(true);
      }
    };
    document.fonts?.ready.then(finish, finish);
    const timer = window.setTimeout(finish, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  // Phone vs desktop changes how the "journey" chapter lays out.
  useEffect(() => {
    const query = window.matchMedia("(max-width: 860px)");
    const update = () => setCompact(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Light up the right chapter dot (no React re-render needed).
  const markActive = useCallback((index: number) => {
    const screen = scope.current;
    if (!screen || index === activeChapter.current) return;
    activeChapter.current = index;
    screen.querySelectorAll<HTMLElement>(".ws-dot").forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
      dot.classList.toggle("is-done", i < index);
      if (i === index) dot.setAttribute("aria-current", "step");
      else dot.removeAttribute("aria-current");
    });
    screen
      .querySelector(".ws-next")
      ?.classList.toggle("is-hidden", index === lastChapter);
  }, []);

  const resetStats = useCallback(() => {
    scope.current
      ?.querySelectorAll<HTMLElement>("[data-stat]")
      .forEach((el) => {
        const s = stats[Number(el.dataset.stat)];
        if (s) el.textContent = format(0, s.decimals) + s.suffix;
      });
  }, []);

  /* ---------------------------- the story ---------------------------- */
  useGSAP(
    () => {
      if (reducedMotion || !fontsReady) return;

      const q = gsap.utils.selector(scope);
      const at = (i: number) => starts[i];

      // Every chapter headline is split into masked lines.
      const lines = (selector: string) => {
        const out: Element[] = [];
        q(selector).forEach((el) => {
          const split = SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "ws-line",
          });
          out.push(...split.lines);
        });
        return out;
      };

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onUpdate: () => {
          const time = tl.time();
          let index = 0;
          for (let i = 0; i < starts.length; i++)
            if (time >= starts[i] - 0.01) index = i;
          markActive(index);
          gsap.set(q(".ws-progress-fill"), { scaleX: tl.progress() });
        },
      });
      master.current = tl;

      // A chapter fades in at its start and out just before the next one.
      const chapter = (i: number, selector: string) => {
        tl.fromTo(
          q(selector),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5, ease: "power1.out" },
          at(i),
        );
        if (i < lastChapter) {
          tl.to(
            q(selector),
            { autoAlpha: 0, duration: crossfade, ease: "power1.in" },
            at(i + 1) - crossfade,
          );
        }
      };

      // Big faint chapter number drifting behind the content.
      const bigNumber = (i: number, selector: string) => {
        tl.fromTo(
          q(selector),
          { yPercent: 14, autoAlpha: 0 },
          { yPercent: -6, autoAlpha: 1, duration: 5.4, ease: "none" },
          at(i) + 0.1,
        );
      };

      /* 0 · Welcome ---------------------------------------------------- */
      const ring = q<SVGCircleElement>(".ws-ring-path");
      const ringLength = ring[0]?.getTotalLength() ?? 400;
      gsap.set(ring, {
        strokeDasharray: ringLength,
        strokeDashoffset: ringLength,
      });
      chapter(0, ".ws-chapter--intro");
      tl.fromTo(
        q(".ws-emblem"),
        { scale: 0.55, autoAlpha: 0, rotate: -12 },
        {
          scale: 1,
          autoAlpha: 1,
          rotate: 0,
          duration: 1.3,
          ease: "back.out(1.6)",
        },
        0.15,
      )
        .to(
          ring,
          { strokeDashoffset: 0, duration: 1.7, ease: "power2.inOut" },
          0.2,
        )
        .fromTo(
          q(".ws-intro-kicker"),
          { autoAlpha: 0, y: 14, letterSpacing: "0.38em" },
          { autoAlpha: 1, y: 0, letterSpacing: "0.22em", duration: 0.9 },
          0.8,
        )
        .fromTo(
          q(".ws-h1-text"),
          { yPercent: 115, rotateX: -12 },
          {
            yPercent: 0,
            rotateX: 0,
            duration: 1.2,
            stagger: 0.14,
            ease: "expo.out",
          },
          1.0,
        )
        .fromTo(
          q(".ws-intro-sub"),
          { autoAlpha: 0, y: 16, filter: "blur(6px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.9 },
          2.0,
        );

      /* 1 · The need --------------------------------------------------- */
      chapter(1, ".ws-chapter--need");
      bigNumber(1, ".ws-chapter--need .ws-bignum");
      tl.fromTo(
        q(".ws-need-photo"),
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" },
        at(1) + 0.05,
      )
        .fromTo(
          q(".ws-need-photo img"),
          { scale: 1.3 },
          { scale: 1.06, duration: 6, ease: "none" },
          at(1) + 0.05,
        )
        .fromTo(
          q(".ws-need .ws-eyebrow"),
          { autoAlpha: 0, x: -20 },
          { autoAlpha: 1, x: 0, duration: 0.8 },
          at(1) + 0.35,
        )
        .from(
          lines(".ws-need .ws-split"),
          { yPercent: 115, duration: 1.1, stagger: 0.12, ease: "expo.out" },
          at(1) + 0.5,
        )
        .fromTo(
          q(".ws-stat"),
          { autoAlpha: 0, y: 34 },
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.18 },
          at(1) + 1.5,
        )
        .fromTo(
          q(".ws-stat-line"),
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.1,
            stagger: 0.18,
            ease: "power2.inOut",
            transformOrigin: "left center",
          },
          at(1) + 1.6,
        )
        .fromTo(
          q(".ws-need-note"),
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.9 },
          at(1) + 3.3,
        );
      stats.forEach((s, i) => {
        const el = q<HTMLElement>(`[data-stat="${i}"]`)[0];
        if (!el) return;
        const counter = { n: 0 };
        el.textContent = format(0, s.decimals) + s.suffix;
        tl.fromTo(
          counter,
          { n: 0 },
          {
            n: s.value,
            duration: 2.0,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = format(counter.n, s.decimals) + s.suffix;
            },
          },
          at(1) + 1.6 + i * 0.18,
        );
      });

      /* 2 · What we do ------------------------------------------------- */
      chapter(2, ".ws-chapter--work");
      bigNumber(2, ".ws-chapter--work .ws-bignum");
      tl.fromTo(
        q(".ws-work .ws-eyebrow"),
        { autoAlpha: 0, x: -20 },
        { autoAlpha: 1, x: 0, duration: 0.8 },
        at(2) + 0.2,
      )
        .from(
          lines(".ws-work .ws-split"),
          { yPercent: 115, duration: 1.1, stagger: 0.12, ease: "expo.out" },
          at(2) + 0.35,
        )
        .fromTo(
          q(".ws-card"),
          { clipPath: "inset(100% 0% 0% 0% round 22px)", y: 40 },
          {
            clipPath: "inset(0% 0% 0% 0% round 22px)",
            y: 0,
            duration: 1.3,
            stagger: 0.2,
            ease: "expo.inOut",
          },
          at(2) + 1.0,
        )
        .fromTo(
          q(".ws-card-img"),
          { scale: 1.35 },
          { scale: 1.05, duration: 5, stagger: 0.2, ease: "none" },
          at(2) + 1.0,
        )
        .fromTo(
          q(".ws-card-text > *"),
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.05 },
          at(2) + 1.9,
        );

      /* 3 · The belief ------------------------------------------------- */
      chapter(3, ".ws-chapter--belief");
      bigNumber(3, ".ws-chapter--belief .ws-bignum");
      tl.fromTo(
        q(".ws-founder-frame"),
        { clipPath: "inset(0% 0% 100% 0% round 26px)", scale: 1.06 },
        {
          clipPath: "inset(0% 0% 0% 0% round 26px)",
          scale: 1,
          duration: 1.4,
          ease: "expo.inOut",
        },
        at(3) + 0.1,
      )
        .fromTo(
          q(".ws-founder-frame img"),
          { scale: 1.25 },
          { scale: 1.02, duration: 4.5, ease: "none" },
          at(3) + 0.1,
        )
        .fromTo(
          q(".ws-belief .ws-eyebrow"),
          { autoAlpha: 0, x: -20 },
          { autoAlpha: 1, x: 0, duration: 0.8 },
          at(3) + 0.5,
        )
        .from(
          lines(".ws-belief .ws-split"),
          { yPercent: 115, duration: 1.2, stagger: 0.14, ease: "expo.out" },
          at(3) + 0.7,
        )
        .fromTo(
          q(".ws-quote-line"),
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1,
            ease: "power2.inOut",
            transformOrigin: "left center",
          },
          at(3) + 1.5,
        )
        .fromTo(
          q(".ws-belief-meta > *"),
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 },
          at(3) + 1.7,
        );

      /* 4 · Our moments (photo wall) --------------------------------- */
      chapter(4, ".ws-chapter--moments");
      tl.fromTo(
        q(".ws-tile"),
        {
          autoAlpha: 0,
          y: 70,
          scale: 0.78,
          rotate: (i: number) => (i % 2 ? 4 : -4),
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          duration: 1.3,
          stagger: { amount: 1.4, from: "random" },
          ease: "power3.out",
        },
        at(4) + 0.1,
      )
        .fromTo(
          q(".ws-tile img"),
          { scale: 1.2 },
          { scale: 1.02, duration: 6, ease: "none" },
          at(4) + 0.1,
        )
        .fromTo(
          q(".ws-moments-card"),
          { autoAlpha: 0, y: 30, scale: 0.94, filter: "blur(10px)" },
          { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.1 },
          at(4) + 1.5,
        )
        .from(
          lines(".ws-moments .ws-split"),
          { yPercent: 115, duration: 1.1, stagger: 0.12, ease: "expo.out" },
          at(4) + 1.75,
        )
        .fromTo(
          q(".ws-moments-kicker, .ws-moments-note"),
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.2 },
          at(4) + 1.7,
        );

      /* 5 · Your gift's journey --------------------------------------- */
      chapter(5, ".ws-chapter--journey");
      bigNumber(5, ".ws-chapter--journey .ws-bignum");
      const axis = compact ? "scaleY" : "scaleX";
      const origin = compact ? "center top" : "left center";
      const travel = at(5) + 1.2;
      const travelTime = 2.8;
      tl.fromTo(
        q(".ws-journey .ws-eyebrow"),
        { autoAlpha: 0, x: -20 },
        { autoAlpha: 1, x: 0, duration: 0.8 },
        at(5) + 0.2,
      )
        .from(
          lines(".ws-journey .ws-split"),
          { yPercent: 115, duration: 1.1, stagger: 0.12, ease: "expo.out" },
          at(5) + 0.35,
        )
        .fromTo(
          q(".ws-track-fill"),
          { [axis]: 0 },
          {
            [axis]: 1,
            duration: travelTime,
            ease: "none",
            transformOrigin: origin,
          },
          travel,
        )
        .fromTo(
          q(".ws-travel-seed"),
          { autoAlpha: 0, [compact ? "top" : "left"]: "0%" },
          {
            autoAlpha: 1,
            [compact ? "top" : "left"]: "100%",
            duration: travelTime,
            ease: "none",
          },
          travel,
        );
      q(".ws-step").forEach((step, i) => {
        const when = travel + (i * travelTime) / 2;
        tl.fromTo(
          step.querySelector(".ws-step-dot"),
          { scale: 0.3, autoAlpha: 0.25 },
          { scale: 1, autoAlpha: 1, duration: 0.8, ease: "back.out(2.4)" },
          i === 0 ? at(5) + 0.9 : when - 0.15,
        )
          .fromTo(
            step.querySelector(".ws-step-ripple"),
            { scale: 0.6, autoAlpha: 0.8 },
            { scale: 2.4, autoAlpha: 0, duration: 1.1, ease: "power2.out" },
            i === 0 ? at(5) + 0.9 : when - 0.15,
          )
          .fromTo(
            step.querySelectorAll(".ws-step-text > *"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 },
            i === 0 ? at(5) + 1.1 : when,
          );
      });
      tl.to(
        q(".ws-travel-seed"),
        { scale: 1.8, autoAlpha: 0, duration: 0.7, ease: "power2.out" },
        travel + travelTime,
      );

      /* 6 · Your turn -------------------------------------------------- */
      chapter(6, ".ws-chapter--final");
      tl.fromTo(
        q(".ws-burst"),
        { scale: 0.2, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 2.2, ease: "expo.out" },
        at(6) + 0.1,
      )
        .fromTo(
          q(".ws-final .ws-eyebrow"),
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          at(6) + 0.3,
        )
        .from(
          lines(".ws-final .ws-split"),
          { yPercent: 115, duration: 1.2, stagger: 0.14, ease: "expo.out" },
          at(6) + 0.45,
        )
        .fromTo(
          q(".ws-final-copy"),
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.9 },
          at(6) + 1.3,
        )
        .fromTo(
          q(".ws-actions > *"),
          { autoAlpha: 0, y: 24, scale: 0.95 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.14,
            ease: "back.out(1.5)",
          },
          at(6) + 1.65,
        )
        .fromTo(
          q(".ws-explore"),
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          at(6) + 2.3,
        )
        .fromTo(
          q(".ws-trust"),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.8 },
          at(6) + 2.6,
        )
        .fromTo(
          q(".ws-auto"),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.6 },
          at(6) + 3.0,
        )
        .fromTo(
          q(".ws-auto-bar"),
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: autoOpenSeconds,
            ease: "none",
            transformOrigin: "left center",
          },
          at(6) + 3.0,
        )
        .call(() => dismissRef.current(), undefined, ">");

      /* Always-on atmosphere ------------------------------------------ */
      gsap.fromTo(
        q(".ws-hud"),
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 1, delay: 1.2, ease: "power2.out" },
      );
      q(".ws-fleck").forEach((el) => {
        gsap.set(el, {
          x: gsap.utils.random(0, window.innerWidth),
          y: gsap.utils.random(window.innerHeight * 0.25, window.innerHeight),
          scale: gsap.utils.random(0.5, 1.5),
          autoAlpha: 0,
        });
        gsap.to(el, {
          y: `-=${gsap.utils.random(140, 360)}`,
          autoAlpha: gsap.utils.random(0.25, 0.75),
          duration: gsap.utils.random(5, 10),
          delay: gsap.utils.random(0, 4),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
      gsap.to(q(".ws-glow--one"), {
        x: 60,
        y: -30,
        scale: 1.12,
        duration: 11,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(q(".ws-glow--two"), {
        x: -50,
        y: 36,
        scale: 1.1,
        duration: 13,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(q(".ws-pulse"), {
        scale: 1.55,
        autoAlpha: 0,
        duration: 1.8,
        repeat: -1,
        ease: "power2.out",
      });
    },
    {
      scope,
      dependencies: [reducedMotion, fontsReady, compact, i18n.resolvedLanguage],
      revertOnUpdate: true,
    },
  );

  /* ----------------------- pointer: spotlight + magnet ----------------------- */
  useEffect(() => {
    const screen = scope.current;
    if (!screen || reducedMotion) return;
    const spot = screen.querySelector<HTMLElement>(".ws-spot");
    if (!spot) return;
    gsap.set(spot, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    const sx = gsap.quickTo(spot, "x", { duration: 0.9, ease: "power3.out" });
    const sy = gsap.quickTo(spot, "y", { duration: 0.9, ease: "power3.out" });

    const magnets = Array.from(
      screen.querySelectorAll<HTMLElement>("[data-magnet]"),
    ).map((el) => ({
      el,
      mx: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }),
      my: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" }),
    }));

    const move = (e: PointerEvent) => {
      sx(e.clientX);
      sy(e.clientY);
      magnets.forEach(({ el, mx, my }) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const near = Math.hypot(dx, dy) < Math.max(r.width, 120);
        mx(near ? dx * 0.22 : 0);
        my(near ? dy * 0.3 : 0);
      });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [reducedMotion]);

  // Stop the page behind from scrolling.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* ------------------------------ leaving ------------------------------ */
  const dismiss = useCallback(
    (to?: string) => {
      if (isClosing.current) return;
      isClosing.current = true;
      master.current?.pause();
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
          { autoAlpha: 0, scale: 1.04, filter: "blur(12px)" },
          {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.7,
            ease: "power2.out",
          },
          0,
        );
      }
      exit
        .to(
          screen.querySelectorAll(".ws-chapter, .ws-hud, .ws-skip"),
          { autoAlpha: 0, y: -28, duration: 0.55, ease: "power2.in" },
          0,
        )
        .to(
          screen,
          {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 1.2,
            ease: "expo.inOut",
          },
          0.4,
        );
    },
    [onComplete, onExitStart, reducedMotion, setLocation],
  );

  useEffect(() => {
    dismissRef.current = () => dismiss();
  }, [dismiss]);

  // Without animation there is no timeline, so open the site after a pause.
  useEffect(() => {
    if (!reducedMotion) return;
    const timer = window.setTimeout(
      () => dismissRef.current(),
      (autoOpenSeconds + 3) * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  /* --------------------------- story controls --------------------------- */
  const goTo = useCallback(
    (index: number) => {
      const tl = master.current;
      const veil = curtain.current;
      if (!tl || !veil || isJumping.current || isClosing.current) return;
      const target = Math.max(0, Math.min(lastChapter, index));
      isJumping.current = true;
      gsap
        .timeline({ onComplete: () => void (isJumping.current = false) })
        .to(veil, { autoAlpha: 1, duration: 0.22, ease: "power1.in" })
        .add(() => {
          resetStats();
          tl.seek(starts[target] + 0.02, false);
          markActive(target);
          tl.play();
        })
        .to(veil, { autoAlpha: 0, duration: 0.4, ease: "power1.out" });
    },
    [markActive, resetStats],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(activeChapter.current + 1);
      else if (e.key === "ArrowLeft") goTo(activeChapter.current - 1);
      else if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismiss, goTo]);

  useEffect(() => {
    scope.current?.focus({ preventScroll: true });
  }, []);

  /* ------------------------------- markup ------------------------------- */
  return (
    <section
      ref={scope}
      className={`welcome-screen${reducedMotion ? " is-static" : ""}${!reducedMotion && !fontsReady ? " is-booting" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-heading"
      tabIndex={-1}
    >
      <div className="ws-bg" aria-hidden="true">
        <span className="ws-glow ws-glow--one" />
        <span className="ws-glow ws-glow--two" />
        <span className="ws-grid" />
        <span className="ws-spot" />
        {Array.from({ length: fleckCount }, (_, i) => (
          <i className="ws-fleck" key={i} />
        ))}
        <span className="ws-grain" />
      </div>

      <div className="ws-stage">
        {/* 0 · Welcome */}
        <div className="ws-chapter ws-chapter--intro">
          <div className="ws-center">
            <div className="ws-emblem">
              <svg className="ws-ring" viewBox="0 0 100 100" aria-hidden="true">
                <circle className="ws-ring-path" cx="50" cy="50" r="48" />
              </svg>
              <img
                src="/images/logo-mark.png"
                alt={t("Jagannath Foundation logo")}
              />
            </div>
            <p className="ws-intro-kicker">
              {t("A charitable trust · Odisha, India")}
            </p>
            <h1 id="welcome-heading">
              <span className="ws-h1-line">
                <span className="ws-h1-text">{t("Welcome to")}</span>
              </span>
              <span className="ws-h1-line ws-gold">
                <span className="ws-h1-text">{t("Jagannath Foundation")}</span>
              </span>
            </h1>
            <p className="ws-intro-sub">
              {t("Here is a short story of what happens when people give.")}
            </p>
          </div>
        </div>

        {/* 1 · The need */}
        <div className="ws-chapter ws-chapter--need">
          <div className="ws-need-photo" aria-hidden="true">
            <img src="/images/community/village-hero.webp" alt="" />
          </div>
          <span className="ws-bignum" aria-hidden="true">
            01
          </span>
          <div className="ws-wrap ws-need">
            <p className="ws-eyebrow">
              <b>01</b>
              {t("The need")}
            </p>
            <h2 className="ws-split ws-headline">
              {t(
                "Odisha is home to more Particularly Vulnerable Tribal Groups than any other state.",
              )}
            </h2>
            <div className="ws-stats">
              {stats.map((s, i) => (
                <div key={s.label} className="ws-stat">
                  <strong data-stat={i}>
                    {format(s.value, s.decimals) + s.suffix}
                  </strong>
                  <span>{localizeText(s.label)}</span>
                  <i className="ws-stat-line" aria-hidden="true" />
                </div>
              ))}
            </div>
            <p className="ws-need-note">
              {t("Behind every number is a family. This is where we begin.")}
            </p>
          </div>
        </div>

        {/* 2 · What we do */}
        <div className="ws-chapter ws-chapter--work">
          <span className="ws-bignum" aria-hidden="true">
            02
          </span>
          <div className="ws-wrap ws-work">
            <p className="ws-eyebrow">
              <b>02</b>
              {t("What we do")}
            </p>
            <h2 className="ws-split ws-headline">
              {t("Four ways we turn a gift into a future.")}
            </h2>
            <div className="ws-cards">
              {pillars.map((p, i) => (
                <article className="ws-card" key={p.title}>
                  <img
                    className="ws-card-img"
                    src={p.photo}
                    alt=""
                    loading="eager"
                  />
                  <div className="ws-card-shade" aria-hidden="true" />
                  <span
                    className="ws-card-num"
                    aria-hidden="true"
                  >{`0${i + 1}`}</span>
                  <div className="ws-card-text">
                    <p>{t(p.label)}</p>
                    <h3>{t(p.title)}</h3>
                    <span>{t(p.body)}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* 3 · The belief */}
        <div className="ws-chapter ws-chapter--belief">
          <span className="ws-bignum" aria-hidden="true">
            03
          </span>
          <div className="ws-wrap ws-belief">
            <div className="ws-founder-frame">
              <DynamicImage
                slotKey="home-founder-photo"
                alt={t("Dr Jagannath Patnaik")}
                className="ws-founder-photo"
                preferLocal={imagesLoading || imagesError}
                loading="eager"
              />
            </div>
            <div className="ws-belief-copy">
              <p className="ws-eyebrow">
                <b>03</b>
                {t("The belief")}
              </p>
              <h2 className="ws-split ws-quote">
                {t("“Manav seva is Ishwar seva”")}
              </h2>
              <i className="ws-quote-line" aria-hidden="true" />
              <div className="ws-belief-meta">
                <p className="ws-belief-line">
                  {t("Service to people is service to God.")}
                </p>
                <p className="ws-belief-name">{t("Dr Jagannath Patnaik")}</p>
                <p className="ws-belief-role">
                  {t("Vice Chancellor, The ICFAI University Sikkim")}
                </p>
                <p className="ws-belief-role">
                  {t("Founder, Settlor & Managing Trustee")}
                  <span aria-hidden="true"> · </span>
                  {t("Jagannath Foundation")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 · Our moments (photo wall) */}
        <div className="ws-chapter ws-chapter--moments">
          <div className="ws-collage" aria-hidden="true">
            {momentSlots.map((slot) => (
              <div className="ws-tile" key={slot}>
                <DynamicImage
                  slotKey={slot}
                  alt=""
                  className="ws-tile-img"
                  preferLocal={imagesLoading || imagesError}
                  loading="eager"
                />
              </div>
            ))}
          </div>
          <div className="ws-moments-shade" aria-hidden="true" />
          <div className="ws-moments">
            <div className="ws-moments-card">
              <p className="ws-moments-kicker">
                <b>04</b>
                {t("Our moments")}
              </p>
              <h2 className="ws-split ws-moments-title">
                {t("Moments that make a difference")}
              </h2>
              <p className="ws-moments-note">
                {t("Just a few highlights · explore our full photo gallery")}
              </p>
            </div>
          </div>
        </div>

        {/* 5 · Your gift's journey */}
        <div className="ws-chapter ws-chapter--journey">
          <span className="ws-bignum" aria-hidden="true">
            05
          </span>
          <div className="ws-wrap ws-journey">
            <p className="ws-eyebrow">
              <b>05</b>
              {t("Your gift's journey")}
            </p>
            <h2 className="ws-split ws-headline">
              {t("From your hands to a village.")}
            </h2>
            <div className="ws-steps">
              <div className="ws-track" aria-hidden="true">
                <i className="ws-track-base" />
                <i className="ws-track-fill" />
                <i className="ws-travel-seed" />
              </div>
              {journey.map((step, i) => (
                <div className="ws-step" key={step.title}>
                  <div className="ws-step-dotwrap">
                    <i className="ws-step-ripple" aria-hidden="true" />
                    <span className="ws-step-dot">{i + 1}</span>
                  </div>
                  <div className="ws-step-text">
                    <h3>{t(step.title)}</h3>
                    <p>{t(step.body)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5 · Your turn */}
        <div className="ws-chapter ws-chapter--final">
          <span className="ws-burst" aria-hidden="true" />
          <div className="ws-center ws-final">
            <p className="ws-eyebrow ws-eyebrow--center">{t("Your turn")}</p>
            <h2 className="ws-split ws-headline ws-headline--big">
              {t("Every gift, big or small, plants a seed of dignity.")}
            </h2>
            <p className="ws-final-copy">
              {t("Give today, or take a look around first. Both are welcome.")}
            </p>
            <div className="ws-actions">
              <button
                className="ws-donate"
                type="button"
                data-magnet
                onClick={() => dismiss("/donate")}
              >
                <i className="ws-pulse" aria-hidden="true" />
                <span>{t("Donate Now")}</span>
              </button>
              <button
                className="ws-enter"
                type="button"
                data-magnet
                onClick={() => dismiss()}
              >
                <span>{t("Enter the website")}</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="ws-explore">
              <span>{t("Or explore")}</span>
              {exploreLinks.map((link) => (
                <button
                  key={link.to}
                  type="button"
                  onClick={() => dismiss(link.to)}
                >
                  {t(link.label)}
                </button>
              ))}
            </div>
            <p className="ws-trust">
              {t("Provisional registration u/s 12A & 80G · Odisha, India")}
            </p>
            <div className="ws-auto" aria-hidden="true">
              <span>{t("Opening the website automatically…")}</span>
              <i className="ws-auto-track">
                <i className="ws-auto-bar" />
              </i>
            </div>
          </div>
        </div>
      </div>

      <div className="ws-curtain" ref={curtain} aria-hidden="true" />

      <button className="ws-skip" type="button" onClick={() => dismiss()}>
        {t("Skip intro")}
        <span aria-hidden="true">↗</span>
      </button>

      <div className="ws-hud">
        <nav className="ws-nav" aria-label={t("Story chapters")}>
          {chapterNames.map((name, i) => (
            <button
              key={name}
              type="button"
              className={`ws-dot${i === 0 ? " is-active" : ""}`}
              aria-label={t(name)}
              aria-current={i === 0 ? "step" : undefined}
              onClick={() => goTo(i)}
            >
              <span className="ws-dot-mark" />
              <span className="ws-dot-label">{t(name)}</span>
            </button>
          ))}
        </nav>
        <button
          className="ws-next"
          type="button"
          onClick={() => goTo(activeChapter.current + 1)}
        >
          {t("Next")}
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="ws-progress" aria-hidden="true">
        <span className="ws-progress-fill" />
      </div>
    </section>
  );
}
