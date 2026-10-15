import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useReducedMotion } from "motion/react";
import { Link } from "wouter";
import Layout from "../components/Layout";
import GsapDialog from "../components/GsapDialog";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { comingSoonSections, type ComingSoonSection } from "../lib/comingSoonSections";
import ComingSoonEmblem from "./ComingSoonEmblem";
import "./coming-soon.css";

export default function ComingSoon({ section }: { section: ComingSoonSection }) {
  const [noticeOpen, setNoticeOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const showNotice = () => setNoticeOpen(true);

  useEffect(() => {
    if (!section.announcement) return;
    const timeout = window.setTimeout(showNotice, 4000);
    return () => window.clearTimeout(timeout);
  }, [section.announcement]);

  useEffect(() => {
    if (!noticeOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNoticeOpen(false);
      if (event.key !== "Tab") return;
      const dialog = document.querySelector<HTMLElement>(".utility-coming-modal");
      const focusable = dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [noticeOpen]);

  const handlePageAction = (event: MouseEvent<HTMLDivElement>) => {
    if (!section.announcement || (event.target as HTMLElement).closest(".utility-coming-modal")) return;
    const target = (event.target as HTMLElement).closest("a, button");
    if (!target) return;
    event.preventDefault();
    showNotice();
  };

  const groupPrefix = section.href.startsWith("/internships/")
    ? "/internships/"
    : section.href.startsWith("/beneficiaries/")
      ? "/beneficiaries/"
      : null;
  const relatedPages = groupPrefix
    ? comingSoonSections.filter((item) => item.href.startsWith(groupPrefix))
    : [];
  const groupLabel = groupPrefix === "/beneficiaries/" ? "Beneficiaries" : "Internships";

  return (
    <Layout>
      <div className="coming-soon-page" onClickCapture={handlePageAction}>
        <PageHero
          theme="work"
          motif={section.motif}
          eyebrow={section.label}
          title={`${section.label} is coming soon.`}
          description={`We’re preparing the ${section.label.toLowerCase()} section now. It’s currently in progress and will be available here soon.`}
          actions={
            <Link href="/programmes" className="pagehero-button">
              Explore our programmes <span aria-hidden="true">↗</span>
            </Link>
          }
        />

        <section className="wrap coming-soon-section" aria-labelledby="coming-soon-title">
          <Reveal className={`coming-soon-card coming-soon-card--${section.id}`}>
            <ComingSoonEmblem section={section} />
            <div className="coming-soon-copy">
              <p className="coming-soon-status"><span /> Currently in progress</p>
              <h2 id="coming-soon-title">{section.note}</h2>
              <p>{section.message}</p>
              {relatedPages.length > 1 && (
                <nav className="coming-soon-related" aria-label={`${groupLabel} pages`}>
                  <span>{groupLabel}</span>
                  {relatedPages
                    .filter((item) => item.href !== section.href)
                    .map((item) => (
                      <Link key={item.href} href={item.href}>
                        {item.label} <span aria-hidden="true">↗</span>
                      </Link>
                    ))}
                </nav>
              )}
            </div>
            <div className="coming-soon-actions">
              <Link href="/contact" className="coming-soon-contact">
                Contact the Foundation <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/" className="coming-soon-home">
                Back to home
              </Link>
            </div>
          </Reveal>
        </section>
        {section.announcement && (
          <GsapDialog
            open={noticeOpen}
            className="utility-coming-overlay"
            dialogClassName={`utility-coming-modal utility-coming-modal--${section.id}`}
            labelledBy="utility-coming-title"
            reducedMotion={Boolean(reducedMotion)}
            onBackdrop={(event) => { if (event.target === event.currentTarget) setNoticeOpen(false); }}
          >
                <button ref={closeRef} className="utility-coming-close" type="button" aria-label="Close announcement" onClick={() => setNoticeOpen(false)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
                </button>
                <div className="utility-coming-art" aria-hidden="true">
                  <span className="utility-coming-orbit utility-coming-orbit--one" />
                  <span className="utility-coming-orbit utility-coming-orbit--two" />
                  <ComingSoonEmblem section={section} />
                  <span className="utility-coming-spark utility-coming-spark--one" />
                  <span className="utility-coming-spark utility-coming-spark--two" />
                </div>
                <div className="utility-coming-copy">
                  <p className="utility-coming-eyebrow">Jagannath Foundation · In progress</p>
                  <h2 id="utility-coming-title">{section.label} is coming soon.</h2>
                  <p>{section.message}</p>
                  <div className="utility-coming-actions">
                    <Link href="/contact" className="utility-coming-contact" onClick={() => setNoticeOpen(false)}>Contact the Foundation <span aria-hidden="true">↗</span></Link>
                    <button type="button" className="utility-coming-dismiss" onClick={() => setNoticeOpen(false)}>Maybe later</button>
                  </div>
                </div>
          </GsapDialog>
        )}
      </div>
    </Layout>
  );
}
