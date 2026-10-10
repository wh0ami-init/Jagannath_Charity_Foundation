import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { DynamicImage } from "../lib/ImagesContext";
import { useSiteContent } from "../lib/SiteContentContext";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

/* Distance from the top of the viewport (below the sticky header) where the
   photo "docks" while it travels. Used for both start and end of the scrub. */
const DOCK = 120;

const credentialTabs = [
  {
    id: "educationist",
    label: "An educationist who turned teaching into a public trust.",
  },
  { id: "appointments", label: "Selected appointments" },
  { id: "books", label: "Books" },
  { id: "recognitions", label: "Selected recognitions" },
];

const appointments = [
  {
    position: "Global Chairman",
    org: "UNACCC – Unity of Nations Action For Climate Change Council",
  },
  { position: "Vice Chancellor", org: "ICFAI University, Sikkim" },
  {
    position: "Vice Chancellor (from 2011)",
    org: "Kalinga University, Raipur",
  },
  { position: "Pro Chancellor", org: "Singhania University" },
  {
    position: "Secretary General",
    org: "Confederation of Indian Universities",
  },
  {
    position: "Director & Vice President",
    org: "Manipal Academy of Higher Education / MEMG",
  },
  {
    position: "Registrar & Director, Distance Education",
    org: "Sikkim Manipal University",
  },
  {
    position: "Academic Registrar",
    org: "International Medical and Technological University, Dar es Salaam",
  },
];

const books: string[] = [
  "Higher Education in the Information Age",
  "Private Initiatives in Higher Education",
  "Financing of Higher Education in India",
  "Vivek Management Model for Industrial Productivity and Profits",
  "Education Management Systems in India",
  "Regulatory Systems in India",
  "Politics of Human Rights in India",
  "Journey of a Curious Mind",
];

const recognitions = [
  "Outstanding Leadership Award, United Nations University – International Leadership Academy, Jordan",
  "Ambassador of Peace, International Association of Educators for World Peace, USA",
  "Doctorates honoris causa in Science, Laws and Literature from international universities",
  "Sadbhavana Award (2013); Utkal Sanman (2013); Kalinga Sanman (2015)",
  "Women Empowerment Award and Education Excellence Award (2015)",
];

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

const tabs = [
  {
    id: "vision",
    label: "Vision",
    title: "Quality of life that lasts",
    body: "To enable communities across the country to improve quality of life — through education, healthcare, livelihoods and lasting household assets — on a sustainable and inclusive basis.",
  },
  {
    id: "mission",
    label: "Mission",
    title: "Women at the centre",
    body: "We exist to serve communities across India, with partners and evidence, putting women at the centre of household economics and turning one-time assistance into a skill, a saving and a school that holds.",
  },
  {
    id: "objects",
    label: "Objects",
    title: "Public benefit only",
    body: "Education, healthcare, relief of poverty, women's and children's welfare, environment, and community development. The Trust does not carry on any activity with the object of earning profit.",
  },
  {
    id: "approach",
    label: "Our approach",
    title: "Four disciplines",
    body: "Four practical disciplines guide how we work with communities and partners.",
  },
  {
    id: "dream",
    label: "The founder's dream",
    title: "Dr Jagannath Patnaik, MBA, M.Law, Ph.D., D.Litt., D.Sc.",
    body: "I did not first meet social service in a conference hall. I met it as a child, in the ordinary work of standing with people who had less than they needed. Those early days taught me a sentence that has never left me: Manav seva is Ishwar seva — service to the human being is service to God. Not as a slogan, but as a discipline. Vice Chancellor, The ICFAI University Sikkim. He has served as Vice Chancellor of Indian universities for over 16 years and is a renowned educationist and author. Recorded in the World Book of Records and recipient of the Utkal Jyoti Award of the Government for social service. On 17 August 2026 he settled Jagannath Foundation as an irrevocable public charitable trust so that classrooms, health camps, skills and household energy could be held for public benefit alone — across the country, without private profit.",
  },
];

