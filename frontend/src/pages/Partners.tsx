import { tr as t, localize } from "../i18n";
import { useTranslation } from "react-i18next";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import Stagger from "../components/Stagger";
import SplitHeading from "../components/SplitHeading";

type IndexEntry = {
  name: string;
  detail: string;
  status: string;
  href?: string;
};

const partnerGroups: {
  number: string;
  title: string;
  intro: string;
  entries: IndexEntry[];
}[] = [
  {
    number: "01",
    title: "Programme partners",
    intro:
      "Organisations that share field work, training or last-mile presence across a programme line.",
    entries: [
      {
        name: "Leva Sports Club Federation",
        detail:
          "Youth skills & sport corridor — talent that has nowhere else to go.",
        status: "Active association",
      },
      {
        name: "Open for partnership",
        detail:
          "Education, health, women’s livelihoods, land and solar housing.",
        status: "Inviting",
      },
    ],
  },
  {
    number: "02",
    title: "Institutional & knowledge partners",
    intro:
      "Universities, professional bodies and public institutions that lend evidence, training or counsel — not a logo for a day.",
    entries: [
      {
        name: "UNACCC — Unity of Nations Action for Climate Change Council",
        detail:
          "Institutional partner for climate action, sustainable education and the UN Sustainable Development Goals — especially quality education, climate action and partnerships. Counsel for the Foundation’s environment, land and solar-housing work.",
        status: "Institutional partner",
        href: "https://unaccc.org/",
      },
      {
        name: "Open for partnership",
        detail:
          "Research, training of field teams, and review of what a household still has next year.",
        status: "Inviting",
      },
    ],
  },
  {
    number: "03",
    title: "Project sponsors",
    intro:
      "Sponsors who underwrite a named project. The first campus project now open to sponsorship is the Senior Citizens Home at Khuntuni.",
    entries: [
      {
        name: "200-Studio Senior Citizens Home",
        detail:
          "Khuntuni, Dhenkanal — a courtyard home so later years can still feel like life.",
        status: "Sponsorship open",
        href: "/projects#senior-citizens-home",
      },
      {
        name: "Classroom Continuity",
        detail: "Reading rooms and first-generation learner support.",
        status: "Sponsorship open",
      },
      {
        name: "Household Health Access",
        detail: "Preventive camps and a nearby path to family welfare.",
        status: "Sponsorship open",
      },
      {
        name: "Solar Housing for BPL, Tribal and PVTG Families",
        detail: "Rooftop solar and cleaner cooking as a household asset.",
        status: "Sponsorship open",
      },
    ],
  },
  {
    number: "04",
    title: "In-kind & professional support",
    intro:
      "Legal, medical, design, logistics and skills given as time rather than a grant.",
    entries: [
      {
        name: "Open for partnership",
        detail: "Professional hours that a field team can actually use.",
        status: "Inviting",
      },
    ],
  },
];

