import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const projects = [
  {
    title: "Classroom Continuity",
    description: "Reading rooms, first-generation learner support and practical help to schools already doing the hard work — so a child does not drop out when a term fee or a textbook stands in the way.",
    status: "Design and partner mapping.",
  },
  {
    title: "Household Health Access",
    description: "Preventive camps, nutrition awareness and a nearby path to family welfare. The measure is whether a household still knows where to go the next time illness arrives.",
    status: "Design and district pairing.",
  },
  {
    title: "Youth Skills & Sport Corridor",
    description: "Livelihood workshops, mentoring, and the Leva Sports Club Federation as a corridor for talent that has nowhere else to go.",
    status: "Partnership design.",
  },
  {
    title: "Women at the Centre of the Household Economy",
    description: "Self-help groups, livelihood training and leadership — so a saving or a solar asset is not spent without the woman of the house.",
    status: "Group identification with local institutions.",
  },
  {
    title: "Land, Water and Village Green",
    description: "Local greening, water and soil awareness, and community care for land that can be walked to from the village — not a distant climate brochure.",
    status: "Site identification.",
  },
  {
    title: "Solar Housing for BPL, Tribal and PVTG Families",
    description: "Affordable rooftop solar and cleaner cooking that turns a recurring bill into a household asset. First field concentration where the PVTG challenge is largest.",
    status: "Technical and household assessment model.",
  },
];

