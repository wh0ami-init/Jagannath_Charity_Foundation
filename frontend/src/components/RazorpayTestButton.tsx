import { FormEvent, useEffect, useRef, useState } from "react";
import { apiUrl } from "../lib/api";
import Reveal from "./Reveal";
import Stagger from "./Stagger";
import "./DonationCheckout.css";

type CheckoutResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};
type DonorDetails = { name: string; email: string; phone: string; address: string; amount_rupees: number; cause: string };
type DonorField = keyof DonorDetails;
type DonorFieldErrors = Partial<Record<DonorField, string>>;
const donationCauses = ["Education & literacy", "Health & family welfare", "Youth skills & sport", "Women's livelihoods", "Environment & land", "Solar housing & clean energy", "Where most needed"];
type DonationReceipt = {
  status: string; order_id: string; payment_id: string; paid_at: string;
  donor_name: string; donor_email: string; donor_phone: string; donor_address: string;
  amount_paise: number; cause: string; receipt_number: string;
};
type CheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: CheckoutResponse) => void;
  modal: { ondismiss: () => void };
  theme: { color: string };
};
type Checkout = {
  open: () => void;
  on: (event: "payment.failed", handler: () => void) => void;
};
type RazorpayConstructor = new (options: CheckoutOptions) => Checkout;
const checkoutWindow = window as Window & { Razorpay?: RazorpayConstructor };
let checkoutScript: Promise<void> | undefined;

function loadCheckout(): Promise<void> {
  if (checkoutWindow.Razorpay) return Promise.resolve();
  if (!checkoutScript) {
    checkoutScript = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      const timer = window.setTimeout(() => {
        script.remove();
        reject(new Error("Razorpay took too long to load. Please retry."));
      }, 15000);
      script.onload = () => {
        window.clearTimeout(timer);
        if (checkoutWindow.Razorpay) resolve();
        else reject(new Error("Razorpay Checkout could not load."));
      };
      script.onerror = () => {
        window.clearTimeout(timer);
        script.remove();
        reject(new Error("Could not load Razorpay. Check your connection."));
      };
      document.head.appendChild(script);
    }).catch((error: unknown) => {
      checkoutScript = undefined;
      throw error;
    });
  }
  return checkoutScript;
}

