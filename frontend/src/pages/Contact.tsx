import { tr as t, localize, trError } from "../i18n";
import { useTranslation } from "react-i18next";
import { useState, FormEvent } from "react";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { submissionPayload, submitForm } from "../lib/api";
import Stagger from "../components/Stagger";

export default function Contact() {
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
      await submitForm(submissionPayload(e.currentTarget, "contact"));
      setSubmitted(true);
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "Your message could not be saved.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout hideNewsletter>
      <PageHero
        theme="contact"
        motif="place"
        eyebrow={t("Contact")}
        title={t("Trust headquarters, Bhubaneswar.")}
        description={t("Programme questions, volunteering, membership and press all come to the same desk. If it is urgent, call. If it can wait, use the form.")}
      />

      <Reveal as="section" className="wrap py-16 grid lg:grid-cols-2 gap-12">
        <div className="contact-details-column">
          <dl className="space-y-5 text-sm">
            <div>
              <dt className="text-navy-900/50">{t("Telephone")}</dt>
              <dd className="font-medium">
                <a href="tel:+919700643333">+91 97006 43333</a>
              </dd>
            </div>
            <div>
              <dt className="text-navy-900/50">{t("Email")}</dt>
              <dd className="font-medium">
                <a href="mailto:chairman@jagannathfoundation.charity">
                  {t("chairman@jagannathfoundation.charity")}</a>
                <br />
                <a href="mailto:secretariatjagannathfoundation@gmail.com">
                  {t("secretariatjagannathfoundation@gmail.com")}</a>
              </dd>
            </div>
            <div>
              <dt className="text-navy-900/50">{t("Trust house")}</dt>
              <dd className="font-medium">
                {t("Foundation House, Raj Bhavan")}<br />
                {t("Tapaswini Colony, Near Z1, Nandan Kanan Road")}<br />
                {t("Bhubaneswar, Khordha 751024")}</dd>
            </div>
            <div>
              <dt className="text-navy-900/50">{t("Web")}</dt>
              <dd className="font-medium">{t("www.jagannathfoundation.charity")}</dd>
            </div>
          </dl>

          <aside
            id="press-media"
            className="press-media mt-10 scroll-mt-28 border-t border-navy-900/15 pt-7"
          >
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-orange-600">
              {t("Press & media")}</p>
            <h2 className="mt-2 font-serif-heading text-2xl font-bold text-navy-950">
              {t("For the press")}</h2>
            <p className="mt-3 text-base leading-7 text-navy-900/70">
              {t("For media queries, interview requests and field visits, contact the secretariat. Please mark your subject line clearly so the right person can respond.")}</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-navy-900/55">{t("Media desk")}</dt>
                <dd className="font-semibold">
                  <a href="mailto:secretariatjagannathfoundation@gmail.com">
                    {t("secretariatjagannathfoundation@gmail.com")}</a>
                </dd>
              </div>
              <div>
                <dt className="text-navy-900/55">{t("Chairman")}</dt>
                <dd className="font-semibold">
                  <a href="mailto:chairman@jagannathfoundation.charity">
                    {t("chairman@jagannathfoundation.charity")}</a>
                  <span className="px-2 text-navy-900/35">·</span>
                  <a href="tel:+919700643333">+91 97006 43333</a>
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-6 text-navy-900/65">
              <span className="font-semibold text-navy-950">
                {t("Suggested subjects:")}</span>{localize(" ")}
              {t("Media query · Interview request · Field visit")}</p>
          </aside>
        </div>

        <Stagger
          as="form"
          onSubmit={handleSubmit}
          className="border border-navy-900/10 rounded-xl p-6 space-y-4"
          gap={0.07}
          distance={16}
        >
          <h2 className="text-xl font-serif-heading font-bold text-navy-950">
            {t("Send a message")}</h2>
          {localize(submitted ? (
            <p className="form-success text-sm text-navy-900" role="status">
              {t("Message received. The Foundation can follow up using your contact details.")}</p>
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
              <Field name="subject" label={t("Subject")} />
              <div>
                <label
                  htmlFor="contact-message"
                  className="text-sm font-medium block mb-1"
                >
                  {t("Message")}</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  maxLength={4000}
                  className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="form-honeypot" aria-hidden="true">
                <label htmlFor="contact-website">{t("Leave this field blank")}</label>
                <input
                  id="contact-website"
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
                {localize(sending ? "Sending…" : "Send message")}
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
        htmlFor={`contact-${name}`}
        className="text-sm font-medium block mb-1"
      >
        {localize(label)}
      </label>
      <input
        id={`contact-${name}`}
        name={name}
        type={type}
        required={required}
        className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}
