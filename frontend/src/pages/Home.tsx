import { tr as t, localize } from "../i18n";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "wouter";
import Layout from "../components/Layout";
import Reveal from "../components/Reveal";
import { DynamicImage } from "../lib/ImagesContext";
import { useSiteContent } from "../lib/SiteContentContext";
import Stagger from "../components/Stagger";
import ParallaxLayer from "../components/ParallaxLayer";

const workAreas = [
  {
    title: "Learning that lasts",
    theme: "learning",
    slot: "work-education",
    label: "Education & literacy",
    body: "Learning support that helps children stay in school and thrive.",
  },
  {
    title: "Care within reach",
    theme: "care",
    slot: "work-health",
    label: "Health & family welfare",
    body: "Community health and family support, close to where people live.",
  },
  {
    title: "Skills into livelihoods",
    theme: "livelihood",
    slot: "work-livelihoods",
    label: "Women's livelihoods",
    body: "Skills, income and leadership opportunities for women and girls.",
  },
  {
    title: "Energy for everyday life",
    theme: "energy",
    slot: "work-solar",
    label: "Clean energy",
    body: "Cleaner, more reliable energy for everyday household life.",
  },
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
  {
    number: "01",
    title: "Dignity first",
    body: "People are partners in the work, never a backdrop to it.",
  },
  {
    number: "02",
    title: "Built to last",
    body: "We look for the skill, habit or household asset that remains useful.",
  },
  {
    number: "03",
    title: "Public benefit",
    body: "The trust exists to serve its charitable objects, without private profit.",
  },
];

