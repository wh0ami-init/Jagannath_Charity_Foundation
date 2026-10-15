import { useEffect, useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { apiUrl } from "../lib/api";
import {
  loadRazorpayCheckout,
  type RazorpayCheckoutResponse,
} from "../lib/razorpay";
import {
  DONATION_CAUSES,
  validateDonationField,
} from "../lib/donationValidation";
import Reveal from "./Reveal";
import Stagger from "./Stagger";
import "./DonationCheckout.css";

type CheckoutResponse = RazorpayCheckoutResponse & {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};
type DonorDetails = {
  name: string;
  email: string;
  phone: string;
  address: string;
  amount_rupees: number;
  cause: string;
};
type DonorField = keyof DonorDetails;
type DonorFieldErrors = Partial<Record<DonorField, string>>;
type DonationReceipt = {
  status: string;
  order_id: string;
  payment_id: string;
  paid_at: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  donor_address: string;
  amount_paise: number;
  cause: string;
  receipt_number: string;
};
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
    if (!response.ok)
      throw new Error(
        typeof data?.detail === "string"
          ? data.detail
          : "Payment request failed. Please retry.",
      );
    return data;
  } catch (error) {
    if (controller.signal.aborted)
      throw new Error("The request timed out. Please retry.");
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
  const [pendingResponse, setPendingResponse] =
    useState<CheckoutResponse | null>(null);
  const [completed, setCompleted] = useState(false);
  const [donor, setDonor] = useState<DonorDetails>({
    name: "",
    email: "",
    phone: "",
    address: "",
    amount_rupees: 100,
    cause: "Where most needed",
  });
  const [fieldErrors, setFieldErrors] = useState<DonorFieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<DonorField, boolean>>
  >({});
  const [donorFormAttempted, setDonorFormAttempted] = useState(false);
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);
  const [paymentMode, setPaymentMode] = useState<"test" | "live">("test");
  const [paymentConfigured, setPaymentConfigured] = useState(false);
  const [setupMessage, setSetupMessage] = useState("Checking donation setup…");

  const receiptRef = useRef<HTMLDivElement>(null);

  // Success moment: card rises in, check mark draws itself, lines cascade.
  useGSAP(
    () => {
      const el = receiptRef.current;
      if (!el || !receipt) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const svg = el.querySelector(".donation-receipt-check");
      const ring = el.querySelector(".donation-receipt-ring");
      const tick = el.querySelector(".donation-receipt-tick");
      const rest = Array.from(el.children).slice(1);
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(el, {
          autoAlpha: 0,
          y: 24,
          scale: 0.97,
          duration: 0.7,
          clearProps: "opacity,visibility,transform",
        })
        .fromTo(
          ring,
          { strokeDashoffset: 151 },
          { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" },
          "-=0.3",
        )
        .fromTo(
          tick,
          { strokeDashoffset: 40 },
          { strokeDashoffset: 0, duration: 0.45 },
          "-=0.15",
        )
        .fromTo(
          svg,
          { scale: 0.9 },
          {
            scale: 1,
            duration: 0.5,
            ease: "back.out(3)",
            clearProps: "transform",
          },
          "<",
        )
        .from(
          rest,
          {
            autoAlpha: 0,
            y: 12,
            stagger: 0.07,
            duration: 0.5,
            clearProps: "opacity,visibility,transform",
          },
          "-=0.4",
        );
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    { dependencies: [receipt], scope: receiptRef },
  );

  useEffect(() => {
    void fetch(apiUrl("/api/payments/mode"))
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => {
        if (result?.mode === "test" || result?.mode === "live")
          setPaymentMode(result.mode);
        setPaymentConfigured(result?.configured === true);
        if (!result)
          setSetupMessage(
            "Could not reach the donation service. Please try again later.",
          );
        else if (!result.payment_configured)
          setSetupMessage(
            "Razorpay is not configured for the selected mode on the backend.",
          );
        else setSetupMessage("");
      })
      .catch(() =>
        setSetupMessage(
          "Could not reach the donation service. Please try again later.",
        ),
      );
  }, []);

  useEffect(
    () => () => {
      document.body.classList.remove("razorpay-checkout-active");
    },
    [],
  );

  function validateDonorField(
    field: DonorField,
    value: DonorDetails[DonorField],
  ): string {
    return validateDonationField(field, value, paymentMode);
  }

  function validateDonorDetails(): boolean {
    const errors: DonorFieldErrors = {};
    (Object.keys(donor) as DonorField[]).forEach((field) => {
      const errorMessage = validateDonorField(field, donor[field]);
      if (errorMessage) errors[field] = errorMessage;
    });
    setFieldErrors(errors);
    setDonorFormAttempted(true);
    setTouchedFields({
      name: true,
      email: true,
      phone: true,
      address: true,
      cause: true,
      amount_rupees: true,
    });
    return Object.keys(errors).length === 0;
  }

  function updateDonorField<K extends DonorField>(
    field: K,
    value: DonorDetails[K],
  ) {
    setDonor((current) => ({ ...current, [field]: value }));
    if (touchedFields[field] || donorFormAttempted) {
      const errorMessage = validateDonorField(field, value);
      setFieldErrors((current) => ({
        ...current,
        [field]: errorMessage || undefined,
      }));
    }
  }

  function markDonorFieldTouched(field: DonorField) {
    setTouchedFields((current) => ({ ...current, [field]: true }));
    const errorMessage = validateDonorField(field, donor[field]);
    setFieldErrors((current) => ({
      ...current,
      [field]: errorMessage || undefined,
    }));
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
      const confirmation = (await paymentRequest(
        "/api/payments/verify",
        result,
      )) as DonationReceipt;
      if (
        confirmation?.status !== "paid" ||
        confirmation.order_id !== result.razorpay_order_id ||
        confirmation.payment_id !== result.razorpay_payment_id
      ) {
        throw new Error("Payment confirmation is still pending.");
      }
      setMessage(
        `Your ₹${(confirmation.amount_paise / 100).toFixed(2)} donation is confirmed. Thank you!`,
      );
      setReceipt(confirmation);
      setPendingResponse(null);
      setCompleted(true);
    } catch (problem) {
      setMessage(
        "Your payment response was received, but confirmation is pending. Check again before making another payment.",
      );
      setError(
        problem instanceof Error
          ? problem.message
          : "Could not confirm the payment.",
      );
    } finally {
      inProgress.current = false;
      setBusy(false);
    }
  }

  async function openPayment() {
    if (!validateDonorDetails()) return;
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
      await loadRazorpayCheckout();
      const donorDetails = {
        ...donor,
        name: donor.name.trim(),
        email: donor.email.trim(),
        phone: donor.phone.trim(),
        address: donor.address.trim(),
      };
      const order = await paymentRequest(
        "/api/payments/create-order",
        donorDetails,
      );
      const expectedPrefix = order?.mode === "live" ? "rzp_live_" : "rzp_test_";
      if (
        typeof order?.key_id !== "string" ||
        !order.key_id.startsWith(expectedPrefix) ||
        typeof order.order_id !== "string" ||
        order.amount !== donor.amount_rupees * 100 ||
        order.currency !== "INR"
      ) {
        throw new Error(
          "The payment order did not match your donation details.",
        );
      }
      const Razorpay = window.Razorpay;
      if (!Razorpay) throw new Error("Razorpay Checkout is unavailable.");
      const checkout = new Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "Jagannath Foundation",
        description: `${order.mode === "test" ? "Test donation" : "Donation"} - INR ${donor.amount_rupees}`,
        prefill: {
          name: donorDetails.name,
          email: donorDetails.email,
          contact: donorDetails.phone,
        },
        theme: { color: "#18372f" },
        handler: (response) => {
          if (!response.razorpay_order_id) {
            setError(
              "Razorpay returned an incomplete payment response. Please contact the Foundation before retrying.",
            );
            finish();
            return;
          }
          responded = true;
          setCheckoutBackdrop(false);
          const paymentResponse = response as CheckoutResponse;
          setPendingResponse(paymentResponse);
          void verifyPayment(paymentResponse);
        },
        modal: {
          ondismiss: () => {
            if (!responded) {
              setMessage(
                "Checkout closed. No donation has been confirmed. You can retry when you’re ready.",
              );
              finish();
            }
          },
        },
      });
      checkout.on("payment.failed", () => {
        setMessage("");
        setError(
          "The payment failed. Retry in Checkout or close it to start again.",
        );
      });
      checkout.open();
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "Could not open Razorpay Checkout.",
      );
      finish();
    }
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
            Complete a secure one-time donation in three steps. Your details
            stay with this contribution, and the receipt is shown only after
            Razorpay confirms the payment.
          </p>
          <ol className="donation-checkout-steps">
            <li>
              <span>01</span>
              <div>
                <strong>Enter your details</strong>
                <small>
                  We use them to identify and receipt your contribution.
                </small>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Pay with Razorpay</strong>
                <small>
                  {paymentMode === "test"
                    ? "Test Mode uses a fixed ₹100 test payment."
                    : "Choose your amount and pay through the Foundation’s live Razorpay account."}
                </small>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>View your receipt</strong>
                <small>
                  It appears here after Razorpay confirms the payment.
                </small>
              </div>
            </li>
          </ol>
          <div className="donation-checkout-assurance">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3 19 6v5c0 4.8-2.9 8.1-7 10-4.1-1.9-7-5.2-7-10V6l7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Payment is confirmed by the Foundation’s server.</span>
          </div>
        </div>

        <Stagger
          as="div"
          className="donation-checkout-panel"
          gap={0.08}
          distance={12}
        >
          <div className="donation-checkout-panel-top">
            <span className="donation-checkout-provider">
              <span
                className="donation-checkout-provider-mark"
                aria-hidden="true"
              >
                J
              </span>
              Jagannath Foundation
            </span>
            <span className="donation-checkout-test">
              {paymentMode === "test" ? "Test mode · ₹100" : "Live donations"}
            </span>
          </div>
          <div>
            <p className="donation-checkout-label">One-time donation</p>
            <h3>
              Donor Details <span>one-time donation</span>
            </h3>
            <p className="donation-checkout-disclaimer">
              {paymentMode === "test"
                ? "Test Mode is fixed at ₹100; the Foundation receives no real money."
                : "Your payment is processed through the Foundation’s live Razorpay account."}
            </p>
            {!paymentConfigured && (
              <p className="donation-setup-status" role="status">
                {setupMessage}
              </p>
            )}
          </div>
          {!completed && (
            <div className="donation-details-form">
              <label className="donation-checkout-label" htmlFor="donor-name">
                Full name <span className="donation-required">Required</span>
                <input
                  id="donor-name"
                  required
                  maxLength={150}
                  autoComplete="name"
                  value={donor.name}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={
                    fieldErrors.name ? "donor-name-error" : undefined
                  }
                  onBlur={() => markDonorFieldTouched("name")}
                  onChange={(e) => updateDonorField("name", e.target.value)}
                />
                {fieldErrors.name && (
                  <small
                    id="donor-name-error"
                    className="donation-field-error"
                    role="alert"
                  >
                    {fieldErrors.name}
                  </small>
                )}
              </label>
              <label className="donation-checkout-label" htmlFor="donor-email">
                Email address{" "}
                <span className="donation-required">Required</span>
                <input
                  id="donor-email"
                  required
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  value={donor.email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "donor-email-error" : undefined
                  }
                  onBlur={() => markDonorFieldTouched("email")}
                  onChange={(e) => updateDonorField("email", e.target.value)}
                />
                {fieldErrors.email && (
                  <small
                    id="donor-email-error"
                    className="donation-field-error"
                    role="alert"
                  >
                    {fieldErrors.email}
                  </small>
                )}
              </label>
              <label className="donation-checkout-label" htmlFor="donor-phone">
                Mobile number{" "}
                <span className="donation-required">Required</span>
                <input
                  id="donor-phone"
                  required
                  type="tel"
                  inputMode="tel"
                  maxLength={40}
                  autoComplete="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={donor.phone}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={
                    fieldErrors.phone ? "donor-phone-error" : "donor-phone-hint"
                  }
                  onBlur={() => markDonorFieldTouched("phone")}
                  onChange={(e) => updateDonorField("phone", e.target.value)}
                />
                {fieldErrors.phone ? (
                  <small
                    id="donor-phone-error"
                    className="donation-field-error"
                    role="alert"
                  >
                    {fieldErrors.phone}
                  </small>
                ) : (
                  <small id="donor-phone-hint" className="donation-field-hint">
                    Use 10–15 digits, with country code if needed.
                  </small>
                )}
              </label>
              <label
                className="donation-checkout-label"
                htmlFor="donor-address"
              >
                Address <span className="donation-optional">Optional</span>
                <input
                  id="donor-address"
                  maxLength={500}
                  autoComplete="street-address"
                  value={donor.address}
                  aria-invalid={Boolean(fieldErrors.address)}
                  aria-describedby={
                    fieldErrors.address ? "donor-address-error" : undefined
                  }
                  onBlur={() => markDonorFieldTouched("address")}
                  onChange={(e) => updateDonorField("address", e.target.value)}
                />
                {fieldErrors.address && (
                  <small
                    id="donor-address-error"
                    className="donation-field-error"
                    role="alert"
                  >
                    {fieldErrors.address}
                  </small>
                )}
              </label>
              <label className="donation-checkout-label" htmlFor="donor-cause">
                Named cause <span className="donation-required">Required</span>
                <select
                  id="donor-cause"
                  required
                  value={donor.cause}
                  aria-invalid={Boolean(fieldErrors.cause)}
                  aria-describedby={
                    fieldErrors.cause ? "donor-cause-error" : undefined
                  }
                  onBlur={() => markDonorFieldTouched("cause")}
                  onChange={(e) => updateDonorField("cause", e.target.value)}
                >
                  {DONATION_CAUSES.map((cause) => (
                    <option key={cause}>{cause}</option>
                  ))}
                </select>
                {fieldErrors.cause && (
                  <small
                    id="donor-cause-error"
                    className="donation-field-error"
                    role="alert"
                  >
                    {fieldErrors.cause}
                  </small>
                )}
              </label>
              <label className="donation-checkout-label" htmlFor="donor-amount">
                Amount in INR{" "}
                <span className="donation-required">Required</span>
                <input
                  id="donor-amount"
                  type="number"
                  min={1}
                  max={1000000}
                  step={1}
                  required
                  value={donor.amount_rupees}
                  disabled={paymentMode === "test"}
                  aria-invalid={Boolean(fieldErrors.amount_rupees)}
                  aria-describedby={
                    fieldErrors.amount_rupees
                      ? "donor-amount-error"
                      : paymentMode === "test"
                        ? "donor-amount-hint"
                        : undefined
                  }
                  onBlur={() => markDonorFieldTouched("amount_rupees")}
                  onChange={(e) =>
                    updateDonorField("amount_rupees", Number(e.target.value))
                  }
                />
                {fieldErrors.amount_rupees ? (
                  <small
                    id="donor-amount-error"
                    className="donation-field-error"
                    role="alert"
                  >
                    {fieldErrors.amount_rupees}
                  </small>
                ) : paymentMode === "test" ? (
                  <small id="donor-amount-hint" className="donation-field-hint">
                    Fixed at ₹100 while Razorpay is in Test Mode.
                  </small>
                ) : null}
              </label>
              <button
                type="button"
                aria-busy={busy}
                disabled={busy || !paymentConfigured || !!pendingResponse}
                onClick={() => void openPayment()}
                className="donation-checkout-button"
              >
                {busy
                  ? "Preparing secure checkout…"
                  : "Continue to Razorpay Checkout"}
              </button>
            </div>
          )}
          {receipt && (
            <div className="donation-receipt" id="donation-receipt">
              <svg
                className="donation-receipt-check"
                viewBox="0 0 52 52"
                aria-hidden="true"
              >
                <circle
                  className="donation-receipt-ring"
                  cx="26"
                  cy="26"
                  r="24"
                />
                <path className="donation-receipt-tick" d="m15 27 8 8 15-17" />
              </svg>

              <p className="donation-checkout-label">Payment confirmed</p>
              <h3>Donation receipt</h3>
              <p>
                <strong>{receipt.receipt_number}</strong>
                <br />
                {receipt.donor_name}
                <br />
                {receipt.donor_email}
                <br />
                {receipt.donor_phone}
                <br />
                {receipt.donor_address}
              </p>
              <p>
                <strong>₹{(receipt.amount_paise / 100).toFixed(2)}</strong> ·{" "}
                {receipt.cause}
                <br />
                Paid: {new Date(receipt.paid_at).toLocaleString()}
                <br />
                Payment reference: {receipt.payment_id}
              </p>
              <p className="donation-checkout-disclaimer">
                This confirms a payment received. It is not a tax exemption
                certificate.
              </p>
              <button
                type="button"
                onClick={() => window.print()}
                className="donation-checkout-button"
              >
                Print or save receipt
              </button>
            </div>
          )}
          {pendingResponse && !busy && (
            <button
              type="button"
              onClick={() => void verifyPayment(pendingResponse)}
              className="donation-checkout-retry"
            >
              Check payment status again
            </button>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="donation-checkout-status" role="status">
              {message}
            </p>
          )}
          <p className="donation-checkout-footnote">
            Secure checkout opens in a Razorpay popup. Please enter your email
            carefully so payment updates reach the right address.
          </p>
        </Stagger>
      </Reveal>
    </section>
  );
}
