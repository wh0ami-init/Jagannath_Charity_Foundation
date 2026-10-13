import { tr as t, localize, trError } from "../i18n";
import { useTranslation } from "react-i18next";
import { useState, FormEvent } from "react";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { submissionPayload, submitForm } from "../lib/api";
import Stagger from "../components/Stagger";
import RazorpayTestButton from "../components/RazorpayTestButton";

const causes = [
  "Education & literacy",
  "Health & family welfare",
  "Youth skills & sport",
  "Women's livelihoods",
  "Environment & land",
  "Solar housing & clean energy",
  "Where most needed",
];

export default function Donate() {
  useTranslation();
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await submitForm(submissionPayload(e.currentTarget, "pledge"));
      setSubmitted(true);
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "Your pledge could not be saved.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout hideNewsletter>
      <PageHero
        theme="donate"
        motif="giving"
        eyebrow={t("Donate")}
        title={t("Give to a named cause, not a vague fund.")}
        description={t("Transfer to the Foundation's Yes Bank savings account, or record a pledge. Income can be applied only to the objects of the trust.")}
      />

      <Reveal as="section" className="wrap py-16 grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-navy-950 mb-3">
            {t("Transfer directly")}</h2>
          <p className="text-sm text-navy-900/70 mb-5">
            {t("Use these details for NEFT, RTGS or IMPS. Please email the office after you transfer so a receipt can be issued against the named cause.")}</p>
          <dl className="space-y-3 text-sm border border-navy-900/10 rounded-xl p-5">
            {localize([
              ["Account name", "Jagannath Foundation"],
              ["Bank", "Yes Bank · Savings account"],
              ["Account number", "121494600000139"],
              ["IFSC", "YESB0001214"],
              ["PAN", "AAFTJ8006Q"],
              ["Provisional registration u/s 12A", "URN AAFTJ8006QE20261"],
              [
                "Provisional approval u/s 80G",
                "URN AAFTJ8006QF20261 · Form 10G dated 07-09-2026 · valid TY 2026-27 to TY 2028-29",
              ],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex flex-col sm:flex-row sm:justify-between gap-1"
              >
                <dt className="text-navy-900/50">{localize(k)}</dt>
                <dd className="font-medium text-navy-950 sm:text-right">{k === "Account name" ? v : localize(v)}</dd>
              </div>
            )))}
          </dl>
          <p className="text-xs text-navy-900/50 mt-4">
            {t("Write to chairman@jagannathfoundation.charity or secretariatjagannathfoundation@gmail.com after you transfer so the gift can be receipted.")}</p>
        </div>

        <Stagger
          as="form"
          onSubmit={handleSubmit}
          className="border border-navy-900/10 rounded-xl p-6 space-y-4"
          gap={0.07}
          distance={16}
        >
          <h2 className="text-xl font-serif-heading font-bold text-navy-950">
            {t("Record my pledge")}</h2>
          <p className="text-xs text-navy-900/50">
            {t("This records an expression of interest only. No payment or PAN details are collected here.")}</p>
          {localize(submitted ? (
            <p className="form-success text-sm text-navy-900" role="status">
              {t("Your pledge note is recorded. No payment was made; the Foundation can follow up using your contact details.")}</p>
          ) : (
            <>
              {localize(error && (
                <p className="form-error" role="alert">
                  {trError(error)}
                </p>
              ))}
              <Field name="name" label={t("Full name")} required />
              <Field name="email" label={t("Email")} type="email" required />
              <Field name="phone" label={t("Phone")} type="tel" />
              <Field name="amount" label={t("Pledge amount (INR)")} type="number" />
              <div>
                <label
                  htmlFor="pledge-cause"
                  className="text-sm font-medium block mb-1"
                >
                  {t("Named cause")}</label>
                <select
                  id="pledge-cause"
                  name="cause"
                  className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm"
                >
                  {localize(causes.map((c) => (
                    <option key={c} value={c}>
                      {localize(c)}
                    </option>
                  )))}
                </select>
              </div>
              <div className="form-honeypot" aria-hidden="true">
                <label htmlFor="pledge-website">{t("Leave this field blank")}</label>
                <input
                  id="pledge-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
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
                  {t("I have read and understood the Data Collection & Consent Notice (DPDP Act, 2023) and give my specific and informed consent to Jagannath Foundation to process my personal data for the stated purposes.")}</span>
              </label>
              <button
                type="submit"
                disabled={sending}
                className="bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white px-5 py-2 rounded-full text-sm font-semibold"
              >
                {localize(sending ? "Saving…" : "Record my pledge")}
              </button>
            </>
          ))}
        </Stagger>
      </Reveal>
      <RazorpayTestButton />
    </Layout>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  useTranslation();
  return (
    <div>
      <label
        htmlFor={`pledge-${name}`}
        className="text-sm font-medium block mb-1"
      >
        {localize(label)}
      </label>
      <input
        id={`pledge-${name}`}
        name={name}
        type={type}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        required={required}
        className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}
