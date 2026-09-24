import { useState, FormEvent } from "react";
import Layout from "../components/Layout";

export default function Contact() {
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
          <p className="text-orange-300 font-semibold mb-2">Contact</p>
          <h1 className="text-3xl sm:text-4xl font-serif-heading font-bold max-w-2xl">
            Trust headquarters, Bhubaneswar.
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Programme questions, volunteering, membership and press all come to the same desk. If
            it is urgent, call. If it can wait, use the form.
          </p>
        </div>
      </section>

      <section className="wrap py-16 grid lg:grid-cols-2 gap-12">
        <dl className="space-y-5 text-sm">
          <div><dt className="text-navy-900/50">Telephone</dt><dd className="font-medium">+91 97006 43333</dd></div>
          <div><dt className="text-navy-900/50">Email</dt><dd className="font-medium">chairman@jagannathfoundation.charity<br/>secretariatjagannathfoundation@gmail.com</dd></div>
          <div><dt className="text-navy-900/50">Trust house</dt><dd className="font-medium">Foundation House, Raj Bhavan<br/>Tapaswini Colony, Near Z1, Nandan Kanan Road<br/>Bhubaneswar, Khordha 751024</dd></div>
          <div><dt className="text-navy-900/50">Web</dt><dd className="font-medium">www.jagannathfoundation.charity</dd></div>
        </dl>

        <form onSubmit={handleSubmit} className="border border-navy-900/10 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-serif-heading font-bold text-navy-950">Send a message</h2>
          {submitted ? (
            <p className="text-sm text-navy-900">Thank you — your message has been sent.</p>
          ) : (
            <>
              <Field label="Full name" required />
              <Field label="Email" type="email" required />
              <Field label="Phone" type="tel" />
              <Field label="Subject" />
              <div>
                <label className="text-sm font-medium block mb-1">Message</label>
                <textarea rows={4} className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm" />
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
                Send message
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
