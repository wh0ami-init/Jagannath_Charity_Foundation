import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";

const stats = [
  { value: "22.85%", label: "of Odisha's population is Scheduled Tribe" },
  { value: "1,759", label: "PVTG habitations identified under PM-JANMAN" },
  { value: "3.1 lakh+", label: "PVTG persons across 54 blocks" },
  { value: "13", label: "PVTG groups — highest of any state" },
];

const fieldRecords = [
  {
    title: "Health & family welfare — voluntary blood donation",
    description:
      "“Give the Gift of Life,” organised with Rotary Club of Bhubaneswar Neeladri (District 3262), HDFC Bank, Gayatridevi Group, FICCI FLO and Red Cross partners. Donors received certificates of appreciation for voluntary blood donation.",
    photos: [
      ["blood-camp-floor", "Donors at the Gift of Life blood donation camp", "Camp floor under the Gift of Life banner."],
      ["blood-donor-woman", "A woman donating blood", "A donor on the camp couch."],
      ["blood-camp-team", "Partners and donors at the camp", "Organisers with donors during collection."],
      ["blood-cert-woman", "Certificate of appreciation presented to a woman donor", "Certificate of Appreciation for voluntary donation."],
      ["blood-cert-man", "Certificate of appreciation presented to a young man", "Certificate presented to a young donor."],
    ],
  },
  {
    title: "Children’s welfare — a meal, a birthday, time spent",
    description:
      "Trustees and volunteers visited a children’s home: supplies packed, a birthday marked for Raj, cakes shared on the stairs, and a meal served on steel thalis in the dining hall.",
    photos: [
      ["home-packing", "Team packing gifts and supplies", "Supplies packed before the visit."],
      ["home-stairs-group", "Children and visitors on the home staircase", "Children of the home with visiting trustees."],
      ["home-stairs-cake", "Chocolate cake shared with children", "A cake brought for the children."],
      ["home-dining-sparklers", "Birthday celebration with sparkler cakes", "Birthday in the dining hall."],
      ["home-cake-raj", "Happy Birthday Raj cake cutting", "Cake cutting — Happy Birthday Raj."],
      ["home-meal", "Children eating a shared meal", "Rice, dal and curry on steel thalis."],
      ["home-team", "Visiting team with the home superintendent", "The visiting team after the meal."],
    ],
  },
  {
    title: "Community presence — under the banyan",
    description:
      "A gathering at a historic temple precinct. Community work begins where people already stand.",
    photos: [
      ["temple-banyan", "Community gathering under a large banyan tree", "Under the hanging roots of the banyan."],
      ["partnership-meeting", "Partnership meeting around a conference table", "Partnership meeting that followed the field work."],
    ],
  },
  {
    title: "Women’s safety — POSH sessions with FICCI FLO",
    description:
      "Awareness sessions on the Prevention of Sexual Harassment Act: recognising forms of harassment, and the legal meaning of “workplace” — including client sites, off-site meetings and virtual settings.",
    photos: [
      ["posh-classroom", "Classroom session on prevention of sexual harassment", "Classroom session with FICCI FLO."],
      ["posh-panel", "Panel on recognising forms of harassment", "Recognising the Forms of Harassment."],
      ["posh-presenter", "Presenter explaining the POSH definition of workplace", "A workplace is any location where the work-relationship exists."],
    ],
  },
] as const;

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

      <section className="bg-[#f4f2e9] py-16 md:py-24" aria-labelledby="impact-field-record-title">
        <div className="wrap">
          <Reveal as="div" className="mb-10 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[.19em] text-orange-600">Field record</p>
            <h2 id="impact-field-record-title" className="mt-3 font-serif-heading text-3xl font-bold text-navy-950 sm:text-4xl">
              The work already done.
            </h2>
            <p className="mt-4 leading-7 text-navy-900/70">
              The Foundation is young. Large beneficiary numbers would be dishonest at this stage. What we can show is the work itself: a blood donation camp, a visit of care to a children’s home, community presence, and POSH awareness held with FICCI FLO.
            </p>
          </Reveal>

          <div className="space-y-8">
            {fieldRecords.map((record, index) => (
              <Reveal as="article" key={record.title} delay={index * 0.08} className="rounded-2xl border border-navy-900/10 bg-white/80 p-6 sm:p-8">
                <h3 className="font-serif-heading text-xl font-bold text-navy-950 sm:text-2xl">{record.title}</h3>
                <p className="mt-3 max-w-4xl leading-7 text-navy-900/70">{record.description}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {record.photos.map(([image, alt, caption]) => (
                    <figure key={image} className="overflow-hidden rounded-xl border border-navy-900/10 bg-[#f8f7f2]">
                      <img
                        src={`/images/activities/${image}.jpg`}
                        alt={alt}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <figcaption className="px-4 py-3 text-sm leading-6 text-navy-900/70">{caption}</figcaption>
                    </figure>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

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
