import { Link } from "wouter";
import Layout from "../components/Layout";
import { DynamicImage } from "../lib/ImagesContext";

const actions = [
  { title: "Education", desc: "Classrooms that stay open" },
  { title: "Healthcare", desc: "Prevention before crisis" },
  { title: "Skills", desc: "Work, character, a playing field" },
  { title: "Solar energy", desc: "From bills to an asset" },
];

const galleryHome = [
  { slot: "home-gallery-kalam", caption: "Hon'ble 11th President of India, Dr A.P.J. Abdul Kalam" },
  { slot: "home-gallery-patil", caption: "Hon'ble 12th President of India, Smt. Pratibha Devisingh Patil" },
  { slot: "home-gallery-mukherjee", caption: "Hon'ble 13th President of India, Shri Pranab Mukherjee" },
  { slot: "home-gallery-kovind", caption: "Hon'ble 14th President of India, Shri Ram Nath Kovind" },
  { slot: "home-gallery-murmu", caption: "Hon'ble 15th President of India, Smt. Droupadi Murmu" },
  { slot: "home-gallery-pm", caption: "Hon'ble Prime Minister Shri Narendra Modi" },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 grid grid-cols-4 opacity-30">
          <DynamicImage slotKey="home-hero-education" className="object-cover w-full h-full" />
          <DynamicImage slotKey="home-hero-health" className="object-cover w-full h-full" />
          <DynamicImage slotKey="home-hero-livelihoods" className="object-cover w-full h-full" />
          <DynamicImage slotKey="home-hero-solar" className="object-cover w-full h-full" />
        </div>
        <div className="relative wrap py-24 sm:py-32">
          <p className="text-orange-300 font-semibold mb-3">Public charitable trust · Across India</p>
          <h1 className="text-4xl sm:text-5xl font-serif-heading font-bold max-w-2xl leading-tight">
            Building stronger communities across the country.
          </h1>
          <p className="mt-5 max-w-xl text-white/80">
            Jagannath Foundation works in education, healthcare, skills, women's livelihoods and
            household energy — so families across the country keep more of what they earn, and
            children stay in school.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/donate" className="bg-orange-500 hover:bg-orange-400 px-6 py-3 rounded-full font-semibold">
              Support the Work
            </Link>
            <Link href="/volunteer" className="border border-white/40 hover:border-white px-6 py-3 rounded-full font-semibold">
              Volunteer / Join
            </Link>
          </div>
        </div>
      </section>

      {/* Action row */}
      <section className="border-b border-navy-900/10">
        <div className="wrap py-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((a) => (
            <div key={a.title} className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                {a.title[0]}
              </div>
              <div>
                <strong className="block text-navy-950">{a.title}</strong>
                <span className="text-sm text-navy-900/60">{a.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who we are */}
      <section className="wrap py-16">
        <p className="text-orange-500 font-semibold mb-2">Who we are</p>
        <h2 className="text-3xl font-serif-heading font-bold text-navy-950 max-w-2xl">
          A public trust for inclusive development across India.
        </h2>
        <p className="mt-4 max-w-2xl text-navy-900/70">
          Formed on 17 August 2026, Jagannath Foundation is an irrevocable public charitable trust.
          Income and property can be applied only to its objects. There is no private profit.
        </p>
        <Link href="/about" className="inline-block mt-6 text-orange-500 font-semibold hover:underline">
          Read our vision, mission &amp; objects →
        </Link>
      </section>

      {/* Gallery preview */}
      <section className="wrap py-16">
        <p className="text-orange-500 font-semibold mb-2">Our gallery</p>
        <h2 className="text-3xl font-serif-heading font-bold text-navy-950 max-w-2xl">
          Courtesy meetings with the honoured guests of the nation.
        </h2>
        <p className="mt-4 max-w-2xl text-navy-900/70">
          A record of respectful courtesy calls — with the Presidents of India, and with national
          and international dignitaries who received the Foundation with warmth.
        </p>
        <Link href="/gallery" className="inline-block mt-4 text-orange-500 font-semibold hover:underline">
          Open the complete gallery →
        </Link>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {galleryHome.map((g) => (
            <figure key={g.slot} className="rounded-lg overflow-hidden bg-navy-900/5">
              <DynamicImage slotKey={g.slot} className="w-full h-40 object-cover" />
              <figcaption className="text-xs text-navy-900/60 p-2">{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </Layout>
  );
}
