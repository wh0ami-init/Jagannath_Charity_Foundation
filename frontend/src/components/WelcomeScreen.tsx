import { useCallback, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import { useLocation } from "wouter";
import { DynamicImage } from "../lib/ImagesContext";
import "./WelcomeScreen.css";

gsap.registerPlugin(useGSAP);
const welcomeDuration = import.meta.env.DEV ? 16 : 10.5;

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

const SEEDS = 12;
const SPARKS = 9;

export default function WelcomeScreen({
  onExitStart,
  onComplete,
}: {
  onExitStart: () => void;
  onComplete: () => void;
}) {
  const scope = useRef<HTMLElement | null>(null);
  const isClosing = useRef(false);
  const reducedMotion = useReducedMotion();
  const [, setLocation] = useLocation();

  useGSAP(
    () => {
      if (reducedMotion) return;

      const tl = gsap.timeline();
      tl.fromTo(
        ".welcome-top",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" },
        0.15,
      )
        .fromTo(
          ".welcome-heading-line",
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            stagger: 0.16,
            ease: "power3.out",
          },
          0.4,
        )
        .fromTo(
          ".welcome-intro-copy",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" },
          1.1,
        )
        .fromTo(
          ".welcome-actions > *",
          { autoAlpha: 0, y: 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
          },
          1.4,
        )
        .fromTo(
          ".welcome-stats",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" },
          4.9,
        )
        .fromTo(
          ".welcome-trust",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.8 },
          5.6,
        );

      // Heart: outline draws, seeds fall in slowly, heart fills with gold
      const art = scope.current?.querySelector<HTMLElement>(".welcome-art");
      const W = art?.offsetWidth ?? 400;
      const H = art?.offsetHeight ?? 400;
      const heart = gsap.timeline({ delay: 0.5 });
      heart
        .fromTo(
          ".welcome-art",
          { autoAlpha: 0, scale: 0.9 },
          { autoAlpha: 1, scale: 1, duration: 1.1, ease: "power3.out" },
          0,
        )
        .fromTo(
          ".welcome-heart-line",
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut" },
          0.2,
        )
        .fromTo(
          ".welcome-heart-level",
          { attr: { y: 300 } },
          { attr: { y: 0 }, duration: 4.2, ease: "power1.inOut" },
          1.6,
        )
        .fromTo(
          ".welcome-heart-fill",
          { opacity: 0.35 },
          { opacity: 1, duration: 1.2, ease: "power2.out" },
          4.8,
        );

      gsap.utils.toArray<HTMLElement>(".welcome-seed").forEach((seed, i) => {
        const at = 1.5 + i * 0.28;
        heart
          .fromTo(
            seed,
            {
              autoAlpha: 0,
              x: gsap.utils.random(-W * 0.4, W * 0.4),
              y: -H * 0.58,
              scale: gsap.utils.random(0.8, 1.5),
            },
            {
              autoAlpha: 1,
              x: 0,
              y: H * 0.03,
              scale: 0.35,
              duration: 1.25,
              ease: "power2.in",
            },
            at,
          )
          .to(seed, { autoAlpha: 0, duration: 0.2 }, at + 1.15);
        heart.to(
          ".welcome-heart-wrap",
          {
            scale: 1.045,
            duration: 0.14,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut",
          },
          at + 1.2,
        );
      });
      // Heart is full: ring of light + thank-you line
      heart
        .fromTo(
          ".welcome-burst",
          { scale: 0.4, autoAlpha: 0.9 },
          {
            scale: 1.9,
            autoAlpha: 0,
            duration: 1.4,
            ease: "power2.out",
            immediateRender: false,
          },
          5.9,
        )
        .fromTo(
          ".welcome-thanks",
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" },
          6.1,
        );

      // After it is full: a gentle heartbeat, a slow float, and tiny sparks rising
      gsap
        .timeline({ delay: 7.2, repeat: -1, repeatDelay: 0.9 })
        .to(".welcome-heart-wrap", {
          scale: 1.07,
          duration: 0.16,
          ease: "power2.out",
        })
        .to(".welcome-heart-wrap", {
          scale: 1,
          duration: 0.2,
          ease: "power2.in",
        })
        .to(".welcome-heart-wrap", {
          scale: 1.04,
          duration: 0.14,
          ease: "power2.out",
        })
        .to(".welcome-heart-wrap", {
          scale: 1,
          duration: 0.32,
          ease: "power2.in",
        });

      gsap.utils.toArray<HTMLElement>(".welcome-spark").forEach((spark, i) => {
        gsap
          .timeline({
            delay: 7 + i * 0.45,
            repeat: -1,
            repeatDelay: gsap.utils.random(0.2, 1),
          })
          .set(spark, {
            x: gsap.utils.random(-W * 0.17, W * 0.17),
            y: H * 0.08,
            scale: gsap.utils.random(0.6, 1.2),
          })
          .addLabel("go")
          .to(spark, { y: -H * 0.42, duration: 2.6, ease: "power1.out" }, "go")
          .to(spark, { autoAlpha: 1, duration: 0.5 }, "go")
          .to(spark, { autoAlpha: 0, duration: 1.2 }, "go+=1.4");
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
          5.0 + i * 0.15,
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
      gsap.to(".welcome-glow--one", {
        x: 70,
        y: -24,
        scale: 1.12,
        duration: 9,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      gsap.to(".welcome-glow--two", {
        x: -64,
        y: 28,
        scale: 1.14,
        duration: 11,
        delay: 0.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
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

  // Cursor magic: glow and heart follow the mouse a little
  useEffect(() => {
    const screen = scope.current;
    if (!screen || reducedMotion) return;
    const art = screen.querySelector<HTMLElement>(".welcome-tilt");
    const glow = screen.querySelector<HTMLElement>(".welcome-glow--one");
    if (!art || !glow) return;
    const ax = gsap.quickTo(art, "x", { duration: 0.9, ease: "power3.out" });
    const ay = gsap.quickTo(art, "y", { duration: 0.9, ease: "power3.out" });
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
      ax(px * 28);
      ay(py * 20);
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
      // Doors slide apart and the website appears between them
      const exit = gsap.timeline({ onComplete });
      exit
        .to(
          ".welcome-content, .welcome-art-zone, .welcome-atmosphere, .welcome-progress",
          { autoAlpha: 0, duration: 0.55, ease: "power2.in" },
        )
        .to(
          ".welcome-door--left",
          { xPercent: -100, duration: 1.2, ease: "power3.inOut" },
          ">-0.1",
        )
        .to(
          ".welcome-door--right",
          { xPercent: 100, duration: 1.2, ease: "power3.inOut" },
          "<",
        )
        .set(screen, { autoAlpha: 0 });
    },
    [onComplete, onExitStart, reducedMotion, setLocation],
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => dismiss(),
      reducedMotion ? 6000 : welcomeDuration * 1000,
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
        <span className="welcome-grid" />
      </div>

      <div className="welcome-layout">
        <div className="welcome-art-zone" aria-hidden="true">
          <div className="welcome-tilt">
            <div className="welcome-art">
              <svg className="welcome-rings" viewBox="0 0 400 400">
                <circle className="welcome-orbit" cx="200" cy="200" r="190" />
                <circle
                  className="welcome-orbit welcome-orbit--inner"
                  cx="200"
                  cy="200"
                  r="150"
                />
              </svg>
              <span className="welcome-burst" />
              {Array.from({ length: SEEDS }).map((_, i) => (
                <span key={i} className="welcome-seed" />
              ))}
              {Array.from({ length: SPARKS }).map((_, i) => (
                <span key={i} className="welcome-spark" />
              ))}
              <div className="welcome-heart-wrap">
                <svg viewBox="0 0 300 300" className="welcome-heart">
                  <defs>
                    <linearGradient
                      id="welcome-heart-gradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0" stopColor="#ffe3a8" />
                      <stop offset="1" stopColor="#d99a46" />
                    </linearGradient>
                    <clipPath id="welcome-heart-clip">
                      <rect
                        className="welcome-heart-level"
                        x="0"
                        y="0"
                        width="300"
                        height="300"
                      />
                    </clipPath>
                  </defs>
                  <path
                    className="welcome-heart-fill"
                    clipPath="url(#welcome-heart-clip)"
                    fill="url(#welcome-heart-gradient)"
                    d="M150 262 C60 200 28 150 28 105 C28 64 60 38 96 38 C122 38 142 52 150 72 C158 52 178 38 204 38 C240 38 272 64 272 105 C272 150 240 200 150 262 Z"
                  />
                  <path
                    className="welcome-heart-line"
                    pathLength={1}
                    d="M150 262 C60 200 28 150 28 105 C28 64 60 38 96 38 C122 38 142 52 150 72 C158 52 178 38 204 38 C240 38 272 64 272 105 C272 150 240 200 150 262 Z"
                  />
                </svg>
              </div>
              <p className="welcome-thanks">Thank you for giving</p>
            </div>
          </div>
        </div>

        <div className="welcome-content">
          <div className="welcome-top">
            <div className="welcome-emblem">
              <DynamicImage
                slotKey="site-logo"
                alt="Jagannath Foundation emblem"
              />
            </div>
            <p className="welcome-kicker">A charitable trust · Odisha, India</p>
          </div>
          <h1 id="welcome-heading">
            <span className="welcome-heading-line">Welcome to</span>
            <span className="welcome-heading-line welcome-foundation-name">
              Jagannath Foundation
            </span>
          </h1>
          <p className="welcome-intro-copy">
            Helping hands. Positive living.
            <br />
            Every gift, big or small, plants a seed of dignity.
          </p>

          <div className="welcome-actions">
            <button
              className="welcome-donate"
              type="button"
              onClick={() => dismiss("/donate")}
            >
              <span aria-hidden="true">♥</span> Donate Now
            </button>
            <button
              className="welcome-enter"
              type="button"
              onClick={() => dismiss()}
              autoFocus
            >
              Enter the website <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="welcome-stats">
            <p className="welcome-stats-title">Why your gift matters</p>
            <div className="welcome-stats-row">
              {stats.map((s, i) => (
                <div key={s.label} className="welcome-stat">
                  <strong data-stat={i}>
                    {format(s.value, s.decimals) + s.suffix}
                  </strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="welcome-trust">
            Provisional registration u/s 12A &amp; 80G · Odisha, India
          </p>
        </div>
      </div>

      <div className="welcome-progress" aria-hidden="true">
        <span className="welcome-progress-fill" />
      </div>
    </section>
  );
}
