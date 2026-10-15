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
import "./programs-and-events.css";

gsap.registerPlugin(useGSAP);

type FoundationEvent = {
  title: string;
  date: string;
};

const foundationEvents: FoundationEvent[] = [];

export default function ProgramsAndEvents() {
  const [pageReady, setPageReady] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const noticeCloseRef = useRef<HTMLButtonElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const eventArtRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const visibleEvents = foundationEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(search.trim().toLowerCase());
    const matchesFrom = !fromDate || event.date >= fromDate;
    const matchesTo = !toDate || event.date <= toDate;
    return matchesSearch && matchesFrom && matchesTo;
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
        ".events-coming-modal button:not(:disabled), .events-coming-modal a[href]",
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
    const art = eventArtRef.current;
    if (!art || !noticeOpen) return;

    const paths = art.querySelectorAll<SVGPathElement>(".events-art-draw");
    const star = art.querySelector<SVGPathElement>(".events-art-star");
    const orbit = art.querySelector<SVGGElement>(".events-art-orbit-spin");
    const sparks = art.querySelectorAll<SVGCircleElement>(".events-art-spark");

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
    gsap.set(star, { scale: .7, autoAlpha: 0, transformOrigin: "50% 50%" });
    gsap.set(sparks, { autoAlpha: 0, scale: .4, transformOrigin: "50% 50%" });

    const drawing = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });
    drawing.to(paths, { strokeDashoffset: 0, duration: 1.25, stagger: .1, ease: "power2.inOut" });
    drawing.to(star, { scale: 1, autoAlpha: 1, duration: .5, ease: "back.out(1.7)" }, "-=.3");
    drawing.to(sparks, { autoAlpha: 1, scale: 1, duration: .4, stagger: .08, ease: "back.out(1.8)" }, "-=.25");
    gsap.to(orbit, { rotation: 360, duration: 32, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
  }, { scope: eventArtRef, dependencies: [noticeOpen, reducedMotion], revertOnUpdate: true });

  return (
    <Layout>
      <div
        className="program-events-page"
        onClickCapture={(event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement) || target.closest(".events-coming-modal")) return;
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
          motif="events"
          eyebrow="Programs & Events"
          title="Gather, learn, and grow together."
          description="Join our events and be a part of the change. Register today and make a difference."
          actions={<button className="pagehero-button" type="button">Explore upcoming events <span aria-hidden="true">↗</span></button>}
        />

        <section className="program-events-content" aria-label="Find Foundation events">
          <div className="program-events-wrap">
            <Reveal className="program-events-filters" aria-label="Search and filter events">
              <label className="program-events-field program-events-search">
                <span><i aria-hidden="true">⌕</i> Search events</span>
                <div className="program-events-input-wrap">
                  <i aria-hidden="true">⌕</i>
                  <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by event name…" aria-disabled="true" readOnly />
                </div>
              </label>
              <label className="program-events-field">
                <span><i aria-hidden="true">▦</i> From date</span>
                <input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => setFromDate(event.target.value)} aria-disabled="true" />
              </label>
              <label className="program-events-field">
                <span><i aria-hidden="true">▦</i> To date</span>
                <input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} aria-disabled="true" />
              </label>
            </Reveal>

            <section className="program-events-results" aria-labelledby="upcoming-events-heading" aria-live="polite">
              <div className="program-events-results-heading">
                <div>
                  <h2 id="upcoming-events-heading" ref={resultsHeadingRef} tabIndex={-1}>Upcoming Events</h2>
                  <span className="program-events-heading-rule" />
                </div>
                <span className="program-events-count"><i aria-hidden="true">▰</i> {visibleEvents.length} {visibleEvents.length === 1 ? "Event" : "Events"} Found</span>
              </div>

              {visibleEvents.length ? (
                <div className="program-events-list">
                  {visibleEvents.map((event) => (
                    <article className="program-event-card" key={`${event.title}-${event.date}`}>
                      <time dateTime={event.date}>{new Date(`${event.date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</time>
                      <h3>{event.title}</h3>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="program-events-empty">
                  <span className="program-events-empty-icon" aria-hidden="true">
                    <svg viewBox="0 0 56 56" fill="none">
                      <rect x="6" y="12" width="44" height="38" rx="5" />
                      <path d="M17 6v12M39 6v12M7 23h42M21 33l14 14M35 33 21 47" />
                    </svg>
                  </span>
                  <h3>{pageReady ? "No Events Found" : "Preparing our events calendar"}</h3>
                  <p>{pageReady ? "There are no upcoming events at the moment. Please check back later." : "Getting the latest Foundation event information ready…"}</p>
                  <div className={`campaign-loading-track${pageReady ? " is-complete" : ""}`} aria-hidden="true"><span /></div>
                </div>
              )}
            </section>
          </div>
        </section>

        <GsapDialog
          open={noticeOpen}
          className="campaign-coming-overlay"
          dialogClassName="campaign-coming-modal events-coming-modal"
          labelledBy="events-coming-title"
          reducedMotion={Boolean(reducedMotion)}
          onBackdrop={(event) => { if (event.target === event.currentTarget) setNoticeOpen(false); }}
        >
                <button ref={noticeCloseRef} className="campaign-modal-close" type="button" aria-label="Close programs and events announcement" onClick={() => setNoticeOpen(false)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
                </button>
                <div className="campaign-modal-art events-modal-art" ref={eventArtRef} aria-hidden="true">
                  <svg viewBox="0 0 360 380" fill="none">
                    <circle className="campaign-art-halo" cx="180" cy="177" r="128" />
                    <g className="events-art-orbit-spin">
                      <circle className="campaign-art-orbit" cx="180" cy="177" r="146" />
                      <circle className="events-art-spark" cx="180" cy="31" r="5" />
                      <circle className="events-art-spark" cx="326" cy="177" r="4" />
                    </g>
                    <circle className="events-art-spark" cx="75" cy="90" r="4" />
                    <circle className="events-art-spark" cx="285" cy="78" r="6" />
                    <path className="events-art-draw" d="M103 111h154v174H103zM103 157h154M139 92v39M221 92v39M133 190h18m28 0h18m28 0h18M133 222h18m28 0h18m28 0h18" />
                    <path className="events-art-draw events-art-people" d="M141 265c3-14 14-22 26-22s23 8 26 22m1 0c3-14 14-22 26-22s23 8 26 22" />
                    <circle className="events-art-draw events-art-person" cx="167" cy="231" r="8" />
                    <circle className="events-art-draw events-art-person" cx="222" cy="231" r="8" />
                    <path className="events-art-star" d="m180 96 8 17 19 3-14 13 3 19-16-9-17 9 4-19-14-13 19-3 8-17Z" />
                    <path className="events-art-draw events-art-ground" d="M106 309c24-15 49-22 74-22 30 0 58 8 83 23" />
                  </svg>
                  <span>Moments that bring us together</span>
                </div>
                <div className="campaign-modal-content">
                  <p className="campaign-modal-eyebrow">A calendar of shared moments</p>
                  <h2 id="events-coming-title">Programs and events are coming soon.</h2>
                  <p className="campaign-modal-copy">We’re preparing upcoming Foundation programs and events. Check back soon for ways to learn, connect, and take part.</p>
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
