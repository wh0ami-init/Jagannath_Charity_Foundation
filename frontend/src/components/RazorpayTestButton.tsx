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
    setMessage("Checking your test payment...");
    try {
      const confirmation = await paymentRequest("/api/payments/verify", result);
      if (confirmation?.status !== "paid" || confirmation.order_id !== result.razorpay_order_id ||
          confirmation.payment_id !== result.razorpay_payment_id) {
        throw new Error("Payment confirmation is still pending.");
      }
      setMessage("Your INR 100 test donation is confirmed. Thank you!");
      setPendingResponse(null);
      setCompleted(true);
    } catch (problem) {
      setMessage("Your payment response was received, but confirmation is pending. Check again before making another payment.");
      setError(problem instanceof Error ? problem.message : "Could not confirm the payment.");
    } finally {
      inProgress.current = false;
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
      const order = await paymentRequest("/api/payments/create-order", { amount_rupees: 100 });
      if (typeof order?.key_id !== "string" || !order.key_id.startsWith("rzp_test_") ||
          typeof order.order_id !== "string" || order.amount !== 10000 || order.currency !== "INR") {
        throw new Error("Expected a INR 100 Razorpay test order.");
      }
      const Razorpay = checkoutWindow.Razorpay;
      if (!Razorpay) throw new Error("Razorpay Checkout is unavailable.");
      const checkout = new Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "Jagannath Foundation",
        description: "Test donation - INR 100",
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
        setError("The test payment failed. Retry in Checkout or close it to start again.");
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
            Continue through Razorpay Checkout to try the Foundation’s secure
            online giving flow. Your payment response is confirmed by our
            server before it is marked complete.
          </p>
          <div className="donation-checkout-assurance">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3 19 6v5c0 4.8-2.9 8.1-7 10-4.1-1.9-7-5.2-7-10V6l7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Payment status is verified by the Foundation’s server</span>
          </div>
        </div>

        <Stagger as="div" className="donation-checkout-panel" gap={0.08} distance={12}>
          <div className="donation-checkout-panel-top">
            <span className="donation-checkout-provider">
              <span className="donation-checkout-provider-mark" aria-hidden="true">J</span>
              Jagannath Foundation
            </span>
            <span className="donation-checkout-test">Test mode</span>
          </div>
          <div>
            <p className="donation-checkout-label">Try an online donation</p>
            <h3>₹100 <span>one-time test</span></h3>
            <p className="donation-checkout-disclaimer">
              This is a test transaction. No real money will be collected.
            </p>
          </div>
          <button
            type="button"
            disabled={busy || !!pendingResponse || completed}
            onClick={openPayment}
            className="donation-checkout-button"
          >
            <span>
              {completed
                ? "Test donation confirmed"
                : busy
                  ? "Payment in progress…"
                  : "Donate with Razorpay"}
            </span>
            {!busy && !completed && <span className="donation-checkout-arrow" aria-hidden="true">→</span>}
          </button>
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
