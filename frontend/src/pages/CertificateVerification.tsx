import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "wouter";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import "./campaigns.css";
import "./certificate-verification.css";

gsap.registerPlugin(useGSAP);

export default function CertificateVerification() {
  const [internshipId, setInternshipId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [noticeOpen, setNoticeOpen] = useState(false);
  const formCardRef = useRef<HTMLDivElement>(null);
  const noticeCloseRef = useRef<HTMLButtonElement>(null);
  const certificateArtRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timeout = window.setTimeout(() => setNoticeOpen(true), 4000);
    return () => window.clearTimeout(timeout);
  }, []);

  useGSAP(() => {
    const card = formCardRef.current;
    if (!card || reducedMotion) return;
    gsap.fromTo(card, { autoAlpha: 0, y: 24, scale: .985 }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: .75,
      ease: "power3.out",
    });
    gsap.fromTo(".certificate-verify-accent", { scaleX: 0 }, {
      scaleX: 1,
      duration: .9,
      delay: .18,
      ease: "power3.inOut",
      transformOrigin: "left center",
    });
    gsap.fromTo(".certificate-verify-benefits li", { autoAlpha: 0, y: 9 }, {
      autoAlpha: 1,
      y: 0,
      duration: .45,
      delay: .3,
      stagger: .08,
      ease: "power2.out",
    });
    gsap.to(".certificate-card-glow--green", {
      x: 26,
      y: -17,
      scale: 1.16,
      duration: 9,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(".certificate-card-glow--gold", {
      x: -24,
      y: 15,
      scale: 1.14,
      duration: 11,
      delay: .6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, { scope: formCardRef, dependencies: [reducedMotion], revertOnUpdate: true });

  useGSAP(() => {
    if (!feedback || reducedMotion) return;
    gsap.fromTo(".certificate-verify-feedback", { autoAlpha: 0, y: 8 }, {
      autoAlpha: 1,
      y: 0,
      duration: .32,
      ease: "power2.out",
    });
  }, { scope: formCardRef, dependencies: [feedback, reducedMotion], revertOnUpdate: true });

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
      const controls = document.querySelectorAll<HTMLElement>(".certificate-coming-modal button:not(:disabled), .certificate-coming-modal a[href]");
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
    };
  }, [noticeOpen]);

  useGSAP(() => {
    const art = certificateArtRef.current;
    if (!art || !noticeOpen) return;
    const paths = art.querySelectorAll<SVGPathElement>(".certificate-art-draw");
    const seal = art.querySelector<SVGGElement>(".certificate-art-seal");
    const orbit = art.querySelector<SVGGElement>(".certificate-art-orbit-spin");
    const sparks = art.querySelectorAll<SVGCircleElement>(".certificate-art-spark");
    if (reducedMotion) {
      paths.forEach((path) => gsap.set(path, { strokeDashoffset: 0 }));
      gsap.set(seal, { scale: 1, autoAlpha: 1 });
      gsap.set(sparks, { autoAlpha: 1, scale: 1 });
      return;
    }
    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });
    gsap.set(seal, { scale: .65, autoAlpha: 0, transformOrigin: "50% 50%" });
    gsap.set(sparks, { autoAlpha: 0, scale: .4, transformOrigin: "50% 50%" });
    const drawing = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });
    drawing.to(paths, { strokeDashoffset: 0, duration: 1.25, stagger: .1, ease: "power2.inOut" });
    drawing.to(seal, { scale: 1, autoAlpha: 1, duration: .5, ease: "back.out(1.7)" }, "-=.3");
    drawing.to(sparks, { autoAlpha: 1, scale: 1, duration: .4, stagger: .08, ease: "back.out(1.8)" }, "-=.25");
    gsap.to(orbit, { rotation: 360, duration: 32, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
  }, { scope: certificateArtRef, dependencies: [noticeOpen, reducedMotion], revertOnUpdate: true });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedId = internshipId.trim();
    if (!/^INT-\d{4}-\d{3,}$/i.test(normalizedId)) {
      setFeedback("Enter a valid internship ID, for example INT-2025-001.");
      return;
    }
    setFeedback("This certificate has not been checked. Online verification is coming soon.");
    setNoticeOpen(true);
  }

  function clearForm() {
    setInternshipId("");
    setFeedback("");
  }

  return (
    <Layout>
      <div className="certificate-verification-page">
        <PageHero
          theme="work"
          motif="certificate-check"
          eyebrow="Certificate Verification"
          title="A record should be easy to verify."
          description="Check a Jagannath Foundation internship certificate using its unique ID."
        />
        <section className="certificate-verify-content" aria-labelledby="certificate-verify-title">
          <div className="certificate-verify-card" ref={formCardRef}>
            <div className="certificate-verify-accent" aria-hidden="true" />
            <div className="certificate-card-atmosphere" aria-hidden="true">
              <span className="certificate-card-glow certificate-card-glow--green" />
              <span className="certificate-card-glow certificate-card-glow--gold" />
            </div>
            <header className="certificate-verify-header">
              <span className="certificate-verify-mark" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none"><path d="M12 7h17l8 8v19H12zM29 7v9h8M17 22h14M17 27h9" /><circle cx="31" cy="32" r="8" /><path d="m27.5 32 2.3 2.3 4.7-5" /></svg>
              </span>
              <div>
                <h2 id="certificate-verify-title">Jagannath Foundation</h2>
                <p>Internship Certificate Verification</p>
              </div>
              <span className="certificate-verify-status"><i aria-hidden="true" /> Online verification coming soon</span>
            </header>

            <form className="certificate-verify-form" onSubmit={handleSubmit}>
              <label className="certificate-verify-label" htmlFor="internship-id">Certificate ID</label>
              <div className="certificate-verify-input-label">
                <span aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M5 2.5h7l3 3V17H5zM12 2.5v3h3M8 9h4M8 12h4" /></svg></span>
                <input
                  id="internship-id"
                  name="internshipId"
                  type="text"
                  autoComplete="off"
                  value={internshipId}
                  onChange={(event) => {
                    setInternshipId(event.target.value);
                    if (feedback) setFeedback("");
                  }}
                  placeholder="Enter Internship ID (e.g., INT-2025-001)"
                  aria-describedby={feedback ? "certificate-verify-feedback" : undefined}
                  required
                />
              </div>
              <p className="certificate-verify-hint">Enter the unique ID printed on the certificate, for example <strong>INT-2025-001</strong>.</p>
              <div className="certificate-verify-actions">
                <button className="certificate-verify-submit" type="submit">
                  <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.25" /><path d="m12.5 12.5 4 4" /></svg>
                  Verify Now
                </button>
                <button className="certificate-verify-clear" type="button" onClick={clearForm}>
                  <span aria-hidden="true">◆</span> Clear
                </button>
              </div>
              {feedback && <p className="certificate-verify-feedback" id="certificate-verify-feedback" role="status">{feedback}</p>}
              <Link href="/internships/available" className="certificate-verify-back"><span aria-hidden="true">‹</span> Go Back</Link>
            </form>

            <ul className="certificate-verify-benefits" aria-label="Planned verification service features">
              <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10V7a6 6 0 0 1 12 0v3M5 10h14v11H5z" /></svg><span>Secure Verification</span></li>
              <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-9 12h7l-1 8 10-13h-7z" /></svg><span>Instant Results</span></li>
              <li><svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v5c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 10v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5M4 15v4c0 1.7 3.6 3 8 3s8-1.3 8-3v-4" /></svg><span>Official Records</span></li>
            </ul>
          </div>
        </section>

        <AnimatePresence>
          {noticeOpen && (
            <motion.div className="campaign-coming-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setNoticeOpen(false); }} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .28 }}>
              <motion.section className="campaign-coming-modal certificate-coming-modal" role="dialog" aria-modal="true" aria-labelledby="certificate-coming-title" initial={reducedMotion ? false : { opacity: 0, y: 24, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} transition={{ duration: reducedMotion ? 0 : .48, ease: [.22, .7, .2, 1] }}>
                <button ref={noticeCloseRef} className="campaign-modal-close" type="button" aria-label="Close certificate verification announcement" onClick={() => setNoticeOpen(false)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
                </button>
                <div className="campaign-modal-art certificate-modal-art" ref={certificateArtRef} aria-hidden="true">
                  <svg viewBox="0 0 360 380" fill="none">
                    <circle className="campaign-art-halo" cx="180" cy="177" r="128" />
                    <g className="certificate-art-orbit-spin"><circle className="campaign-art-orbit" cx="180" cy="177" r="146" /><circle className="certificate-art-spark" cx="180" cy="31" r="5" /><circle className="certificate-art-spark" cx="326" cy="177" r="4" /></g>
                    <circle className="certificate-art-spark" cx="75" cy="90" r="4" /><circle className="certificate-art-spark" cx="285" cy="78" r="6" />
                    <path className="certificate-art-draw" d="M99 98h123l40 40v168H99zM222 99v41h40M126 171h104M126 200h104M126 229h62" />
                    <g className="certificate-art-seal"><circle cx="228" cy="257" r="37" /><circle cx="228" cy="257" r="27" /><path d="m213 257 10 10 20-22" /></g>
                    <path className="certificate-art-draw certificate-art-ground" d="M94 319c25-15 52-22 80-22 30 0 57 8 82 23" />
                  </svg>
                  <span>Every record, clearly verified</span>
                </div>
                <div className="campaign-modal-content">
                  <p className="campaign-modal-eyebrow">A trusted record, made easy to check</p>
                  <h2 id="certificate-coming-title">Certificate verification is coming soon.</h2>
                  <p className="campaign-modal-copy">We’re preparing a secure way to check internship certificates against official Foundation records. No certificate can be verified here yet.</p>
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
