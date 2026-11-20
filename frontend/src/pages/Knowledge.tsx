import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { knowledgePages } from "../lib/knowledgePages";
import { tr as t } from "../i18n";
import "./knowledge.css";

const hubTitle = "Knowledge, Partnerships & Opportunities";
const hubDescription = "Research, learning, events, fellowships and institutional partnerships of the Foundation.";

export default function Knowledge({ slug }: { slug?: string }) {
  const { i18n } = useTranslation();
  const page = knowledgePages.find((entry) => entry.slug === slug);
  const title = page?.title ?? hubTitle;
  useEffect(() => {
    const previous = document.title;
    document.title = `${t(title)} · Jagannath Foundation`;
    return () => { document.title = previous; };
  }, [title, i18n.resolvedLanguage]);

  return (
    <Layout>
      <PageHero theme={page?.slug.includes("partnership") ? "about" : "work"}
        motif={page?.slug.includes("partnership") ? "partners" : page?.slug === "think-tank-council" ? "leadership" : "documents"}
        eyebrow={t(title)} title={t(title)} description={t(page?.description ?? hubDescription)} />
      <div className="wrap knowledge-body">
        {page ? (
          <div className="knowledge-detail">
            <article className="knowledge-copy">
              <Link className="knowledge-back" href="/knowledge-partnerships-opportunities">← {t(hubTitle)}</Link>
              {page.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph.map((part, i) => (
                  "href" in part && part.href
                    ? <a key={i} href={part.href}>{part.text}</a>
                    : <span key={i}>{part.text}</span>
                ))}</p>
              ))}
              <p className="knowledge-registration">{t(page.footer)}</p>
            </article>
            <nav className="knowledge-nav" aria-label={t(hubTitle)}>
              {knowledgePages.map((entry) => (
                <Link key={entry.slug} href={entry.href} aria-current={entry.slug === page.slug ? "page" : undefined}>
                  {t(entry.title)}<span aria-hidden="true">↗</span>
                </Link>
              ))}
            </nav>
          </div>
        ) : (
          <>
            <div className="knowledge-grid">
              {knowledgePages.map((entry, index) => (
                <Reveal key={entry.slug}>
                  <Link className="knowledge-card" href={entry.href}>
                    <span className="knowledge-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <h2>{t(entry.title)}</h2>
                    <p>{t(entry.note)}</p>
                    <span className="knowledge-arrow" aria-hidden="true">↗</span>
                  </Link>
                </Reveal>
              ))}
            </div>
            <p className="knowledge-registration">{t(knowledgePages[0].footer)}</p>
          </>
        )}
      </div>
    </Layout>
  );
}
