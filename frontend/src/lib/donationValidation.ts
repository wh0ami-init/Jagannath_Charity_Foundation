export const DONATION_CAUSES = [
  "Education & literacy",
  "Health & family welfare",
  "Youth skills & sport",
  "Women's livelihoods",
  "Environment & land",
  "Solar housing & clean energy",
  "Where most needed",
] as const;

export type DonationField = "name" | "email" | "phone" | "address" | "cause" | "amount_rupees";

export function validateDonationField(
  field: DonationField,
  value: string | number,
  mode: "test" | "live",
  amountMinimum = 1,
): string {
  const text = String(value).trim();
  if (field === "name") {
    if (text.length < 2) return "Enter your full name (at least 2 characters).";
    if (text.length > 150 || /[\u0000-\u001f\u007f]/u.test(text)) return "Enter a valid name of 150 characters or fewer.";
  }
  if (field === "email") {
    if (text.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(text)) return "Enter a valid email address.";
  }
  if (field === "phone") {
    const digits = text.replace(/\D/gu, "");
    if (!/^\+?[0-9][0-9\s().-]*$/u.test(text) || digits.length < 10 || digits.length > 15) {
      return "Enter a valid phone number with 10 to 15 digits.";
    }
  }
  if (field === "address" && (text.length > 500 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text))) {
    return "Enter a valid address of 500 characters or fewer.";
  }
  if (field === "cause" && !DONATION_CAUSES.includes(text as typeof DONATION_CAUSES[number])) {
    return "Select a listed donation cause.";
  }
  if (field === "amount_rupees") {
    const amount = Number(value);
    if (!Number.isSafeInteger(amount) || amount < amountMinimum || amount > 1_000_000) {
      return `Enter an amount between ₹${amountMinimum.toLocaleString("en-IN")} and ₹10,00,000.`;
    }
    if (mode === "test" && amount !== 100) return "Test Mode contributions are fixed at ₹100.";
  }
  return "";
}
