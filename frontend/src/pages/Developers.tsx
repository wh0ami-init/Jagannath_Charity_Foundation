import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import { tr as t } from "../i18n";
import "./developers.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  EDIT HERE: names, roles, short lines, links and photos.            */
/*  Photo: put the file in  frontend/public/images/developers/  and    */
/*  write   photo: "/images/developers/pawan-thapa.webp"               */
/*  No photo yet? Leave it out. Initials are shown instead.            */
/* ------------------------------------------------------------------ */
type Developer = {
  name: string;
  role: string;
  bio: string;
  skills: string[];
  photo?: string;
  github?: string;
  linkedin?: string;
};

const leadDevelopers: Developer[] = [
  {
    name: "Pawan Thapa",
    role: "Project Manager & DevOps",
    bio: "Planned the project, led the team and put the website live for the Foundation.",
    skills: ["Project management", "DevOps", "React", "GSAP"],
    photo: "/images/developers/pawan-thapa.jpg",
    github: "https://github.com/wh0ami-init",
    // linkedin: "https://www.linkedin.com/in/your-name",
  },
  {
    name: "Lakpa Tshering Sherpa",
    role: "Back-End Developer",
    bio: "Built the server side that keeps the site, forms and donations working.",
    skills: ["Python", "FastAPI", "PostgreSQL", "APIs"],
    photo: "/images/developers/lakpa-tshering-sherpa.jpeg",
    // github: "https://github.com/their-username",
    // linkedin: "https://www.linkedin.com/in/their-name",
  },
];

const teamMembers: Developer[] = [
  {
    name: "Keshav Manger",
    role: "Front-End Developer",
    bio: "Helped shape the pages that visitors see and use.",
    skills: ["React", "UI"],
    // photo: "/images/developers/keshav-manger.webp",
    // github: "https://github.com/their-username",
  },
  {
    name: "Sahil Pradhan",
    role: "Back-End & Security Developer",
    bio: "Worked on the back end and on keeping the site safe.",
    skills: ["Python", "Security"],
    // photo: "/images/developers/sahil-pradhan.webp",
    // github: "https://github.com/their-username",
  },
  {
    name: "Karishma Adhikari",
    role: "QA Tester",
    bio: "Tested the site and reported bugs so visitors get a smooth experience.",
    skills: ["Testing", "Quality"],
    // photo: "/images/developers/karishma-adhikari.webp",
    // github: "https://github.com/their-username",
  },
];

const techStack = [
  "React",
  "TypeScript",
  "Vite",
  "GSAP",
  "Tailwind CSS",
  "Python",
  "FastAPI",
  "PostgreSQL",
  "Vercel",
  "Railway",
  "Razorpay",
  "Git & GitHub",
];

const terminalLines = [
  "$ git push origin main",
  "✓ built by students of ICFAI University, Sikkim",
  "✓ live at jagannathfoundation.charity",
];
/* ------------------------------------------------------------------ */

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

function Portrait({ person }: { person: Developer }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="dev-portrait">
      {person.photo && !failed ? (
        <img
          src={person.photo}
          alt={person.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="dev-initials" aria-hidden="true">
          {initials(person.name)}
        </span>
      )}
    </div>
  );
}