export default function Home() {
  useTranslation();
  const content = useSiteContent();
  const [slide, setSlide] = useState(0);
  const [heroTextVisible, setHeroTextVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cycleTimer = 0;
    let imageTimer = 0;
    let returnTimer = 0;

    const runCycle = () => {
      cycleTimer = window.setTimeout(() => {
        setHeroTextVisible(false);
        imageTimer = window.setTimeout(() => {
          setSlide((current) => (current + 1) % heroImages.length);
        }, 850);
        returnTimer = window.setTimeout(() => {
          setHeroTextVisible(true);
          runCycle();
        }, 3850);
      }, 7000);
    };

    runCycle();
    return () => {
      window.clearTimeout(cycleTimer);
      window.clearTimeout(imageTimer);
      window.clearTimeout(returnTimer);
    };
  }, []);
  const text = (key: string, fallback: string) =>
    t(content[key]?.value || fallback);
  const heroTitle = text(
    "home_title",
    "Building stronger communities, one lasting opportunity at a time.",
  );
  const storyTitle = text(
    "home_about_title",
    "Dignity, opportunity and lasting change.",
  );
  let titleWord = 0;

  return (
    <Layout>
      <section className="home-hero">
        <div className="hero-scene" aria-hidden="true">
          {localize(heroImages.map(([slot, alt], index) => (
            <DynamicImage
              key={slot}
              slotKey={slot}
              alt={localize(alt)}
              className={`hero-scene-image ${index === slide ? "active" : ""}`}
            />
          )))}
          <div className="hero-shade" />
        </div>
        <div className="hero-copy wrap">
          <AnimatePresence mode="wait" initial={false}>
            {localize(heroTextVisible && (
              <motion.div
                key={slide}
                className="hero-copy-message"
                initial={
                  reducedMotion
                    ? false
                    : { opacity: 0, x: -30, filter: "blur(5px)" }
                }
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={
                  reducedMotion
                    ? undefined
                    : { opacity: 0, x: 30, filter: "blur(4px)" }
                }
                transition={{
                  duration: reducedMotion ? 0 : 0.85,
                  ease: [0.22, 0.7, 0.2, 1],
                }}
              >
                <p className="eyebrow eyebrow-light">
                  <span />
                  {localize(text(
                    "home_eyebrow",
                    "A public charitable trust · Across India",
                  ))}
                </p>
                <h1 aria-label={localize(heroTitle)}>
                  {localize(heroTitle.split(/(\s+)/).map((part, index) => {
                    if (!part.trim()) return part;
                    const wordIndex = titleWord++;
                    return (
                      <motion.span
                        className="hero-title-word"
                        key={`${index}-${part}`}
                        initial={{ opacity: 0, y: reducedMotion ? 0 : 7 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: reducedMotion ? 0 : 0.55,
                          delay: reducedMotion ? 0 : wordIndex * 0.09,
                          ease: [0.22, 0.7, 0.2, 1],
                        }}
                      >
                        {localize(part)}
                      </motion.span>
                    );
                  }))}
                </h1>
                <p className="hero-lede">
                  {localize(text(
                    "home_intro",
                    "We work alongside communities through education, healthcare, livelihoods and clean energy, supporting opportunities people can carry forward.",
                  ))}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="hero-actions">
          <Link
            href="/programmes"
            className="hero-action hero-action-primary"
            aria-label={t("Explore our programmes")}
            title={t("Explore our programmes")}
          >
            <span className="hero-action-arrow" aria-hidden="true">
              →
            </span>
            <span className="hero-action-tooltip" aria-hidden="true">
              {t("Programmes")}</span>
          </Link>
          <Link
            href="/about"
            className="hero-action hero-action-secondary"
            aria-label={t("Our story")}
            title={t("Our story")}
          >
            <span className="hero-action-arrow" aria-hidden="true">
              →
            </span>
            <span className="hero-action-tooltip" aria-hidden="true">
              {t("Our story")}</span>
          </Link>
        </div>
        <div className="hero-bottom">
          <span>{t("JAGANNATH FOUNDATION")}</span>
          <span>{t("PEOPLE · DIGNITY · POSSIBILITY")}</span>
          <span>0{localize(slide + 1)} / 04</span>
          <div
            className="hero-controls"
            role="group"
            aria-label={t("Choose a featured image")}
          >
            {localize(heroImages.map(([slot, label], index) => (
              <button
                key={slot}
                type="button"
                className={`hero-dot ${index === slide ? "is-active" : ""}`}
                aria-label={t("Show {{label}}", { label: t(label) })}
                aria-pressed={index === slide}
                onClick={() => setSlide(index)}
              />
            )))}
          </div>
        </div>
        <div className="hero-seal" aria-hidden="true">
          <span>{t("MANAV SEVA")}</span>
          <b>सेवा</b>
          <span>{t("ISHWAR SEVA")}</span>
        </div>
      </section>

      <section className="home-facts" aria-label={t("About the Foundation")}>
        <div className="wrap facts-inner">
          <Reveal className="facts-heading" direction="left">
            <p className="eyebrow">
              <span />{t("A clear beginning")}</p>
            <p className="facts-note">
              {t("A public trust working across six connected areas, with progress shared as programmes take shape.")}</p>
          </Reveal>
          <Stagger className="facts-list" gap={0.1} distance={24}>
            {localize(foundationFacts.map((fact) => (
              <article className="fact-item" key={fact.value}>
                <strong>{localize(fact.value)}</strong>
                <span>{localize(fact.label)}</span>
              </article>
            )))}
          </Stagger>
        </div>
      </section>

      <section className="home-story">
        <div className="wrap story-layout">
          <Reveal className="story-portrait" direction="left" duration={1.2}>
            <motion.div
              className="story-photo"
              initial={reducedMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: reducedMotion ? 0 : 1.25,
                delay: reducedMotion ? 0 : 0.48,
                ease: [0.22, 0.7, 0.2, 1],
              }}
            >
              <motion.div
                initial={
                  reducedMotion
                    ? false
                    : { scale: 1.055, clipPath: "inset(14% 0 0)" }
                }
                whileInView={{ scale: 1, clipPath: "inset(0% 0 0)" }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: reducedMotion ? 0 : 1.8,
                  delay: reducedMotion ? 0 : 0.42,
                  ease: [0.22, 0.7, 0.2, 1],
                }}
              >
                <DynamicImage
                  slotKey="about-founder-photo"
                  alt={t("Dr Jagannath Patnaik, founder of Jagannath Foundation")}
                  className="founder-image"
                />
              </motion.div>
              <motion.svg
                className="founder-photo-frame"
                aria-hidden="true"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M50 1 H99 V99 H1 V1 H50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={reducedMotion ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.95,
                    delay: reducedMotion ? 0 : 0.16,
                    ease: [0.22, 0.7, 0.2, 1],
                  }}
                />
              </motion.svg>
            </motion.div>
            <div className="story-photo-caption">
              {t("Dr Jagannath Patnaik")}<i>{t("Founder, Settlor & Managing Trustee")}</i>
            </div>
          </Reveal>
          <Reveal className="story-copy" direction="right" duration={1.1}>
            <p className="eyebrow">
              <span />
              {t("The Foundation")}</p>
            <h2>{localize(storyTitle)}</h2>
            <p className="body-large">
              {localize(text(
                "home_about_body",
                "We support education, family wellbeing and livelihoods so communities can shape stronger futures for themselves.",
              ))}
            </p>
            <blockquote className="story-mantra">
              <span>{t("“Manav seva is Ishwar seva”")}</span>
              <small>{t("Service to people is at the heart of our work.")}</small>
            </blockquote>
            <Link href="/about" className="text-link">
              {t("Read our story")}{" "}<span>↗</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="home-work">
        <div className="wrap">
          <Reveal className="section-topline" direction="down">
            <div>
              <p className="eyebrow">
                <span />
                {t("Six connected areas")}</p>
              <h2>
                {t("Everyday needs.")}<br />
                {t("Lasting possibility.")}</h2>
            </div>
            <p>
              {t("Six connected areas of work, shaped around the everyday needs of people and families.")}</p>
          </Reveal>
          <Stagger className="work-grid" gap={0.12} distance={34}>
            {localize(workAreas.map((area, index) => (
              <div
                key={area.title}
                className={`work-feature-reveal work-feature-reveal-${index + 1}`}
              >
                <Link
                  href="/programmes"
                  className={`work-feature work-feature-${index + 1} work-${area.theme}`}
                >
                  <div className="work-photo">
                    <DynamicImage
                      slotKey={area.slot}
                      alt={localize(area.label)}
                      className="work-image"
                    />
                    <span className="work-index">0{localize(index + 1)}</span>
                  </div>
                  <div className="work-text">
                    <span>{localize(area.label)}</span>
                    <h3>{localize(area.title)}</h3>
                    <p>{localize(area.body)}</p>
                    <b aria-hidden="true">↗</b>
                  </div>
                </Link>
              </div>
            )))}
          </Stagger>
          <Reveal className="work-footer" direction="up">
            <span className="work-count">
              <strong>4 / 6</strong> {" "}{t("programme areas featured")}</span>
            <Link href="/programmes" className="text-link">
              {t("Explore all our programmes")}{" "}<span>↗</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="home-principles">
        <div className="wrap principles-layout">
          <Reveal className="principles-intro" direction="left">
            <p className="eyebrow eyebrow-light">
              <span />
              {t("How we work")}</p>
            <h2>{t("Good intentions need good practice.")}</h2>
            <p>
              {t("We listen first, work with local partners and focus on what can last.")}</p>
            <Link href="/impact" className="text-link">
              {t("Our approach to impact")}{" "}<span>↗</span>
            </Link>
          </Reveal>
          <Stagger className="principles-list" gap={0.1} distance={26}>
            {localize(principles.map((item) => (
              <article key={item.number}>
                <span>{localize(item.number)}</span>
                <div>
                  <h3>{localize(item.title)}</h3>
                  <p>{localize(item.body)}</p>
                </div>
                <b aria-hidden="true">↗</b>
              </article>
            )))}
          </Stagger>
        </div>
      </section>

      <section className="home-gallery wrap">
        <Reveal className="gallery-heading" delay={0.04} direction="down">
          <div>
            <p className="eyebrow">
              <span />
              {t("People and partnerships")}</p>
            <h2>
              {localize(text("home_gallery_title", "Partnerships built on respect."))}
            </h2>
            <p>
              {localize(text(
                "home_gallery_body",
                "A few moments with leaders and partners who share a commitment to public service.",
              ))}
            </p>
          </div>
          <Link href="/gallery" className="text-link">
            {t("View the gallery")}{" "}<span>↗</span>
          </Link>
        </Reveal>
        <div className="gallery-ribbon">
          {localize(galleryHome.map((photo, i) => (
            <Reveal
              key={photo.slot}
              className={`gallery-reveal gallery-reveal-${i + 1}`}
              delay={i * 0.08}
              direction={i % 2 === 0 ? "left" : "right"}
            >
              <Link
                href="/gallery"
                className={`gallery-frame gallery-frame-${i + 1}`}
              >
                <div className="gallery-photo">
                  <DynamicImage
                    slotKey={photo.slot}
                    alt=""
                    className="gallery-image gallery-image-backdrop"
                  />
                  <DynamicImage
                    slotKey={photo.slot}
                    alt={localize(photo.caption)}
                    className="gallery-image gallery-image-foreground"
                  />
                </div>
                <span>{localize(photo.caption)}</span>
              </Link>
            </Reveal>
          )))}
        </div>
      </section>

      <Reveal as="section" className="home-join">
        <div className="join-ornament" aria-hidden="true">
          ✳
        </div>
        <p className="eyebrow eyebrow-light">
          <span />
          {t("Stand alongside communities")}</p>
        <h2>
          {t("There is room for")}<br />
          {t("more good work.")}</h2>
        <p>
          {t("Bring your time, your experience or your support. Together, we can help create the conditions for people to thrive.")}</p>
        <div>
          <Link href="/volunteer" className="button button-paper">
            {t("Join as a volunteer")}{" "}<span>↗</span>
          </Link>
          <Link href="/contact" className="button button-line">
            {t("Talk with us")}{" "}<span>→</span>
          </Link>
        </div>
      </Reveal>
    </Layout>
  );
}
