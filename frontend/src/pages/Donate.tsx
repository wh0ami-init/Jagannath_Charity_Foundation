import { useEffect, useRef, useState, FormEvent } from "react";
import gsap from "gsap";
import { Link } from "wouter";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { submissionPayload, submitForm } from "../lib/api";
import Stagger from "../components/Stagger";
import RazorpayTestButton from "../components/RazorpayTestButton";
import MonthlyAutoPay from "../components/MonthlyAutoPay";
import { useDonateMotion } from "../lib/useDonateMotion";
import "./donate.css";

const causes = [
  "Education & literacy",
  "Health & family welfare",
  "Youth skills & sport",
  "Women's livelihoods",
  "Environment & land",
  "Solar housing & clean energy",
  "Where most needed",
];

const bankRows: [string, string, boolean?][] = [
  ["Account name", "Jagannath Foundation", true],
  ["Bank", "Yes Bank · Savings account"],
  ["Account number", "121494600000139", true],
  ["IFSC", "YESB0001214", true],
  ["PAN", "AAFTJ8006Q", true],
  ["Provisional registration u/s 12A", "URN AAFTJ8006QE20261"],
  [
    "Provisional approval u/s 80G",
    "URN AAFTJ8006QF20261 · Form 10G dated 07-09-2026 · valid TY 2026-27 to TY 2028-29",
  ],
];

