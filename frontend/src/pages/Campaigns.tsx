import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "wouter";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import "./campaigns.css";

gsap.registerPlugin(useGSAP);

const campaignStats = [
  { value: "0+", label: "Active campaigns" },
  { value: "0+", label: "Total donors" },
  { value: "₹0K+", label: "Raised" },
];

export default function Campaigns() {
  const [pageReady, setPageReady] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const noticeCloseRef = useRef<HTMLButtonElement>(null);
  const featuredHeadingRef = useRef<HTMLHeadingElement>(null);
  const campaignArtRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPageReady(true);
      setNoticeOpen(true);
    }, 4000);
    return () => window.clearTimeout(timeout);
  }, [reducedMotion]);

  useEffect(() => {
    if (!noticeOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    document.body.style.overflow = "hidden";
    noticeCloseRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNoticeOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const controls = document.querySelectorAll<HTMLElement>(
        ".campaign-coming-modal button:not(:disabled), .campaign-coming-modal a[href]",
      );
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      if (previousFocus && previousFocus !== document.body) previousFocus.focus();
      else featuredHeadingRef.current?.focus();
    };
  }, [noticeOpen]);

  useGSAP(() => {
    const art = campaignArtRef.current;
    if (!art || !noticeOpen) return;

    const paths = art.querySelectorAll<SVGPathElement>(".campaign-art-draw");
    const heart = art.querySelector<SVGPathElement>(".campaign-art-heart");
    const orbit = art.querySelector<SVGGElement>(".campaign-art-orbit-spin");
    const sparks = art.querySelectorAll<SVGCircleElement>(".campaign-art-spark");

    if (reducedMotion) {
      paths.forEach((path) => gsap.set(path, { strokeDashoffset: 0 }));
      gsap.set(heart, { scale: 1, autoAlpha: 1 });
      gsap.set(sparks, { autoAlpha: 1, scale: 1 });
      return;
    }

    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });
    gsap.set(heart, { scale: .78, autoAlpha: 0, transformOrigin: "50% 50%" });
    gsap.set(sparks, { autoAlpha: 0, scale: .45, transformOrigin: "50% 50%" });

    const drawing = gsap.timeline({ repeat: -1, repeatDelay: 2.6 });
    drawing.to(paths, {
      strokeDashoffset: 0,
      duration: 1.35,
      stagger: .12,
      ease: "power2.inOut",
    });
    drawing.to(heart, {
      scale: 1,
      autoAlpha: 1,
      duration: .55,
      ease: "back.out(1.7)",
    }, "-=.25");
    drawing.to(sparks, {
      autoAlpha: 1,
      scale: 1,
      duration: .4,
      stagger: .08,
      ease: "back.out(1.8)",
    }, "-=.3");

    gsap.to(orbit, {
      rotation: 360,
      duration: 32,
      repeat: -1,
      ease: "none",
      transformOrigin: "50% 50%",
    });
  }, { scope: campaignArtRef, dependencies: [noticeOpen, reducedMotion], revertOnUpdate: true });

  return (
    <Layout>
      <main
        className="campaigns-page"
        onClickCapture={(event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement) || target.closest(".campaign-coming-modal")) return;
          if (target.closest("button, a, input, select, [role='button']")) {
            event.preventDefault();
            setPageReady(true);
            setNoticeOpen(true);
          }
        }}
        onKeyDownCapture={(event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement) || !target.closest("[aria-disabled='true']")) return;
          if (!["Enter", " ", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
          event.preventDefault();
          setPageReady(true);
          setNoticeOpen(true);
        }}
      >
        <PageHero
          theme="work"
          motif="campaigns"
          eyebrow="Campaigns"
          title="Every donation counts towards a better tomorrow."
          description="When a community comes together, small acts can create lasting change."
          facts={campaignStats}
          actions={
            <button className="pagehero-button" type="button">
              Explore campaign support <span aria-hidden="true">↗</span>
            </button>
          }
        />

        <div className="wrap campaigns-content">
          <Reveal className="campaign-filter-panel" aria-label="Campaign filters">
            <label className="campaign-filter-field">
              <span><i aria-hidden="true">⌕</i> Search campaigns</span>
              <input type="search" placeholder="Search campaigns…" aria-disabled="true" readOnly />
            </label>
            <label className="campaign-filter-field">
              <span><i aria-hidden="true">◆</i> Category</span>
              <select defaultValue="all" aria-disabled="true">
                <option value="all">All categories</option>
              </select>
            </label>
            <label className="campaign-filter-field">
              <span><i aria-hidden="true">▼</i> Status</span>
              <select defaultValue="all" aria-disabled="true">
                <option value="all">All statuses</option>
              </select>
            </label>
            <div className="campaign-goal-filter">
              <span>₹ Goal amount: <strong>₹20,30,000</strong></span>
              <input type="range" min="0" max="1000000" defaultValue="20000" aria-label="Minimum campaign goal amount" aria-disabled="true" />
              <span>₹1,00,00,000</span>
              <span className="campaign-count"><i aria-hidden="true">▰</i> Showing 0 campaigns</span>
            </div>
          </Reveal>

          <section className="campaign-featured" aria-labelledby="campaign-featured-title">
            <div className="campaign-section-heading">
              <span className="campaign-heading-icon" aria-hidden="true">↗</span>
              <h2 id="campaign-featured-title" ref={featuredHeadingRef} tabIndex={-1}>Featured campaigns</h2>
              <span className="campaign-heading-rule" />
            </div>

            <div className="campaign-empty-state" aria-live="polite">
              <span className="campaign-search-mark" aria-hidden="true">
                <svg viewBox="0 0 56 56" fill="none">
                  <circle cx="23" cy="23" r="14" />
                  <path d="m34 34 13 13" />
                </svg>
              </span>
              <h3>{pageReady ? "No campaigns found" : "Preparing our campaign space"}</h3>
              <p>{pageReady ? "Check back soon for ways to get involved." : "Getting the latest campaign information ready…"}</p>
              <div className={`campaign-loading-track${pageReady ? " is-complete" : ""}`} aria-hidden="true">
                <span />
              </div>
            </div>
          </section>
        </div>

        <AnimatePresence>
          {noticeOpen && (
            <motion.div
              className="campaign-coming-overlay"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setNoticeOpen(false);
              }}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : .28 }}
            >
              <motion.section
                className="campaign-coming-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="campaign-coming-title"
                initial={reducedMotion ? false : { opacity: 0, y: 24, scale: .96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: .98 }}
                transition={{ duration: reducedMotion ? 0 : .48, ease: [.22, .7, .2, 1] }}
              >
                <button
                  ref={noticeCloseRef}
                  className="campaign-modal-close"
                  type="button"
                  aria-label="Close campaigns announcement"
                  onClick={() => setNoticeOpen(false)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
                <div className="campaign-modal-art" ref={campaignArtRef} aria-hidden="true">
                  <svg viewBox="0 0 360 380" fill="none">
                    <circle className="campaign-art-halo" cx="180" cy="177" r="128" />
                    <g className="campaign-art-orbit-spin">
                      <circle className="campaign-art-orbit" cx="180" cy="177" r="146" />
                      <circle className="campaign-art-spark" cx="180" cy="30" r="5" />
                      <circle className="campaign-art-spark" cx="326" cy="177" r="4" />
                    </g>
                    <circle className="campaign-art-spark" cx="74" cy="91" r="4" />
                    <circle className="campaign-art-spark" cx="285" cy="79" r="6" />
                    <circle className="campaign-art-spark" cx="85" cy="286" r="5" />
                    <path className="campaign-art-draw campaign-art-hands" d="M63 235c26-12 47-17 67-14 14 2 26 11 38 20l23 17c11 8 13 20 6 28-7 9-19 10-29 3l-30-20m159-34c-26-12-47-17-67-14-14 2-26 11-38 20l-20 15c-11 8-13 20-6 28 7 9 19 10 29 3l27-18M63 235l-15 25m229-25 15 25M70 247l-14 25m216-25 14 25" />
                    <path className="campaign-art-heart" d="M180 211s-63-37-63-79c0-34 43-47 63-13 20-34 63-21 63 13 0 42-63 79-63 79Z" />
                    <path className="campaign-art-draw campaign-art-ground" d="M94 309c24-15 49-22 75-22 30 0 58 8 83 23" />
                  </svg>
                  <span>Care, shared forward</span>
                </div>
                <div className="campaign-modal-content">
                  <p className="campaign-modal-eyebrow">A new way to make a difference</p>
                  <h2 id="campaign-coming-title">Our campaigns are coming soon.</h2>
                  <p className="campaign-modal-copy">We’re preparing meaningful ways for you to support our communities. Please check back soon.</p>
                  <div className="campaign-modal-actions">
                    <Link href="/contact" className="campaign-modal-contact" onClick={() => setNoticeOpen(false)}>
                      Contact the Foundation <span aria-hidden="true">↗</span>
                    </Link>
                    <button className="campaign-modal-dismiss" type="button" onClick={() => setNoticeOpen(false)}>
                      Maybe later
                    </button>
                  </div>
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}
