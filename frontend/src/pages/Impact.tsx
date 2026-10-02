import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";

const stats = [
  { value: "22.85%", label: "of Odisha's population is Scheduled Tribe" },
  { value: "1,759", label: "PVTG habitations identified under PM-JANMAN" },
  { value: "3.1 lakh+", label: "PVTG persons across 54 blocks" },
  { value: "13", label: "PVTG groups — highest of any state" },
];

export default function Impact() {
  return (
    <Layout>
      <PageHero theme="impact" motif="measure" eyebrow="Impact" title="We measure what a household still has next year." description="The Foundation is young. We will not invent a wall of beneficiaries. We will name the problem in the country plainly, and the philosophy we work by." />

      <Reveal as="section" className="wrap py-16">
        <h2 className="text-2xl font-serif-heading font-bold text-navy-950 max-w-2xl">
          India's PVTG challenge is large and geographically complex.
        </h2>
        <p className="mt-4 max-w-2xl text-navy-900/70 leading-relaxed">
          Odisha has 13 particularly vulnerable tribal groups — the highest of any Indian state —
          spread across 20 Micro Project Agencies in 14 districts. PM-JANMAN habitation data
          identifies 1,759 PVTG habitations and over 3.1 lakh PVTG persons across 54 blocks.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <Reveal as="article" key={s.label} delay={stats.indexOf(s) * 0.1} direction={stats.indexOf(s) % 2 ? "right" : "left"} className="rounded-xl border border-navy-900/10 p-6 text-center">
              <p className="text-3xl font-serif-heading font-bold text-orange-500">{s.value}</p>
              <p className="mt-2 text-sm text-navy-900/70">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="wrap pb-16 md:pb-24">
        <div className="border-t border-navy-900/15 pt-8 md:grid md:grid-cols-[.7fr_1.3fr] md:gap-12">
          <h2 className="font-serif-heading text-2xl font-bold text-navy-950 sm:text-3xl">A public record should stand up to scrutiny.</h2>
          <p className="mt-4 text-base leading-7 text-navy-900/70 md:mt-0 md:text-lg">
            We will not publish invented beneficiary walls, unfinished installation counts, or photographs that outrun the work. When a number is ready to stand a year later, it will be named here.
          </p>
        </div>
      </Reveal>
    </Layout>
  );
}
