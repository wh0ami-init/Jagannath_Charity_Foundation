import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "wouter";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import "./campaigns.css";
import "./available-internships.css";

gsap.registerPlugin(useGSAP);

type Internship = { title: string; category: string; type: string };
const internships: Internship[] = [];
const internshipCategories = ["All Categories", "Education", "Community Development", "Healthcare", "Environment"];
const internshipTypes = ["All Types", "On-site", "Remote", "Hybrid"];
const internshipStats = [
  { value: "0+", label: "Open positions" },
  { value: "0+", label: "Applications" },
  { value: "0+", label: "Certificates issued" },
];

export default function AvailableInternships() {
  const [pageReady, setPageReady] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const noticeCloseRef = useRef<HTMLButtonElement>(null);
  const pageMotionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const visibleInternships = internships.filter((internship) => (
    internship.title.toLowerCase().includes(search.trim().toLowerCase())
    && (category === "all" || internship.category === category)
    && (type === "all" || internship.type === type)
  ));

  useGSAP(() => {
    const page = pageMotionRef.current;
    if (!page || reducedMotion) return;
    const greenGlow = page.querySelector(".internships-filter-glow--green");
    const goldGlow = page.querySelector(".internships-filter-glow--gold");
    const emptyGreenGlow = page.querySelector(".internships-empty-glow--green");
    const emptyGoldGlow = page.querySelector(".internships-empty-glow--gold");
    const emptyIcon = page.querySelector(".internships-empty-icon");
    gsap.to(greenGlow, { x: 24, y: -14, scale: 1.13, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(goldGlow, { x: -21, y: 14, scale: 1.15, duration: 11, delay: .6, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(emptyGreenGlow, { x: -18, y: 12, scale: 1.16, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(emptyGoldGlow, { x: 20, y: -12, scale: 1.12, duration: 12, delay: .8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.fromTo(emptyIcon, { autoAlpha: 0, y: 10, scale: .9 }, { autoAlpha: 1, y: 0, scale: 1, duration: .65, ease: "back.out(1.5)" });
    gsap.to(emptyIcon, { y: -5, duration: 2.8, delay: .7, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, { scope: pageMotionRef, dependencies: [reducedMotion], revertOnUpdate: true });

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
      const controls = document.querySelectorAll<HTMLElement>(".internships-coming-modal button:not(:disabled), .internships-coming-modal a[href]");
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
      else headingRef.current?.focus();
    };
  }, [noticeOpen]);

  useGSAP(() => {
    const art = artRef.current;
    if (!art || !noticeOpen) return;
    const paths = art.querySelectorAll<SVGPathElement>(".intern-art-draw");
    const cap = art.querySelector<SVGPathElement>(".intern-art-cap");
    const orbit = art.querySelector<SVGGElement>(".intern-art-orbit-spin");
    const sparks = art.querySelectorAll<SVGCircleElement>(".intern-art-spark");
    if (reducedMotion) {
      paths.forEach((path) => gsap.set(path, { strokeDashoffset: 0 }));
      gsap.set(cap, { scale: 1, autoAlpha: 1 });
      gsap.set(sparks, { autoAlpha: 1, scale: 1 });
      return;
    }
    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });
    gsap.set(cap, { scale: .7, autoAlpha: 0, transformOrigin: "50% 50%" });
    gsap.set(sparks, { autoAlpha: 0, scale: .4, transformOrigin: "50% 50%" });
    const drawing = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });
    drawing.to(paths, { strokeDashoffset: 0, duration: 1.2, stagger: .1, ease: "power2.inOut" });
    drawing.to(cap, { scale: 1, autoAlpha: 1, duration: .5, ease: "back.out(1.7)" }, "-=.25");
    drawing.to(sparks, { autoAlpha: 1, scale: 1, duration: .4, stagger: .08, ease: "back.out(1.8)" }, "-=.2");
    gsap.to(orbit, { rotation: 360, duration: 32, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
  }, { scope: artRef, dependencies: [noticeOpen, reducedMotion], revertOnUpdate: true });

  return (
    <Layout>
      <div
        className="available-internships-page"
        ref={pageMotionRef}
        onClickCapture={(event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement) || target.closest(".internships-coming-modal")) return;
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
          motif="internships"
          eyebrow="Internship Opportunities"
          title={<>Build Your <span className="internship-title-accent">Career</span> With Us</>}
          description={<>Gain real-world experience, earn certificates, and make a difference.<br />Apply for internship opportunities at our NGO.</>}
          facts={internshipStats}
        />

        <section className="internships-content" aria-label="Find internship opportunities">
          <div className="internships-wrap">
            <Reveal className="internships-filters" aria-label="Search and filter internships">
              <div className="internships-filter-atmosphere" aria-hidden="true">
                <span className="internships-filter-glow internships-filter-glow--green" />
                <span className="internships-filter-glow internships-filter-glow--gold" />
              </div>
              <label className="internships-field internships-search">
                <span><i aria-hidden="true">⌕</i> Search</span>
                <div className="internships-input-wrap">
                  <i aria-hidden="true">⌕</i>
                  <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search internships…" aria-disabled="true" readOnly />
                </div>
              </label>
              <label className="internships-field">
                <span><i aria-hidden="true">◆</i> Category</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)} aria-disabled="true">
                  {internshipCategories.map((item, index) => <option key={item} value={index === 0 ? "all" : item}>{item}</option>)}
                </select>
              </label>
              <label className="internships-field">
                <span><i aria-hidden="true">▱</i> Type</span>
                <select value={type} onChange={(event) => setType(event.target.value)} aria-disabled="true">
                  {internshipTypes.map((item, index) => <option key={item} value={index === 0 ? "all" : item}>{item}</option>)}
                </select>
              </label>
            </Reveal>

            <section className="internships-results" aria-labelledby="available-internships-heading" aria-live="polite">
              <div className="internships-results-heading">
                <div className="internships-heading-title">
                  <span aria-hidden="true">◆</span>
                  <h2 id="available-internships-heading" ref={headingRef} tabIndex={-1}>Available Internships</h2>
                  <span className="internships-heading-rule" />
                </div>
                <span className="internships-count"><i aria-hidden="true">▰</i> {visibleInternships.length} {visibleInternships.length === 1 ? "Internship" : "Internships"}</span>
              </div>

              {visibleInternships.length ? (
                <div className="internships-list">
                  {visibleInternships.map((internship) => (
                    <article className="internship-card" key={internship.title}>
                      <span>{internship.category} · {internship.type}</span>
                      <h3>{internship.title}</h3>
                      <button type="button" aria-disabled="true">Apply now <span aria-hidden="true">↗</span></button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="internships-empty">
                  <div className="internships-empty-atmosphere" aria-hidden="true">
                    <span className="internships-empty-glow internships-empty-glow--green" />
                    <span className="internships-empty-glow internships-empty-glow--gold" />
                  </div>
                  <span className="internships-empty-icon" aria-hidden="true">
                    <svg viewBox="0 0 64 64" fill="none"><path d="m4 24 28-12 28 12-28 12L4 24Z" /><path d="M15 30v13c9 8 27 8 36 0V30M59 25v17" /><circle cx="59" cy="45" r="3" /></svg>
                  </span>
                  <h3>{pageReady ? "No Internships Available" : "Preparing internship opportunities"}</h3>
                  <p>{pageReady ? "Check back soon for new opportunities." : "Getting the latest internship information ready…"}</p>
                  <div className={`campaign-loading-track${pageReady ? " is-complete" : ""}`} aria-hidden="true"><span /></div>
                </div>
              )}
            </section>
          </div>
        </section>

        <AnimatePresence>
          {noticeOpen && (
            <motion.div className="campaign-coming-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setNoticeOpen(false); }} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .28 }}>
              <motion.section className="campaign-coming-modal internships-coming-modal" role="dialog" aria-modal="true" aria-labelledby="internships-coming-title" initial={reducedMotion ? false : { opacity: 0, y: 24, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} transition={{ duration: reducedMotion ? 0 : .48, ease: [.22, .7, .2, 1] }}>
                <button ref={noticeCloseRef} className="campaign-modal-close" type="button" aria-label="Close internship announcement" onClick={() => setNoticeOpen(false)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
                </button>
                <div className="campaign-modal-art internships-modal-art" ref={artRef} aria-hidden="true">
                  <svg viewBox="0 0 360 380" fill="none">
                    <circle className="campaign-art-halo" cx="180" cy="177" r="128" />
                    <g className="intern-art-orbit-spin"><circle className="campaign-art-orbit" cx="180" cy="177" r="146" /><circle className="intern-art-spark" cx="180" cy="31" r="5" /><circle className="intern-art-spark" cx="326" cy="177" r="4" /></g>
                    <circle className="intern-art-spark" cx="75" cy="90" r="4" /><circle className="intern-art-spark" cx="285" cy="78" r="6" />
                    <path className="intern-art-draw" d="M94 192 180 155l86 37-86 38-86-38ZM117 204v48c37 26 89 26 126 0v-48M266 196v57" />
                    <path className="intern-art-cap" d="m180 139 21 38 43 7-32 30 8 42-40-21-39 21 7-42-31-30 43-7 20-38Z" />
                    <path className="intern-art-draw intern-art-ground" d="M95 309c25-15 52-22 80-22 30 0 57 8 82 23" />
                  </svg>
                  <span>Learn, contribute, grow</span>
                </div>
                <div className="campaign-modal-content">
                  <p className="campaign-modal-eyebrow">Your next opportunity is taking shape</p>
                  <h2 id="internships-coming-title">Internship applications are coming soon.</h2>
                  <p className="campaign-modal-copy">We’re preparing meaningful opportunities to learn, contribute, and earn a certificate through work with the Foundation.</p>
                  <div className="campaign-modal-actions">
                    <Link href="/contact" className="campaign-modal-contact" onClick={() => setNoticeOpen(false)}>Contact the Foundation <span aria-hidden="true">↗</span></Link>
                    <button className="campaign-modal-dismiss" type="button" onClick={() => setNoticeOpen(false)}>Maybe later</button>
                  </div>
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