const disciplines = [
  {
    title: "Dignity first",
    body: "People we work with are partners in a household’s future, not recipients of a spectacle. We show up with respect, keep records, and do not photograph anyone into a slogan.",
  },
  {
    title: "Evidence over theatre",
    body: "A camp that looks busy is not the same as a bill that falls, a girl who stays in school, or a skill that pays. We design for what a family can still feel twelve months later.",
  },
  {
    title: "Communities first",
    body: "We work with existing schools, health workers, self-help groups and panchayats across the country rather than inventing a parallel system.",
  },
  {
    title: "Women at the centre",
    body: "Household energy, savings, nutrition and children’s schooling move when women have information, income and a seat at the table. Our programmes are built around that fact",
  },
];

const focusAreas = [
  {
    number: "01",
    slug: "education-literacy",
    title: "Education & literacy",
    detail: "Support for learning, literacy and schools.",
  },
  {
    number: "02",
    slug: "health-family-welfare",
    title: "Health & family welfare",
    detail: "Preventive care, nutrition awareness and family wellbeing.",
  },
  {
    number: "03",
    slug: "youth-skills-sport",
    title: "Youth skills & sport",
    detail: "Skills, mentoring and routes into opportunity.",
  },
  {
    number: "04",
    slug: "women-livelihoods",
    title: "Women’s livelihoods",
    detail: "Livelihood training and leadership for women and girls.",
  },
  {
    number: "05",
    slug: "environment-land",
    title: "Environment & land",
    detail: "Community care for local greening, water and soil.",
  },
  {
    number: "06",
    slug: "solar-clean-energy",
    title: "Solar housing & clean energy",
    detail: "Household solar and cleaner cooking initiatives.",
  },
];

const organisationFacts = [
  ["Legal form", "Public charitable trust"],
  ["Established", "17 August 2026"],
  ["Geography", "Across India"],
  ["Trust headquarters", "Foundation House, Bhubaneswar"],
  ["Scope of work", "Nationwide"],
  ["Record", "DARPAN, NITI Aayog"],
];

function TypewriterText({
  text,
  reducedMotion,
}: {
  text: string;
  reducedMotion: boolean;
}) {
  const [visibleText, setVisibleText] = useState(reducedMotion ? text : "");

  useEffect(() => {
    if (reducedMotion) {
      setVisibleText(text);
      return;
    }

    setVisibleText("");
    let position = 0;
    const timer = window.setInterval(() => {
      position = Math.min(position + 2, text.length);
      setVisibleText(text.slice(0, position));
      if (position >= text.length) window.clearInterval(timer);
    }, 24);

    return () => window.clearInterval(timer);
  }, [text, reducedMotion]);

  return (
    <p className="founder-dream-text">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {visibleText}
        {!reducedMotion && visibleText.length < text.length && (
          <span className="typewriter-caret">▍</span>
        )}
      </span>
    </p>
  );
}

