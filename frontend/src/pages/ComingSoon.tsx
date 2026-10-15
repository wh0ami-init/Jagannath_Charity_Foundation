import { tr as translateText, localize as localizeText, trError as translateError } from "../i18n";
import { useTranslation as usePageTranslation } from "react-i18next";
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
export default function ComingSoon({ section }: {
    section: ComingSoonSection;
}) {
    usePageTranslation();
    const [noticeOpen, setNoticeOpen] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const reducedMotion = useReducedMotion();
    const showNotice = () => setNoticeOpen(true);
    useEffect(() => {
        if (!section.announcement)
            return;
        const timeout = window.setTimeout(showNotice, 4000);
        return () => window.clearTimeout(timeout);
    }, [section.announcement]);
    useEffect(() => {
        if (!noticeOpen)
            return;
        const previousOverflow = document.body.style.overflow;
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape")
                setNoticeOpen(false);
            if (event.key !== "Tab")
                return;
            const dialog = document.querySelector<HTMLElement>(".utility-coming-modal");
            const focusable = dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
            if (!focusable?.length)
                return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
            previousFocus?.focus();
        };
    }, [noticeOpen]);
    const handlePageAction = (event: MouseEvent<HTMLDivElement>) => {
        if (!section.announcement || (event.target as HTMLElement).closest(".utility-coming-modal"))
            return;
        const target = (event.target as HTMLElement).closest("a, button");
        if (!target)
            return;
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
    return (<Layout>
      <div className="coming-soon-page" onClickCapture={handlePageAction}>
        <PageHero theme="work" motif={section.motif} eyebrow={localizeText(section.label)} title={translateText("{{page}} is coming soon.", { page: localizeText(section.label) })} description={translateText("We’re preparing the {{page}} section now. It’s currently in progress and will be available here soon.", { page: localizeText(section.label) })} actions={<Link href="/programmes" className="pagehero-button">{translateText("Explore our programmes")}<span aria-hidden="true">↗</span>
            </Link>}/>

        <section className="wrap coming-soon-section" aria-labelledby="coming-soon-title">
          <Reveal className={`coming-soon-card coming-soon-card--${section.id}`}>
            <ComingSoonEmblem section={section}/>
            <div className="coming-soon-copy">
              <p className="coming-soon-status"><span />{translateText("Currently in progress")}</p>
              <h2 id="coming-soon-title">{localizeText(section.note)}</h2>
              <p>{localizeText(section.message)}</p>
              {localizeText(relatedPages.length > 1 && (<nav className="coming-soon-related" aria-label={translateText("{{group}} pages", { group: localizeText(groupLabel) })}>
                  <span>{localizeText(groupLabel)}</span>
                  {localizeText(relatedPages
                .filter((item) => item.href !== section.href)
                .map((item) => (<Link key={item.href} href={item.href}>
                        {localizeText(item.label)} <span aria-hidden="true">↗</span>
                      </Link>)))}
                </nav>))}
            </div>
            <div className="coming-soon-actions">
              <Link href="/contact" className="coming-soon-contact">{translateText("Contact the Foundation")}<span aria-hidden="true">↗</span>
              </Link>
              <Link href="/" className="coming-soon-home">{translateText("Back to home")}</Link>
            </div>
          </Reveal>
        </section>
        {localizeText(section.announcement && (<GsapDialog open={noticeOpen} className="utility-coming-overlay" dialogClassName={`utility-coming-modal utility-coming-modal--${section.id}`} labelledBy="utility-coming-title" reducedMotion={Boolean(reducedMotion)} onBackdrop={(event) => { if (event.target === event.currentTarget)
            setNoticeOpen(false); }}>
                <button ref={closeRef} className="utility-coming-close" type="button" aria-label={translateText("Close announcement")} onClick={() => setNoticeOpen(false)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
                </button>
                <div className="utility-coming-art" aria-hidden="true">
                  <span className="utility-coming-orbit utility-coming-orbit--one"/>
                  <span className="utility-coming-orbit utility-coming-orbit--two"/>
                  <ComingSoonEmblem section={section}/>
                  <span className="utility-coming-spark utility-coming-spark--one"/>
                  <span className="utility-coming-spark utility-coming-spark--two"/>
                </div>
                <div className="utility-coming-copy">
                  <p className="utility-coming-eyebrow">{translateText("Jagannath Foundation \u00B7 In progress")}</p>
                  <h2 id="utility-coming-title">{translateText("{{page}} is coming soon.", { page: localizeText(section.label) })}</h2>
                  <p>{localizeText(section.message)}</p>
                  <div className="utility-coming-actions">
                    <Link href="/contact" className="utility-coming-contact" onClick={() => setNoticeOpen(false)}>{translateText("Contact the Foundation")}<span aria-hidden="true">↗</span></Link>
                    <button type="button" className="utility-coming-dismiss" onClick={() => setNoticeOpen(false)}>{translateText("Maybe later")}</button>
                  </div>
                </div>
          </GsapDialog>))}
      </div>
    </Layout>);
}
