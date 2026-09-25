import { useState, FormEvent } from "react";
import Layout from "../components/Layout";
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
      <Reveal as="section" className="page-banner">
        <div className="wrap">
          <p className="text-orange-300 font-semibold mb-2">Contact</p>
          <h1 className="text-3xl sm:text-4xl font-serif-heading font-bold max-w-2xl">
            Trust headquarters, Bhubaneswar.
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Programme questions, volunteering, membership and press all come to the same desk. If
            it is urgent, call. If it can wait, use the form.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="wrap py-16 grid lg:grid-cols-2 gap-12">
        <dl className="space-y-5 text-sm">
          <div><dt className="text-navy-900/50">Telephone</dt><dd className="font-medium">+91 97006 43333</dd></div>
          <div><dt className="text-navy-900/50">Email</dt><dd className="font-medium">chairman@jagannathfoundation.charity<br/>secretariatjagannathfoundation@gmail.com</dd></div>
          <div><dt className="text-navy-900/50">Trust house</dt><dd className="font-medium">Foundation House, Raj Bhavan<br/>Tapaswini Colony, Near Z1, Nandan Kanan Road<br/>Bhubaneswar, Khordha 751024</dd></div>
          <div><dt className="text-navy-900/50">Web</dt><dd className="font-medium">www.jagannathfoundation.charity</dd></div>
        </dl>

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
