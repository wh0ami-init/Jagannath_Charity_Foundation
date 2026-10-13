import { tr as t, localize } from "../i18n";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

export default function DataCollectionNotice({ showPolicyLink = false }: { showPolicyLink?: boolean }) {
  useTranslation();
  return (
    <div className="data-collection-notice">
      <h3>{t("Data Collection & Consent Notice (DPDP Act, 2023)")}</h3>
      <p><strong>{t("What data we collect:")}</strong> {" "}{t("If you submit a form, the Foundation stores the details you provide, such as your name, email, phone, message, volunteering interests, or pledge amount and cause. The website does not collect payment card details or PAN through its forms.")}</p>
      <p><strong>{t("Why we process it:")}</strong> {" "}{t("Form details are used by the Foundation team to respond to messages, follow up on volunteer interest or pledges, and manage requests for programme updates. A pledge form records an expression of interest only; it does not make a payment.")}</p>
      <p><strong>{t("Access and deletion:")}</strong> {" "}{t("Submissions are stored in the Foundation's website database and can be viewed by an authenticated site administrator. They remain there until an administrator deletes them. To request a copy, correction or deletion, or to withdraw consent, contact the Foundation at secretariatjagannathfoundation@gmail.com or +91 97006 43333.")}</p>
      <p><strong>{t("Grievance Redressal:")}</strong> {" "}{t("To exercise your rights, withdraw consent, or raise a grievance, please contact our Grievance Officer at secretariatjagannathfoundation@gmail.com or +91 97006 43333. If your grievance is not resolved, you have the right to file a complaint with the Data Protection Board of India.")}</p>
      {localize(showPolicyLink && <Link href="/privacy-policy" className="newsletter-privacy-link">{t("Read the full Privacy Policy")}{" "}<span aria-hidden="true">↗</span></Link>)}
    </div>
  );
}
