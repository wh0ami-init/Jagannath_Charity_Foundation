import { tr as translateText, localize as localizeText, trError as translateError } from "../i18n";
import { useTranslation as usePageTranslation } from "react-i18next";
import { tr as t, localize } from "../i18n";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import Reveal from "./Reveal";
import { DynamicImage } from "../lib/ImagesContext";

const foundationLinks = [
  ["Our story", "/about"],
  ["Programmes", "/programmes"],
  ["Our impact", "/impact"],
  ["Our people", "/team"],
  ["Photo gallery", "/gallery"],
  ["Certificates & records", "/certificates"],
  ["Community portal", "/services"],
] as const;

const takePartLinks = [
  ["Make a donation", "/donate"],
  ["Volunteer with us", "/volunteer"],
  ["Contact the Foundation", "/contact"],
  ["Privacy policy", "/privacy-policy"],
] as const;

export default function Footer() {
  usePageTranslation();
  useTranslation();
  return (
    <footer className="site-footer">
      <div className="wrap footer-main">
        <Reveal className="footer-brand" delay={0}>
          <Link href="/" className="footer-identity">
            <span className="footer-mark"><DynamicImage slotKey="site-logo" alt="" className="footer-logo" /></span>
            <span><strong>{t("Jagannath Foundation")}</strong><small>{t("Serving with dignity")}</small></span>
          </Link>
          <p>{t("Working alongside communities to widen opportunity through education, health, livelihoods and clean energy.")}</p>
          <span className="footer-charity-note"><i aria-hidden="true" /> {localizeText(" ")}{t("A public charitable trust in India")}</span>
        </Reveal>

        <Reveal as="nav" className="footer-links" delay={0.12} aria-label={t("Foundation links")}>
          <h2>{t("The Foundation")}</h2>
          <ul>{localize(foundationLinks.map(([label, href]) => <li key={href}><Link href={href}>{localize(label)}<span aria-hidden="true">↗</span></Link></li>))}</ul>
        </Reveal>

        <Reveal as="nav" className="footer-links" delay={0.24} aria-label={t("Ways to participate")}>
          <h2>{t("Get involved")}</h2>
          <ul>{localize(takePartLinks.map(([label, href]) => <li key={href}><Link href={href}>{localize(label)}<span aria-hidden="true">↗</span></Link></li>))}</ul>
        </Reveal>

        <Reveal as="address" className="footer-contact" delay={0.36}>
          <h2>{t("Start a conversation")}</h2>
          <a className="footer-email" href="mailto:chairman@jagannathfoundation.charity">{t("chairman@jagannathfoundation.charity")}</a>
          <a href="tel:+919700643333">+91 97006 43333</a>
          <p>{t("Foundation House, Raj Bhavan")}<br />{t("Tapaswini Colony, Near Z1")}<br />{t("Nandan Kanan Road, Bhubaneswar")}<br />{t("Khordha, Odisha 751024")}</p>
          <Link href="/contact" className="footer-contact-link">{t("Contact us")}{localizeText(" ")}<span aria-hidden="true">→</span></Link>
        </Reveal>
      </div>

      <Reveal className="wrap footer-admin-entry" delay={0.12}>
        <span className="footer-admin-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 3 19 6v5c0 4.7-2.9 8-7 10-4.1-2-7-5.3-7-10V6l7-3Z" />
            <path d="m9.5 12 1.7 1.7 3.6-3.8" />
          </svg>
        </span>
        <span className="footer-admin-copy">
          <strong>{t("Foundation team")}</strong>
          <small>{t("Authorized staff access")}</small>
        </span>
        <Link href="/admin/login" className="footer-admin-link">
          <svg className="footer-admin-lock" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path className="footer-admin-lock-shackle" d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10" />
            <rect x="5" y="10" width="14" height="11" rx="2.5" />
            <path d="M12 14v3" />
          </svg>
          <span className="footer-admin-link-label" aria-hidden="true">
            <span className="footer-admin-link-compact">{t("Admin")}</span>
            <span className="footer-admin-link-expanded">{t("Administrator sign in")}</span>
          </span>
          <span className="footer-admin-link-arrow" aria-hidden="true">→</span>
          <span className="sr-only">{t("Administrator sign in")}</span>
        </Link>
      </Reveal>

      <div className="footer-legal">
        <div className="wrap footer-legal-inner">
          <span>© {localize(new Date().getFullYear())} {localizeText(" ")}{t("Jagannath Foundation")}</span>
          <span>{t("PAN AAFTJ8006Q")}{localizeText(" ")}<i /> {localizeText(" ")}{t("DARPAN OR/2026/1196699")}</span>
          <span>{t("The Trust does not carry on any activity with the object of earning profit.")}</span>
        </div>
      </div>
    </footer>
  );
}
