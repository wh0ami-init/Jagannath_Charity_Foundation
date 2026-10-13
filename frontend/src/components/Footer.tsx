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
  ["Community portal", "/services"],
] as const;

const takePartLinks = [
  ["Make a donation", "/donate"],
  ["Volunteer with us", "/volunteer"],
  ["Contact the Foundation", "/contact"],
  ["Privacy policy", "/privacy-policy"],
] as const;

export default function Footer() {
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
          <span className="footer-charity-note"><i aria-hidden="true" /> {" "}{t("A public charitable trust in India")}</span>
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
          <Link href="/contact" className="footer-contact-link">{t("Contact us")}{" "}<span aria-hidden="true">→</span></Link>
        </Reveal>
      </div>

      <div className="footer-legal">
        <div className="wrap footer-legal-inner">
          <span>© {localize(new Date().getFullYear())} {" "}{t("Jagannath Foundation")}</span>
          <span>{t("PAN AAFTJ8006Q")}{" "}<i /> {" "}{t("DARPAN OR/2026/1196699")}</span>
          <span>{t("The Trust does not carry on any activity with the object of earning profit.")}</span>
        </div>
      </div>
    </footer>
  );
}
