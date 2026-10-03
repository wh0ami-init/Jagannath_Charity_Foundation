import { useEffect } from "react";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";

const programmes = [
  {
    num: "01",
    slug: "education-literacy",
    title: "Education & literacy",
    lead: "Literacy is treated as a public good, not a privilege reserved for those who can already pay for it.",
    paragraphs: [
      "Too many children in cities, towns and villages across the country are the first in their family to sit a full school day. The Foundation supports that crossing — with reading rooms, after-school coaching, and material help to government and community schools that are already open.",
      "We also work with adults. A mother who can read a health card, a ration slip or a bank passbook changes the household’s bargaining power. Adult literacy classes are run in community halls, with women facilitators wherever possible.",
      "Vocational and professional skill classes sit beside the books: so that education is not only a certificate, but a path into work.",
    ],
    activities: [
      "Reading rooms and first-generation learner support",
      "Aid to existing schools and training institutes",
      "Adult literacy, with attention to women’s access",
      "Vocational classes linked to local livelihoods",
    ],
    audience:
      "Children, first-generation learners, and adults across the country who were left outside the classroom.",
  },
  {
    num: "02",
    slug: "health-family-welfare",
    title: "Health & family welfare",
    lead: "Most families we meet do not lack courage. They lack a clear, nearby path to preventive care.",
    paragraphs: [
      "The Foundation runs awareness camps and screening days with local health workers — blood pressure, anaemia, maternal nutrition, childhood immunisation follow-up. The aim is not a one-day crowd. It is a habit of checking before a crisis arrives.",
      "Family welfare, for us, includes mental load. Dr Jagannath Patnaik’s teaching of positive living is used here as a practical discipline: sleep, breath, attention, and a calmer household — not as a substitute for medicine.",
      "We work alongside existing PHCs and ASHA networks rather than competing with them. Where a camp finds a case that needs a hospital, we help the family get there.",
    ],
    activities: [
      "Preventive screening and nutrition awareness",
      "Maternal and family wellbeing sessions",
      "Coordination with local health workers and existing services",
      "Referral guidance where a qualified provider recommends further care",
    ],
    audience:
      "Women, children, older people and families with limited access to clear, nearby health information across the country.",
  },
  {
    num: "03",
    slug: "youth-skills-sport",
    title: "Youth skills & sport",
    lead: "A district full of young people is not automatically a district full of livelihoods.",
    paragraphs: [
      "We run mentoring and skill workshops across the country — trades, digital basics, and the civic habits that keep a first job: showing up, keeping accounts, speaking in a room.",
      "Leva Sports Club Federation sits inside this programme. It is a platform for talented sportspersons from cities, villages and the ground between — coaching, competition, and the direction a talent actually needs. Sport here is character work as much as medals.",
      "Youth work is not a camp with a certificate at the end. We prefer small cohorts, follow-up, and introductions to employers, coaches and institutes that already exist.",
    ],
    activities: [
      "Livelihood and digital skill workshops",
      "Mentoring for first-generation job seekers",
      "Leva Sports Club Federation — coaching and competition",
      "Civic purpose and character education",
    ],
    audience:
      "Young people across the country who need a skill, a coach, or a first professional corridor.",
  },
  {
    num: "04",
    slug: "women-livelihoods",
    title: "Women’s livelihoods",
    lead: "A household energy saving that a woman cannot control is not a livelihood. It is a rumour.",
    paragraphs: [
      "Women’s development in our work is not a side event. SHG convergence, solar awareness and livelihood-linked training are led by and for women in the community.",
      "We support dignity, income and leadership for women and girls; protection of the girl child; and practical help that keeps families intact without keeping anyone small.",
      "Where a woman already runs a group, a stall or a farm, we do not replace her. We add skill, market access, and a cleaner energy bill so the surplus stays in her hands.",
    ],
    activities: [
      "Self-help group collaboration, where locally appropriate",
      "Solar and clean-cooking awareness led by women",
      "Leadership practice inside neighbourhood group",
      "Protection and schooling support for the girl child",
    ],
    audience:
      "Women and girls in BPL, tribal and peri-urban households across the country.",
  },
  {
    num: "05",
    slug: "environment-land",
    title: "Environment & land",
    lead: "Climate work that cannot be walked to from a village is not climate work we will sign.",
    paragraphs: [
      "The Foundation’s environmental programme is deliberately local: tree lines, water sense, and soil care on the ground people already use — in communities across the country.",
      "We run community planting days, awareness on waste and water, and household energy reform — because a solar roof is also an environmental act, not only an economic one.",
      "The Foundation’s climate work is local first. A strategic partnership with UNAccc will enhance that objective — it does not replace community implementation.",
    ],
    activities: [
      "Community greening and care for planted areas",
      "Water and soil awareness based on local priorities",
      "Household energy choices as part of environmental planning",
      "Alignment with SDG and clean-energy partners",
    ],
    audience:
      "Rural and peri-urban habitations nationwide, and tribal blocks as the solar programme expands.",
  },
  {
    num: "06",
    slug: "solar-clean-energy",
    title: "Solar housing & clean energy",
    lead: "Traditional welfare hands over assistance. This model helps a family permanently reduce a recurring bill.",
    paragraphs: [
      "Electricity, LPG and cooking fuel are not small lines in a poor household. They are the monthly leak. Jagannath Foundation’s energy work is a household-asset philosophy: rooftop solar, cleaner cooking, and women at the centre of the training, so a recurring bill becomes a saving.",
      "The sequence is the Foundation’s own: identify households, assess the energy load, solarise where it is viable, cut LPG dependence with clean cooking, and put women at the centre. The saving is then available for school, food and livelihood — not for the next cylinder.",
      "India’s PVTG challenge is large and geographically complex. Odisha alone has 13 particularly vulnerable tribal groups — the highest of any Indian state — spread across 20 Micro Project Agencies in 14 districts. Isolated camps will not meet that scale. An integrated household model might. A strategic partnership with UNAccc will enhance this objective; it does not substitute for it",
    ],
    activities: [
      "Rooftop solar and energy-efficiency retrofits for BPL, tribal and PVTG households",
      "Clean cooking to reduce LPG and conventional fuel dependence",
      "Women-led awareness and SHG convergence",
      "Pilot across states, then district and national replication with government partners",
    ],
    audience:
      "Low-income households, including tribal and PVTG communities, where a viable and supported approach can be established.",
  },
];

