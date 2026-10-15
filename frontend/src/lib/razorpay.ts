export type RazorpayCheckoutResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
};

export type RazorpayCheckoutOptions = {
  key: string;
  amount?: number;
  currency?: string;
  order_id?: string;
  subscription_id?: string;
  name: string;
  description: string;
  prefill?: { name: string; email: string; contact: string };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal: { ondismiss: () => void };
  theme: { color: string };
};

export type RazorpayCheckout = {
  open: () => void;
  on: (event: "payment.failed", handler: () => void) => void;
};

export type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayCheckout;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let checkoutScript: Promise<void> | undefined;

export function loadRazorpayCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
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
        if (window.Razorpay) resolve();
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