const projectSteps = [
  { number: "01", title: "Identify", description: "Map BPL, tribal and PVTG households in a block with local institutions — not from a desk in the city." },
  { number: "02", title: "Assess", description: "Read the actual energy, health and livelihood load of the household." },
  { number: "03", title: "Install lasting assets", description: "Solarise where it is viable. Pair with clean cooking, skills and school support." },
  { number: "04", title: "Hold the line", description: "The work is finished when the household keeps the saving — not when a banner comes down." },
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
        eyebrow="Projects · Ideas for lasting care"
        title="Places and possibilities, built around people."
        description="Explore the initiatives we are developing to make dignity, connection and everyday support part of community life."
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
                Dream World Religious Centre, Khuntuni, Dhenkanal, Odisha · G+3 · 1,80,000 sq.ft.
              </p>
              <div className="project-description mt-6 space-y-4 text-navy-900/70">
                <p>Growing older should not mean growing smaller. Too many elders have a roof and a silence — meals without conversation, days without purpose, care that treats the body and forgets the person.</p>
                <p>This home is being raised so that later life can still feel like life. It sits inside the Dream World Religious Centre: a campus of prayer, learning, healing and service. An elder is not parked at the edge of the world. They remain in the middle of it — near a garden, near a kitchen that cooks with care, near a health centre, near the sound of students and the quiet of a shrine.</p>
                <p>This is home-care in the truest sense. Not a ward. A neighbourhood of two hundred private studios around a landscaped inner court, where morning light, companionship and respectful help are part of the building itself.</p>
                <p><strong className="font-semibold text-navy-950">What residents will find.</strong> Private studios with light and rest. A courtyard garden to walk at dusk. Daily sattvic meals at the campus Annapurna Bhandar. A primary health centre with kidney, heart and Ayurvedic care as a short walk away. A living campus — world religion centre, museum of all faiths, gurukul courtyards and a goshala — so an elder still belongs to a community.</p>
                <p>Happiness in later years is not a programme. It is a rhythm: a clean room of one’s own, a name spoken kindly, a meal that arrives warm, a path to walk, a doctor nearby, and a reason to dress in the morning. Families will know their parent is safe. The parent will know they have not been sent away. That difference is the whole project.</p>
              </div>
              <p className="project-status mt-6 text-navy-900/70">
                <strong className="font-semibold text-navy-950">Status:</strong> Upcoming — concept and campus plan in place. Expressions of interest will open as construction milestones are reached.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="bg-[#e8ebe2] py-16 md:py-24" aria-labelledby="project-pipeline-title">
        <div className="wrap">
          <Reveal as="div" duration={2.1} delayOffset={0.3} start="top 80%" className="mb-9 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[.19em] text-orange-600">The work ahead</p>
            <h2 id="project-pipeline-title" className="mt-3 font-serif-heading text-3xl font-bold text-navy-950 sm:text-4xl">Projects built around lasting change.</h2>
            <p className="project-section-intro mt-4 leading-7 text-navy-900/70">The Foundation’s first projects follow six programmes — each shaped with local institutions and designed to make a practical difference in everyday life.</p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal as="article" key={project.title} duration={2.1} delayOffset={0.3} start="top 80%" delay={(index % 3) * 0.14} direction={index % 2 ? "right" : "left"} className="flex h-full flex-col rounded-xl border border-navy-900/10 bg-white/75 p-6 shadow-[0_12px_34px_rgba(24,55,47,.05)] transition-transform duration-300 hover:-translate-y-1">
                <span className="text-sm font-semibold text-orange-600">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-serif-heading text-xl font-bold leading-snug text-navy-950">{project.title}</h3>
                <p className="project-summary-copy mt-3 flex-1 text-navy-900/70">{project.description}</p>
                <p className="project-status mt-5 text-navy-900/70"><strong className="text-navy-950">Status:</strong> {project.status}</p>
              </Reveal>
            ))}
            <Reveal as="article" duration={2.1} delayOffset={0.3} start="top 80%" delay={0.18} className="flex h-full flex-col rounded-xl border border-orange-500/30 bg-[#fff8eb] p-6 shadow-[0_12px_34px_rgba(24,55,47,.05)] transition-transform duration-300 hover:-translate-y-1">
              <span className="text-sm font-semibold text-orange-600">07</span>
              <h3 className="mt-3 font-serif-heading text-xl font-bold leading-snug text-navy-950">200-Studio Senior Citizens Home</h3>
              <p className="project-summary-copy mt-3 flex-1 text-navy-900/70">A courtyard home at Khuntuni, Dhenkanal, so elders live with company, care and quiet joy — not as patients in an institution, but as residents of a living community.</p>
              <p className="project-status mt-5 text-navy-900/70"><strong className="text-navy-950">Status:</strong> Upcoming. <a className="font-semibold text-orange-700 underline underline-offset-4" href="#senior-citizens-home">Read the project</a>.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <Reveal as="section" duration={2.1} delayOffset={0.3} start="top 80%" id="partner-sponsor-index" className="wrap scroll-mt-28 py-16 md:py-24">
        <div className="rounded-2xl border border-navy-900/10 bg-white/50 p-7 sm:p-10 lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[.19em] text-orange-600">Work &amp; partners</p>
          <h2 className="mt-3 font-serif-heading text-3xl font-bold text-navy-950 sm:text-4xl">Partner / Sponsor Index</h2>
          <p className="project-section-intro mt-5 max-w-3xl leading-7 text-navy-900/70">Organisations that walk with the Foundation are listed in a public index — programme partners, institutional partners, and sponsors of a named project, including the Senior Citizens Home at Khuntuni. A name is published when an agreement is signed, not when a conversation begins.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Programme partners", "Organisations working with us across the Foundation’s six programme areas."],
              ["Institutional partners", "Schools, health providers and community institutions supporting local delivery."],
              ["Project sponsors", "Sponsors supporting a named initiative, including the Senior Citizens Home at Khuntuni."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-xl border border-navy-900/10 bg-[#f8f7f0] p-5">
                <h3 className="font-serif-heading text-lg font-bold text-navy-950">{title}</h3>
                <p className="project-partner-copy mt-2 leading-6 text-navy-900/65">{description}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-navy-900/60">No partnership is listed until its agreement is signed.</p>
          <a href="/partners" className="project-action mt-6">View the Partner / Sponsor Index <span aria-hidden="true">↗</span></a>
        </div>
      </Reveal>

      <section className="bg-[#f4f2e9] py-16 md:py-24" aria-labelledby="project-admission-title">
        <div className="wrap grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <Reveal as="div" duration={2.1} delayOffset={0.3} start="top 80%">
            <p className="text-xs font-semibold uppercase tracking-[.19em] text-orange-600">A practical standard</p>
            <h2 id="project-admission-title" className="mt-3 font-serif-heading text-3xl font-bold text-navy-950 sm:text-4xl">How a project is admitted.</h2>
            <p className="project-section-intro mt-4 max-w-md leading-7 text-navy-900/70">A project begins with the people and the place. We work with local institutions to understand what households need, then stay accountable for lasting results.</p>
            <div className="project-actions mt-7 flex flex-wrap gap-3">
              <a href="/work" className="project-action">See the six programmes</a>
              <a href="/volunteer" className="project-action project-action-secondary">Volunteer for a project</a>
            </div>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {projectSteps.map((step, index) => (
              <Reveal as="article" key={step.number} duration={2.1} delayOffset={0.3} start="top 80%" delay={index * 0.14} direction={index % 2 ? "right" : "left"} className="rounded-xl border border-navy-900/10 bg-white/70 p-6">
                <span className="font-serif-heading text-2xl font-bold text-orange-600">{step.number}</span>
                <h3 className="mt-3 font-serif-heading text-xl font-bold text-navy-950">{step.title}</h3>
                <p className="project-step-copy mt-2 leading-6 text-navy-900/70">{step.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      </div>
    </Layout>
  );
}