function Links({ person }: { person: Developer }) {
  if (!person.github && !person.linkedin) return null;
  return (
    <div className="dev-links dev-reveal">
      {person.github && (
        <a
          href={person.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${person.name} – GitHub`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
          </svg>
          <span>GitHub</span>
        </a>
      )}
      {person.linkedin && (
        <a
          href={person.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${person.name} – LinkedIn`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.05c.53-1 1.84-2.07 3.78-2.07 4.04 0 4.79 2.66 4.79 6.12V21h-4v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.59V21h-4V9.75Z" />
          </svg>
          <span>LinkedIn</span>
        </a>
      )}
    </div>
  );
}

function Skills({ skills }: { skills: string[] }) {
  return (
    <ul className="dev-skills dev-reveal">
      {skills.map((skill) => (
        <li key={skill}>{t(skill)}</li>
      ))}
    </ul>
  );
}

function TechBackdrop() {
  return (
    <div className="dev-tech-backdrop" aria-hidden="true">
      <div className="dev-tech-mesh" />
      <svg className="dev-tech-circuit" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" focusable="false">
        <g className="dev-tech-traces" fill="none">
          <path pathLength="1" d="M0 120H140L210 190V340L300 430H420" />
          <path pathLength="1" d="M1200 60H1030L950 140V290L850 390H780" />
          <path pathLength="1" d="M0 690H180L260 610V550L340 470" />
          <path pathLength="1" d="M1200 720H1020L920 620V530L850 460H760" />
        </g>
        <g className="dev-tech-nodes">
          {[[140,120],[210,340],[420,430],[1030,60],[950,290],[780,390],[180,690],[340,470],[1020,720],[760,460]].map(([cx,cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" />
          ))}
        </g>
      </svg>
      <div className="dev-tech-scan" />
    </div>
  );
}

export default function Developers() {
  const { i18n } = useTranslation();
  const root = useRef<HTMLDivElement>(null);

  // Hindi text has a different length, so tell ScrollTrigger to measure again.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [i18n.resolvedLanguage]);

  useGSAP(
    () => {
      // Functions that remove mouse listeners when the page closes.
      const cleanups: Array<() => void> = [];
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          fine: "(hover: hover) and (pointer: fine)",
        },
        (context) => {
          const { motion, fine } = context.conditions as unknown as {
            motion: boolean;
            fine: boolean;
          };
          // People who asked for less motion simply see the finished page.
          if (!motion) return;

          const el = root.current!;
          const q = <T extends Element = HTMLElement>(sel: string) =>
            gsap.utils.toArray<T>(sel, el);

          // Animate decorative layers only; never transform the page wrapper.
          q(".dev-tech-backdrop").forEach((backdrop) => {
            const trigger = backdrop.parentElement!;
            const timeline = gsap.timeline({
              scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: 1.2 },
            });
            timeline.fromTo(backdrop.querySelectorAll(".dev-tech-traces path"),
              { strokeDasharray: 1, strokeDashoffset: 1 },
              { strokeDashoffset: 0, duration: 1, stagger: 0.08, ease: "none" }, 0);
            timeline.fromTo(backdrop.querySelector(".dev-tech-mesh"),
              { y: -35 }, { y: 35, duration: 1.3, ease: "none" }, 0);
            timeline.fromTo(backdrop.querySelector(".dev-tech-scan"),
              { top: "5%", opacity: 0 },
              { top: "95%", opacity: 0.6, duration: 1.3, ease: "none" }, 0);
            timeline.fromTo(backdrop.querySelectorAll(".dev-tech-nodes circle"),
              { opacity: 0.2 }, { opacity: 1, duration: 0.5, stagger: 0.06 }, 0.25);
          });

          /* 1. Section headings: slide up, then draw the gold line */
          q(".dev-heading-wrap").forEach((wrap) => {
            gsap
              .timeline({
                scrollTrigger: { trigger: wrap, start: "top 88%", once: true },
              })
              .from(wrap.querySelectorAll(".dev-heading, .dev-sub"), {
                autoAlpha: 0,
                y: 26,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
              })
              .from(
                wrap.querySelector(".dev-rule"),
                {
                  scaleX: 0,
                  transformOrigin: "left center",
                  duration: 0.9,
                  ease: "power3.inOut",
                },
                "<0.1",
              );
          });

          /* 2. Numbers count up */
          q(".dev-stat-num").forEach((num) => {
            const end = Number(num.dataset.to ?? 0);
            const counter = { value: 0 };
            num.textContent = "0";
            gsap.to(counter, {
              value: end,
              duration: 1.6,
              ease: "power2.out",
              onUpdate: () => {
                num.textContent = String(Math.round(counter.value));
              },
              scrollTrigger: { trigger: num, start: "top 92%", once: true },
            });
          });
          gsap.from(q(".dev-stat"), {
            autoAlpha: 0,
            y: 24,
            duration: 0.7,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".dev-stats",
              start: "top 90%",
              once: true,
            },
          });

          /* 3. Terminal types its lines, one by one */
          const lines = q(".dev-term-line");
          const typing = gsap.timeline({
            scrollTrigger: {
              trigger: ".dev-terminal",
              start: "top 82%",
              once: true,
            },
          });
          typing.from(".dev-terminal", {
            autoAlpha: 0,
            y: 30,
            scale: 0.97,
            duration: 0.8,
            ease: "power3.out",
          });
          lines.forEach((line) => {
            const full = line.dataset.text ?? "";
            const progress = { n: 0 };
            line.textContent = "";
            typing.to(
              progress,
              {
                n: full.length,
                duration: Math.max(0.5, full.length * 0.032),
                ease: "none",
                onUpdate: () => {
                  line.textContent = full.slice(0, Math.round(progress.n));
                },
              },
              ">+0.25",
            );
          });

          /* 4. Lead developer cards */
          q(".dev-lead").forEach((card) => {
            gsap
              .timeline({
                scrollTrigger: { trigger: card, start: "top 84%", once: true },
              })
              .from(card, {
                autoAlpha: 0,
                y: 56,
                duration: 0.85,
                ease: "power3.out",
              })
              .from(
                card.querySelector(".dev-portrait"),
                {
                  clipPath: "inset(0% 0% 100% 0%)",
                  duration: 0.95,
                  ease: "power4.inOut",
                },
                "<0.15",
              )
              .from(
                card.querySelectorAll(".dev-reveal"),
                {
                  autoAlpha: 0,
                  y: 18,
                  duration: 0.6,
                  stagger: 0.09,
                  ease: "power2.out",
                },
                "-=0.55",
              );
          });

          /* 5. Team member cards come in as a group */
          gsap.set(q(".dev-member"), { autoAlpha: 0 });
          ScrollTrigger.batch(q(".dev-member"), {
            start: "top 90%",
            once: true,
            onEnter: (batch) =>
              gsap.fromTo(
                batch,
                { autoAlpha: 0, y: 44, scale: 0.96 },
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.75,
                  stagger: 0.13,
                  ease: "power3.out",
                  overwrite: true,
                },
              ),
          });

          /* 6. Dark section: glowing orbs float, grid moves slowly */
          gsap.to(".dev-orb--one", {
            x: 50,
            y: 30,
            scale: 1.12,
            duration: 12,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
          gsap.to(".dev-orb--two", {
            x: -44,
            y: -26,
            scale: 1.08,
            duration: 15,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
          gsap.to(".dev-grid-bg", {
            yPercent: -14,
            ease: "none",
            scrollTrigger: {
              trigger: ".dev-leads-section",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });

          /* 7. Technology strip scrolls forever (slows down on hover) */
          const track = el.querySelector(".dev-marquee-track");
          if (track) {
            const loop = gsap.to(track, {
              xPercent: -50,
              duration: 36,
              ease: "none",
              repeat: -1,
            });
            if (fine) {
              const strip = el.querySelector(".dev-marquee")!;
              const slow = () =>
                gsap.to(loop, {
                  timeScale: 0.15,
                  duration: 0.6,
                  overwrite: true,
                });
              const fast = () =>
                gsap.to(loop, { timeScale: 1, duration: 0.6, overwrite: true });
              strip.addEventListener("pointerenter", slow);
              strip.addEventListener("pointerleave", fast);
              cleanups.push(() => {
                strip.removeEventListener("pointerenter", slow);
                strip.removeEventListener("pointerleave", fast);
              });
            }
          }

          /* 8. Mouse and trackpad only: lead cards tilt and glow */
          if (fine) {
            q(".dev-lead").forEach((card) => {
              gsap.set(card, { transformPerspective: 900 });
              const rotateX = gsap.quickTo(card, "rotationX", {
                duration: 0.5,
                ease: "power3.out",
              });
              const rotateY = gsap.quickTo(card, "rotationY", {
                duration: 0.5,
                ease: "power3.out",
              });
              const move = (event: PointerEvent) => {
                const box = card.getBoundingClientRect();
                const px = (event.clientX - box.left) / box.width;
                const py = (event.clientY - box.top) / box.height;
                rotateY((px - 0.5) * 9);
                rotateX(-(py - 0.5) * 9);
                card.style.setProperty("--mx", `${px * 100}%`);
                card.style.setProperty("--my", `${py * 100}%`);
              };
              const leave = () => {
                rotateX(0);
                rotateY(0);
              };
              card.addEventListener("pointermove", move);
              card.addEventListener("pointerleave", leave);
              cleanups.push(() => {
                card.removeEventListener("pointermove", move);
                card.removeEventListener("pointerleave", leave);
              });
            });
          }

          return () => {
            cleanups.splice(0).forEach((fn) => fn());
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  const total = leadDevelopers.length + teamMembers.length;

  return (
    <Layout>
      <div className="dev-hero-surface">
      <PageHero
        theme="team"
        motif="leadership"
        eyebrow={t("Developers")}
        title={t("The people who built this website.")}
        description={t(
          "Students of The ICFAI University, Sikkim designed, built and launched this site for the Foundation, under the guidance of Dr Jagannath Patnaik.",
        )}
      />
      </div>

      <div className="dev-page" ref={root}>
        <TechBackdrop />
        {/* ---------- Intro: story + numbers + terminal ---------- */}
        <section className="wrap dev-intro">
          <div className="dev-intro-copy">
            <div className="dev-heading-wrap">
              <h2 className="dev-heading">
                {t("Built by students. Built with care.")}
              </h2>
              <span className="dev-rule" aria-hidden="true" />
            </div>
            <p>
              {t(
                "This website carries donations, certificates, programmes and stories for the Foundation. A small team of developers planned it, wrote every page and keeps it running.",
              )}
            </p>
            <dl className="dev-stats">
              <div className="dev-stat">
                <dt>{t("Developers")}</dt>
                <dd className="dev-stat-num" data-to={total}>
                  {total}
                </dd>
              </div>
              <div className="dev-stat">
                <dt>{t("Technologies")}</dt>
                <dd className="dev-stat-num" data-to={techStack.length}>
                  {techStack.length}
                </dd>
              </div>
              <div className="dev-stat">
                <dt>{t("Languages")}</dt>
                <dd className="dev-stat-num" data-to={2}>
                  2
                </dd>
              </div>
            </dl>
          </div>

          <div className="dev-terminal" aria-hidden="true">
            <div className="dev-terminal-bar">
              <i />
              <i />
              <i />
              <span>jagannath-foundation</span>
            </div>
            <div className="dev-terminal-body">
              {terminalLines.map((line) => (
                <p className="dev-term-line" data-text={line} key={line}>
                  {line}
                </p>
              ))}
              <span className="dev-caret" />
            </div>
          </div>
        </section>

        {/* ---------- Lead developers ---------- */}
        <section className="dev-leads-section">
          <TechBackdrop />
          <div className="dev-grid-bg" aria-hidden="true" />
          <span className="dev-orb dev-orb--one" aria-hidden="true" />
          <span className="dev-orb dev-orb--two" aria-hidden="true" />
          <div className="wrap dev-leads-inner">
            <div className="dev-heading-wrap dev-heading-wrap--light">
              <h2 className="dev-heading">{t("Lead Developers")}</h2>
              <span className="dev-rule" aria-hidden="true" />
              <p className="dev-sub">
                {t(
                  "The core team that designed, built and launched the website.",
                )}
              </p>
            </div>
            <div className="dev-leads">
              {leadDevelopers.map((person) => (
                <article className="dev-lead" key={person.name}>
                  <span className="dev-badge dev-reveal">
                    <i aria-hidden="true" /> {t("Lead")}
                  </span>
                  <Portrait person={person} />
                  <h3 className="dev-reveal">{person.name}</h3>
                  <p className="dev-role dev-reveal">{t(person.role)}</p>
                  <p className="dev-bio dev-reveal">{t(person.bio)}</p>
                  <Skills skills={person.skills} />
                  <Links person={person} />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Team members ---------- */}
        <section className="wrap dev-members-section">
          <div className="dev-heading-wrap">
            <h2 className="dev-heading">{t("Development Team")}</h2>
            <span className="dev-rule" aria-hidden="true" />
            <p className="dev-sub">
              {t("Team members who helped build, secure and test the website.")}
            </p>
          </div>
          <div className="dev-members">
            {teamMembers.map((person) => (
              <article className="dev-member" key={person.name}>
                <Portrait person={person} />
                <h3>{person.name}</h3>
                <p className="dev-role">{t(person.role)}</p>
                <p className="dev-bio">{t(person.bio)}</p>
                <ul className="dev-skills">
                  {person.skills.map((skill) => (
                    <li key={skill}>{t(skill)}</li>
                  ))}
                </ul>
                <Links person={person} />
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Tech stack strip ---------- */}
        <section className="dev-stack" aria-label={t("Technologies we used")}>
          <p className="dev-stack-title">{t("Technologies we used")}</p>
          <div className="dev-marquee">
            <div className="dev-marquee-track">
              <ul>
                {techStack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
              <ul className="dev-marquee-dup" aria-hidden="true">
                {techStack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- Thank you ---------- */}
        <section className="wrap dev-thanks">
          <p>
            {t(
              "With thanks to Dr Jagannath Patnaik and the Foundation for trusting students with a real project.",
            )}
          </p>
        </section>
      </div>
    </Layout>
  );
}
