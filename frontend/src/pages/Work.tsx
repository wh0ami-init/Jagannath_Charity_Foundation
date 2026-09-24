import Layout from "../components/Layout";
import { DynamicImage } from "../lib/ImagesContext";

const programmes = [
  { num: "01", title: "Education & literacy", slot: "work-education",
    body: "Literacy is treated as a public good, not a privilege reserved for those who can already pay for it. Reading rooms, first-generation learner support, and practical help to schools already doing the hard work across the country." },
  { num: "02", title: "Health & family welfare", slot: "work-health",
    body: "Most families we meet do not lack courage. They lack a clear, nearby path to preventive care. Health camps, nutrition awareness and family wellbeing — modern public health, explained in the language of the household." },
  { num: "03", title: "Youth skills & sport", slot: "work-education",
    body: "A district full of young people is not automatically a district full of livelihoods. Livelihood workshops, mentoring, and the Leva Sports Club Federation as a corridor for talent that has nowhere else to go." },
  { num: "04", title: "Women's livelihoods", slot: "work-livelihoods",
    body: "A household energy saving that a woman cannot control is not a livelihood. Self-help groups, livelihood training and leadership for women and girls." },
  { num: "05", title: "Environment & land", slot: "work-health",
    body: "Climate work that cannot be walked to from a village is not climate work we will sign. Local greening, water and soil awareness, and community care for land." },
  { num: "06", title: "Solar housing & clean energy", slot: "work-solar",
    body: "Traditional welfare hands over assistance. This model helps a family permanently reduce a recurring bill. Rooftop solar, cleaner cooking, women at the centre of the training." },
];

export default function Work() {
  return (
    <Layout>
      <section className="bg-navy-950 text-white py-16">
        <div className="wrap">
          <p className="text-orange-300 font-semibold mb-2">Focus areas</p>
          <h1 className="text-3xl sm:text-4xl font-serif-heading font-bold max-w-2xl">
            Six programmes, nationwide, no theatre.
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Each line of work is designed to leave something a household can still use a year
            later: a skill, a saving, a school habit, a cleaner bill.
          </p>
        </div>
      </section>

      <section className="wrap py-16 grid sm:grid-cols-2 gap-8">
        {programmes.map((p) => (
          <article key={p.num} className="rounded-xl overflow-hidden border border-navy-900/10">
            <DynamicImage slotKey={p.slot} className="w-full h-48 object-cover" />
            <div className="p-6">
              <p className="text-orange-500 text-sm font-semibold mb-1">{p.num}</p>
              <h3 className="text-lg font-serif-heading font-bold text-navy-950 mb-2">{p.title}</h3>
              <p className="text-sm text-navy-900/70 leading-relaxed">{p.body}</p>
            </div>
          </article>
        ))}
      </section>
    </Layout>
  );
}
