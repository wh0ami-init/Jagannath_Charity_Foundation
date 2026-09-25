import { Link } from "wouter";
import Reveal from "./Reveal";
import { DynamicImage } from "../lib/ImagesContext";

const foundationLinks = [
  ["Our story", "/about"],
  ["Our work", "/work"],
  ["Our impact", "/impact"],
  ["Our people", "/team"],
  ["Photo gallery", "/gallery"],
] as const;

const takePartLinks = [
  ["Make a donation", "/donate"],
  ["Volunteer with us", "/volunteer"],
  ["Contact the Foundation", "/contact"],
  ["Privacy policy", "/privacy-policy"],
] as const;

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-main">
        <Reveal className="footer-brand" delay={0}>
          <Link href="/" className="footer-identity">
            <span className="footer-mark"><DynamicImage slotKey="site-logo" alt="" className="footer-logo" /></span>
            <span><strong>Jagannath Foundation</strong><small>Serving with dignity</small></span>
          </Link>
          <p>Working alongside communities to widen opportunity through education, health, livelihoods and clean energy.</p>
          <span className="footer-charity-note"><i aria-hidden="true" /> A public charitable trust in India</span>
        </Reveal>

        <Reveal as="nav" className="footer-links" delay={0.12} aria-label="Foundation links">
          <h2>The Foundation</h2>
          <ul>{foundationLinks.map(([label, href]) => <li key={href}><Link href={href}>{label}<span aria-hidden="true">↗</span></Link></li>)}</ul>
        </Reveal>

        <Reveal as="nav" className="footer-links" delay={0.24} aria-label="Ways to participate">
          <h2>Get involved</h2>
          <ul>{takePartLinks.map(([label, href]) => <li key={href}><Link href={href}>{label}<span aria-hidden="true">↗</span></Link></li>)}</ul>
        </Reveal>

        <Reveal as="address" className="footer-contact" delay={0.36}>
          <h2>Start a conversation</h2>
          <a className="footer-email" href="mailto:chairman@jagannathfoundation.charity">chairman@jagannathfoundation.charity</a>
          <a href="tel:+919700643333">+91 97006 43333</a>
          <p>Foundation House, Raj Bhavan<br />Tapaswini Colony, Near Z1<br />Nandan Kanan Road, Bhubaneswar<br />Khordha, Odisha 751024</p>
          <Link href="/contact" className="footer-contact-link">Contact us <span aria-hidden="true">→</span></Link>
        </Reveal>
      </div>

      <div className="footer-legal">
        <div className="wrap footer-legal-inner">
          <span>© {new Date().getFullYear()} Jagannath Foundation</span>
          <span>PAN AAFTJ8006Q <i /> DARPAN OR/2026/1196699</span>
          <span>The Trust does not carry on any activity with the object of earning profit.</span>
        </div>
      </div>
    </footer>
  );
}
