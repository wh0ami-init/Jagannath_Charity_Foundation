import { useState, FormEvent } from "react";
import Layout from "../components/Layout";

export default function Volunteer() {
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <Layout hideNewsletter>
      <section className="bg-navy-950 text-white py-16">
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
      </section>

      <section className="wrap py-16 grid lg:grid-cols-2 gap-12">
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
            <p className="text-sm text-navy-900">Thank you — your application has been submitted.</p>
          ) : (
            <>
              <Field label="Full name" required />
              <Field label="Email" type="email" required />
              <Field label="Phone" type="tel" />
              <Field label="District you can reach" />
              <Field label="Skill you actually have" />
              <div>
                <label className="text-sm font-medium block mb-1">Note</label>
                <textarea rows={3} className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm" />
              </div>
              <label className="flex gap-2 text-xs text-navy-900/70">
                <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
                <span>
                  I have read and understood the Data Collection &amp; Consent Notice (DPDP Act, 2023)
                  and give my specific and informed consent to Jagannath Foundation to process my
                  personal data for the stated purposes.
                </span>
              </label>
              <button type="submit" className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-2 rounded-full text-sm font-semibold">
                Submit application
              </button>
            </>
          )}
        </form>
      </section>
    </Layout>
  );
}

function Field({ label, type = "text", required = false }: { label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      <input type={type} required={required} className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}
