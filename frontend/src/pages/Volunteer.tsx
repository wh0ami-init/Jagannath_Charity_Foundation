import { tr as t, localize, trError } from "../i18n";
import { useTranslation } from "react-i18next";
import { useState, FormEvent } from "react";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { submissionPayload, submitForm } from "../lib/api";
import Stagger from "../components/Stagger";

export default function Volunteer() {
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
      await submitForm(submissionPayload(e.currentTarget, "volunteer"));
      setSubmitted(true);
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "Your application could not be saved.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout hideNewsletter>
      <PageHero
        theme="volunteer"
        motif="volunteers"
        eyebrow={t("Get involved")}
        title={t("If you will return, there is a place for you.")}
        description={t("We need people who can sit in a classroom, keep a register, plant a line of trees, or brief a household on a solar roof — and come back the following month.")}
      />

      <Reveal as="section" className="wrap py-16 grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h3 className="font-serif-heading font-bold text-navy-950 mb-1">
              {t("Be a serious voice")}</h3>
            <p className="text-sm text-navy-900/70">
              {t("Help carry facts about education, health, energy and tribal households — not slogans — into rooms that still have not heard them.")}</p>
          </div>
          <div>
            <h3 className="font-serif-heading font-bold text-navy-950 mb-1">
              {t("Work with a community")}</h3>
            <p className="text-sm text-navy-900/70">
              {t("Join field days, literacy classes, planting and camps. The Foundation prefers people who will return, not people who will post.")}</p>
          </div>
        </div>

        <Stagger
          as="form"
          onSubmit={handleSubmit}
          className="border border-navy-900/10 rounded-xl p-6 space-y-4"
          gap={0.07}
          distance={16}
        >
          <h2 className="text-xl font-serif-heading font-bold text-navy-950">
            {t("Offer your time")}</h2>
          {localize(submitted ? (
            <p className="form-success text-sm text-navy-900" role="status">
              {t("Your volunteer interest is recorded. The Foundation can follow up using your contact details.")}</p>
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
              <Field name="district" label={t("District you can reach")} />
              <Field name="skill" label={t("Skill you actually have")} />
              <div>
                <label
                  htmlFor="volunteer-message"
                  className="text-sm font-medium block mb-1"
                >
                  {t("Note")}</label>
                <textarea
                  id="volunteer-message"
                  name="message"
                  rows={3}
                  maxLength={4000}
                  className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="form-honeypot" aria-hidden="true">
                <label htmlFor="volunteer-website">
                  {t("Leave this field blank")}</label>
                <input
                  id="volunteer-website"
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
                {localize(sending ? "Sending…" : "Submit application")}
              </button>
            </>
          ))}
        </Stagger>
      </Reveal>
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
        htmlFor={`volunteer-${name}`}
        className="text-sm font-medium block mb-1"
      >
        {localize(label)}
      </label>
      <input
        id={`volunteer-${name}`}
        name={name}
        type={type}
        required={required}
        className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}
