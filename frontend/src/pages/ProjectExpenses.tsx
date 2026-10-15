import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "wouter";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import "./campaigns.css";
import "./project-expenses.css";

gsap.registerPlugin(useGSAP);

type FoundationProject = {
  name: string;
  category: string;
  status: "active" | "completed";
  goal: number;
  spent: number;
};

const foundationProjects: FoundationProject[] = [];

const projectStats = [
  { value: "0", label: "Total projects" },
  { value: "₹0K", label: "Total goal" },
  { value: "₹0K", label: "Amount spent" },
  { value: "0", label: "Completed" },
];

export default function ProjectExpenses() {
  const [pageReady, setPageReady] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const noticeCloseRef = useRef<HTMLButtonElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const projectArtRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const visibleProjects = foundationProjects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesCategory = category === "all" || project.category === category;
    const matchesStatus = status === "all" || project.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
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
        ".expenses-coming-modal button:not(:disabled), .expenses-coming-modal a[href]",
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
      else resultsHeadingRef.current?.focus();
    };
  }, [noticeOpen]);

  useGSAP(() => {
    const art = projectArtRef.current;
    if (!art || !noticeOpen) return;
    const paths = art.querySelectorAll<SVGPathElement>(".expenses-art-draw");
    const rupee = art.querySelector<SVGTextElement>(".expenses-art-rupee");
    const orbit = art.querySelector<SVGGElement>(".expenses-art-orbit-spin");
    const sparks = art.querySelectorAll<SVGCircleElement>(".expenses-art-spark");

    if (reducedMotion) {
      paths.forEach((path) => gsap.set(path, { strokeDashoffset: 0 }));
      gsap.set(rupee, { scale: 1, autoAlpha: 1 });
      gsap.set(sparks, { autoAlpha: 1, scale: 1 });
      return;
    }

    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });
    gsap.set(rupee, { scale: .7, autoAlpha: 0, transformOrigin: "50% 50%" });
    gsap.set(sparks, { autoAlpha: 0, scale: .4, transformOrigin: "50% 50%" });

    const drawing = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });
    drawing.to(paths, { strokeDashoffset: 0, duration: 1.25, stagger: .1, ease: "power2.inOut" });
    drawing.to(rupee, { scale: 1, autoAlpha: 1, duration: .5, ease: "back.out(1.7)" }, "-=.3");
    drawing.to(sparks, { autoAlpha: 1, scale: 1, duration: .4, stagger: .08, ease: "back.out(1.8)" }, "-=.25");
    gsap.to(orbit, { rotation: 360, duration: 32, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
  }, { scope: projectArtRef, dependencies: [noticeOpen, reducedMotion], revertOnUpdate: true });

  return (
    <Layout>
      <div
        className="project-expenses-page"
        onClickCapture={(event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement) || target.closest(".expenses-coming-modal")) return;
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
          motif="expenses"
          eyebrow="Project Expenses"
          title="See exactly where your donations go."
          description="Every rupee tracked, every project transparent."
          actions={<button className="pagehero-button" type="button">Explore project updates <span aria-hidden="true">↗</span></button>}
        />

        <section className="project-expenses-content" aria-label="Search Foundation projects">
          <div className="project-expenses-wrap">
            <Reveal className="project-expenses-filters" aria-label="Search and filter projects">
              <label className="project-expenses-field project-expenses-search">
                <span><i aria-hidden="true">⌕</i> Search projects</span>
                <div className="project-expenses-input-wrap">
                  <i aria-hidden="true">⌕</i>
                  <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by project name or location…" aria-disabled="true" readOnly />
                </div>
              </label>
              <label className="project-expenses-field">
                <span><i aria-hidden="true">◆</i> Category</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)} aria-disabled="true">
                  <option value="all">All categories</option>
                </select>
              </label>
              <fieldset className="project-expenses-status">
                <legend><i aria-hidden="true">●</i> Status</legend>
                {[["all", "All"], ["active", "Active"], ["completed", "Completed"]].map(([value, label]) => (
                  <button key={value} type="button" className={status === value ? "is-selected" : ""} aria-pressed={status === value} aria-disabled="true" onClick={() => setStatus(value)}>
                    {value !== "all" && <i className={`project-status-dot project-status-dot--${value}`} aria-hidden="true" />}{label}
                  </button>
                ))}
              </fieldset>
            </Reveal>

            <Reveal className="project-expenses-stats" aria-label="Project totals">
              {projectStats.map((stat) => (
                <div className="project-expenses-stat" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </Reveal>

            <section className="project-expenses-results" aria-labelledby="all-projects-heading" aria-live="polite">
              <div className="project-expenses-results-heading">
                <div>
                  <h2 id="all-projects-heading" ref={resultsHeadingRef} tabIndex={-1}>All Projects</h2>
                  <span className="project-expenses-heading-rule" />
                </div>
                <span className="project-expenses-count"><i aria-hidden="true">▰</i> {visibleProjects.length} {visibleProjects.length === 1 ? "Project" : "Projects"}</span>
              </div>

              {visibleProjects.length ? (
                <div className="project-expenses-list">
                  {visibleProjects.map((project) => (
                    <article className="project-expense-card" key={project.name}>
                      <span>{project.category}</span>
                      <h3>{project.name}</h3>
                      <p>Goal ₹{project.goal.toLocaleString("en-IN")} · Spent ₹{project.spent.toLocaleString("en-IN")}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="project-expenses-empty">
                  <span className="project-expenses-empty-icon" aria-hidden="true">
                    <svg viewBox="0 0 56 56" fill="none">
                      <path d="M15 14h10v10H15zM31 14h10v10H31zM23 32h10v10H23zM20 24l7 8m6-8-5 8m5-13h-2" />
                    </svg>
                  </span>
                  <h3>{pageReady ? "No Projects Found" : "Preparing project updates"}</h3>
                  <p>{pageReady ? "No projects match your search. Try a different filter." : "Getting the latest project information ready…"}</p>
                  <div className={`campaign-loading-track${pageReady ? " is-complete" : ""}`} aria-hidden="true"><span /></div>
                </div>
              )}
            </section>
          </div>
        </section>

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
                className="campaign-coming-modal expenses-coming-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="expenses-coming-title"
                initial={reducedMotion ? false : { opacity: 0, y: 24, scale: .96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: .98 }}
                transition={{ duration: reducedMotion ? 0 : .48, ease: [.22, .7, .2, 1] }}
              >
                <button ref={noticeCloseRef} className="campaign-modal-close" type="button" aria-label="Close project expenses announcement" onClick={() => setNoticeOpen(false)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
                </button>
                <div className="campaign-modal-art expenses-modal-art" ref={projectArtRef} aria-hidden="true">
                  <svg viewBox="0 0 360 380" fill="none">
                    <circle className="campaign-art-halo" cx="180" cy="177" r="128" />
                    <g className="expenses-art-orbit-spin">
                      <circle className="campaign-art-orbit" cx="180" cy="177" r="146" />
                      <circle className="expenses-art-spark" cx="180" cy="31" r="5" />
                      <circle className="expenses-art-spark" cx="326" cy="177" r="4" />
                    </g>
                    <circle className="expenses-art-spark" cx="75" cy="90" r="4" />
                    <circle className="expenses-art-spark" cx="285" cy="78" r="6" />
                    <path className="expenses-art-draw" d="M105 104h114l39 39v154H105zM219 105v39h39M132 173h95M132 202h95M132 231h42" />
                    <path className="expenses-art-draw expenses-art-bars" d="M142 268v-18h19v18m12 0v-32h19v32m12 0v-48h19v48" />
                    <text className="expenses-art-rupee" x="236" y="229" textAnchor="middle">₹</text>
                    <path className="expenses-art-draw expenses-art-ground" d="M94 309c24-15 49-22 75-22 30 0 58 8 83 23" />
                  </svg>
                  <span>Every rupee, accounted for</span>
                </div>
                <div className="campaign-modal-content">
                  <p className="campaign-modal-eyebrow">Clarity behind every contribution</p>
                  <h2 id="expenses-coming-title">Project updates are coming soon.</h2>
                  <p className="campaign-modal-copy">We’re preparing clear, project-by-project updates on goals, spending, and progress. Please check back soon.</p>
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
