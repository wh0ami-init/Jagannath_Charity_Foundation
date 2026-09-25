import Layout from "../components/Layout";
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
      <Reveal as="section" className="page-banner">
        <div className="wrap">
          <p className="text-orange-300 font-semibold mb-2">Impact</p>
          <h1 className="text-3xl sm:text-4xl font-serif-heading font-bold max-w-2xl">
            We measure what a household still has next year.
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            The Foundation is young. We will not invent a wall of beneficiaries. We will name the
            problem in the country plainly, and the philosophy we work by.
          </p>
        </div>
      </Reveal>

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
            <Reveal as="article" key={s.label} delay={stats.indexOf(s) * 0.06} className="rounded-xl border border-navy-900/10 p-6 text-center">
              <p className="text-3xl font-serif-heading font-bold text-orange-500">{s.value}</p>
              <p className="mt-2 text-sm text-navy-900/70">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </Layout>
  );
}
