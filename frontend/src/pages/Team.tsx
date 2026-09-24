import Layout from "../components/Layout";
import { DynamicImage } from "../lib/ImagesContext";

const trustBoard = [
  { slot: "team-jagannath-patnaik", role: "Founder, Settlor & Managing Trustee", name: "Dr Jagannath Patnaik, MBA, M.Law, Ph.D., D.Litt., D.Sc.",
    body: "Vice Chancellor, The ICFAI University Sikkim. Served as Vice Chancellor of Indian universities for over 16 years and a renowned educationist and author. Holds the Foundation's direction across education, health, youth skills, women's livelihoods and household energy. Recorded in the World Book of Records and recipient of the Utkal Jyoti Award of the Government for social service." },
  { slot: "", role: "Founder Trustee and Vice President", name: "Dr Shrabani Patnaik, M.Sc., M.Phil., Ph.D., D.Litt.",
    body: "M.Sc. Environment, M.Phil. Environment. National Co-Chairman, UNAccc. National President, Women Empowerment Forum. Director, Global Chamber of Consumer Rights, India. Former Secretary, FICCI-FLO Bhubaneswar." },
  { slot: "", role: "Founder Trustee and Treasurer", name: "Adv. Prakriti Patnaik, Ph.D. Scholar, LL.M. (India), LL.M. (Queen Mary, UK), BBA-LL.B. (Hons.)",
    body: "Empaneled Lawyer, YES Bank Ltd. Practising advocate in Bhubaneswar and Cuttack before the High Court, District Courts, Consumer Redressal Forums, Real Estate Regulatory Forum and DRT." },
  { slot: "", role: "Founder Trustee and Secretary", name: "Mr Purushraj Patnaik, BBA-LL.B., LL.M.",
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
  { name: "Dr Jagannath Patnaik", role: "Chair, Board of Advisors", note: "Founder, Settlor & Managing Trustee." },
  { name: "Prof. (Dr.) Pradeep Kumar Joshi", role: "Public Examinations & Higher Education", note: "Chairman, National Testing Agency. Former Chairman, UPSC, MPPSC and CGPSC." },
  { name: "Lt Gen Gurbirpal Singh, PVSM, AVSM, VSM", role: "National Cadet Corps & Defence", note: "Former Director General, NCC (2021–2025)." },
  { name: "Shri O.P. Singh, IPS (Retd.)", role: "Public Order, Disaster Response & Police Reform", note: "Former DGP, Uttar Pradesh; former DG, CISF and NDRF." },
  { name: "Prof. (Dr.) S. S. Mantha", role: "Technical Education & Regulation", note: "Former Chairman, AICTE." },
  { name: "Dr. Avinash Rai Khanna", role: "Public Life & Social Service", note: "Former Member of Parliament (Rajya Sabha)." },
  { name: "Shri Subhash Chandra, IFS (Retd.)", role: "Forests, Environment & Public Institutions", note: "Special Rapporteur, NHRC; Professor of Practice, IIT Indore." },
  { name: "Shri Ajay Misra, IAS (Retd.)", role: "Energy, Renewable Power & Public Service", note: "Director General, Renewable Energy Society of India." },
  { name: "Dr. Ashok Tripathi", role: "Public Sector Governance & Audit", note: "Former Independent Director and Chairman, Audit Committee, Hindustan Photo Films Limited." },
  { name: "Prof. (Dr.) Viney Kapoor Mehra", role: "Law & Higher Education Governance", note: "Founder Vice-Chancellor, Dr. B.R. Ambedkar National Law University, Sonepat." },
  { name: "Prof. (Dr.) Parimal H. Vyas", role: "University Leadership", note: "Provost / Vice Chancellor, AURO University, Surat." },
  { name: "Prof. Raj Nath Yadava", role: "University Leadership", note: "Former Vice Chancellor, Purnea University." },
  { name: "Prof. Sir Manuel Freire-Garabal y Núñez", role: "Global Policy & Higher Education", note: "Founder, Al-Khalifa Business School." },
  { name: "Dr. Murali Rao, MD, DLFAPA", role: "Psychiatry & Medical Education", note: "Board-certified psychiatrist; Medical Director, DuPage Psychiatric Care." },
  { name: "Prof. Martin C.J. Mongiello", role: "Presidential Service & Culinary Heritage", note: "President, U.S. Presidential Service Center." },
  { name: "Dr. Ajay Singh", role: "Social Marketing & Institutional Training", note: "Associate Director, Indian School of Business, Hyderabad." },
  { name: "Shri Anil Khaitan", role: "Industry, Healthcare & Chamber Leadership", note: "Chairman & Managing Director, Sunil Healthcare Limited." },
  { name: "Prof. (Dr) Diwakar Sukul", role: "Clinical Psychology & Integrated Healthcare", note: "Founder of Kamkus Clinic, Harley Street, London." },
  { name: "Prof. Dr. Ghanashyam Lal Das", role: "University Leadership & Higher Education", note: "Former Vice Chancellor, Purbanchal University, Biratnagar, Nepal." },
];

function PersonCard({ slot, role, name, body }: { slot: string; role: string; name: string; body: string }) {
  return (
    <article className="rounded-xl border border-navy-900/10 overflow-hidden">
      {slot ? (
        <DynamicImage slotKey={slot} className="w-full h-56 object-cover" />
      ) : (
        <div className="w-full h-56 bg-navy-900/5" />
      )}
      <div className="p-5">
        <p className="text-orange-500 text-xs font-semibold uppercase tracking-wide mb-1">{role}</p>
        <h3 className="font-serif-heading font-bold text-navy-950 mb-2">{name}</h3>
        <p className="text-sm text-navy-900/70 leading-relaxed">{body}</p>
      </div>
    </article>
  );
}

export default function Team() {
  return (
    <Layout>
      <section className="bg-navy-950 text-white py-16">
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
      </section>

      <section className="wrap py-16">
        <h2 className="text-2xl font-serif-heading font-bold text-navy-950 mb-8">Trust board</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustBoard.map((p) => <PersonCard key={p.name} {...p} />)}
        </div>
      </section>

      <section className="wrap pb-16">
        <h2 className="text-2xl font-serif-heading font-bold text-navy-950 mb-8">Board of management</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boardOfManagement.map((p) => <PersonCard key={p.name} {...p} />)}
        </div>
      </section>

      <section className="wrap pb-16">
        <h2 className="text-2xl font-serif-heading font-bold text-navy-950 mb-8">Board of advisors</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {advisors.map((a) => (
            <div key={a.name} className="rounded-lg border border-navy-900/10 p-4">
              <p className="text-orange-500 text-xs font-semibold uppercase tracking-wide mb-1">{a.role}</p>
              <h4 className="font-semibold text-navy-950 text-sm mb-1">{a.name}</h4>
              <p className="text-xs text-navy-900/60">{a.note}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