async function paymentRequest(path: string, body: unknown) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(typeof data?.detail === "string" ? data.detail : "Payment request failed. Please retry.");
    return data;
  } catch (error) {
    if (controller.signal.aborted) throw new Error("The request timed out. Please retry.");
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

export default function RazorpayTestButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inProgress = useRef(false);
  const [pendingResponse, setPendingResponse] = useState<CheckoutResponse | null>(null);
  const [completed, setCompleted] = useState(false);
  const [donor, setDonor] = useState<DonorDetails>({ name: "", email: "", phone: "", address: "", amount_rupees: 100, cause: "Where most needed" });
  const [code, setCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<DonorFieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<DonorField, boolean>>>({});
  const [donorFormAttempted, setDonorFormAttempted] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);
  const [paymentMode, setPaymentMode] = useState<"test" | "live">("test");
  const [paymentConfigured, setPaymentConfigured] = useState(false);
  const [setupMessage, setSetupMessage] = useState("Checking donation setup…");

  useEffect(() => {
    void fetch(apiUrl("/api/payments/mode")).then(response => response.ok ? response.json() : null)
      .then(result => {
        if (result?.mode === "test" || result?.mode === "live") setPaymentMode(result.mode);
        setPaymentConfigured(result?.configured === true);
        if (!result) setSetupMessage("Could not reach the donation service. Please try again later.");
        else if (!result.payment_configured) setSetupMessage("Razorpay is not configured for the selected mode on the backend.");
        else if (!result.email_configured) setSetupMessage("Email verification needs SMTP settings in the backend environment.");
        else setSetupMessage("");
      })
      .catch(() => setSetupMessage("Could not reach the donation service. Please try again later."));
  }, []);

  useEffect(() => () => {
    document.body.classList.remove("razorpay-checkout-active");
    document.body.classList.remove("donation-email-modal-open");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("donation-email-modal-open", emailModalOpen);
    if (emailModalOpen) window.setTimeout(() => otpInputRef.current?.focus(), 80);
    return () => document.body.classList.remove("donation-email-modal-open");
  }, [emailModalOpen]);

  useEffect(() => {
    if (!emailModalOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setEmailModalOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [emailModalOpen, busy]);

  function validateDonorField(field: DonorField, value: DonorDetails[DonorField]): string {
    const text = String(value).trim();
    if (field === "name") {
      if (!text) return "Please enter your full name.";
      if (text.length < 2) return "Please enter at least 2 characters.";
      if (text.length > 150) return "Your name must be 150 characters or fewer.";
    }
    if (field === "email") {
      if (!text) return "Please enter your email address.";
      if (text.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return "Please enter a valid email address.";
    }
    if (field === "phone") {
      if (!text) return "Please enter your mobile number.";
      const digits = text.replace(/\D/g, "");
      if (!/^[+\d][\d\s().-]*$/.test(text) || digits.length < 10 || digits.length > 15) return "Enter a valid mobile number with 10 to 15 digits.";
    }
    if (field === "address" && text.length > 500) return "Address must be 500 characters or fewer.";
    if (field === "cause" && !donationCauses.includes(text)) return "Please select a donation cause.";
    if (field === "amount_rupees") {
      const amount = Number(value);
      if (!Number.isInteger(amount) || amount < 1 || amount > 1000000) return "Enter an amount between ₹1 and ₹10,00,000.";
      if (paymentMode === "test" && amount !== 100) return "Test Mode donations are fixed at ₹100.";
    }
    return "";
  }

  function validateDonorDetails(): boolean {
    const errors: DonorFieldErrors = {};
    (Object.keys(donor) as DonorField[]).forEach((field) => {
      const errorMessage = validateDonorField(field, donor[field]);
      if (errorMessage) errors[field] = errorMessage;
    });
    setFieldErrors(errors);
    setDonorFormAttempted(true);
    setTouchedFields({ name: true, email: true, phone: true, address: true, cause: true, amount_rupees: true });
    return Object.keys(errors).length === 0;
  }

  function updateDonorField<K extends DonorField>(field: K, value: DonorDetails[K]) {
    setDonor((current) => ({ ...current, [field]: value }));
    if (touchedFields[field] || donorFormAttempted) {
      const errorMessage = validateDonorField(field, value);
      setFieldErrors((current) => ({ ...current, [field]: errorMessage || undefined }));
    }
  }

  function markDonorFieldTouched(field: DonorField) {
    setTouchedFields((current) => ({ ...current, [field]: true }));
    const errorMessage = validateDonorField(field, donor[field]);
    setFieldErrors((current) => ({ ...current, [field]: errorMessage || undefined }));
  }

  const setCheckoutBackdrop = (active: boolean) => {
    document.body.classList.toggle("razorpay-checkout-active", active);
  };

  async function verifyPayment(result: CheckoutResponse) {
    inProgress.current = true;
    setBusy(true);
    setError("");
    setMessage("Checking your payment...");
    try {
      const confirmation = await paymentRequest("/api/payments/verify", result) as DonationReceipt;
      if (confirmation?.status !== "paid" || confirmation.order_id !== result.razorpay_order_id ||
          confirmation.payment_id !== result.razorpay_payment_id) {
        throw new Error("Payment confirmation is still pending.");
      }
      setMessage(`Your ₹${(confirmation.amount_paise / 100).toFixed(2)} donation is confirmed. Thank you!`);
      setReceipt(confirmation);
      setPendingResponse(null);
      setCompleted(true);
    } catch (problem) {
      setMessage(problem instanceof Error && problem.message.startsWith("Payment confirmed")
        ? "Your payment is confirmed, but the receipt email needs to be retried."
        : "Your payment response was received, but confirmation is pending. Check again before making another payment.");
      setError(problem instanceof Error ? problem.message : "Could not confirm the payment.");
    } finally {
      inProgress.current = false;
      setBusy(false);
    }
  }

  async function sendEmailCode() {
    if (!validateDonorDetails()) return;
    setError("");
    setCodeError("");
    setBusy(true);
    try {
      await paymentRequest("/api/payments/email/send-code", donor);
      setEmailSent(true);
      setCode("");
      setEmailModalOpen(true);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Could not send the verification code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyEmail() {
    if (code.length !== 6) {
      setCodeError("Enter the six-digit code from your email.");
      return;
    }
    setCodeError("");
    setBusy(true);
    try {
      const result = await paymentRequest("/api/payments/email/verify-code", { email: donor.email.trim(), code }) as { verification_token: string };
      if (!result?.verification_token) throw new Error("We could not confirm that code. Please request a new one.");
      setVerificationToken(result.verification_token);
      setEmailModalOpen(false);
      setMessage("Email verified. Opening secure checkout…");
      await openPayment(result.verification_token);
    } catch (problem) {
      setCodeError(problem instanceof Error ? problem.message : "Could not verify that code.");
    } finally {
      setBusy(false);
    }
  }

  async function openPayment(token = verificationToken) {
    if (!token) {
      setError("Verify your email before continuing to checkout.");
      return;
    }
    if (inProgress.current) return;
    inProgress.current = true;
    setCheckoutBackdrop(true);
    setBusy(true);
    setMessage("");
    setError("");
    const finish = () => {
      inProgress.current = false;
      setBusy(false);
      setCheckoutBackdrop(false);
    };
    let responded = false;
    try {
      await loadCheckout();
      const order = await paymentRequest("/api/payments/create-order", { verification_token: token });
      const expectedPrefix = order?.mode === "live" ? "rzp_live_" : "rzp_test_";
      if (typeof order?.key_id !== "string" || !order.key_id.startsWith(expectedPrefix) ||
          typeof order.order_id !== "string" || order.amount !== donor.amount_rupees * 100 || order.currency !== "INR") {
        throw new Error("The payment order did not match your verified donation.");
      }
      const Razorpay = checkoutWindow.Razorpay;
      if (!Razorpay) throw new Error("Razorpay Checkout is unavailable.");
      const checkout = new Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "Jagannath Foundation",
        description: `${order.mode === "test" ? "Test donation" : "Donation"} - INR ${donor.amount_rupees}`,
        theme: { color: "#18372f" },
        handler: (response) => {
          responded = true;
          setCheckoutBackdrop(false);
          setPendingResponse(response);
          void verifyPayment(response);
        },
        modal: {
          ondismiss: () => {
            if (!responded) {
              setMessage("Checkout closed. No donation has been confirmed. Verify your email again if you want to retry.");
              setVerificationToken("");
              setEmailSent(false);
              setCode("");
              finish();
            }
          },
        },
      });
      checkout.on("payment.failed", () => {
        setMessage("");
        setError("The payment failed. Retry in Checkout or close it to start again.");
      });
      checkout.open();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Could not open Razorpay Checkout.");
      setVerificationToken("");
      setEmailSent(false);
      setCode("");
      finish();
    }
  }

  function closeEmailModal() {
    if (busy) return;
    setEmailModalOpen(false);
    window.requestAnimationFrame(() => document.getElementById("donation-code-reopen")?.focus());
  }

  function changeDonorEmail() {
    if (busy) return;
    setEmailModalOpen(false);
    setEmailSent(false);
    setVerificationToken("");
    setCode("");
    setCodeError("");
    setMessage("");
    window.requestAnimationFrame(() => document.getElementById("donor-email")?.focus());
  }

  return (
    <section className="wrap pb-16" aria-labelledby="razorpay-test-heading">
      <Reveal as="div" className="donation-checkout-card">
        <div className="donation-checkout-glow" aria-hidden="true" />
        <div className="donation-checkout-copy">
          <span className="donation-checkout-eyebrow">
            <span aria-hidden="true" /> Online giving
          </span>
          <h2>Make your support count.</h2>
          <p>
            Complete a simple, verified donation in three steps. Your details
            stay with this contribution, and the receipt is shown only after
            Razorpay confirms the payment.
          </p>
          <ol className="donation-checkout-steps">
            <li><span>01</span><div><strong>Verify your email</strong><small>Enter the code sent to your inbox.</small></div></li>
            <li><span>02</span><div><strong>Pay with Razorpay</strong><small>Test Mode uses a fixed ₹100 test payment.</small></div></li>
            <li><span>03</span><div><strong>Receive your receipt</strong><small>We show it here after payment confirmation.</small></div></li>
          </ol>
          <div className="donation-checkout-assurance">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3 19 6v5c0 4.8-2.9 8.1-7 10-4.1-1.9-7-5.2-7-10V6l7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Payment is confirmed by the Foundation’s server.</span>
          </div>
        </div>

        <Stagger as="div" className="donation-checkout-panel" gap={0.08} distance={12}>
          <div className="donation-checkout-panel-top">
            <span className="donation-checkout-provider">
              <span className="donation-checkout-provider-mark" aria-hidden="true">J</span>
              Jagannath Foundation
            </span>
            <span className="donation-checkout-test">{paymentMode === "test" ? "Test mode · ₹100" : "Live donations"}</span>
          </div>
          <div>
            <p className="donation-checkout-label">One-time donation</p>
            <h3>Donor details <span>email verification required</span></h3>
            <p className="donation-checkout-disclaimer">
              {paymentMode === "test" ? "Test Mode is fixed at ₹100; the Foundation receives no real money." : "Your payment is processed through the Foundation’s live Razorpay account."}
            </p>
            {!paymentConfigured && <p className="donation-setup-status" role="status">{setupMessage}</p>}
          </div>
          {!completed && <div className="donation-details-form">
            <label className="donation-checkout-label" htmlFor="donor-name">Full name <span className="donation-required">Required</span>
              <input id="donor-name" required maxLength={150} autoComplete="name" disabled={emailSent} value={donor.name} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "donor-name-error" : undefined} onBlur={() => markDonorFieldTouched("name")} onChange={e => updateDonorField("name", e.target.value)} />
              {fieldErrors.name && <small id="donor-name-error" className="donation-field-error" role="alert">{fieldErrors.name}</small>}
            </label>
            <label className="donation-checkout-label" htmlFor="donor-email">Email address <span className="donation-required">Required</span>
              <input id="donor-email" required type="email" maxLength={254} autoComplete="email" disabled={emailSent} value={donor.email} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "donor-email-error" : undefined} onBlur={() => markDonorFieldTouched("email")} onChange={e => updateDonorField("email", e.target.value)} />
              {fieldErrors.email && <small id="donor-email-error" className="donation-field-error" role="alert">{fieldErrors.email}</small>}
            </label>
            <label className="donation-checkout-label" htmlFor="donor-phone">Mobile number <span className="donation-required">Required</span>
              <input id="donor-phone" required type="tel" inputMode="tel" maxLength={40} autoComplete="tel" placeholder="e.g. +91 98765 43210" disabled={emailSent} value={donor.phone} aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "donor-phone-error" : "donor-phone-hint"} onBlur={() => markDonorFieldTouched("phone")} onChange={e => updateDonorField("phone", e.target.value)} />
              {fieldErrors.phone ? <small id="donor-phone-error" className="donation-field-error" role="alert">{fieldErrors.phone}</small> : <small id="donor-phone-hint" className="donation-field-hint">Use 10–15 digits, with country code if needed.</small>}
            </label>
            <label className="donation-checkout-label" htmlFor="donor-address">Address <span className="donation-optional">Optional</span>
              <input id="donor-address" maxLength={500} autoComplete="street-address" disabled={emailSent} value={donor.address} aria-invalid={Boolean(fieldErrors.address)} aria-describedby={fieldErrors.address ? "donor-address-error" : undefined} onBlur={() => markDonorFieldTouched("address")} onChange={e => updateDonorField("address", e.target.value)} />
              {fieldErrors.address && <small id="donor-address-error" className="donation-field-error" role="alert">{fieldErrors.address}</small>}
            </label>
            <label className="donation-checkout-label" htmlFor="donor-cause">Named cause <span className="donation-required">Required</span>
              <select id="donor-cause" required disabled={emailSent} value={donor.cause} aria-invalid={Boolean(fieldErrors.cause)} aria-describedby={fieldErrors.cause ? "donor-cause-error" : undefined} onBlur={() => markDonorFieldTouched("cause")} onChange={e => updateDonorField("cause", e.target.value)}>{donationCauses.map(cause => <option key={cause}>{cause}</option>)}</select>
              {fieldErrors.cause && <small id="donor-cause-error" className="donation-field-error" role="alert">{fieldErrors.cause}</small>}
            </label>
            <label className="donation-checkout-label" htmlFor="donor-amount">Amount in INR <span className="donation-required">Required</span>
              <input id="donor-amount" type="number" min={1} max={1000000} step={1} required value={donor.amount_rupees} disabled={emailSent || paymentMode === "test"} aria-invalid={Boolean(fieldErrors.amount_rupees)} aria-describedby={fieldErrors.amount_rupees ? "donor-amount-error" : paymentMode === "test" ? "donor-amount-hint" : undefined} onBlur={() => markDonorFieldTouched("amount_rupees")} onChange={e => updateDonorField("amount_rupees", Number(e.target.value))} />
              {fieldErrors.amount_rupees ? <small id="donor-amount-error" className="donation-field-error" role="alert">{fieldErrors.amount_rupees}</small> : paymentMode === "test" ? <small id="donor-amount-hint" className="donation-field-hint">Fixed at ₹100 while Razorpay is in Test Mode.</small> : null}
            </label>
            {!emailSent && <button type="button" disabled={busy || !paymentConfigured} onClick={() => void sendEmailCode()} className="donation-checkout-button">Send email verification code</button>}
            {emailSent && !verificationToken && <div className="donation-code-sent-inline" role="status">
              <span>A code was sent to <strong>{donor.email}</strong>.</span>
              <button id="donation-code-reopen" type="button" disabled={busy} onClick={() => { setCodeError(""); setEmailModalOpen(true); }} className="donation-link-button">Enter verification code</button>
            </div>}
            {verificationToken && <button type="button" disabled={busy || !!pendingResponse} onClick={() => void openPayment(verificationToken)} className="donation-checkout-button">{busy ? "Payment in progress…" : "Continue to Razorpay Checkout"}</button>}
          </div>}
          {receipt && <div className="donation-receipt" id="donation-receipt">
            <p className="donation-checkout-label">Payment confirmed</p><h3>Donation receipt</h3>
            <p><strong>{receipt.receipt_number}</strong><br />{receipt.donor_name}<br />{receipt.donor_email}<br />{receipt.donor_phone}<br />{receipt.donor_address}</p>
            <p><strong>₹{(receipt.amount_paise / 100).toFixed(2)}</strong> · {receipt.cause}<br />Paid: {new Date(receipt.paid_at).toLocaleString()}<br />Payment reference: {receipt.payment_id}</p>
            <p className="donation-checkout-disclaimer">This confirms a payment received. It is not a tax exemption certificate.</p>
            <button type="button" onClick={() => window.print()} className="donation-checkout-button">Print or save receipt</button>
          </div>}
          {pendingResponse && !busy && (
            <button
              type="button"
              onClick={() => void verifyPayment(pendingResponse)}
              className="donation-checkout-retry"
            >
              Check payment status again
            </button>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p className="donation-checkout-status" role="status">{message}</p>}
          <p className="donation-checkout-footnote">
            Secure checkout opens in a Razorpay popup.
          </p>
        </Stagger>
      </Reveal>
      {emailModalOpen && <div className="donation-email-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) closeEmailModal(); }}>
        <section className="donation-email-modal" role="dialog" aria-modal="true" aria-labelledby="donation-email-modal-title" aria-describedby="donation-email-modal-copy" onKeyDown={event => {
          if (event.key !== "Tab") return;
          const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled)"));
          if (!focusable.length) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }}>
          <button type="button" className="donation-email-modal-close" aria-label="Close email verification" disabled={busy} onClick={closeEmailModal}>×</button>
          <div className="donation-email-modal-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M3.5 6.5h17v12h-17z"/><path d="m4 7 8 6 8-6"/></svg>
          </div>
          <p className="donation-email-modal-eyebrow">Email sent</p>
          <h2 id="donation-email-modal-title">Check your inbox</h2>
          <p id="donation-email-modal-copy" className="donation-email-modal-copy">We sent a six-digit code to <strong>{donor.email}</strong>. Enter it here to verify your email and continue to secure payment.</p>
          <form className="donation-otp-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void verifyEmail(); }}>
            <label htmlFor="donation-email-otp">Verification code</label>
            <input ref={otpInputRef} id="donation-email-otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="Enter 6 digits" value={code} aria-invalid={Boolean(codeError)} aria-describedby={codeError ? "donation-otp-error" : "donation-otp-help"} onChange={event => { setCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setCodeError(""); }} />
            {codeError ? <p id="donation-otp-error" className="donation-otp-error" role="alert">{codeError}</p> : <p id="donation-otp-help" className="donation-otp-help">The code expires in 10 minutes.</p>}
            <button type="submit" className="donation-checkout-button" disabled={busy || code.length !== 6}>{busy ? "Verifying email…" : "Verify & continue to payment"}</button>
          </form>
          <div className="donation-email-modal-actions">
            <button type="button" disabled={busy} onClick={() => void sendEmailCode()}>Resend code</button>
            <button type="button" disabled={busy} onClick={changeDonorEmail}>Change email</button>
          </div>
        </section>
      </div>}
    </section>
  );
}
