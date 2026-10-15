import { FormEvent, useEffect, useRef, useState } from "react";
import { apiUrl } from "../lib/api";
import { DONATION_CAUSES, type DonationField, validateDonationField } from "../lib/donationValidation";
import { loadRazorpayCheckout } from "../lib/razorpay";

type DonorDetails = { name: string; email: string; phone: string; address: string; amount_rupees: number; cause: string };
type Errors = Partial<Record<DonationField, string>>;

async function postPaymentRequest(path: string, body: unknown) {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof result?.detail === "string" ? result.detail : "The AutoPay request could not be completed.");
  return result;
}

export default function MonthlyAutoPay() {
  const [mode, setMode] = useState<"test" | "live">("test");
  const [configured, setConfigured] = useState(false);
  const [setupMessage, setSetupMessage] = useState("Checking Razorpay setup…");
  const [donor, setDonor] = useState<DonorDetails>({ name: "", email: "", phone: "", address: "", amount_rupees: 100, cause: "Where most needed" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const inProgress = useRef(false);

  useEffect(() => {
    void fetch(apiUrl("/api/payments/mode"))
      .then(response => response.ok ? response.json() : null)
      .then(result => {
        if (result?.mode === "test" || result?.mode === "live") setMode(result.mode);
        setConfigured(result?.subscriptions_configured === true);
        if (!result) setSetupMessage("Could not reach the donation service. Please try again later.");
        else if (!result.payment_configured) setSetupMessage("Razorpay credentials are not configured yet.");
        else if (!result.subscriptions_configured) setSetupMessage("Add the Razorpay webhook secret before enabling monthly mandates.");
        else setSetupMessage("");
      })
      .catch(() => setSetupMessage("Could not reach the donation service. Please try again later."));
  }, []);

  function validate(): boolean {
    const next: Errors = {};
    (Object.keys(donor) as DonationField[]).forEach(field => {
      const fieldError = validateDonationField(field, donor[field], mode, 100);
      if (fieldError) next[field] = fieldError;
    });
    setErrors(next);
    if (!consent) setError("Please confirm the monthly AutoPay authorization before continuing.");
    return Object.keys(next).length === 0 && consent;
  }

  function update<K extends keyof DonorDetails>(field: K, value: DonorDetails[K]) {
    setDonor(current => ({ ...current, [field]: value }));
    if (errors[field as DonationField]) {
      const fieldError = validateDonationField(field as DonationField, value as string | number, mode, 100);
      setErrors(current => ({ ...current, [field]: fieldError || undefined }));
    }
  }

  async function startAutoPay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!validate() || inProgress.current) return;
    inProgress.current = true;
    setBusy(true);
    let responded = false;
    const finish = () => {
      inProgress.current = false;
      setBusy(false);
    };
    try {
      await loadRazorpayCheckout();
      const donorDetails = {
        ...donor,
        name: donor.name.trim(),
        email: donor.email.trim(),
        phone: donor.phone.trim(),
        address: donor.address.trim(),
        consent: true,
      };
      const subscription = await postPaymentRequest("/api/payments/subscriptions/create", donorDetails);
      if (typeof subscription?.subscription_id !== "string"
          || !subscription.subscription_id.startsWith("sub_")
          || subscription.amount !== donor.amount_rupees * 100) {
        throw new Error("Razorpay returned an invalid monthly mandate.");
      }
      if (!window.Razorpay) throw new Error("Razorpay Checkout is unavailable.");
      const checkout = new window.Razorpay({
        key: subscription.key_id,
        subscription_id: subscription.subscription_id,
        name: "Jagannath Foundation",
        description: `Monthly donation · ₹${donor.amount_rupees}`,
        prefill: { name: donorDetails.name, email: donorDetails.email, contact: donorDetails.phone },
        theme: { color: "#18372f" },
        handler: async response => {
          responded = true;
          setMessage("Confirming your monthly mandate with Razorpay…");
          try {
            if (!response.razorpay_subscription_id || !response.razorpay_signature) {
              throw new Error("Razorpay returned an incomplete authorization response.");
            }
            const confirmation = await postPaymentRequest("/api/payments/subscriptions/verify", response);
            setComplete(true);
            setMessage(`Your monthly mandate is authorized with Razorpay. Status: ${confirmation.status}. You can manage or cancel it through your payment provider or by contacting the Foundation.`);
          } catch (problem) {
            setError(problem instanceof Error ? problem.message : "Could not confirm the monthly mandate.");
          } finally {
            finish();
          }
        },
        modal: {
          ondismiss: () => {
            if (!responded) {
              setMessage("Checkout closed. No monthly mandate was confirmed. You can try again when ready.");
              finish();
            }
          },
        },
      });
      checkout.on("payment.failed", () => setError("Razorpay could not authorize this mandate. You can retry in Checkout or close it to start again."));
      checkout.open();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Could not start AutoPay.");
      finish();
    }
  }

  return <div className="monthly-autopay-layout">
    <div className="monthly-autopay-copy">
      <p className="donation-section-eyebrow">Monthly contribution</p>
      <h2 id="monthly-autopay-title">Support the work month after month.</h2>
      <p>Choose a monthly amount and approve a UPI or card mandate in Razorpay Checkout. The Foundation will not store your card or bank credentials.</p>
      <p className="monthly-autopay-note">Each recurring contribution is authorized by your payment provider. You can cancel the mandate through your provider or contact the Foundation for help.</p>
      <a className="monthly-autopay-contact" href="mailto:chairman@jagannathfoundation.charity?subject=Monthly%20giving%20support">Need help with monthly giving? Contact us <span aria-hidden="true">→</span></a>
    </div>
    <form className="monthly-autopay-form" onSubmit={event => void startAutoPay(event)} noValidate>
      <div className="monthly-autopay-form-heading">
        <span className="donation-checkout-label">Monthly AutoPay</span>
        <span className="monthly-autopay-mode">{mode === "test" ? "Test mode · ₹100" : "Monthly mandate"}</span>
      </div>
      {!configured && <p className="donation-setup-status" role="status">{setupMessage}</p>}
      <label htmlFor="autopay-name">Full name <span className="donation-required">Required</span>
        <input id="autopay-name" autoComplete="name" maxLength={150} required value={donor.name} aria-invalid={Boolean(errors.name)} onBlur={() => setErrors(current => ({ ...current, name: validateDonationField("name", donor.name, mode) || undefined }))} onChange={event => update("name", event.target.value)} />
        {errors.name && <small className="donation-field-error" role="alert">{errors.name}</small>}
      </label>
      <label htmlFor="autopay-email">Email address <span className="donation-required">Required</span>
        <input id="autopay-email" type="email" autoComplete="email" maxLength={254} required value={donor.email} aria-invalid={Boolean(errors.email)} onBlur={() => setErrors(current => ({ ...current, email: validateDonationField("email", donor.email, mode) || undefined }))} onChange={event => update("email", event.target.value)} />
        {errors.email && <small className="donation-field-error" role="alert">{errors.email}</small>}
      </label>
      <label htmlFor="autopay-phone">Mobile number <span className="donation-required">Required</span>
        <input id="autopay-phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={40} placeholder="e.g. +91 98765 43210" required value={donor.phone} aria-invalid={Boolean(errors.phone)} onBlur={() => setErrors(current => ({ ...current, phone: validateDonationField("phone", donor.phone, mode) || undefined }))} onChange={event => update("phone", event.target.value)} />
        {errors.phone && <small className="donation-field-error" role="alert">{errors.phone}</small>}
      </label>
      <label htmlFor="autopay-amount">Monthly amount (INR) <span className="donation-required">Required</span>
        <input id="autopay-amount" type="number" inputMode="numeric" min={mode === "test" ? 100 : 100} max={1000000} step={1} required disabled={mode === "test"} value={donor.amount_rupees} aria-invalid={Boolean(errors.amount_rupees)} onBlur={() => setErrors(current => ({ ...current, amount_rupees: validateDonationField("amount_rupees", donor.amount_rupees, mode, 100) || undefined }))} onChange={event => update("amount_rupees", Number(event.target.value))} />
        {errors.amount_rupees ? <small className="donation-field-error" role="alert">{errors.amount_rupees}</small> : <small className="donation-field-hint">Charged monthly after you authorize the mandate. Minimum ₹100.</small>}
      </label>
      <label htmlFor="autopay-cause">Named cause <span className="donation-required">Required</span>
        <select id="autopay-cause" required value={donor.cause} onChange={event => update("cause", event.target.value)}>{DONATION_CAUSES.map(cause => <option key={cause}>{cause}</option>)}</select>
      </label>
      <label className="monthly-autopay-consent">
        <input type="checkbox" checked={consent} onChange={event => { setConsent(event.target.checked); if (event.target.checked) setError(""); }} />
        <span>I authorize a ₹{donor.amount_rupees.toLocaleString("en-IN")} monthly contribution for the selected cause. I understand this is recurring and will approve the mandate in Razorpay Checkout.</span>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="donation-checkout-status" role="status">{message}</p>}
      {!complete && <button className="donation-checkout-button" type="submit" disabled={busy || !configured}>{busy ? "Opening Razorpay…" : "Set up monthly AutoPay"}</button>}
      <small className="monthly-autopay-footnote">No payment is collected until you authorize the mandate. Test Mode creates no real recurring charge.</small>
    </form>
  </div>;
}
