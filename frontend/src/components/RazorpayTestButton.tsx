import { useEffect, useRef, useState } from "react";
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
  }, []);

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
    setError("");
    setBusy(true);
    try {
      await paymentRequest("/api/payments/email/send-code", donor);
      setEmailSent(true);
      setMessage(`A verification code was sent to ${donor.email}.`);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Could not send the verification code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyEmail() {
    setError("");
    setBusy(true);
    try {
      const result = await paymentRequest("/api/payments/email/verify-code", { email: donor.email, code }) as { verification_token: string };
      setVerificationToken(result.verification_token);
      setMessage("Email verified. Continue to secure checkout.");
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Could not verify that code.");
    } finally {
      setBusy(false);
    }
  }

  async function openPayment() {
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
      const order = await paymentRequest("/api/payments/create-order", { verification_token: verificationToken });
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
              setMessage("Checkout closed. No donation has been confirmed.");
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
            <label className="donation-checkout-label">Full name<input required maxLength={150} autoComplete="name" disabled={emailSent} value={donor.name} onChange={e => setDonor({...donor, name:e.target.value})} /></label>
            <label className="donation-checkout-label">Email address<input required type="email" maxLength={254} autoComplete="email" disabled={emailSent} value={donor.email} onChange={e => { setDonor({...donor, email:e.target.value}); setVerificationToken(""); setEmailSent(false); }} /></label>
            <label className="donation-checkout-label">Mobile number<input maxLength={40} autoComplete="tel" disabled={emailSent} value={donor.phone} onChange={e => setDonor({...donor, phone:e.target.value})} /></label>
            <label className="donation-checkout-label">Address (optional)<input maxLength={500} autoComplete="street-address" disabled={emailSent} value={donor.address} onChange={e => setDonor({...donor, address:e.target.value})} /></label>
            <label className="donation-checkout-label">Named cause<select disabled={emailSent} value={donor.cause} onChange={e => setDonor({...donor, cause:e.target.value})}>{["Education & literacy", "Health & family welfare", "Youth skills & sport", "Women's livelihoods", "Environment & land", "Solar housing & clean energy", "Where most needed"].map(cause => <option key={cause}>{cause}</option>)}</select></label>
            <label className="donation-checkout-label">Amount in INR<input type="number" min={1} max={1000000} value={donor.amount_rupees} disabled={emailSent || paymentMode === "test"} onChange={e => setDonor({...donor, amount_rupees:Number(e.target.value)})} />{paymentMode === "test" && <small>₹100 while Razorpay is in Test Mode.</small>}</label>
            {!emailSent && <button type="button" disabled={busy || !paymentConfigured || !donor.name.trim() || !donor.email.trim()} onClick={() => void sendEmailCode()} className="donation-checkout-button">Send email verification code</button>}
            {emailSent && !verificationToken && <div className="donation-email-code"><label className="donation-checkout-label">6-digit email code<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} /></label><button type="button" disabled={busy || code.length !== 6} onClick={() => void verifyEmail()} className="donation-checkout-button">Verify email</button></div>}
            {verificationToken && <button type="button" disabled={busy || !!pendingResponse} onClick={openPayment} className="donation-checkout-button">{busy ? "Payment in progress…" : "Continue to Razorpay Checkout"}</button>}
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
    </section>
  );
}
