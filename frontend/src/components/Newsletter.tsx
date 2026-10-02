import { useState, FormEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { submissionPayload, submitForm } from "../lib/api";
import DataCollectionNotice from "./DataCollectionNotice";
import Reveal from "./Reveal";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const reducedMotion = useReducedMotion();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await submitForm(submissionPayload(e.currentTarget, "newsletter"));
      setSubmitted(true);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Your request could not be saved.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Reveal as="section" className="newsletter-section bg-navy-900 text-white">
      <div className="wrap py-14 grid gap-8 lg:grid-cols-2 items-center">
        <div className="newsletter-copy">
          <p className="newsletter-eyebrow">Stay informed</p>
          <h2 className="newsletter-title">
            Programme notes,<br /><em>not slogans.</em>
          </h2>
          <p className="newsletter-description">
            Occasional updates on classrooms, camps, skills and household energy.
            You can withdraw consent at any time.
          </p>
        </div>
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white text-navy-950 rounded-xl p-6 space-y-4"
          initial={reducedMotion ? false : { opacity: 0, x: 52 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reducedMotion ? 0 : 1.35, delay: reducedMotion ? 0 : 0.24, ease: [0.22, 0.7, 0.2, 1] }}
        >
          {submitted ? (
            <p className="form-success text-sm" role="status">Your update request is saved. Programme emails are not sent automatically yet.</p>
          ) : (
            <>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div>
                <label htmlFor="news-email" className="text-sm font-medium block mb-1">
                  Email address
                </label>
                <input
                  id="news-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="form-honeypot" aria-hidden="true"><label htmlFor="news-website">Leave this field blank</label><input id="news-website" name="website" tabIndex={-1} autoComplete="off" /></div>
              <details className="newsletter-privacy-notice" open onToggle={() => window.requestAnimationFrame(() => ScrollTrigger.refresh())}>
                <summary>Data collection and consent notice</summary>
                <DataCollectionNotice showPolicyLink />
              </details>
              <label className="flex gap-2 text-xs text-navy-900/70">
                <input
                  name="consent"
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  I have read and understood the Data Collection &amp; Consent Notice (DPDP Act, 2023)
                  and give my specific and informed consent to Jagannath Foundation to process my
                  personal data for the stated purposes.
                </span>
              </label>
              <button
                type="submit"
                disabled={sending}
                className="bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white px-5 py-2 rounded-full text-sm font-semibold"
              >
                {sending ? "Saving…" : "Request updates"}
              </button>
            </>
          )}
        </motion.form>
      </div>
    </Reveal>
  );
}
