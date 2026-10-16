import { tr as translateText, localize as localizeText, trError as translateError } from "../i18n";
import { useTranslation as usePageTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "wouter";
import Layout from "../components/Layout";
import Reveal from "../components/Reveal";
import { DynamicImage } from "../lib/ImagesContext";
import { useSiteContent } from "../lib/SiteContentContext";
import Stagger from "../components/Stagger";
import HomeGallerySlider from "../components/HomeGallerySlider";
import HomeUtilityCards from "../components/HomeUtilityCards";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const workAreas = [
  {
    title: "Learning that lasts",
    theme: "learning",
    photo: "/images/community/education.webp",
    secondary: "/images/hero-education.webp",
    label: "Education & literacy",
    body: "Learning support that helps children stay in school and thrive.",
  },
  {
    title: "Care within reach",
    theme: "care",
    photo: "/images/community/health.webp",
    secondary: "/images/hero-health.webp",
    label: "Health & family welfare",
    body: "Community health and family support, close to where people live.",
  },
  {
    title: "Skills into livelihoods",
    theme: "livelihood",
    photo: "/images/community/womens-livelihoods.webp",
    secondary: "/images/hero-livelihoods.webp",
    label: "Women's livelihoods",
    body: "Skills, income and leadership opportunities for women and girls.",
  },
  {
    title: "Energy for everyday life",
    theme: "energy",
    photo: "/images/community/solar-household.webp",
    secondary: "/images/community/solar-energy.webp",
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
  { slot: "gallery-manmohan-singh", caption: "Dr Manmohan Singh" },
  { slot: "gallery-vp-dhankhar", caption: "Shri Jagdeep Dhankhar" },
  { slot: "gallery-amit-shah", caption: "Shri Amit Shah" },
  { slot: "gallery-rajnath-singh", caption: "Shri Rajnath Singh" },
  { slot: "gallery-om-birla", caption: "Shri Om Birla" },
  { slot: "gallery-jp-nadda", caption: "Shri J.P. Nadda" },
];

const peopleHome = [
  {
    slot: "team-jagannath-patnaik",
    caption: "Dr Jagannath Patnaik",
  },
  {
    slot: "team-shrabani-patnaik",
    caption: "Dr Shrabani Patnaik",
  },
  {
    slot: "team-prakriti-patnaik",
    caption: "Adv. Prakriti Patnaik",
  },
  {
    slot: "team-purushraj-patnaik",
    caption: "Mr Purushraj Patnaik",
  },
  {
    slot: "team-sarita-patwal",
    caption: "Ms Sarita Patwal",
  },
  {
    slot: "team-prateek-nayak",
    caption: "Adv. Prateek Nayak",
  },
  {
    slot: "team-samarendra-patra",
    caption: "Er. Samarendra Patra",
  },
  {
    slot: "team-reema-diddee",
    caption: "CA Reema Diddee",
  },
  {
    slot: "team-lhamu-tshering-tamang",
    caption: "Adv. Lhamu Tshering Tamang",
  },
  {
    slot: "advisor-pradeep-joshi",
    caption: "Prof. Pradeep Kumar Joshi",
  },
];

const heroImages = [
  ["home-hero-community", "A village community at sunrise"],
  ["community-hero-education", "Community education and learning"],
  ["community-hero-health", "Community health outreach"],
  ["community-hero-livelihoods", "Women working together in their community"],
  ["community-hero-solar", "Solar energy for rural homes"],
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

function WorkFeatureSlideshow({ photo, secondary, alt }: {
  photo: string;
  secondary: string;
  alt: string;
}) {
  usePageTranslation();
  return (
    <div className="work-photo-slideshow" aria-hidden="true">
      {localizeText([photo, secondary].map((src, index) => (
        <div
          key={src}
          className={`work-image-slide ${index === 0 ? "work-image-slide-primary" : "work-image-slide-secondary"}`}
        >
          <img
            src={src}
            alt={localizeText(index === 0 ? alt : "")}
            className="work-image"
            loading="lazy"
            decoding="async"
          />
        </div>
      )))}
    </div>
  );
}

export default function Home({
  isWelcomeVisible = false,
}: {
  isWelcomeVisible?: boolean;
}) {
  usePageTranslation();
  const content = useSiteContent();
  const [slide, setSlide] = useState(0);
  const [heroTextVisible, setHeroTextVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const workSection = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = workSection.current;
      if (!section || reducedMotion) return;
      const frames = gsap.utils.toArray<HTMLElement>(".work-photo-slideshow", section);
      if (!frames.length) return;

      const imageHold = 4.4;
      const slideshow = gsap.timeline({ paused: true });
      frames.forEach((frame, index) => {
        const [primary, secondary] = frame.querySelectorAll<HTMLElement>(".work-image-slide");
        if (!primary || !secondary) return;
        gsap.set(primary, { autoAlpha: 1, scale: 1 });
        gsap.set(secondary, { autoAlpha: 0, scale: 1.035 });
        const cardSlideshow = gsap.timeline({ repeat: -1 });
        cardSlideshow
          .to(secondary, { autoAlpha: 1, scale: 1, duration: 1.25, ease: "power2.inOut" })
          .to(primary, { autoAlpha: 0, scale: 1.02, duration: 1.25, ease: "power2.inOut" }, "<")
          .to({}, { duration: imageHold })
          .to(primary, { autoAlpha: 1, scale: 1, duration: 1.25, ease: "power2.inOut" })
          .to(secondary, { autoAlpha: 0, scale: 1.035, duration: 1.25, ease: "power2.inOut" }, "<")
          .to({}, { duration: imageHold });
        slideshow.add(cardSlideshow, index * 0.9);
      });

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 90%",
        end: "bottom 10%",
        onEnter: () => slideshow.play(),
        onEnterBack: () => slideshow.play(),
        onLeave: () => slideshow.pause(),
        onLeaveBack: () => slideshow.pause(),
      });

      return () => {
        trigger.kill();
        slideshow.kill();
      };
    },
    { scope: workSection, dependencies: [reducedMotion], revertOnUpdate: true },
  );
  useEffect(() => {
    if (
      isWelcomeVisible ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;
    let cycleTimer = 0;
    let imageTimer = 0;
    let returnTimer = 0;

    const scheduleCycle = (delay: number) => {
      cycleTimer = window.setTimeout(() => {
        setHeroTextVisible(false);
        imageTimer = window.setTimeout(() => {
          setSlide((current) => (current + 1) % heroImages.length);
        }, 850);
        returnTimer = window.setTimeout(() => {
          setHeroTextVisible(true);
          scheduleCycle(7000);
        }, 3850);
      }, delay);
    };

    // The photo changes 850 ms into the cycle; this starts that transition
    // 1.5 seconds after Home is revealed.
    scheduleCycle(650);
    return () => {
      window.clearTimeout(cycleTimer);
      window.clearTimeout(imageTimer);
      window.clearTimeout(returnTimer);
    };
  }, [isWelcomeVisible]);
  const text = (key: string, fallback: string) =>
    content[key]?.value || fallback;
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
          {localizeText(heroImages.map(([slot, alt], index) => (
            <DynamicImage
              key={slot}
              slotKey={slot}
              alt={localizeText(alt)}
              className={`hero-scene-image ${index === slide ? "active" : ""}`}
              preferLocal
            />
          )))}
          <div className="hero-shade" />
        </div>
        <div className="hero-copy wrap">
          <AnimatePresence mode="wait" initial={false}>
            {localizeText(heroTextVisible && (
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
                  {localizeText(text(
                    "home_eyebrow",
                    "A public charitable trust · Across India",
                  ))}
                </p>
                <h1 aria-label={localizeText(heroTitle)}>
                  {localizeText(translateText(heroTitle).split(/(\s+)/).map((part, index) => {
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
                        {localizeText(part)}
                      </motion.span>
                    );
                  }))}
                </h1>
                <p className="hero-lede">
                  {localizeText(text(
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
            aria-label={translateText("Explore our programmes")}
            title={translateText("Explore our programmes")}
          >
            <span className="hero-action-arrow" aria-hidden="true">
              →
            </span>
            <span className="hero-action-tooltip" aria-hidden="true"> {translateText("Programmes")} </span>
          </Link>
          <Link
            href="/about"
            className="hero-action hero-action-secondary"
            aria-label={translateText("Our story")}
            title={translateText("Our story")}
          >
            <span className="hero-action-arrow" aria-hidden="true">
              →
            </span>
            <span className="hero-action-tooltip" aria-hidden="true"> {translateText("Our story")} </span>
          </Link>
        </div>
        <div className="hero-bottom">
          <span>{translateText("JAGANNATH FOUNDATION")}</span>
          <span>{translateText("PEOPLE · DIGNITY · POSSIBILITY")}</span>
          <span>0{localizeText(slide + 1)} / 04</span>
          <div
            className="hero-controls"
            role="group"
            aria-label={translateText("Choose a featured image")}
          >
            {localizeText(heroImages.map(([slot, label], index) => (
              <button
                key={slot}
                type="button"
                className={`hero-dot ${index === slide ? "is-active" : ""}`}
                aria-label={localizeText(`Show ${label}`)}
                aria-pressed={index === slide}
                onClick={() => setSlide(index)}
              />
            )))}
          </div>
        </div>
        <div className="hero-seal" aria-hidden="true">
          <span>{translateText("MANAV SEVA")}</span>
          <b>सेवा</b>
          <span>{translateText("ISHWAR SEVA")}</span>
        </div>
      </section>

      <HomeUtilityCards />
      <section className="home-facts" aria-label={translateText("About the Foundation")}>
        <div className="wrap facts-inner">
          <Reveal className="facts-heading" direction="left">
            <p className="eyebrow">
              <span />{translateText("A clear beginning")} </p>
            <p className="facts-note"> {translateText("A public trust working across six connected areas, with progress shared as programmes take shape.")} </p>
          </Reveal>
          <Stagger className="facts-list" gap={0.1} distance={24}>
            {localizeText(foundationFacts.map((fact) => (
              <article className="fact-item" key={fact.value}>
                <strong>{localizeText(fact.value)}</strong>
                <span>{localizeText(fact.label)}</span>
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
                  slotKey="home-founder-photo"
                  alt={translateText("Dr Jagannath Patnaik, founder of Jagannath Foundation")}
                  className="founder-image"
                  preferLocal
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
            <motion.div
              className="story-photo-caption"
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: reducedMotion ? 0 : 0.8,
                delay: reducedMotion ? 0 : 0.58,
                ease: [0.22, 0.7, 0.2, 1],
              }}
            >
              <span>{translateText("Dr Jagannath Patnaik")}</span>
              <i>{translateText("Founder, Settlor & Managing Trustee")}</i>
            </motion.div>
          </Reveal>
          <Reveal className="story-copy" direction="right" duration={1.1}>
            <p className="eyebrow">
              <span /> {translateText("Our founder")} </p>
            <h2>{localizeText(storyTitle)}</h2>
            <p className="body-large">
              {localizeText(text(
                "home_about_body",
                "We support education, family wellbeing and livelihoods so communities can shape stronger futures for themselves.",
              ))}
            </p>
            <blockquote className="story-mantra">
              <span>{translateText("“Manav seva is Ishwar seva”")}</span>
              <small>{translateText("Service to people is at the heart of our work.")}</small>
            </blockquote>
            <Link href="/team" className="text-link"> {translateText("Meet our leadership")} <span>↗</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="home-work" ref={workSection}>
        <div className="wrap">
          <Reveal className="section-topline" direction="down">
            <div>
              <p className="eyebrow">
                <span /> {translateText("Six connected areas")} </p>
              <h2> {translateText("Everyday needs.")} <br /> {translateText("Lasting possibility.")} </h2>
            </div>
            <p> {translateText("Six connected areas of work, shaped around the everyday needs of people and families.")} </p>
          </Reveal>
          <Stagger className="work-grid" gap={0.12} distance={34}>
            {localizeText(workAreas.map((area, index) => (
              <div
                key={area.title}
                className={`work-feature-reveal work-feature-reveal-${index + 1}`}
              >
                <Link
                  href="/programmes"
                  className={`work-feature work-feature-${index + 1} work-${area.theme}`}
                >
                  <div className="work-photo">
                    <WorkFeatureSlideshow
                      photo={area.photo}
                      secondary={area.secondary}
                      alt={localizeText(area.label)}
                    />
                    <span className="work-index">0{localizeText(index + 1)}</span>
                  </div>
                  <div className="work-text">
                    <span>{localizeText(area.label)}</span>
                    <h3>{localizeText(area.title)}</h3>
                    <p>{localizeText(area.body)}</p>
                    <b aria-hidden="true">↗</b>
                  </div>
                </Link>
              </div>
            )))}
          </Stagger>
          <Reveal className="work-footer" direction="up">
            <span className="work-count">
              <strong>4 / 6</strong> {translateText("programme areas featured")} </span>
            <Link href="/programmes" className="text-link"> {translateText("Explore all our programmes")} <span>↗</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="home-gallery home-people wrap">
        <Reveal className="gallery-heading" delay={0.04} direction="down">
          <div>
            <p className="eyebrow">
              <span /> {translateText("People and leadership")} </p>
            <h2>{translateText("Meet the people behind the work.")}</h2>
            <p> {translateText("Trustees, management and advisors bring experience and care to the Foundation’s public service.")} </p>
          </div>
          <Link href="/team" className="text-link"> {translateText("Meet our people")} <span>↗</span>
          </Link>
        </Reveal>
        <Reveal
          className="gallery-slider-reveal"
          delay={0.04}
          delayOffset={0.08}
          direction="up"
        >
          <HomeGallerySlider
            photos={peopleHome}
            reducedMotion={Boolean(reducedMotion)}
            href="/team"
            variant="people"
          />
        </Reveal>
      </section>

      <section className="home-principles">
        <div className="wrap principles-layout">
          <Reveal className="principles-intro" direction="left">
            <p className="eyebrow eyebrow-light">
              <span /> {translateText("How we work")} </p>
            <h2>{translateText("Good intentions need good practice.")}</h2>
            <p> {translateText("We listen first, work with local partners and focus on what can last.")} </p>
            <Link href="/impact" className="text-link"> {translateText("Our approach to impact")} <span>↗</span>
            </Link>
          </Reveal>
          <Stagger className="principles-list" gap={0.1} distance={26}>
            {localizeText(principles.map((item) => (
              <article key={item.number}>
                <span>{localizeText(item.number)}</span>
                <div>
                  <h3>{localizeText(item.title)}</h3>
                  <p>{localizeText(item.body)}</p>
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
              <span /> {translateText("People and partnerships")} </p>
            <h2>
              {localizeText(text("home_gallery_title", "Partnerships built on respect."))}
            </h2>
            <p>
              {localizeText(text(
                "home_gallery_body",
                "A few moments with leaders and partners who share a commitment to public service.",
              ))}
            </p>
          </div>
          <Link href="/gallery" className="text-link"> {translateText("View the gallery")} <span>↗</span>
          </Link>
        </Reveal>
        <Reveal className="gallery-slider-reveal" delay={0.12} direction="up">
          <HomeGallerySlider photos={galleryHome} reducedMotion={Boolean(reducedMotion)} />
        </Reveal>
      </section>

      <Reveal as="section" className="home-join">
        <div className="join-ornament" aria-hidden="true">
          ✳
        </div>
        <p className="eyebrow eyebrow-light">
          <span /> {translateText("Stand alongside communities")} </p>
        <h2> {translateText("There is room for")} <br /> {translateText("more good work.")} </h2>
        <p> {translateText("Bring your time, your experience or your support. Together, we can help create the conditions for people to thrive.")} </p>
        <div>
          <Link href="/volunteer" className="button button-paper"> {translateText("Join as a volunteer")} <span>↗</span>
          </Link>
          <Link href="/contact" className="button button-line"> {translateText("Talk with us")} <span>→</span>
          </Link>
        </div>
      </Reveal>
    </Layout>
  );
}
