import { useState } from "react";
import Layout from "../components/Layout";
import { DynamicImage } from "../lib/ImagesContext";

const tabs = [
  {
    id: "vision", label: "Vision", title: "Quality of life that lasts",
    body: "To enable communities across the country to improve quality of life — through education, healthcare, livelihoods and lasting household assets — on a sustainable and inclusive basis.",
  },
  {
    id: "mission", label: "Mission", title: "Women at the centre",
    body: "We exist to serve communities across India, with partners and evidence, putting women at the centre of household economics and turning one-time assistance into a skill, a saving and a school that holds.",
  },
  {
    id: "objects", label: "Objects", title: "Public benefit only",
    body: "Education, healthcare, relief of poverty, women's and children's welfare, environment, and community development. The Trust does not carry on any activity with the object of earning profit.",
  },
  {
    id: "approach", label: "Our approach", title: "Four disciplines",
    body: "Dignity first — people we work with are partners, not recipients of a spectacle. Evidence over theatre — we design for what a family can still feel twelve months later. Communities first — we work with existing schools, health workers, self-help groups and panchayats. Women at the centre — household energy, savings, nutrition and children's schooling move when women have information, income and a seat at the table.",
  },
  {
    id: "dream", label: "The founder's dream", title: "Dr Jagannath Patnaik, MBA, M.Law, Ph.D., D.Litt., D.Sc.",
    body: "I did not first meet social service in a conference hall. I met it as a child, in the ordinary work of standing with people who had less than they needed. Those early days taught me a sentence that has never left me: Manav seva is Ishwar seva — service to the human being is service to God. Not as a slogan, but as a discipline. Vice Chancellor, The ICFAI University Sikkim. He has served as Vice Chancellor of Indian universities for over 16 years and is a renowned educationist and author. Recorded in the World Book of Records and recipient of the Utkal Jyoti Award of the Government for social service. On 17 August 2026 he settled Jagannath Foundation as an irrevocable public charitable trust so that classrooms, health camps, skills and household energy could be held for public benefit alone — across the country, without private profit.",
  },
];

export default function About() {
  const [active, setActive] = useState("vision");
  const current = tabs.find((t) => t.id === active)!;

  return (
    <Layout>
      <section className="bg-navy-950 text-white py-16">
        <div className="wrap">
          <p className="text-orange-300 font-semibold mb-2">About the Foundation</p>
          <h1 className="text-3xl sm:text-4xl font-serif-heading font-bold max-w-2xl">
            Helping hands. Positive living. A trust held for the people.
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Jagannath Foundation was created on 17 August 2026. It is irrevocable. Its income and
            property can be applied only to the objects of the trust. There is no private profit.
          </p>
        </div>
      </section>

      <section className="wrap py-16 grid lg:grid-cols-[2fr_1fr] gap-10">
        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  active === t.id
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-navy-900/20 text-navy-900/70 hover:border-orange-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <h3 className="text-xl font-serif-heading font-bold text-navy-950 mb-2">{current.title}</h3>
          <p className="text-navy-900/70 leading-relaxed">{current.body}</p>
        </div>
        <aside className="space-y-4">
          <DynamicImage
            slotKey="about-founder-photo"
            className="w-full rounded-xl object-cover aspect-[4/5]"
          />
          <a
            href="/assets/organization-profile.pdf"
            className="block text-center border border-navy-900/20 rounded-full py-2 text-sm font-medium hover:border-orange-500"
          >
            Download Organisation Profile (PDF)
          </a>
        </aside>
      </section>
    </Layout>
  );
}
