import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "wouter";
import Layout from "../components/Layout";
import Reveal from "../components/Reveal";
import { DynamicImage } from "../lib/ImagesContext";
import { useSiteContent } from "../lib/SiteContentContext";

const workAreas = [
  { title: "Learning that lasts", theme: "learning", slot: "work-education", label: "Education & literacy", body: "Learning builds possibility. We work to support access to education and the conditions that help children stay and thrive." },
  { title: "Care within reach", theme: "care", slot: "work-health", label: "Health & family welfare", body: "Stronger families begin with wellbeing. Community health and family support can help people meet each day with greater security." },
  { title: "Skills into livelihoods", theme: "livelihood", slot: "work-livelihoods", label: "Women's livelihoods", body: "When women can build skills, income and confidence, the benefits reach across their families and communities." },
  { title: "Energy for everyday life", theme: "energy", slot: "work-solar", label: "Clean energy", body: "Reliable household energy can ease daily burdens and give families more time, comfort and choice." },
];

const galleryHome = [
  { slot: "home-gallery-kalam", caption: "Dr A.P.J. Abdul Kalam" },
  { slot: "home-gallery-patil", caption: "Smt. Pratibha Devisingh Patil" },
  { slot: "home-gallery-mukherjee", caption: "Shri Pranab Mukherjee" },
  { slot: "home-gallery-kovind", caption: "Shri Ram Nath Kovind" },
  { slot: "home-gallery-murmu", caption: "Smt. Droupadi Murmu" },
  { slot: "home-gallery-pm", caption: "Shri Narendra Modi" },
];

const heroImages = [
  ["home-hero-education", "Education and learning"],
  ["home-hero-health", "Community health"],
  ["home-hero-livelihoods", "Livelihoods and skills"],
  ["home-hero-solar", "Clean household energy"],
];

const foundationFacts = [
  { value: "2026", label: "Established as a public charitable trust" },
  { value: "06", label: "Connected areas of work" },
  { value: "16+", label: "Years of university leadership" },
];

const principles = [
  { number: "01", title: "Dignity first", body: "People are partners in the work, never a backdrop to it." },
  { number: "02", title: "Built to last", body: "We look for the skill, habit or household asset that remains useful." },
  { number: "03", title: "Public benefit", body: "The trust exists to serve its charitable objects, without private profit." },
];