export default function About() {
  const siteContent = useSiteContent();
  const [active, setActive] = useState("vision");
  const current = tabs.find((t) => t.id === active)!;
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const flyEnabled = isDesktop && !reducedMotion;
  const [landed, setLanded] = useState(false);
  const [credTab, setCredTab] = useState("educationist");

  const flyerRef = useRef<HTMLDivElement>(null);
  const leftSlotRef = useRef<HTMLDivElement>(null);
  const rightSlotRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLElement>(null);

  /* Move the founder photo from its introduction into the founder's story.
     Scrubbed, so scrolling back up plays it in reverse automatically. ---- */
  useGSAP(
    () => {
      const flyer = flyerRef.current;
      const left = leftSlotRef.current;
      const right = rightSlotRef.current;
      if (!flyEnabled || !flyer || !left || !right) {
        setLanded(false);
        return;
      }

      const pageRect = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left + window.scrollX,
          y: r.top + window.scrollY,
          w: r.width,
        };
      };

      gsap.set(flyer, { transformOrigin: "0 0" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: left,
          start: `top ${DOCK}px`,
          endTrigger: right,
          end: `top ${DOCK}px`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => setLanded(tl.progress() > 0.985),
      });

      // Keep the photo aligned with the viewport during the scroll.
      tl.to(
        flyer,
        {
          y: () => pageRect(right).y - pageRect(left).y,
          scale: () => pageRect(right).w / pageRect(left).w,
          duration: 1,
        },
        0,
      );
      // Move the photo horizontally after the story text is visible.
      tl.to(
        flyer,
        {
          x: () => pageRect(right).x - pageRect(left).x,
          ease: "power3.in",
          duration: 1,
        },
        0,
      );

      return () => setLanded(false);
    },
    { dependencies: [flyEnabled], revertOnUpdate: true },
  );

  // heights change when tabs switch -> re-measure the trigger positions
  useEffect(() => {
    if (!flyEnabled) return;
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60);
    return () => window.clearTimeout(id);
  }, [credTab, active, flyEnabled]);

  const goToDream = () => {
    setActive("dream");
    const right = rightSlotRef.current;
    const section = tabsRef.current;
    let y = 0;
    if (flyEnabled && right) {
      // Match the transform endpoint to the photo's final layout position.
      y = right.getBoundingClientRect().top + window.scrollY - DOCK + 2;
    } else if (section) {
      y = section.getBoundingClientRect().top + window.scrollY - 96;
    }
    const html = document.documentElement;
    html.style.scrollBehavior = "auto"; // stop CSS smooth-scroll fighting GSAP
    const restore = () => {
      html.style.scrollBehavior = "";
    };
    gsap.to(window, {
      scrollTo: { y, autoKill: true },
      duration: reducedMotion ? 0 : 1.7,
      ease: "power2.inOut",
      onComplete: restore,
      onInterrupt: restore,
    });
  };

  const dreamTab = tabs.find((tab) => tab.id === "dream")!;

  return (
    <Layout>
      <PageHero
        theme="about"
        motif="origin"
        eyebrow="About the Foundation"
        title={
          siteContent.about_heading?.value ||
          "A trust held for the public good."
        }
        description={
          siteContent.about_intro?.value ||
          "Jagannath Foundation is an irrevocable public charitable trust. Its income and property are applied only to its charitable objects, without private profit."
        }
      />

      <section
        className="about-organisation wrap"
        aria-labelledby="about-organisation-title"
      >
        <Reveal
          as="div"
          className="about-organisation-copy"
          direction="left"
          duration={1.35}
        >
          <p className="eyebrow">The organisation</p>
          <h2 id="about-organisation-title">
            Civic work across the country, with a wider partnership behind it.
          </h2>
          <p>
            The Foundation was established by the settlor, Dr Jagannath Patnaik,
            with an initial corpus, and founder trustees invited to hold the
            property for public benefit. Its objects cover education,
            healthcare, relief of poverty, women’s and children’s welfare,
            environment, and community development.
          </p>
          <p>
            We work directly with communities across India — cities, towns and
            villages — because a trust that only serves one district has no
            business announcing a nation.
          </p>
          <p>
            The work is secular. Programmes are open to every community. We do
            not ask anyone to belong to a tradition in order to sit in a
            classroom, a camp or a self-help group.
          </p>
        </Reveal>
        <Reveal
          as="aside"
          className="about-organisation-facts"
          direction="right"
          duration={1.35}
          delay={0.16}
        >
          <h3>At a glance</h3>
          <dl>
            {organisationFacts.map(([label, value], index) => (
              <motion.div
                key={label}
                className="about-organisation-fact"
                initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.65,
                  delay: reducedMotion ? 0 : 0.2 + index * 0.1,
                  ease: [0.22, 0.7, 0.2, 1],
                }}
              >
                <motion.dt
                  initial={reducedMotion ? false : { opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.7,
                    delay: reducedMotion ? 0 : 0.12,
                    ease: [0.22, 0.7, 0.2, 1],
                  }}
                >
                  {label}
                </motion.dt>
                <dd>{value}</dd>
              </motion.div>
            ))}
          </dl>
        </Reveal>
      </section>

      <Reveal as="section" className="wrap py-12">
        <div className="max-w-4xl">
          <h2 className="text-3xl font-serif-heading font-bold text-navy-950 mb-3">
            Statutory registrations
          </h2>
          <p className="text-sm text-navy-900/70 mb-6">
            The Foundation is a public charitable trust, recorded on NITI Aayog
            DARPAN, provisionally registered for tax exemption, and approved by
            the Ministry of Corporate Affairs to undertake CSR activities.
          </p>
          <dl className="grid sm:grid-cols-[minmax(12rem,1fr)_2fr] gap-x-6 gap-y-3 text-sm border border-navy-900/10 rounded-xl p-5">
            <dt className="text-navy-900/60">PAN</dt>
            <dd className="font-medium text-navy-950">AAFTJ8006Q</dd>
            <dt className="text-navy-900/60">DARPAN (NITI Aayog)</dt>
            <dd className="font-medium text-navy-950">
              OR/2026/1196699 · registered 02-09-2026
            </dd>
            <dt className="text-navy-900/60">
              Provisional registration u/s 12A
            </dt>
            <dd className="font-medium text-navy-950">URN AAFTJ8006QE20261</dd>
            <dt className="text-navy-900/60">Provisional approval u/s 80G</dt>
            <dd className="font-medium text-navy-950">
              URN AAFTJ8006QF20261 · Form 10G dated 07-09-2026 · valid TY
              2026-27 to TY 2028-29
            </dd>
            <dt className="text-navy-900/60">MCA CSR registration</dt>
            <dd className="font-medium text-navy-950">
              CSR00118119 · Form CSR-1 dated 21-09-2026 · SRN AC6085516 · ROC
              Delhi
            </dd>
          </dl>
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="about-focus wrap"
        aria-labelledby="about-focus-heading"
      >
        <div className="about-focus-heading">
          <div>
            <p className="eyebrow">Where we work</p>
            <h2 id="about-focus-heading">Six connected areas of service</h2>
          </div>
          <p>
            Our charitable objects take shape through practical programmes that
            support people, households and the communities around them.
          </p>
        </div>
        <div className="about-focus-grid">
          {focusAreas.map((area, index) => (
            <motion.a
              href={`/programmes#programme-${area.slug}`}
              aria-label={`Explore ${area.title} programme`}
              key={area.number}
              className="about-focus-card"
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{
                duration: reducedMotion ? 0 : 0.85,
                delay: reducedMotion ? 0 : index * 0.1,
                ease: [0.22, 0.7, 0.2, 1],
              }}
            >
              <span>{area.number}</span>
              <h3>{area.title}</h3>
              <p>{area.detail}</p>
              <b aria-hidden="true">↗</b>
            </motion.a>
          ))}
        </div>
      </Reveal>

      <section
        className="about-principles wrap"
        aria-labelledby="about-principles-title"
      >
        <header className="about-principles-heading">
          <p className="eyebrow">Our commitments</p>
          <h2 id="about-principles-title">
            Built for lasting change, guided by public trust.
          </h2>
          <p>
            The way we work in communities and the way we govern the Foundation
            are rooted in the same promise: lasting public benefit.
          </p>
        </header>
        <div className="about-principles-grid">
          <Reveal as="article" className="about-principle" direction="left">
            <span className="about-principle-number" aria-hidden="true">
              01
            </span>
            <p className="eyebrow">Work philosophy</p>
            <h3>Lasting household assets, not one-time assistance.</h3>
            <p>
              Lasting change can mean a child staying in school, care arriving
              before a crisis, a skill creating income, or a household energy
              asset reducing monthly costs. We build on the institutions people
              already rely on: schools, clinics, self-help groups and
              panchayats.
            </p>
            <p className="about-principle-note">
              Our strategic partnership with UNACCC will support our climate and
              household-energy objectives.
            </p>
          </Reveal>
          <Reveal
            as="article"
            className="about-principle"
            direction="right"
            delay={0.12}
          >
            <span className="about-principle-number" aria-hidden="true">
              02
            </span>
            <p className="eyebrow">Governance</p>
            <h3>Accountable leadership. Open participation.</h3>
            <p>
              Founder trustees hold the trust for public benefit. A management
              body leads programmes, while general members can strengthen
              fieldwork, fundraising and our district presence.
            </p>
            <div className="about-membership-callout">
              <p>
                Membership is open by application and supports the Foundation’s
                charitable work.
              </p>
              <a className="about-membership-link" href="/contact">
                Apply to take part <span aria-hidden="true">↗</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Founder introduction and profile content. */}
      <section
        className="founder-intro wrap"
        aria-labelledby="founder-intro-title"
      >
        <div className="founder-intro-photo">
          <div ref={leftSlotRef} className="founder-slot founder-slot--left">
            {/* The parent handles the scroll transition; the child handles entry. */}
            <div ref={flyerRef} className="founder-flyer">
              <motion.div
                className="about-founder-visual"
                initial={reducedMotion ? false : { opacity: 0, scale: 0.975 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: reducedMotion ? 0 : 1.2,
                  ease: [0.22, 0.7, 0.2, 1],
                }}
              >
                <DynamicImage
                  slotKey="about-founder-photo"
                  alt="Dr Jagannath Patnaik, founder of Jagannath Foundation"
                  className="about-founder-image"
                />
                <svg
                  className="about-founder-frame"
                  aria-hidden="true"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M50 1 H99 V99 H1 V1 H50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <AnimatePresence>
                  {flyEnabled && landed && active === "dream" && (
                    <motion.div
                      className="founder-dream-overlay"
                      key="founder-dream-overlay"
                      initial={{ opacity: 0, y: 22, scale: 0.985 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 14, scale: 0.99 }}
                      transition={{ duration: 0.78, ease: [0.22, 0.7, 0.2, 1] }}
                    >
                      <p className="founder-dream-kicker">
                        The founder's dream
                      </p>
                      <h3>{dreamTab.title}</h3>
                      <TypewriterText
                        text={dreamTab.body}
                        reducedMotion={Boolean(reducedMotion)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>

        <Reveal as="div" className="founder-intro-copy" direction="right">
          <p className="eyebrow">Founder &amp; Managing Trustee</p>
          <h2 id="founder-intro-title">Dr Jagannath Patnaik</h2>
          <blockquote className="founder-quote">
            “Service is not a performance. It is the daily work of making
            education reachable, health understandable, and young people
            employable.”
          </blockquote>
          <p>
            Dr Patnaik is a teacher of positive living and purposeful leadership
            — a practical discipline of calm, work and service. He founded the
            trust to turn that teaching into classrooms, health awareness, youth
            skills, women’s agency and care for the living environment across
            the country, without private profit. The picture he could not put
            down — a child in school, a bill that no longer ate the month — is
            the duty the Foundation now holds.
          </p>

          <button
            type="button"
            className="founder-dream-button"
            onClick={goToDream}
          >
            Know Founder's Dream <span aria-hidden="true">↓</span>
          </button>

          <div className="founder-credentials">
            <div
              className="founder-cred-tabs"
              role="tablist"
              aria-label="Founder background"
            >
              {credentialTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={credTab === t.id}
                  aria-controls="founder-cred-panel"
                  onClick={() => setCredTab(t.id)}
                  className="founder-cred-tab"
                  title={t.label}
                >
                  {credTab === t.id && (
                    <motion.span
                      className="tab-shape"
                      aria-hidden="true"
                      initial={{ opacity: reducedMotion ? 1 : 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: reducedMotion ? 0 : 0.22 }}
                    />
                  )}
                  <span className="tab-label">{t.label}</span>
                </button>
              ))}
            </div>
            <motion.div
              className="founder-cred-panel"
              id="founder-cred-panel"
              role="tabpanel"
              key={credTab}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.45,
                ease: [0.22, 0.7, 0.2, 1],
              }}
            >
              {credTab === "educationist" && (
                <>
                  <p>
                    Dr Patnaik is a teacher of positive living and purposeful
                    leadership, a distinguished academician, author and
                    education administrator. His career has been spent building
                    and running universities, institutes and skill programmes in
                    India and overseas — medical, dentistry, engineering,
                    management and public schooling — from concept to
                    commissioning.
                  </p>
                  <p>
                    He is currently Vice Chancellor of ICFAI University. Earlier
                    appointments include Vice Chancellor of Kalinga University,
                    Raipur; Pro Chancellor of Singhania University; Secretary
                    General of the Confederation of Indian Universities;
                    Director and Vice President of the Manipal Academy of Higher
                    Education and the Manipal Education and Medical Group;
                    Registrar and Director of Distance Education at Sikkim
                    Manipal University; and Academic Registrar of the
                    International Medical and Technological University, Dar es
                    Salaam. He also serves as Global Chairman of UNACCC — a
                    strategic partnership that will enhance the Foundation’s
                    climate and household-energy objectives.
                  </p>
                  <p>
                    He has advised institutions including the British Medical
                    Journal, the Pharmaceutical Advisory Forum of the Government
                    of India, Aptech Computer Education, the Society of Business
                    Practitioners (England), ICFAI University projects, and the
                    International Management Centre, Australia. His public work
                    has long sat at the junction of education, youth
                    livelihoods, women’s agency and human rights.
                  </p>
                </>
              )}
              {credTab === "appointments" && (
                <div className="cred-table-wrap">
                  <table className="cred-table">
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Institution / Organization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((a) => (
                        <tr key={a.position + a.org}>
                          <th scope="row">{a.position}</th>
                          <td>{a.org}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {credTab === "books" &&
                (books.length ? (
                  <ul>
                    {books.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Publication details will be added soon.</p>
                ))}
              {credTab === "recognitions" && (
                <ul>
                  {recognitions.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        </Reveal>
      </section>

      <section
        ref={tabsRef}
        id="founder-dream"
        className="about-content wrap py-16 grid lg:grid-cols-[2fr_1fr] gap-10"
      >
        <div className="about-information">
          <div
            className="about-tabs flex flex-wrap gap-2 mb-6"
            role="tablist"
            aria-label="About the Foundation"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active === t.id}
                aria-controls="about-tab-panel"
                onClick={() => setActive(t.id)}
                className={`about-tab-button px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  active === t.id
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-navy-900/20 text-navy-900/70 hover:border-orange-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <motion.div
            className="about-tab-panel"
            key={current.id}
            id="about-tab-panel"
            role="tabpanel"
            aria-live={current.id === "dream" ? "off" : "polite"}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 1.05,
              ease: [0.22, 0.7, 0.2, 1],
            }}
          >
            <h3>
              {current.id === "dream" ? "A lifelong conviction" : current.title}
            </h3>
            {current.id === "approach" ? (
              <div className="discipline-grid">
                {disciplines.map((discipline, index) => (
                  <motion.article
                    key={discipline.title}
                    initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reducedMotion ? 0 : 0.9,
                      delay: reducedMotion ? 0 : 0.18 + index * 0.16,
                    }}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h4>{discipline.title}</h4>
                    <p>{discipline.body}</p>
                  </motion.article>
                ))}
              </div>
            ) : (
              <p>
                {current.id === "dream"
                  ? flyEnabled
                    ? "The founder's early experience of standing alongside people shaped a belief that service to people is service to God—and the purpose behind this Foundation."
                    : dreamTab.body
                  : current.body}
              </p>
            )}
          </motion.div>
        </div>
        <aside className="about-founder-column">
          {flyEnabled && (
            <div
              ref={rightSlotRef}
              className="founder-slot founder-slot--right"
              aria-hidden="true"
            />
          )}
          <a
            href="/assets/organization-profile.pdf"
            className="about-profile-download"
          >
            Download Organisation Profile (PDF)
          </a>
        </aside>
      </section>
    </Layout>
  );
}
