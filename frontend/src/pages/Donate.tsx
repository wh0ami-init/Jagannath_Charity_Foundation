import { useState, FormEvent } from "react";
import Layout from "../components/Layout";

const causes = [
  "Education & literacy", "Health & family welfare", "Youth skills & sport",
  "Women's livelihoods", "Environment & land", "Solar housing & clean energy", "Where most needed",
];

export default function Donate() {
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
          <p className="text-orange-300 font-semibold mb-2">Donate</p>
          <h1 className="text-3xl sm:text-4xl font-serif-heading font-bold max-w-2xl">
            Give to a named cause, not a vague fund.
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Transfer to the Foundation's Yes Bank savings account, or record a pledge. Income can
            be applied only to the objects of the trust.
          </p>
        </div>
      </section>

      <section className="wrap py-16 grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-navy-950 mb-3">Transfer directly</h2>
          <p className="text-sm text-navy-900/70 mb-5">
            Use these details for NEFT, RTGS or IMPS. Please email the office after you transfer
            so a receipt can be issued against the named cause.
          </p>
          <dl className="space-y-3 text-sm border border-navy-900/10 rounded-xl p-5">
            {[
              ["Account name", "Jagannath Foundation"],
              ["Bank", "Yes Bank · Savings account"],
              ["Account number", "121494600000139"],
              ["IFSC", "YESB0001214"],
              ["PAN", "AAFTJ8006Q"],
              ["Provisional registration u/s 12A", "URN AAFTJ8006QE20261"],
              ["Provisional approval u/s 80G", "URN AAFTJ8006QF20261 · Form 10G dated 07-09-2026 · valid TY 2026-27 to TY 2028-29"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <dt className="text-navy-900/50">{k}</dt>
                <dd className="font-medium text-navy-950 sm:text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-navy-900/50 mt-4">
            Write to chairman@jagannathfoundation.charity or secretariatjagannathfoundation@gmail.com
            after you transfer so the gift can be receipted.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="border border-navy-900/10 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-serif-heading font-bold text-navy-950">Record my pledge</h2>
          <p className="text-xs text-navy-900/50">This form records a pledge. No card or UPI details are collected here.</p>
          {submitted ? (
            <p className="text-sm text-navy-900">Thank you — your pledge has been recorded.</p>
          ) : (
            <>
              <Field label="Full name" required />
              <Field label="Email" type="email" required />
              <Field label="Phone" type="tel" />
              <Field label="Pledge amount (INR)" type="number" />
              <div>
                <label className="text-sm font-medium block mb-1">Named cause</label>
                <select className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm">
                  {causes.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Field label="PAN (for 80G receipt, if applicable)" />
              <label className="flex gap-2 text-xs text-navy-900/70">
                <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
                <span>
                  I have read and understood the Data Collection &amp; Consent Notice (DPDP Act, 2023)
                  and give my specific and informed consent to Jagannath Foundation to process my
                  personal data for the stated purposes.
                </span>
              </label>
              <button type="submit" className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-2 rounded-full text-sm font-semibold">
                Record my pledge
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
