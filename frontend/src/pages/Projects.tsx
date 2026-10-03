import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import Stagger from "../components/Stagger";
import SplitHeading from "../components/SplitHeading";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const projectSteps = [
  {
    number: "01",
    title: "Listen",
    description:
      "Work with communities and local institutions to understand priorities and existing services.",
  },
  {
    number: "02",
    title: "Assess",
    description:
      "Check feasibility, partner capacity, safeguarding needs and likely costs before setting a scope.",
  },
  {
    number: "03",
    title: "Agree a plan",
    description:
      "Define who will deliver what, where resources will come from, and how progress will be checked.",
  },
  {
    number: "04",
    title: "Share progress",
    description:
      "Publish a project status and evidence when work begins; report outcomes only when measured.",
  },
];

export default function Projects() {
  const projectRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const card = projectRef.current;
      if (!card) return;

      const image = card.querySelector(".project-visual img");
      const copy = card.querySelectorAll(".project-copy > *");
      if (reducedMotion) {
        gsap.set([card, image, copy], { clearProps: "all" });
        return;
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 78%",
          once: true,
        },
      });

      timeline.fromTo(
        card,
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          delay: 0.22,
          ease: "power3.out",
        },
      );
      if (image) {
        timeline.fromTo(
          image,
          { scale: 1.12 },
          {
            scale: 1,
            duration: 1.8,
            ease: "power2.out",
          },
          "<0.08",
        );
      }
      timeline.fromTo(
        copy,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
        },
        "<0.18",
      );
    },
    { scope: projectRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <Layout>
      <div className="projects-page">
        <PageHero
          theme="work"
          motif="projects"
          eyebrow="Named projects · Ideas for lasting care"
          title="Named projects and their current stage."
          description="Explore specific initiatives with a defined concept, location or status. The Foundation’s broader areas of focus are described in its programmes."
        />

        <section className="wrap py-16 md:py-24" aria-label="Featured project">
          <article
            ref={projectRef}
            id="senior-citizens-home"
            className="scroll-mt-28 overflow-hidden rounded-2xl border border-navy-900/10 bg-white/55 shadow-[0_24px_70px_rgba(24,55,47,.10)]"
          >
            <div className="grid lg:grid-cols-[1.08fr_.92fr]">
              <div className="project-visual relative min-h-[320px] overflow-hidden bg-navy-950 sm:min-h-[460px]">
                <img
                  src="/images/senior-citizens-home.jpg"
                  alt="Architectural concept rendering of a landscaped courtyard at a senior citizens home"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  loading="lazy"
                />
                <span className="absolute left-5 top-5 rounded-full border border-white/35 bg-navy-950/65 px-4 py-2 text-xs font-semibold uppercase tracking-[.16em] text-white backdrop-blur-sm">
                  Project vision
                </span>
              </div>

              <div className="project-copy flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                <p className="text-xs font-semibold uppercase tracking-[.19em] text-orange-600">
                  Care · Community · Belonging
                </p>
                <h2 className="mt-4 max-w-lg font-serif-heading text-3xl font-bold leading-tight text-navy-950 sm:text-4xl">
                  200-Studio Senior Citizens Home
                </h2>
                <p className="project-location mt-3 text-sm font-medium leading-6 text-navy-900/65">
                  Dream World Religious Centre, Khuntuni, Dhenkanal, Odisha ·
                  G+3 · 1,80,000 sq.ft.
                </p>
                <div className="project-description mt-6 space-y-4 text-navy-900/70">
                  <p>
                    Growing older should not mean growing smaller. Too many
                    elders have a roof and a silence — meals without
                    conversation, days without purpose, care that treats the
                    body and forgets the person.
                  </p>
                  <p>
                    The current concept places the proposed home at Dream World
                    Religious Centre. The Foundation describes its charitable
                    work as secular and open to every community; resident
                    eligibility, the role of the campus’s religious facilities,
                    and any arrangements for meals and daily life should be
                    clearly settled before admissions are invited.
                  </p>
                  <p>
                    The concept is for a residential community of up to 200
                    private studios around a landscaped courtyard. These are
                    planning intentions, not a description of an operating
                    facility.
                  </p>
                  <p>
                    <strong className="font-semibold text-navy-950">
                      Under consideration.
                    </strong>{" "}
                    The concept includes private accommodation, shared outdoor
                    space, meals and access to nearby health services. Service
                    providers, clinical scope, costs and operating arrangements
                    have not been presented as confirmed here.
                  </p>
                  <p>
                    Any future description of resident services, fees,
                    eligibility or opening dates should be published once the
                    plans, approvals, funding and delivery arrangements are
                    confirmed.
                  </p>
                </div>
                <p className="project-status mt-6 text-navy-900/70">
                  <strong className="font-semibold text-navy-950">
                    Status:
                  </strong>{" "}
                  Concept stage; campus plan in place. No admission or opening
                  date is announced on this page.
                </p>
              </div>
            </div>
          </article>
        </section>

        <Reveal
          as="section"
          duration={2.1}
          delayOffset={0.3}
          start="top 80%"
          id="partner-sponsor-index"
          className="wrap scroll-mt-28 py-16 md:py-24"
        >
          <div className="rounded-2xl border border-navy-900/10 bg-white/50 p-7 sm:p-10 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[.19em] text-orange-600">
              Work &amp; partners
            </p>
            <h2 className="mt-3 font-serif-heading text-3xl font-bold text-navy-950 sm:text-4xl">
              Partner / Sponsor Index
            </h2>
            <p className="project-section-intro mt-5 max-w-3xl leading-7 text-navy-900/70">
              The public index distinguishes programme partners, institutional
              partners and sponsors of named projects. A name is published after
              an agreement is signed, not while a conversation is still under
              way.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                [
                  "Programme partners",
                  "Organisations working with us across the Foundation’s six programme areas.",
                ],
                [
                  "Institutional partners",
                  "Schools, health providers and community institutions supporting local delivery.",
                ],
                [
                  "Project sponsors",
                  "Sponsors supporting a named initiative, including the Senior Citizens Home at Khuntuni.",
                ],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-xl border border-navy-900/10 bg-[#f8f7f0] p-5"
                >
                  <h3 className="font-serif-heading text-lg font-bold text-navy-950">
                    {title}
                  </h3>
                  <p className="project-partner-copy mt-2 leading-6 text-navy-900/65">
                    {description}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-navy-900/60">
              No partnership is listed until its agreement is signed.
            </p>
            <a href="/partners" className="project-action mt-6">
              View the Partner / Sponsor Index <span aria-hidden="true">↗</span>
            </a>
          </div>
        </Reveal>

        <section
          className="bg-[#f4f2e9] py-16 md:py-24"
          aria-labelledby="project-admission-title"
        >
          <div className="wrap grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <Reveal as="div" duration={2.1} delayOffset={0.3} start="top 80%">
              <p className="text-xs font-semibold uppercase tracking-[.19em] text-orange-600">
                A practical standard
              </p>
              <SplitHeading
                as="h2"
                id="project-admission-title"
                className="mt-3 font-serif-heading text-3xl font-bold text-navy-950 sm:text-4xl"
              >
                How a project is admitted.
              </SplitHeading>
              <p className="project-section-intro mt-4 max-w-md leading-7 text-navy-900/70">
                Projects move from community input and feasibility checks to
                confirmed plans, delivery and reporting. We will identify active
                work and measured results as those stages are reached.
              </p>
              <div className="project-actions mt-7 flex flex-wrap gap-3">
                <a href="/programmes" className="project-action">
                  Explore our programmes
                </a>
                <a
                  href="/volunteer"
                  className="project-action project-action-secondary"
                >
                  Volunteer for a project
                </a>
              </div>
            </Reveal>
            <Stagger
              className="grid gap-3 sm:grid-cols-2"
              gap={0.18}
              distance={24}
            >
              {projectSteps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-xl border border-navy-900/10 bg-white/70 p-6"
                >
                  <span
                    data-line
                    className="mb-4 block h-0.5 w-full bg-orange-500/70"
                    aria-hidden="true"
                  />
                  <span className="font-serif-heading text-2xl font-bold text-orange-600">
                    {step.number}
                  </span>
                  <h3 className="mt-3 font-serif-heading text-xl font-bold text-navy-950">
                    {step.title}
                  </h3>
                  <p className="project-step-copy mt-2 leading-6 text-navy-900/70">
                    {step.description}
                  </p>
                </article>
              ))}
            </Stagger>
          </div>
        </section>
      </div>
    </Layout>
  );
}
