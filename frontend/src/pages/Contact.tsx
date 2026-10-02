import { useState, FormEvent } from "react";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { submissionPayload, submitForm } from "../lib/api";

export default function Contact() {
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await submitForm(submissionPayload(e.currentTarget, "contact"));
      setSubmitted(true);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Your message could not be saved.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout hideNewsletter>
      <PageHero theme="contact" motif="place" eyebrow="Contact" title="Trust headquarters, Bhubaneswar." description="Programme questions, volunteering, membership and press all come to the same desk. If it is urgent, call. If it can wait, use the form." />

      <Reveal as="section" className="wrap py-16 grid lg:grid-cols-2 gap-12">
        <div className="contact-details-column">
          <dl className="space-y-5 text-sm">
            <div><dt className="text-navy-900/50">Telephone</dt><dd className="font-medium"><a href="tel:+919700643333">+91 97006 43333</a></dd></div>
            <div><dt className="text-navy-900/50">Email</dt><dd className="font-medium"><a href="mailto:chairman@jagannathfoundation.charity">chairman@jagannathfoundation.charity</a><br/><a href="mailto:secretariatjagannathfoundation@gmail.com">secretariatjagannathfoundation@gmail.com</a></dd></div>
            <div><dt className="text-navy-900/50">Trust house</dt><dd className="font-medium">Foundation House, Raj Bhavan<br/>Tapaswini Colony, Near Z1, Nandan Kanan Road<br/>Bhubaneswar, Khordha 751024</dd></div>
            <div><dt className="text-navy-900/50">Web</dt><dd className="font-medium">www.jagannathfoundation.charity</dd></div>
          </dl>

          <aside id="press-media" className="press-media mt-10 scroll-mt-28 border-t border-navy-900/15 pt-7">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-orange-600">Press &amp; media</p>
            <h2 className="mt-2 font-serif-heading text-2xl font-bold text-navy-950">For the press</h2>
            <p className="mt-3 text-base leading-7 text-navy-900/70">For media queries, interview requests and field visits, contact the secretariat. Please mark your subject line clearly so the right person can respond.</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div><dt className="text-navy-900/55">Media desk</dt><dd className="font-semibold"><a href="mailto:secretariatjagannathfoundation@gmail.com">secretariatjagannathfoundation@gmail.com</a></dd></div>
              <div><dt className="text-navy-900/55">Chairman</dt><dd className="font-semibold"><a href="mailto:chairman@jagannathfoundation.charity">chairman@jagannathfoundation.charity</a><span className="px-2 text-navy-900/35">·</span><a href="tel:+919700643333">+91 97006 43333</a></dd></div>
            </dl>
            <p className="mt-5 text-sm leading-6 text-navy-900/65"><span className="font-semibold text-navy-950">Suggested subjects:</span> Media query · Interview request · Field visit</p>
          </aside>
        </div>

        <form onSubmit={handleSubmit} className="border border-navy-900/10 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-serif-heading font-bold text-navy-950">Send a message</h2>
          {submitted ? (
            <p className="form-success text-sm text-navy-900" role="status">Message received. The Foundation can follow up using your contact details.</p>
          ) : (
            <>
              {error && <p className="form-error" role="alert">{error}</p>}
              <Field name="name" label="Full name" required />
              <Field name="email" label="Email" type="email" required />
              <Field name="phone" label="Phone" type="tel" />
              <Field name="subject" label="Subject" />
              <div>
                <label htmlFor="contact-message" className="text-sm font-medium block mb-1">Message</label>
                <textarea id="contact-message" name="message" rows={4} maxLength={4000} className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="form-honeypot" aria-hidden="true"><label htmlFor="contact-website">Leave this field blank</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
              <label className="flex gap-2 text-xs text-navy-900/70">
                <input name="consent" type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
                <span>
                  I have read and understood the Data Collection &amp; Consent Notice (DPDP Act, 2023)
                  and give my specific and informed consent to Jagannath Foundation to process my
                  personal data for the stated purposes.
                </span>
              </label>
              <button type="submit" disabled={sending} className="bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white px-5 py-2 rounded-full text-sm font-semibold">
                {sending ? "Sending…" : "Send message"}
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
      <label htmlFor={`contact-${name}`} className="text-sm font-medium block mb-1">{label}</label>
      <input id={`contact-${name}`} name={name} type={type} required={required} className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}
