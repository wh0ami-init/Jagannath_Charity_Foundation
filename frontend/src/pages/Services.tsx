import { FormEvent, useState } from "react";
import { Link } from "wouter";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { submissionPayload, submitForm } from "../lib/api";
import Stagger from "../components/Stagger";
import SplitHeading from "../components/SplitHeading";
import { scrollToElement } from "../lib/scroll";

const services = [
  {
    title: "Membership",
    group: "Join",
    text: "Ask about membership, registration, member records and ID cards.",
  },
  {
    title: "Beneficiary support",
    group: "Get support",
    text: "Contact the Foundation about programme eligibility and beneficiary assistance.",
  },
  {
    title: "Internships & careers",
    group: "Opportunities",
    text: "Enquire about internships, vacancies, certificates or application letters.",
  },
  {
    title: "Complaints & feedback",
    group: "Get help",
    text: "Send a complaint or ask the team to follow up on an existing concern.",
  },
  {
    title: "Donor services",
    group: "Give",
    text: "Ask about donation receipts, recurring giving or a previous contribution.",
  },
  {
    title: "Projects & events",
    group: "Explore",
    text: "Request details about campaigns, events, project updates or activity records.",
  },
  {
    title: "Verification requests",
    group: "Records",
    text: "Request help with member, internship or certificate verification.",
  },
  {
    title: "Foundation directory",
    group: "Records",
    text: "Ask for information about the management body, general members or advisors.",
  },
];

export default function Services() {
  const [service, setService] = useState(services[0].title);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSending(true);
    try {
      const payload = submissionPayload(event.currentTarget, "service");
      payload.subject = service;
      await submitForm(payload);
      setSubmitted(true);
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "Your request could not be saved.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout hideNewsletter>
      <PageHero
        theme="volunteer"
        motif="services"
        eyebrow="Community portal"
        title="One place to reach the Foundation."
        description="Membership, programme support, opportunities, donor questions and records requests all come to the Foundation’s service desk."
      />

      <section className="wrap py-14" aria-labelledby="service-list-title">
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow">
            <span />
            Services
          </p>
          <SplitHeading
            as="h2"
            id="service-list-title"
            className="mt-3 font-serif-heading text-4xl font-bold text-navy-950"
          >
            What can we help with?
          </SplitHeading>
          <p className="mt-3 text-sm leading-7 text-navy-900/70">
            Choose a service to start a request. The Foundation team will follow
            up using the contact details you provide.
          </p>
        </div>
        <Stagger
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          gap={0.09}
          distance={26}
        >
          {services.map((item) => (
            <article
              key={item.title}
              className="flex min-h-52 flex-col rounded-xl border border-navy-900/10 bg-white/55 p-5"
            >
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-orange-600">
                {item.group}
              </p>
              <h3 className="mt-3 font-serif-heading text-2xl font-bold text-navy-950">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-navy-900/65">
                {item.text}
              </p>
              <button
                type="button"
                onClick={() => {
                  setService(item.title);
                  const form = document.getElementById("request-form");
                  if (form) scrollToElement(form, "top 100px");
                }}
                className="mt-4 self-start text-sm font-semibold text-navy-800 underline decoration-orange-400 underline-offset-4"
              >
                Make a request ↗
              </button>
            </article>
          ))}
        </Stagger>
      </section>

      <Reveal
        as="section"
        id="request-form"
        className="wrap scroll-mt-24 pb-16"
      >
        <div className="grid gap-10 rounded-2xl border border-navy-900/10 bg-white/45 p-6 sm:p-9 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">
              <span />
              Service desk
            </p>
            <SplitHeading
              as="h2"
              className="mt-3 font-serif-heading text-4xl font-bold text-navy-950"
            >
              Send a request.
            </SplitHeading>
            <p className="mt-4 text-sm leading-7 text-navy-900/70">
              This form records a request for the Foundation team. It does not
              create an account, issue a certificate, verify a record or process
              a payment. For donations, use the Foundation’s existing{" "}
              <Link className="font-semibold underline" href="/donate">
                donation information
              </Link>
              .
            </p>
            <p className="mt-4 text-sm text-navy-900/70">
              For urgent or sensitive matters, contact{" "}
              <a
                className="font-semibold underline"
                href="mailto:secretariatjagannathfoundation@gmail.com"
              >
                the secretariat
              </a>{" "}
              directly.
            </p>
          </div>

          <Stagger
            as="form"
            onSubmit={handleSubmit}
            className="space-y-4"
            gap={0.07}
            distance={16}
          >
            <h3 className="font-serif-heading text-2xl font-bold text-navy-950">
              Request details
            </h3>
            {submitted ? (
              <p className="form-success text-sm" role="status">
                Your {service.toLowerCase()} request has been recorded. The
                Foundation can follow up using your contact details.
              </p>
            ) : (
              <>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <div>
                  <label
                    htmlFor="service-type"
                    className="mb-1 block text-sm font-medium"
                  >
                    Service
                  </label>
                  <select
                    id="service-type"
                    value={service}
                    onChange={(event) => setService(event.target.value)}
                    className="w-full rounded-lg border border-navy-900/20 bg-white px-3 py-2 text-sm"
                  >
                    {services.map((item) => (
                      <option key={item.title}>{item.title}</option>
                    ))}
                  </select>
                </div>
                <Field name="name" label="Full name" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field name="email" label="Email" type="email" required />
                  <Field name="phone" label="Phone" type="tel" />
                </div>
                <Field name="district" label="District / city" />
                <div>
                  <label
                    htmlFor="service-message"
                    className="mb-1 block text-sm font-medium"
                  >
                    How can we help?
                  </label>
                  <textarea
                    id="service-message"
                    name="message"
                    rows={4}
                    maxLength={4000}
                    required
                    className="w-full rounded-lg border border-navy-900/20 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="form-honeypot" aria-hidden="true">
                  <label htmlFor="service-website">
                    Leave this field blank
                  </label>
                  <input
                    id="service-website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <label className="flex gap-2 text-xs leading-5 text-navy-900/70">
                  <input
                    name="consent"
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I consent to the Foundation using these details to respond
                    to this request. See the{" "}
                    <Link className="underline" href="/privacy-policy">
                      privacy policy
                    </Link>
                    .
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Send request"}
                </button>
              </>
            )}
          </Stagger>
        </div>
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
  return (
    <div>
      <label
        htmlFor={`service-${name}`}
        className="mb-1 block text-sm font-medium"
      >
        {label}
      </label>
      <input
        id={`service-${name}`}
        name={name}
        type={type}
        required={required}
        maxLength={type === "email" ? 254 : 150}
        className="w-full rounded-lg border border-navy-900/20 bg-white px-3 py-2 text-sm"
      />
    </div>
  );
}
