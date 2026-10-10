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
  image?: string;
  imageAlt?: string;
};

// Add a verified scan under /public/images/certificates and set its path here.
// Keeping image paths in this list makes future document updates straightforward.
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
    label: "Public service & education",
    title: "Utkal Jyoti · World Book of Records",
    detail:
      "These recognitions are mentioned in the founder biography on this website.",
  },
];

function RecordCard({
  item,
  index,
  onPreview,
}: {
  item: RecordItem;
  index: number;
  onPreview: (item: RecordItem) => void;
}) {
  return (
    <article className="certificate-card">
      <div className="certificate-card-topline">
        <span className="certificate-number">{String(index + 1).padStart(2, "0")}</span>
        <span className="certificate-kind">{item.label}</span>
      </div>

      {item.image ? (
        <button
          className="certificate-preview certificate-preview--image"
          type="button"
          onClick={() => onPreview(item)}
          aria-label={`View ${item.title}`}
        >
          <img src={item.image} alt={item.imageAlt ?? item.title} loading="lazy" />
          <span className="certificate-preview-hint">Open document <span aria-hidden="true">↗</span></span>
        </button>
      ) : (
        <div className="certificate-preview" aria-label="Document image to be added">
          <div className="certificate-placeholder-sheet" aria-hidden="true">
            <span className="certificate-placeholder-seal">JF</span>
            <i /><i /><i />
            <span className="certificate-placeholder-caption">Verified image to be added</span>
          </div>
          <span className="certificate-preview-status"><span aria-hidden="true">＋</span> Image pending</span>
        </div>
      )}

      <div className="certificate-card-copy">
        <h3>{item.title}</h3>
        <p>{item.detail}</p>
        {item.reference && <p className="certificate-reference">{item.reference}</p>}
      </div>
      <span className="certificate-card-edge" aria-hidden="true" />
    </article>
  );
}

export default function Certificates() {
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
          eyebrow="The Foundation"
          title="Trust, records & recognition."
          description="A public record of the Foundation’s registrations and the recognitions listed in its founder’s profile. Document images will be added as verified files are prepared."
          facts={[
            { value: "Public charitable trust", label: "Legal form" },
            { value: "17 August 2026", label: "Established" },
            { value: "Bhubaneswar, Odisha", label: "Headquarters" },
          ]}
        />

        <section className="wrap certificates-intro" aria-labelledby="certificates-intro-title">
          <Reveal className="certificates-intro-copy">
            <p className="certificates-kicker">Open records · 01</p>
            <h2 id="certificates-intro-title">The documents behind the work.</h2>
            <p>
              We publish the Foundation’s core identity and registration details here. Each card is prepared for its corresponding source image; scans will appear after the Foundation supplies and checks the files.
            </p>
          </Reveal>
          <Reveal className="certificates-note" delay={0.12}>
            <span className="certificates-note-mark" aria-hidden="true">i</span>
            <p>
              <strong>About donation certificates</strong>
              These are organizational records, not receipts for an individual gift. Donation confirmations and any applicable tax certificates are handled separately.
            </p>
          </Reveal>
        </section>

        <section className="certificates-section" aria-labelledby="foundation-records-heading">
          <div className="wrap">
            <Reveal className="certificates-section-heading">
              <div>
                <p className="certificates-kicker">01 onward · Foundation records</p>
                <h2 id="foundation-records-heading">Identity & registrations</h2>
              </div>
              <p>Public identifiers are shown as text while the source document images are being prepared.</p>
            </Reveal>
            <Stagger className="certificates-grid" gap={0.09} distance={20}>
              {foundationRecords.map((item, index) => (
                <RecordCard key={item.title} item={item} index={index} onPreview={setSelected} />
              ))}
            </Stagger>
          </div>
        </section>

        <section className="certificates-section certificates-section--recognitions" aria-labelledby="recognitions-heading">
          <div className="wrap">
            <Reveal className="certificates-section-heading">
              <div>
                <p className="certificates-kicker">09 onward · Founder profile</p>
                <h2 id="recognitions-heading">Selected honours & academic recognition</h2>
              </div>
              <p>These entries reflect recognitions already named in the Foundation’s public profile. Supporting images can be added individually.</p>
            </Reveal>
            <Stagger className="certificates-grid certificates-grid--honours" gap={0.09} distance={20}>
              {founderRecognitions.map((item, index) => (
                <RecordCard key={item.title} item={item} index={index + foundationRecords.length} onPreview={setSelected} />
              ))}
            </Stagger>
          </div>
        </section>

        <Reveal as="section" className="wrap certificates-originals" aria-labelledby="original-records-heading">
          <div className="originals-seal" aria-hidden="true">JF</div>
          <div>
            <p className="certificates-kicker">The originals</p>
            <h2 id="original-records-heading">A record should be easy to verify.</h2>
            <p>
              For a certified copy or a question about a listed record, contact the Foundation office. New scans can be added here once the source documents are received and reviewed.
            </p>
          </div>
          <a href="mailto:chairman@jagannathfoundation.charity" className="certificates-contact-link">
            Contact the Foundation <span aria-hidden="true">↗</span>
          </a>
        </Reveal>

        <dialog
          ref={dialogRef}
          className="certificate-dialog"
          aria-label={selected ? `Document preview: ${selected.title}` : "Document preview"}
          onClose={() => setSelected(null)}
          onClick={(event) => {
            if (event.target === dialogRef.current) setSelected(null);
          }}
        >
          <button className="certificate-dialog-close" type="button" onClick={() => setSelected(null)} aria-label="Close document preview">×</button>
          {selected?.image && <img src={selected.image} alt={selected.imageAlt ?? selected.title} />}
          <p>{selected?.title}</p>
        </dialog>
      </div>
    </Layout>
  );
}
