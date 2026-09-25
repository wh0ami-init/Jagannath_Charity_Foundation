import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Layout from "../components/Layout";
import Reveal from "../components/Reveal";
import { DynamicImage } from "../lib/ImagesContext";
import { useImages } from "../lib/ImagesContext";

const trustBoard = [
  { slot: "team-jagannath-patnaik", role: "Founder, Settlor & Managing Trustee", name: "Dr Jagannath Patnaik, MBA, M.Law, Ph.D., D.Litt., D.Sc.",
    body: "Vice Chancellor, The ICFAI University Sikkim. Served as Vice Chancellor of Indian universities for over 16 years and a renowned educationist and author. Holds the Foundation's direction across education, health, youth skills, women's livelihoods and household energy. Recorded in the World Book of Records and recipient of the Utkal Jyoti Award of the Government for social service." },
  { slot: "team-shrabani-patnaik", role: "Founder Trustee and Vice President", name: "Dr Shrabani Patnaik, M.Sc., M.Phil., Ph.D., D.Litt.",
    body: "M.Sc. Environment, M.Phil. Environment. National Co-Chairman, UNAccc. National President, Women Empowerment Forum. Director, Global Chamber of Consumer Rights, India. Former Secretary, FICCI-FLO Bhubaneswar." },
  { slot: "team-prakriti-patnaik", role: "Founder Trustee and Treasurer", name: "Adv. Prakriti Patnaik, Ph.D. Scholar, LL.M. (India), LL.M. (Queen Mary, UK), BBA-LL.B. (Hons.)",
    body: "Empaneled Lawyer, YES Bank Ltd. Practising advocate in Bhubaneswar and Cuttack before the High Court, District Courts, Consumer Redressal Forums, Real Estate Regulatory Forum and DRT." },
  { slot: "team-purushraj-patnaik", role: "Founder Trustee and Secretary", name: "Mr Purushraj Patnaik, BBA-LL.B., LL.M.",
    body: "Experience in policy advocacy and cyber law. Supports field follow-up, youth programmes and the longer association of members with the trust." },
];

const boardOfManagement = [
  { slot: "team-sarita-patwal", role: "Chief Executive Officer", name: "Ms Sarita Patwal, MBA",
    body: "CEO, Board of Management. Holds operational leadership of the Foundation's programmes and day-to-day administration." },
  { slot: "team-prateek-nayak", role: "Executive Director, Planning and Coordination", name: "Adv. Prateek Nayak, LL.M. (India), LL.M. (UK)",
    body: "An expert in criminal and civil laws, policy and advocacy. Coordinates planning across programmes, partners and districts." },
  { slot: "team-samarendra-patra", role: "Executive Director, International Affairs", name: "Er. Samarendra Patra, B.Tech.",
    body: "An expert in the Merchant Navy and in international relations and trade policy. Leads international partnerships and outreach." },
  { slot: "team-reema-diddee", role: "Non-Executive Director, Finance", name: "CA Reema Diddee",
    body: "Independent Director, LIC Mutual Fund. 31 years of experience in financial and management consultancy, mergers and acquisitions, private equity and corporate governance." },
  { slot: "team-lhamu-tshering-tamang", role: "Head, Legal", name: "Adv. Lhamu Tshering Tamang, B.A. LL.B., LL.M., Ph.D. Research Scholar",
    body: "An expert in family law, government advocacy and women empowerment. Leads legal affairs and compliance." },
];