export default function Work() {
  useEffect(() => {
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    if (!targetId.startsWith("programme-")) return;

    let frame = 0;
    let clearTimer = 0;
    frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => {
        const target = document.getElementById(targetId);
        if (!target) return;
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        target.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "center",
        });
        target.classList.add("is-highlighted");
        clearTimer = window.setTimeout(
          () => target.classList.remove("is-highlighted"),
          3000,
        );
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(clearTimer);
      document.getElementById(targetId)?.classList.remove("is-highlighted");
    };
  }, []);

  return (
    <Layout>
      <PageHero
        theme="work"
        motif="programmes"
        eyebrow="Focus areas"
        title="Six programme areas, planned with care."
        description="These six areas guide the Foundation’s programme planning. Specific activities, locations and delivery partners will be published as they are confirmed."
      />

      <Reveal as="section" className="wrap pt-10" aria-label="Programme status">
        <p className="max-w-3xl border-l-2 border-orange-500 pl-4 text-sm leading-6 text-navy-900/65">
          Programme areas describe the Foundation’s intended focus; they are not
          a count of completed projects or beneficiaries. See{" "}
          <a
            className="font-semibold text-navy-950 underline underline-offset-4"
            href="/projects"
          >
            Projects
          </a>{" "}
          for named initiatives and their current status.
        </p>
      </Reveal>

      <section
        className="wrap space-y-7 py-16 md:space-y-9 md:py-20"
        aria-label="Programme areas"
      >
        {programmes.map((p) => (
          <Reveal
            as="article"
            key={p.num}
            id={`programme-${p.slug}`}
            delay={Number(p.num) % 2 ? 0 : 0.12}
            direction={Number(p.num) % 2 ? "left" : "right"}
            className="work-programme-card rounded-2xl border border-navy-900/10 bg-white p-5 shadow-[0_12px_36px_rgba(24,55,47,.045)] sm:p-7 lg:p-8"
          >
            <div className="grid gap-7 lg:grid-cols-[1.02fr_.98fr] lg:gap-9">
              <div className="py-1">
                <p className="mb-2 text-sm font-semibold tracking-wide text-orange-600">
                  {p.num} <span className="text-navy-900/35">/ 06</span>
                </p>
                <h2 className="font-serif-heading text-2xl font-bold text-navy-950 sm:text-3xl">
                  {p.title}
                </h2>
                <p className="mt-4 text-lg font-semibold leading-7 text-navy-950">
                  {p.lead}
                </p>
                <div className="mt-4 space-y-4 text-sm leading-7 text-navy-900/70 sm:text-base">
                  {p.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <aside
                className="rounded-xl border border-navy-900/10 bg-[#f8f7f2] p-5 sm:p-6"
                aria-label={`${p.title} potential activities and intended audience`}
              >
                <h3 className="font-serif-heading text-xl font-semibold text-navy-950">
                  Potential areas of work
                </h3>
                <ul className="mt-3 divide-y divide-navy-900/10">
                  {p.activities.map((activity) => (
                    <li
                      key={activity}
                      className="py-3 text-sm leading-6 text-navy-900/75"
                    >
                      {activity}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm leading-6 text-navy-900/75">
                  <strong className="font-semibold text-navy-950">
                    Intended focus.{" "}
                  </strong>
                  {p.audience}
                </p>
                <a
                  href="/contact"
                  className="mt-5 inline-flex min-h-11 items-center rounded-full border border-navy-900/40 px-5 text-sm font-medium text-navy-950 transition-colors hover:border-orange-600 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                >
                  Ask about this programme{" "}
                  <span className="ml-2" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </aside>
            </div>
          </Reveal>
        ))}
      </section>
    </Layout>
  );
}
