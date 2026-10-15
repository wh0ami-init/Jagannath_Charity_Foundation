import { Link } from "wouter";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { comingSoonSections, type ComingSoonSection } from "../lib/comingSoonSections";
import ComingSoonEmblem from "./ComingSoonEmblem";
import "./coming-soon.css";

export default function ComingSoon({ section }: { section: ComingSoonSection }) {
  const groupPrefix = section.href.startsWith("/internships/")
    ? "/internships/"
    : section.href.startsWith("/beneficiaries/")
      ? "/beneficiaries/"
      : null;
  const relatedPages = groupPrefix
    ? comingSoonSections.filter((item) => item.href.startsWith(groupPrefix))
    : [];
  const groupLabel = groupPrefix === "/beneficiaries/" ? "Beneficiaries" : "Internships";

  return (
    <Layout>
      <div className="coming-soon-page">
        <PageHero
          theme="work"
          motif={section.motif}
          eyebrow={section.label}
          title={`${section.label} is coming soon.`}
          description={`We’re preparing the ${section.label.toLowerCase()} section now. It’s currently in progress and will be available here soon.`}
          actions={
            <Link href="/programmes" className="pagehero-button">
              Explore our programmes <span aria-hidden="true">↗</span>
            </Link>
          }
        />

        <section className="wrap coming-soon-section" aria-labelledby="coming-soon-title">
          <Reveal className={`coming-soon-card coming-soon-card--${section.id}`}>
            <ComingSoonEmblem section={section} />
            <div className="coming-soon-copy">
              <p className="coming-soon-status"><span /> Currently in progress</p>
              <h2 id="coming-soon-title">{section.note}</h2>
              <p>{section.message}</p>
              {relatedPages.length > 1 && (
                <nav className="coming-soon-related" aria-label={`${groupLabel} pages`}>
                  <span>{groupLabel}</span>
                  {relatedPages
                    .filter((item) => item.href !== section.href)
                    .map((item) => (
                      <Link key={item.href} href={item.href}>
                        {item.label} <span aria-hidden="true">↗</span>
                      </Link>
                    ))}
                </nav>
              )}
            </div>
            <div className="coming-soon-actions">
              <Link href="/contact" className="coming-soon-contact">
                Contact the Foundation <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/" className="coming-soon-home">
                Back to home
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </Layout>
  );
}
