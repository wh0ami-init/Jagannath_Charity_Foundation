import { useState, FormEvent } from "react";
import Layout from "../components/Layout";
import Reveal from "../components/Reveal";
import { submissionPayload, submitForm } from "../lib/api";

export default function Volunteer() {
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await submitForm(submissionPayload(e.currentTarget, "volunteer"));
      setSubmitted(true);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Your application could not be saved.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout hideNewsletter>
      <Reveal as="section" className="page-banner">
        <div className="wrap">
          <p className="text-orange-300 font-semibold mb-2">Get involved</p>
          <h1 className="text-3xl sm:text-4xl font-serif-heading font-bold max-w-2xl">
            If you will return, there is a place for you.
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            We need people who can sit in a classroom, keep a register, plant a line of trees, or
            brief a household on a solar roof — and come back the following month.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="wrap py-16 grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h3 className="font-serif-heading font-bold text-navy-950 mb-1">Be a serious voice</h3>
            <p className="text-sm text-navy-900/70">
              Help carry facts about education, health, energy and tribal households — not
              slogans — into rooms that still have not heard them.
            </p>
          </div>
          <div>
            <h3 className="font-serif-heading font-bold text-navy-950 mb-1">Work with a community</h3>
            <p className="text-sm text-navy-900/70">
              Join field days, literacy classes, planting and camps. The Foundation prefers people
              who will return, not people who will post.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border border-navy-900/10 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-serif-heading font-bold text-navy-950">Offer your time</h2>
          {submitted ? (
            <p className="form-success text-sm text-navy-900" role="status">Your volunteer interest is recorded. The Foundation can follow up using your contact details.</p>
          ) : (
            <>
              {error && <p className="form-error" role="alert">{error}</p>}
              <Field name="name" label="Full name" required />
              <Field name="email" label="Email" type="email" required />
              <Field name="phone" label="Phone" type="tel" />
              <Field name="district" label="District you can reach" />
              <Field name="skill" label="Skill you actually have" />
              <div>
                <label htmlFor="volunteer-message" className="text-sm font-medium block mb-1">Note</label>
                <textarea id="volunteer-message" name="message" rows={3} maxLength={4000} className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="form-honeypot" aria-hidden="true"><label htmlFor="volunteer-website">Leave this field blank</label><input id="volunteer-website" name="website" tabIndex={-1} autoComplete="off" /></div>
              <label className="flex gap-2 text-xs text-navy-900/70">
                <input name="consent" type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
                <span>
                  I have read and understood the Data Collection &amp; Consent Notice (DPDP Act, 2023)
                  and give my specific and informed consent to Jagannath Foundation to process my
                  personal data for the stated purposes.
                </span>
              </label>
              <button type="submit" disabled={sending} className="bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white px-5 py-2 rounded-full text-sm font-semibold">
                {sending ? "Sending…" : "Submit application"}
              </button>
            </>
          )}
        </form>
      </Reveal>
    </Layout>
  );
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={`volunteer-${name}`} className="text-sm font-medium block mb-1">{label}</label>
      <input id={`volunteer-${name}`} name={name} type={type} required={required} className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}