const advisors = [
  { slot: "team-jagannath-patnaik", name: "Dr Jagannath Patnaik", role: "Chair, Board of Advisors", note: "Founder, Settlor & Managing Trustee." },
  { slot: "advisor-pradeep-joshi", name: "Prof. (Dr.) Pradeep Kumar Joshi", role: "Public Examinations & Higher Education", note: "Chairman, National Testing Agency. Former Chairman, UPSC, MPPSC and CGPSC." },
  { slot: "advisor-gurbirpal-singh", name: "Lt Gen Gurbirpal Singh, PVSM, AVSM, VSM", role: "National Cadet Corps & Defence", note: "Former Director General, NCC (2021–2025)." },
  { slot: "advisor-op-singh", name: "Shri O.P. Singh, IPS (Retd.)", role: "Public Order, Disaster Response & Police Reform", note: "Former DGP, Uttar Pradesh; former DG, CISF and NDRF." },
  { slot: "advisor-ss-mantha", name: "Prof. (Dr.) S. S. Mantha", role: "Technical Education & Regulation", note: "Former Chairman, AICTE." },
  { slot: "advisor-avinash-khanna", name: "Dr. Avinash Rai Khanna", role: "Public Life & Social Service", note: "Former Member of Parliament (Rajya Sabha)." },
  { slot: "advisor-subhash-chandra", name: "Shri Subhash Chandra, IFS (Retd.)", role: "Forests, Environment & Public Institutions", note: "Special Rapporteur, NHRC; Professor of Practice, IIT Indore." },
  { slot: "advisor-ajay-misra", name: "Shri Ajay Misra, IAS (Retd.)", role: "Energy, Renewable Power & Public Service", note: "Director General, Renewable Energy Society of India." },
  { slot: "advisor-ashok-tripathi", name: "Dr. Ashok Tripathi", role: "Public Sector Governance & Audit", note: "Former Independent Director and Chairman, Audit Committee, Hindustan Photo Films Limited." },
  { slot: "advisor-viney-kapoor-mehra", name: "Prof. (Dr.) Viney Kapoor Mehra", role: "Law & Higher Education Governance", note: "Founder Vice-Chancellor, Dr. B.R. Ambedkar National Law University, Sonepat." },
  { slot: "advisor-parimal-vyas", name: "Prof. (Dr.) Parimal H. Vyas", role: "University Leadership", note: "Provost / Vice Chancellor, AURO University, Surat." },
  { slot: "advisor-raj-nath-yadava", name: "Prof. Raj Nath Yadava", role: "University Leadership", note: "Former Vice Chancellor, Purnea University." },
  { slot: "advisor-manuel-freire-garabal", name: "Prof. Sir Manuel Freire-Garabal y Núñez", role: "Global Policy & Higher Education", note: "Founder, Al-Khalifa Business School." },
  { slot: "advisor-murali-rao", name: "Dr. Murali Rao, MD, DLFAPA", role: "Psychiatry & Medical Education", note: "Board-certified psychiatrist; Medical Director, DuPage Psychiatric Care." },
  { slot: "advisor-martin-mongiello", name: "Prof. Martin C.J. Mongiello", role: "Presidential Service & Culinary Heritage", note: "President, U.S. Presidential Service Center." },
  { slot: "advisor-ajay-singh", name: "Dr. Ajay Singh", role: "Social Marketing & Institutional Training", note: "Associate Director, Indian School of Business, Hyderabad." },
  { slot: "advisor-anil-khaitan", name: "Shri Anil Khaitan", role: "Industry, Healthcare & Chamber Leadership", note: "Chairman & Managing Director, Sunil Healthcare Limited." },
  { slot: "advisor-diwakar-sukul", name: "Prof. (Dr) Diwakar Sukul", role: "Clinical Psychology & Integrated Healthcare", note: "Founder of Kamkus Clinic, Harley Street, London." },
  { slot: "advisor-ghanashyam-lal-das", name: "Prof. Dr. Ghanashyam Lal Das", role: "University Leadership & Higher Education", note: "Former Vice Chancellor, Purbanchal University, Biratnagar, Nepal." },
];

type Person = { slot: string; role: string; name: string; body: string };
const initials = (name: string) => name.split(/\s+/).filter((part) => /^[A-Z]/.test(part)).slice(0, 2).map((part) => part[0]).join("");

