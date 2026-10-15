import { tr as translateText, localize as localizeText, trError as translateError } from "../i18n";
import { useTranslation as usePageTranslation } from "react-i18next";
import { Link } from "wouter";

export default function DataCollectionNotice({ showPolicyLink = false }: { showPolicyLink?: boolean }) {
  usePageTranslation();
  return (
    <div className="data-collection-notice">
      <h3>{translateText("Data collection and consent")}</h3>
      <p><strong>{translateText("What data we collect:")}</strong> {translateText("If you submit a form, the Foundation stores the details you provide, such as your name, email, phone, message, volunteering interests, or pledge amount and cause. The website does not collect payment card details or PAN through its forms.")}</p>
      <p><strong>{translateText("Why we process it:")}</strong> {translateText("Form details help the Foundation respond to messages and service requests, follow up on volunteer interest or pledges, and record programme-update requests. A pledge records interest only; it does not make a payment. Programme emails are not sent automatically yet.")}</p>
      <p><strong>{translateText("Access and deletion:")}</strong> {translateText("Submissions are stored in the Foundation's website database and are visible to authenticated administrators. They remain until an administrator deletes them. To request a copy, correction or deletion, withdraw consent, or raise a concern, contact secretariatjagannathfoundation@gmail.com or +91 97006 43333.")}</p>
      {localizeText(showPolicyLink && <Link href="/privacy-policy" className="newsletter-privacy-link">{translateText("Read the full Privacy Policy")} <span aria-hidden="true">↗</span></Link>)}
    </div>
  );
}
