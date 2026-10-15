import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Link } from "wouter";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Layout from "../components/Layout";
import GsapDialog from "../components/GsapDialog";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import "./campaigns.css";
import "./careers.css";

gsap.registerPlugin(useGSAP);

type FoundationPosition = {
  title: string;
  type: string;
};

const foundationPositions: FoundationPosition[] = [];
const positionTypes = ["All Types", "Full Time", "Internship", "Remote", "On-site", "Work From Home"];

export default function Careers() {
  const [pageReady, setPageReady] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("all");
  const noticeCloseRef = useRef<HTMLButtonElement>(null);
  const positionsHeadingRef = useRef<HTMLHeadingElement>(null);
  const careerArtRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const visiblePositions = foundationPositions.filter((position) => {
    const matchesSearch = position.title.toLowerCase().includes(search.trim().toLowerCase());
    const matchesType = jobType === "all" || position.type === jobType;
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPageReady(true);
      setNoticeOpen(true);
    }, 4000);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!noticeOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    noticeCloseRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNoticeOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const controls = document.querySelectorAll<HTMLElement>(
        ".careers-coming-modal button:not(:disabled), .careers-coming-modal a[href]",
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
      else positionsHeadingRef.current?.focus();
    };
  }, [noticeOpen]);

  useGSAP(() => {
    const art = careerArtRef.current;
    if (!art || !noticeOpen) return;
    const paths = art.querySelectorAll<SVGPathElement>(".careers-art-draw");
    const star = art.querySelector<SVGPathElement>(".careers-art-star");
    const orbit = art.querySelector<SVGGElement>(".careers-art-orbit-spin");
    const sparks = art.querySelectorAll<SVGCircleElement>(".careers-art-spark");

    if (reducedMotion) {
      paths.forEach((path) => gsap.set(path, { strokeDashoffset: 0 }));
      gsap.set(star, { scale: 1, autoAlpha: 1 });
      gsap.set(sparks, { autoAlpha: 1, scale: 1 });
      return;
    }

    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });
    gsap.set(star, { scale: .68, autoAlpha: 0, transformOrigin: "50% 50%" });
    gsap.set(sparks, { autoAlpha: 0, scale: .4, transformOrigin: "50% 50%" });

    const drawing = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });
    drawing.to(paths, { strokeDashoffset: 0, duration: 1.25, stagger: .1, ease: "power2.inOut" });
    drawing.to(star, { scale: 1, autoAlpha: 1, duration: .5, ease: "back.out(1.7)" }, "-=.3");
    drawing.to(sparks, { autoAlpha: 1, scale: 1, duration: .4, stagger: .08, ease: "back.out(1.8)" }, "-=.25");
    gsap.to(orbit, { rotation: 360, duration: 32, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
  }, { scope: careerArtRef, dependencies: [noticeOpen, reducedMotion], revertOnUpdate: true });

  return (
    <Layout>
      <div
        className="careers-page"
        onClickCapture={(event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement) || target.closest(".careers-coming-modal")) return;
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
          motif="careers"
          eyebrow="Career Opportunities"
          title="Join our team."
          description="Explore open positions and be part of our mission to create positive change."
          facts={[{ value: "0", label: "Open positions" }]}
        />

        <section className="careers-content" aria-label="Find open positions">
          <div className="careers-wrap">
            <Reveal className="careers-filters" aria-label="Search and filter positions">
              <label className="careers-field careers-search">
                <span><i aria-hidden="true">⌕</i> Search</span>
                <div className="careers-input-wrap">
                  <i aria-hidden="true">⌕</i>
                  <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Job title…" aria-disabled="true" readOnly />
                </div>
              </label>
              <label className="careers-field">
                <span><i aria-hidden="true">▼</i> Job type</span>
                <select value={jobType} onChange={(event) => setJobType(event.target.value)} aria-disabled="true">
                  {positionTypes.map((type, index) => <option key={type} value={index === 0 ? "all" : type}>{type}</option>)}
                </select>
              </label>
              <button
                className="careers-clear"
                type="button"
                onClick={() => {
                  setSearch("");
                  setJobType("all");
                }}
              >
                <span aria-hidden="true">×</span> Clear
              </button>
            </Reveal>

            <section className="careers-results" aria-labelledby="available-positions-heading" aria-live="polite">
              <div className="careers-results-heading">
                <div>
                  <h2 id="available-positions-heading" ref={positionsHeadingRef} tabIndex={-1}>Available Positions</h2>
                  <span className="careers-heading-rule" />
                </div>
                <span className="careers-count"><i aria-hidden="true">▣</i> {visiblePositions.length} {visiblePositions.length === 1 ? "Job" : "Jobs"}</span>
              </div>

              {visiblePositions.length ? (
                <div className="careers-list">
                  {visiblePositions.map((position) => (
                    <article className="career-card" key={position.title}>
                      <span>{position.type}</span>
                      <h3>{position.title}</h3>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="careers-empty">
                  <span className="careers-empty-icon" aria-hidden="true">
                    <svg viewBox="0 0 56 56" fill="none">
                      <path d="M8 19h40v29H8zM20 19v-7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7M8 28h40M24 28v6h8v-6" />
                    </svg>
                  </span>
                  <h3>{pageReady ? "No Jobs Found" : "Preparing career opportunities"}</h3>
                  <p>{pageReady ? "No positions match your search. Please check back soon." : "Getting the latest position information ready…"}</p>
                  <div className={`campaign-loading-track${pageReady ? " is-complete" : ""}`} aria-hidden="true"><span /></div>
                </div>
              )}
            </section>
          </div>
        </section>

        <GsapDialog
          open={noticeOpen}
          className="campaign-coming-overlay"
          dialogClassName="campaign-coming-modal careers-coming-modal"
          labelledBy="careers-coming-title"
          reducedMotion={Boolean(reducedMotion)}
          onBackdrop={(event) => { if (event.target === event.currentTarget) setNoticeOpen(false); }}
        >
                <button ref={noticeCloseRef} className="campaign-modal-close" type="button" aria-label="Close careers announcement" onClick={() => setNoticeOpen(false)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
                </button>
                <div className="campaign-modal-art careers-modal-art" ref={careerArtRef} aria-hidden="true">
                  <svg viewBox="0 0 360 380" fill="none">
                    <circle className="campaign-art-halo" cx="180" cy="177" r="128" />
                    <g className="careers-art-orbit-spin">
                      <circle className="campaign-art-orbit" cx="180" cy="177" r="146" />
                      <circle className="careers-art-spark" cx="180" cy="31" r="5" />
                      <circle className="careers-art-spark" cx="326" cy="177" r="4" />
                    </g>
                    <circle className="careers-art-spark" cx="75" cy="90" r="4" />
                    <circle className="careers-art-spark" cx="285" cy="78" r="6" />
                    <path className="careers-art-draw" d="M89 184h182v111H89zM112 184v-22h54v22m28 0v-22h54v22M89 222h182M119 250h48m22 0h52" />
                    <circle className="careers-art-draw careers-art-person" cx="151" cy="130" r="20" />
                    <path className="careers-art-draw" d="M112 177c3-26 18-39 39-39s36 13 39 39" />
                    <path className="careers-art-star" d="m226 104 8 17 19 3-14 13 3 19-16-9-17 9 4-19-14-13 19-3 8-17Z" />
                    <path className="careers-art-draw careers-art-ground" d="M93 316c25-15 52-22 80-22 30 0 57 8 82 23" />
                  </svg>
                  <span>Good work starts together</span>
                </div>
                <div className="campaign-modal-content">
                  <p className="campaign-modal-eyebrow">Build something meaningful with us</p>
                  <h2 id="careers-coming-title">Career opportunities are coming soon.</h2>
                  <p className="campaign-modal-copy">We’re preparing a place to share future roles with people who want to create positive change alongside our communities.</p>
                  <div className="campaign-modal-actions">
                    <Link href="/contact" className="campaign-modal-contact" onClick={() => setNoticeOpen(false)}>Contact the Foundation <span aria-hidden="true">↗</span></Link>
                    <button className="campaign-modal-dismiss" type="button" onClick={() => setNoticeOpen(false)}>Maybe later</button>
                  </div>
                </div>
        </GsapDialog>
      </div>
    </Layout>
  );
}