export default function Home() {
  const content = useSiteContent();
  const [slide, setSlide] = useState(0);
  const [heroTextVisible, setHeroTextVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % heroImages.length), 7000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (reducedMotion) {
      setHeroTextVisible(true);
      return;
    }
    let hideTimer: number;
    let showTimer: number;
    const showText = () => {
      setHeroTextVisible(true);
      showTimer = window.setTimeout(() => {
        setHeroTextVisible(false);
        hideTimer = window.setTimeout(showText, 3600);
      }, 3900);
    };
    hideTimer = window.setTimeout(() => {
      setHeroTextVisible(false);
      showTimer = window.setTimeout(showText, 3600);
    }, 4000);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(showTimer);
    };
  }, [reducedMotion]);
  const text = (key: string, fallback: string) => content[key]?.value || fallback;
  const heroTitle = text("home_title", "Building stronger communities, one lasting opportunity at a time.");
  const storyTitle = text("home_about_title", "Dignity, opportunity and lasting change.");
  let titleWord = 0;

  return (
    <Layout>
      <section className="home-hero">
        <div className="hero-scene" aria-hidden="true">
          {heroImages.map(([slot, alt], index) => <DynamicImage key={slot} slotKey={slot} alt={alt} className={`hero-scene-image ${index === slide ? "active" : ""}`} />)}
          <div className="hero-shade" />
        </div>
        <div className="hero-copy wrap">
          <motion.div className="hero-copy-message" initial={{ opacity: 1, x: 0, scale: 1, height: "auto" }} animate={reducedMotion || heroTextVisible ? { opacity: 1, x: 0, scale: 1, height: "auto" } : { opacity: 0, x: -48, scale: 0.94, height: 0 }} transition={{ duration: reducedMotion ? 0 : heroTextVisible ? 0.72 : 0.58, ease: [0.22, 0.7, 0.2, 1] }} style={{ transformOrigin: "left center", overflow: "hidden" }}>
          <p className="eyebrow eyebrow-light"><span />{text("home_eyebrow", "A public charitable trust · India")}</p>
          <h1 aria-label={heroTitle}>{heroTitle.split(/(\s+)/).map((part, index) => {
            if (!part.trim()) return part;
            const wordIndex = titleWord++;
            return <motion.span className="hero-title-word" key={`${index}-${part}`} initial={{ opacity: 0, y: reducedMotion ? 0 : 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.3, delay: reducedMotion ? 0 : wordIndex * 0.075, ease: [0.22, 0.7, 0.2, 1] }}>{part}</motion.span>;
          })}</h1>
          <p className="hero-lede">{text("home_intro", "Jagannath Foundation works alongside communities through education, healthcare, livelihoods and clean energy, creating opportunities that last.")}</p>
          </motion.div>
        </div>
        <div className="hero-actions">
          <Link href="/work" className="hero-action hero-action-primary" aria-label="Explore our work" title="Explore our work"><span className="hero-action-arrow" aria-hidden="true">→</span><span className="hero-action-tooltip" aria-hidden="true">Explore our work</span></Link>
          <Link href="/about" className="hero-action hero-action-secondary" aria-label="Our story" title="Our story"><span className="hero-action-arrow" aria-hidden="true">→</span><span className="hero-action-tooltip" aria-hidden="true">Our story</span></Link>
        </div>
        <div className="hero-bottom"><span>JAGANNATH FOUNDATION</span><span>PEOPLE · DIGNITY · POSSIBILITY</span><span>0{slide + 1} / 04</span><div className="hero-controls" role="group" aria-label="Choose a featured image">{heroImages.map(([slot, label], index) => <button key={slot} type="button" className={`hero-dot ${index === slide ? "is-active" : ""}`} aria-label={`Show ${label}`} aria-pressed={index === slide} onClick={() => setSlide(index)} />)}</div></div>
        <div className="hero-seal" aria-hidden="true"><span>MANAV SEVA</span><b>सेवा</b><span>ISHWAR SEVA</span></div>
      </section>

      <Reveal as="section" className="home-facts" aria-label="About the Foundation">
        <div className="wrap facts-inner">
          <p className="eyebrow"><span />A clear beginning</p>
          <div className="facts-list">{foundationFacts.map((fact, index) => <Reveal as="article" className="fact-item" delay={index * 0.12} key={fact.value}><strong>{fact.value}</strong><span>{fact.label}</span></Reveal>)}</div>
          <p className="facts-note">A young foundation. A public purpose. Results reported as programmes take shape.</p>
        </div>
      </Reveal>

      <Reveal as="section" className="home-story">
        <div className="wrap story-layout">
          <motion.div className="story-photo" initial={reducedMotion ? false : { opacity: 0, clipPath: "inset(14% 0 0)" }} whileInView={{ opacity: 1, clipPath: "inset(0% 0 0)" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: reducedMotion ? 0 : 1, delay: reducedMotion ? 0 : 0.12, ease: [0.22, 0.7, 0.2, 1] }}>
            <motion.div initial={reducedMotion ? false : { scale: 1.055 }} whileInView={{ scale: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: reducedMotion ? 0 : 1.35, ease: [0.22, 0.7, 0.2, 1] }}><DynamicImage slotKey="about-founder-photo" alt="Dr Jagannath Patnaik, founder of Jagannath Foundation" className="founder-image" /></motion.div>
            <span>Dr Jagannath Patnaik <i>Founder, Settlor &amp; Managing Trustee</i></span>
          </motion.div>
          <div className="story-copy"><p className="eyebrow"><span />The Foundation</p><h2 aria-label={storyTitle}>{storyTitle.split(/(\s+)/).map((part, index) => {
            if (!part.trim()) return part;
            return <motion.span className="story-title-word" key={`${index}-${part}`} initial={reducedMotion ? false : { opacity: 0, y: 9 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: reducedMotion ? 0 : 0.38, delay: reducedMotion ? 0 : index * 0.045, ease: [0.22, 0.7, 0.2, 1] }}>{part}</motion.span>;
          })}</h2><p className="body-large">{text("home_about_body", "Rooted in a belief that service to people is service to God, the Foundation works to widen access to education, strengthen family wellbeing and support communities to shape their own futures.")}</p><blockquote>“Manav seva is Ishwar seva”<small>Service to the human being is service to God.</small></blockquote><Link href="/about" className="text-link">Read our story <span>↗</span></Link></div>
        </div>
      </Reveal>

      <Reveal as="section" className="home-work">
        <div className="wrap">
          <div className="section-topline"><div><p className="eyebrow"><span />Six connected areas</p><h2>Everyday needs.<br />Lasting possibility.</h2></div><p>Education, health, skills, livelihoods and clean energy are connected in the life of a family. Our programmes begin with that whole picture.</p></div>
          <div className="work-grid">{workAreas.map((area, index) => <Reveal key={area.title} className={`work-feature-reveal work-feature-reveal-${index + 1}`} delay={index * 0.13}><Link href="/work" className={`work-feature work-feature-${index + 1} work-${area.theme}`}><div className="work-photo"><DynamicImage slotKey={area.slot} alt={area.label} className="work-image" /><span className="work-index">0{index + 1}</span></div><div className="work-text"><span>{area.label}</span><h3>{area.title}</h3><p>{area.body}</p><b aria-hidden="true">↗</b></div></Link></Reveal>)}</div>
          <div className="work-footer"><span>Four of six areas shown</span><Link href="/work" className="text-link">Explore all our work <span>↗</span></Link></div>
        </div>
      </Reveal>

      <Reveal as="section" className="home-principles">
        <div className="wrap principles-layout">
          <div className="principles-intro"><p className="eyebrow eyebrow-light"><span />How we work</p><h2>Good intentions need good practice.</h2><p>We want each effort to respect people, meet a real need and hold value beyond the day it begins.</p><Link href="/impact" className="text-link">Our approach to impact <span>↗</span></Link></div>
          <div className="principles-list">{principles.map((item, index) => <Reveal as="article" key={item.number} delay={index * 0.14}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.body}</p></div><b aria-hidden="true">↗</b></Reveal>)}</div>
        </div>
      </Reveal>

      <Reveal as="section" className="home-gallery wrap">
        <Reveal className="gallery-heading" delay={0.12}><div><p className="eyebrow"><span />People and partnerships</p><h2>{text("home_gallery_title", "Partnerships built on respect.")}</h2><p>{text("home_gallery_body", "A selection of courtesy meetings and moments of shared purpose with leaders and friends of the Foundation.")}</p></div><Link href="/gallery" className="text-link">View the gallery <span>↗</span></Link></Reveal>
        <div className="gallery-ribbon">{galleryHome.map((photo, i) => <Reveal key={photo.slot} className={`gallery-reveal gallery-reveal-${i + 1}`} delay={i * 0.14}><Link href="/gallery" className={`gallery-frame gallery-frame-${i + 1}`}><DynamicImage slotKey={photo.slot} alt={photo.caption} className="gallery-image" /><span>{photo.caption}</span></Link></Reveal>)}</div>
      </Reveal>

      <Reveal as="section" className="home-join"><div className="join-ornament" aria-hidden="true">✳</div><p className="eyebrow eyebrow-light"><span />Stand alongside communities</p><h2>There is room for<br />more good work.</h2><p>Bring your time, your experience or your support. Together, we can help create the conditions for people to thrive.</p><div><Link href="/volunteer" className="button button-paper">Join as a volunteer <span>↗</span></Link><Link href="/contact" className="button button-line">Talk with us <span>→</span></Link></div></Reveal>
    </Layout>
  );
}
