import { tr as translateText, localize as localizeText, trError as translateError } from "../i18n";
import { useTranslation as usePageTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import Stagger from "../components/Stagger";
import "./certificates.css";

type RecordItem = {
  label: string;
  title: string;
  detail: string;
  reference?: string;
};

const pendingRecognitionScan =
  "Recognition listed on the Foundation’s public certificates page; the original document image is not shown here.";

const foundationRecords: RecordItem[] = [
  {
    label: "Trust instrument",
    title: "Deed of public charitable trust",
    detail:
      "Jagannath Foundation was settled as an irrevocable public charitable trust on 17 August 2026.",
    reference: "Foundation record · 17 August 2026",
  },
  {
    label: "Permanent account",
    title: "PAN",
    detail: "Permanent Account Number recorded for Jagannath Foundation.",
    reference: "AAFTJ8006Q",
  },
  {
    label: "NITI Aayog · DARPAN",
    title: "NGO DARPAN record",
    detail:
      "The Foundation’s record on the NITI Aayog NGO DARPAN portal.",
    reference: "OR/2026/1196699 · registered 2 September 2026",
  },
  {
    label: "Income tax · Section 12A",
    title: "Provisional registration",
    detail:
      "Provisional registration for the Foundation under section 12A.",
    reference: "URN AAFTJ8006QE20261",
  },
  {
    label: "Income tax · Section 80G",
    title: "Provisional approval",
    detail:
      "Provisional approval under section 80G. Donor eligibility depends on the applicable rules and the Foundation’s reporting; this page is not a donor tax certificate.",
    reference:
      "URN AAFTJ8006QF20261 · Form 10G dated 7 September 2026 · valid TY 2026–27 to TY 2028–29",
  },
  {
    label: "Ministry of Corporate Affairs",
    title: "CSR-1 registration",
    detail:
      "Registration to undertake CSR activities, as recorded by the Foundation.",
    reference: "CSR00118119 · SRN AC6085516 · 21 September 2026",
  },
  {
    label: "E-Anudaan",
    title: "Portal record",
    detail:
      "Listed on the Foundation’s earlier public certificates page. The source record and image are awaiting confirmation before publication here.",
  },
  {
    label: "NPO record",
    title: "Non-profit portal document",
    detail:
      "Listed on the Foundation’s earlier public certificates page. Add the verified document image and reference details when available.",
  },
];

const founderRecognitions: RecordItem[] = [
  {
    label: "Academic recognition",
    title: "Honorary doctorates",
    detail:
      "Doctorates honoris causa in Science, Laws and Literature, as listed in the founder’s public profile.",
  },
  {
    label: "Public service",
    title: "Sadbhavana Award · Utkal Sanman",
    detail: "Recognitions listed for 2013 in the founder’s public profile.",
    reference: "2013",
  },
  {
    label: "Education & public life",
    title: "Kalinga Sanman",
    detail: "Recognition listed for 2015 in the founder’s public profile.",
    reference: "2015",
  },
  {
    label: "Women’s empowerment & education",
    title: "Selected recognitions",
    detail:
      "Women Empowerment Award and Education Excellence Award, listed in the founder’s public profile.",
    reference: "2015",
  },
  {
    label: "Academic recognition · Honoris causa",
    title: "Doctor of Philosophy",
    detail: pendingRecognitionScan,
  },
  {
    label: "Academic recognition · Honoris causa",
    title: "Doctor of Science",
    detail:
      "A 2016 honorary doctorate listed on the Foundation’s public certificates page; the original document image is not shown here.",
    reference: "2016",
  },
  {
    label: "Academic recognition · Honoris causa",
    title: "Doctor of Philosophy",
    detail:
      "A 2016 honorary doctorate listed on the Foundation’s public certificates page; the original document image is not shown here.",
    reference: "2016",
  },
  {
    label: "Natural medicine",
    title: "Grand Award of International Natural Medicine",
    detail: pendingRecognitionScan,
  },
  {
    label: "International peace",
    title: "Outstanding Leadership Award · Middle East Peace Process",
    detail: pendingRecognitionScan,
  },
  {
    label: "International peace",
    title: "Ambassador of Peace",
    detail:
      "An international recognition listed on the Foundation’s public certificates page; the original document image is not shown here.",
  },
  {
    label: "Human rights education",
    title: "World Human Rights Educators Award",
    detail: pendingRecognitionScan,
    reference: "2002",
  },
  {
    label: "Education quality",
    title: "India Quality Award",
    detail: pendingRecognitionScan,
  },
  {
    label: "National recognition",
    title: "Pride of India Award",
    detail: pendingRecognitionScan,
    reference: "2003",
  },
  {
    label: "Youth leadership",
    title: "Youth Leadership Award",
    detail: pendingRecognitionScan,
    reference: "2014",
  },
  {
    label: "Public service",
    title: "Swachh Bharat Award",
    detail: pendingRecognitionScan,
    reference: "2015",
  },
  {
    label: "Education",
    title: "CUTE Award",
    detail: pendingRecognitionScan,
    reference: "2015",
  },
  {
    label: "Education leadership",
    title: "Outstanding Educationist Award",
    detail: pendingRecognitionScan,
    reference: "2015",
  },
  {
    label: "Public service",
    title: "Seva Excellence Award",
    detail: pendingRecognitionScan,
    reference: "2015",
  },
  {
    label: "Public service & education",
    title: "Utkal Jyoti · World Book of Records",
    detail:
      "These recognitions are mentioned in the founder biography on this website.",
  },
];

function RecordCard({ item, index, onPreview }: { item: RecordItem; index: number; onPreview: (item: RecordItem) => void }) {
  usePageTranslation();
  return (
    <article className="certificate-card">
      <div className="certificate-card-topline">
        <span className="certificate-number">{localizeText(String(index + 1).padStart(2, "0"))}</span>
        <span className="certificate-kind">{localizeText(item.label)}</span>
      </div>

      <button
        className="certificate-preview certificate-preview--button"
        type="button"
        aria-label={translateText("Open full designed summary for {{title}}", {title: translateText(item.title)})}
        onClick={() => onPreview(item)}
      >
        <div className="certificate-document">
          <svg className="certificate-document-border" viewBox="0 0 1000 1000" aria-hidden="true" preserveAspectRatio="none">
            <path className="certificate-document-border-outer" d="M 12 12 H 988 V 988 H 12 Z" pathLength="1000" />
            <path className="certificate-document-border-inner" d="M 28 28 H 972 V 972 H 28 Z" pathLength="1000" />
          </svg>
          <span className="certificate-document-glint" aria-hidden="true" />
          <span className="certificate-document-overline">{translateText("Jagannath Foundation")}</span>
          <span className="certificate-document-rule" aria-hidden="true" />
          <span className="certificate-document-label">{localizeText(item.label)}</span>
          <strong>{localizeText(item.title)}</strong>
          <span className="certificate-document-description">{localizeText(item.detail)}</span>
          {localizeText(item.reference && <span className="certificate-document-reference">{localizeText(item.reference)}</span>)}
          <span className="certificate-document-footer">{translateText("Designed record summary · Not an official document")}</span>
        </div>
        <span className="certificate-preview-hint">{translateText("View larger")} <span aria-hidden="true">↗</span></span>
      </button>

      <div className="certificate-card-copy">
        <h3>{localizeText(item.title)}</h3>
        <p>{localizeText(item.detail)}</p>
        {localizeText(item.reference && <p className="certificate-reference">{localizeText(item.reference)}</p>)}
      </div>
      <span className="certificate-card-edge" aria-hidden="true" />
    </article>
  );
}

export default function Certificates() {
  usePageTranslation();
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected && !dialog.open) dialog.showModal();
    if (!selected && dialog.open) dialog.close();
  }, [selected]);

  return (
    <Layout>
      <div className="certificates-page">
        <PageHero
          theme="certificates"
          motif="documents"
          eyebrow={translateText("The Foundation")}
          title={translateText("Trust, records & recognition.")}
          description={translateText("A public record of the Foundation’s registrations and the recognitions listed in its founder’s profile, presented as designed summaries.")}
          facts={[
            { value: "Public charitable trust", label: "Legal form" },
            { value: "17 August 2026", label: "Established" },
            { value: "Bhubaneswar, Odisha", label: "Headquarters" },
          ]}
        />

        <section className="wrap certificates-intro" aria-labelledby="certificates-intro-title">
          <Reveal className="certificates-intro-copy">
            <p className="certificates-kicker">{translateText("Open records · 01")}</p>
            <h2 id="certificates-intro-title">{translateText("The documents behind the work.")}</h2>
            <p> {translateText("We publish the Foundation’s core identity and registration details here in an original, consistent visual format. Each panel summarizes the record in plain text.")} </p>
          </Reveal>
          <Reveal className="certificates-note" delay={0.12}>
            <span className="certificates-note-mark" aria-hidden="true">{translateText("i")}</span>
            <p>
              <strong>{translateText("About donation certificates")}</strong> {translateText("These are organizational records, not receipts for an individual gift. Donation confirmations and any applicable tax certificates are handled separately.")} </p>
          </Reveal>
        </section>

        <section className="certificates-section" aria-labelledby="foundation-records-heading">
          <div className="wrap">
            <Reveal className="certificates-section-heading">
              <div>
                <p className="certificates-kicker">{translateText("01 onward · Foundation records")}</p>
                <h2 id="foundation-records-heading">{translateText("Identity & registrations")}</h2>
              </div>
              <p>{translateText("Each designed panel summarizes the record; it is not a scan or replacement for an issued document.")}</p>
            </Reveal>
            <Stagger className="certificates-grid" gap={0.09} distance={20}>
              {localizeText(foundationRecords.map((item, index) => (
                <RecordCard key={`${item.title}-${index}`} item={item} index={index} onPreview={setSelected} />
              )))}
            </Stagger>
          </div>
        </section>

        <section className="certificates-section certificates-section--recognitions" aria-labelledby="recognitions-heading">
          <div className="wrap">
            <Reveal className="certificates-section-heading">
              <div>
                <p className="certificates-kicker">{translateText("09 onward · Founder profile")}</p>
                <h2 id="recognitions-heading">{translateText("Selected honours & academic recognition")}</h2>
              </div>
              <p>{translateText("These entries reflect recognitions named in the Foundation’s public profile. The panels are summaries, not award certificates.")}</p>
            </Reveal>
            <Stagger className="certificates-grid certificates-grid--honours" gap={0.09} distance={20}>
              {localizeText(founderRecognitions.map((item, index) => (
                <RecordCard key={`${item.title}-${index}`} item={item} index={index + foundationRecords.length} onPreview={setSelected} />
              )))}
            </Stagger>
          </div>
        </section>

        <Reveal as="section" className="wrap certificates-originals" aria-labelledby="original-records-heading">
          <div className="originals-seal" aria-hidden="true">{translateText("JF")}</div>
          <div>
            <p className="certificates-kicker">{translateText("The originals")}</p>
            <h2 id="original-records-heading">{translateText("A record should be easy to verify.")}</h2>
            <p> {translateText("For a certified copy or a question about a listed record, contact the Foundation office.")} </p>
          </div>
          <a href="mailto:chairman@jagannathfoundation.charity" className="certificates-contact-link"> {translateText("Contact the Foundation")} <span aria-hidden="true">↗</span>
          </a>
        </Reveal>

        <dialog
          ref={dialogRef}
          className="certificate-dialog"
          aria-label={selected ? translateText("Designed summary: {{title}}", {title: translateText(selected.title)}) : translateText("Designed summary")}
          onClose={() => setSelected(null)}
          onClick={(event) => {
            if (event.target === dialogRef.current) setSelected(null);
          }}
        >
          <button
            className="certificate-dialog-close"
            type="button"
            aria-label={translateText("Close certificate summary")}
            onClick={() => setSelected(null)}
          >
            ×
          </button>
          {localizeText(selected && (
            <div className="certificate-document certificate-document--large">
              <svg className="certificate-document-border" viewBox="0 0 1000 1000" aria-hidden="true" preserveAspectRatio="none">
                <path className="certificate-document-border-outer" d="M 12 12 H 988 V 988 H 12 Z" pathLength="1000" />
                <path className="certificate-document-border-inner" d="M 28 28 H 972 V 972 H 28 Z" pathLength="1000" />
              </svg>
              <span className="certificate-document-glint" aria-hidden="true" />
              <span className="certificate-document-overline">{translateText("Jagannath Foundation")}</span>
              <span className="certificate-document-rule" aria-hidden="true" />
              <span className="certificate-document-label">{localizeText(selected.label)}</span>
              <strong>{localizeText(selected.title)}</strong>
              <span className="certificate-document-description">{localizeText(selected.detail)}</span>
              {localizeText(selected.reference && <span className="certificate-document-reference">{localizeText(selected.reference)}</span>)}
              <span className="certificate-document-footer">{translateText("Designed record summary · Not an official document")}</span>
            </div>
          ))}
        </dialog>

      </div>
    </Layout>
  );
}