export default function Donate() {
  const page = useRef<HTMLDivElement>(null);
  useDonateMotion(page);

  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!submitted || !page.current) return;
    const note = page.current.querySelector(".form-success");
    if (!note || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    gsap.fromTo(
      note,
      { autoAlpha: 0, y: 14, scale: 0.97 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: "back.out(1.6)",
        clearProps: "all",
      },
    );
  }, [submitted]);

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
        eyebrow="Donate"
        title="Choose how you’d like to support the Foundation."
        description="Make a one-time contribution, arrange a bank transfer, record a pledge or set up an optional monthly AutoPay mandate. All income is applied only to the objects of the trust."
      />

      <div ref={page}>
        <section
          className="donation-choice-section wrap"
          aria-labelledby="donation-choice-title"
        >
          <Reveal className="donation-choice-heading" delay={0.02}>
            <p className="donation-section-eyebrow">Ways to support</p>
            <h2 id="donation-choice-title">
              Choose how you’d like to contribute.
            </h2>
            <p>
              Choose a one-time gift or authorize an optional monthly UPI or
              card mandate through Razorpay.
            </p>
          </Reveal>
          <Stagger className="donation-choice-grid" gap={0.12} distance={24}>
            <a
              className="donation-choice-card donation-choice-card--once"
              href="#one-time"
            >
              <span className="donation-choice-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <path d="M16 3.5 19.8 12l8.7 1-6.5 6 1.8 8.5L16 23l-7.8 4.5L10 19l-6.5-6 8.7-1L16 3.5Z" />
                </svg>
              </span>
              <span className="donation-choice-label">
                One-time contribution
              </span>
              <h3>Give once</h3>
              <p>
                Use bank transfer, secure one-time checkout or record a pledge.
                The checkout amount follows the active Razorpay mode.
              </p>
              <span className="donation-choice-link">
                Explore one-time giving <span aria-hidden="true">→</span>
              </span>
            </a>
            <a
              className="donation-choice-card donation-choice-card--monthly"
              href="#monthly-autopay"
            >
              <span className="donation-choice-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <rect x="4.5" y="7" width="23" height="21" rx="3" />
                  <path d="M10 3.5v7M22 3.5v7M5 13h22M11 19h4m-4 4h10" />
                </svg>
              </span>
              <span className="donation-choice-label">
                Recurring contribution
              </span>
              <h3>Give monthly with AutoPay</h3>
              <p>
                Set up an optional monthly UPI or card mandate through
                Razorpay. A one-time contribution never starts recurring
                payments.
              </p>
              <span className="donation-choice-link">
                Explore monthly giving <span aria-hidden="true">→</span>
              </span>
            </a>
          </Stagger>
        </section>

        <section
          id="one-time"
          className="donation-flow-section"
          aria-labelledby="one-time-title"
        >
          <header className="donation-section-heading wrap">
            <p className="donation-section-eyebrow">One-time contribution</p>
            <h2 id="one-time-title">Give once, in the way that suits you.</h2>
            <p>
              Use a bank transfer or Razorpay checkout for a contribution. The
              pledge form records interest only; it does not collect payment.
            </p>
          </header>
          <RazorpayTestButton />
          <Reveal as="div" className="wrap py-16 grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-xl font-serif-heading font-bold text-navy-950 mb-3">
                Transfer directly
              </h2>
              <p className="text-sm text-navy-900/70 mb-5">
                Use these details for NEFT, RTGS or IMPS. Please email the
                office after you transfer so a receipt can be issued against the
                named cause.
              </p>
              <dl className="bank-details space-y-3 text-sm border border-navy-900/10 rounded-xl p-5">
                {bankRows.map(([k, v, copyable]) => (
                  <div
                    key={k}
                    className="bank-row flex flex-col sm:flex-row sm:justify-between gap-1"
                  >
                    <dt className="text-navy-900/50">{k}</dt>
                    <dd className="font-medium text-navy-950 sm:text-right flex flex-wrap items-center gap-y-1 sm:justify-end">
                      <span className="break-all">{v}</span>
                      {copyable && <CopyValue value={v} label={k} />}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-navy-900/50 mt-4">
                Write to chairman@jagannathfoundation.charity or
                secretariatjagannathfoundation@gmail.com after you transfer so
                the gift can be receipted.
              </p>
            </div>

            <Stagger
              as="form"
              onSubmit={handleSubmit}
              className="border border-navy-900/10 rounded-xl p-6 space-y-4"
              gap={0.07}
              distance={16}
            >
              <h2 className="text-xl font-serif-heading font-bold text-navy-950">
                Record my pledge
              </h2>
              <p className="text-xs text-navy-900/50">
                This records an expression of interest only. No payment or PAN
                details are collected here.
              </p>
              {submitted ? (
                <p className="form-success text-sm text-navy-900" role="status">
                  Your pledge note is recorded. No payment was made; the
                  Foundation can follow up using your contact details.
                </p>
              ) : (
                <>
                  {error && (
                    <p className="form-error" role="alert">
                      {error}
                    </p>
                  )}
                  <Field name="name" label="Full name" required />
                  <Field name="email" label="Email" type="email" required />
                  <Field name="phone" label="Phone" type="tel" />
                  <Field
                    name="amount"
                    label="Pledge amount (INR)"
                    type="number"
                  />
                  <div>
                    <label
                      htmlFor="pledge-cause"
                      className="text-sm font-medium block mb-1"
                    >
                      Named cause
                    </label>
                    <select
                      id="pledge-cause"
                      name="cause"
                      className="w-full border border-navy-900/20 rounded-lg px-3 py-2 text-sm"
                    >
                      {causes.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-honeypot" aria-hidden="true">
                    <label htmlFor="pledge-website">
                      Leave this field blank
                    </label>
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
                      I consent to Jagannath Foundation using these details to
                      follow up on my pledge.
                    </span>
                  </label>
                  <p className="text-xs text-navy-900/60">
                    Read our{" "}
                    <Link className="underline" href="/privacy-policy">
                      privacy policy
                    </Link>
                    .
                  </p>
                  <button
                    type="submit"
                    disabled={sending}
                    className="bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white px-5 py-2 rounded-full text-sm font-semibold"
                  >
                    {sending ? "Saving…" : "Record my pledge"}
                  </button>
                </>
              )}
            </Stagger>
          </Reveal>
        </section>

        <section
          id="monthly-autopay"
          className="monthly-autopay-section"
          aria-labelledby="monthly-autopay-title"
        >
          <div className="wrap py-16">
            <Reveal
              className="monthly-autopay-card"
              delay={0.04}
              direction="up"
            >
              <MonthlyAutoPay />
            </Reveal>
          </div>
        </section>
      </div>
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
        htmlFor={`pledge-${name}`}
        className="text-sm font-medium block mb-1"
      >
        {label}
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

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    if (button.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        button.current,
        { scale: 0.86 },
        { scale: 1, duration: 0.55, ease: "back.out(3)", clearProps: "transform" },
      );
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        className="copy-chip"
        data-copied={copied}
        aria-label={`Copy ${label}`}
        onClick={() => void copy()}
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
      <span className="sr-only" role="status">
        {copied ? `${label} copied to clipboard` : ""}
      </span>
    </>
  );
}