function PersonCard({ person, index, onSelect }: { person: Person; index: number; onSelect: (person: Person) => void }) {
  const { images } = useImages();
  const { slot, role, name, body } = person;
  const imageSlot = images[slot];
  const showImage = imageSlot ? !imageSlot.url.endsWith("/placeholder.jpg") : slot.startsWith("team-");
  return (
    <Reveal as="article" delay={(index % 4) * 0.09} className="team-card team-profile-card rounded-xl border border-navy-900/10 overflow-hidden">
      {showImage ? (
        <div className="team-portrait-frame"><DynamicImage slotKey={slot} alt={name} className="team-portrait" /></div>
      ) : (
        <div className="team-portrait-frame person-portrait-pending" aria-label={`Portrait for ${name} has not been added`}>
          <span>{initials(name)}</span>
        </div>
      )}
      <div className="team-profile-copy">
        <p className="team-profile-role">{role}</p>
        <h3>{name}</h3>
        <button type="button" className="team-view-more" onClick={() => onSelect(person)}>View more <span aria-hidden="true">→</span></button>
      </div>
    </Reveal>
  );
}

export default function Team() {
  const { images } = useImages();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!selectedPerson) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPerson(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      previousFocusRef.current?.focus();
    };
  }, [selectedPerson]);

  const openPerson = (person: Person) => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setSelectedPerson(person);
  };
  const selectedImage = selectedPerson ? images[selectedPerson.slot] : undefined;
  const showSelectedPhoto = selectedPerson && (selectedImage ? !selectedImage.url.endsWith("/placeholder.jpg") : selectedPerson.slot.startsWith("team-"));

  const renderPeople = (people: Person[]) => people.map((person, index) => (
    <PersonCard key={person.name} person={person} index={index} onSelect={openPerson} />
  ));

  return (
    <Layout>
      <Reveal as="section" className="page-banner">
        <div className="wrap">
          <p className="text-orange-300 font-semibold mb-2">Key leadership</p>
          <h1 className="text-3xl sm:text-4xl font-serif-heading font-bold max-w-2xl">
            Who holds the trust, and who tests the work.
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            The settlor and managing trustee, the founder trustees, the Board of Management and the
            Board of Advisors govern the Foundation with clear policy and strategic planning.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="wrap py-16">
        <h2 className="text-2xl font-serif-heading font-bold text-navy-950 mb-8">Trust board</h2>
        <div className="team-profile-grid team-profile-grid-trust">
          {renderPeople(trustBoard)}
        </div>
      </Reveal>

      <Reveal as="section" className="wrap pb-16">
        <h2 className="text-2xl font-serif-heading font-bold text-navy-950 mb-8">Board of management</h2>
        <div className="team-profile-grid team-profile-grid-management">
          {renderPeople(boardOfManagement)}
        </div>
      </Reveal>

      <Reveal as="section" className="wrap pb-16">
        <h2 className="text-2xl font-serif-heading font-bold text-navy-950 mb-8">Board of advisors</h2>
        <div className="team-profile-grid team-profile-grid-advisors">
          {renderPeople(advisors.map((advisor) => ({ ...advisor, body: advisor.note })))}
        </div>
      </Reveal>

      <AnimatePresence>
        {selectedPerson && (
          <motion.div className="team-profile-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.28 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPerson(null); }}>
            <motion.aside className="team-profile-panel" role="dialog" aria-modal="true" aria-labelledby="team-profile-name" initial={reducedMotion ? false : { x: "100%" }} animate={{ x: 0 }} exit={reducedMotion ? undefined : { x: "100%" }} transition={{ duration: reducedMotion ? 0 : 0.48, ease: [0.22, 0.7, 0.2, 1] }}>
              <button ref={closeButtonRef} type="button" className="team-profile-close" aria-label="Close profile" onClick={() => setSelectedPerson(null)}>×</button>
              <div className="team-profile-background">
                {showSelectedPhoto ? <DynamicImage slotKey={selectedPerson.slot} alt={selectedPerson.name} /> : <div className="team-profile-placeholder" aria-label={`Portrait for ${selectedPerson.name} has not been added`}><span>{initials(selectedPerson.name)}</span></div>}
                <div className="team-profile-image-shade" />
                <motion.div className="team-profile-panel-copy" initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.48, delay: reducedMotion ? 0 : 0.2, ease: [0.22, 0.7, 0.2, 1] }}>
                  <p className="eyebrow"><span />{selectedPerson.role}</p>
                  <h2 id="team-profile-name">{selectedPerson.name}</h2>
                  <div className="team-profile-rule" />
                  <p>{selectedPerson.body}</p>
                </motion.div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