export default function Partners() {
  useTranslation();
  return (
    <Layout>
      <div className="partners-page">
        <PageHero
          theme="work"
          motif="partners"
          eyebrow={t("Work & partners")}
          title={t("Partner / Sponsor Index")}
          description={t("A public list of organisations that walk with the Foundation — as programme partners or as sponsors of a project. Names are added when an agreement is signed, not when a conversation begins.")}
        />

        <section
          className="wrap py-14 md:py-20"
          aria-labelledby="partner-index-policy"
        >
          <Reveal
            as="div"
            duration={2.1}
            delayOffset={0.3}
            start="top 80%"
            className="partner-policy grid gap-6 lg:grid-cols-[.72fr_1.28fr] lg:gap-16"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.19em] text-orange-600">
                {t("A clear public record")}</p>
              <h2
                id="partner-index-policy"
                className="mt-3 max-w-sm font-serif-heading text-3xl font-bold text-navy-950 sm:text-4xl"
              >
                {t("How a name enters this index")}</h2>
            </div>
            <div>
              <p className="partner-copy">
                {t("Partners help the work hold after the camp comes down. Sponsors underwrite a defined project — a classroom line, a health camp, household solar, or the upcoming Senior Citizens Home at Khuntuni — without turning the Foundation into a billboard.")}</p>
              <p className="partner-copy mt-4">
                {t("The Trust does not sell its name. Listing here means a current understanding: what is being done, where, and what the household should still have a year later.")}</p>
            </div>
            <div className="partner-index-principles mt-8 lg:col-span-2">
              <div>
                <span>01</span>
                <h3>{t("Agreement signed")}</h3>
                <p>{t("A name is added after a formal agreement is in place.")}</p>
              </div>
              <div>
                <span>02</span>
                <h3>{t("Commitment defined")}</h3>
                <p>{t("The work, place and commitment are clearly understood.")}</p>
              </div>
              <div>
                <span>03</span>
                <h3>{t("Publicly listed")}</h3>
                <p>
                  {t("The index records who is involved and what the work is meant to leave behind.")}</p>
              </div>
            </div>
            <div className="partner-registration mt-7 lg:col-span-2">
              <p>
                <strong>{t("CSR registration.")}</strong> {" "}{t("Jagannath Foundation is registered with the Ministry of Corporate Affairs to undertake CSR activities. Registration number")}{" "}<strong>{t("CSR00118119")}</strong>{localize(" ")}
                {t("(Form CSR-1 approved 21 September 2026, SRN AC6085516).")}</p>
              <p className="mt-2">
                {t("Companies may use this number when routing funds under Section 135 of the Companies Act.")}</p>
            </div>
          </Reveal>
        </section>

        <section
          className="partner-index-section py-8 md:py-12"
          aria-label={t("Partner and sponsor categories")}
        >
          <div className="wrap">
            {localize(partnerGroups.map((group, groupIndex) => (
              <Reveal
                as="article"
                duration={1.9}
                delayOffset={0.32}
                start="top 82%"
                delay={groupIndex * 0.18}
                direction={groupIndex % 2 ? "right" : "left"}
                className="partner-index-block"
                key={group.number}
              >
                <header className="partner-index-heading grid gap-3 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.18em] text-orange-600">
                      {localize(group.number)} {" "}{t("· Partnership category")}</p>
                    <h2 className="mt-3 max-w-md font-serif-heading text-2xl font-bold text-navy-950 sm:text-3xl">
                      {localize(group.title)}
                    </h2>
                  </div>
                  <p className="partner-copy max-w-3xl">{localize(group.intro)}</p>
                </header>
                <Stagger
                  className="partner-index-table mt-5"
                  role="list"
                  gap={0.08}
                  distance={14}
                >
                  {localize(group.entries.map((entry) => (
                    <div
                      className={`partner-index-row${entry.status === "Inviting" ? " is-open" : ""}`}
                      role="listitem"
                      key={entry.name}
                    >
                      <div className="partner-index-identity">
                        <strong>{localize(entry.name)}</strong>
                        {localize(entry.href?.startsWith("https://") && (
                          <a
                            href={entry.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="partner-external-link"
                          >
                            {t("Visit UNACCC ↗")}</a>
                        ))}
                      </div>
                      <span className="partner-index-detail">
                        {localize(entry.href === "/projects#senior-citizens-home" ? (
                          <>
                            <a href={entry.href}>{localize(entry.detail)}</a>
                          </>
                        ) : (
                          entry.detail
                        ))}
                      </span>
                      <span className="partner-index-status">
                        {localize(entry.status)}
                      </span>
                    </div>
                  )))}
                </Stagger>
              </Reveal>
            )))}
          </div>
        </section>

        <section
          className="partner-invitation-section bg-navy-950 py-14 md:py-20"
          aria-labelledby="partner-invitation-title"
        >
          <div className="wrap">
            <Reveal
              as="div"
              duration={2.1}
              delayOffset={0.3}
              start="top 80%"
              className="partner-invitation max-w-5xl py-2 text-white"
            >
              <p className="text-xs font-semibold uppercase tracking-[.19em] text-orange-300">
                {t("Build with us")}</p>
              <h2
                id="partner-invitation-title"
                className="mt-3 font-serif-heading text-3xl font-bold text-white sm:text-4xl"
              >
                {t("Write if you wish to be listed.")}</h2>
              <p className="partner-invitation-copy mt-5 max-w-3xl">
                {t("Send the organisation name, the project or programme you wish to stand with, and what you can commit for twelve months. The secretariat will reply with the objects of the trust and the terms on which a name is published here.")}</p>
              <div className="partner-actions mt-8 flex flex-wrap gap-3">
                <a className="partner-action" href="/contact">
                  {t("Write to the Foundation")}</a>
                <a
                  className="partner-action partner-action-secondary"
                  href="/projects#senior-citizens-home"
                >
                  {t("See the Senior Citizens Home")}</a>
                <a
                  className="partner-action partner-action-secondary"
                  href="/donate"
                >
                  {t("Donate")}</a>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </Layout>
  );
}
