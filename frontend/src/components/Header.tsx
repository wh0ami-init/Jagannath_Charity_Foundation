import LanguageSwitcher from "./LanguageSwitcher";
import {
  tr as translateText,
  localize as localizeText,
  trError as translateError,
} from "../i18n";
import { useTranslation as usePageTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { DynamicImage } from "../lib/ImagesContext";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { comingSoonSections } from "../lib/comingSoonSections";
import "../nav-menu.css";
gsap.registerPlugin(useGSAP, ScrollTrigger);
const sectionLink = (href: string) => {
  const found = comingSoonSections.find((section) => section.href === href);
  if (!found) throw new Error(`Missing navigation section: ${href}`);
  return { href: found.href, label: found.label, note: found.note };
};
// Keep the top bar light and group every destination by visitor intent.
const navMenus = [
  {
    id: "about",
    title: "About",
    links: [
      {
        href: "/about",
        label: "Our story",
        note: "Who we are and why we exist",
      },
      {
        href: "/team",
        label: "People",
        note: "The team behind the Foundation",
      },
      {
        href: "/partners",
        label: "Partners",
        note: "The organisations alongside us",
      },
      { href: "/contact", label: "Contact", note: "Reach the Foundation team" },
    ],
  },
  {
    id: "work",
    title: "Our work",
    links: [
      { href: "/projects", label: "Projects", note: "Projects in progress" },
      {
        href: "/impact",
        label: "Our impact",
        note: "Numbers and stories of change",
      },
      sectionLink("/beneficiaries/active"),
      sectionLink("/project-expenses"),
      sectionLink("/campaigns"),
      sectionLink("/programs-and-events"),
    ],
  },
  {
    id: "involved",
    title: "Get involved",
    links: [
      {
        href: "/volunteer",
        label: "Volunteer",
        note: "Offer your time and experience",
      },
      sectionLink("/careers"),
      sectionLink("/internships/available"),
      sectionLink("/beneficiaries/apply"),
      {
        href: "/services",
        label: "Community portal",
        note: "Membership, opportunities and requests",
      },
    ],
  },
  {
    id: "resources",
    title: "Resources",
    links: [
      {
        href: "/certificates",
        label: "Certificates",
        note: "Registrations and official records",
      },
      sectionLink("/generate-id-card"),
      sectionLink("/generate-certificate"),
      sectionLink("/appointment-letter"),
      sectionLink("/internships/certificate-verification"),
      { href: "/gallery", label: "Gallery", note: "Photographs from our work" },
      sectionLink("/video-gallery"),
    ],
  },
];
export default function Header() {
  usePageTranslation();
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const exploreOpen = openMenu !== null;
  const setExploreOpen = (value: boolean) => {
    if (!value) setOpenMenu(null);
  };
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const [homeActive] = useRoute("/");
  const [programmesActive] = useRoute("/programmes/*?");
  const headerRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const menuLocked = useRef(false);
  menuLocked.current = open || exploreOpen;
  // On-Scroll Header Hide --Section
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header || reducedMotion) return;
      let hidden = false;
      const show = () => {
        if (!hidden) return;
        hidden = false;
        gsap.to(header, {
          yPercent: 0,
          y: 0,
          duration: 0.4,
          ease: "power3.out",
          overwrite: "auto",
          clearProps: "transform",
        });
      };
      const hide = () => {
        if (hidden) return;
        hidden = true;
        // extra -40px so the soft shadow under the header is hidden too
        gsap.to(header, {
          yPercent: -100,
          y: -40,
          duration: 0.45,
          ease: "power3.inOut",
          overwrite: "auto",
        });
      };
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          // never hide while a menu is open or while someone is tabbing through the header
          if (menuLocked.current || header.querySelector(":focus-visible")) {
            show();
            return;
          }
          if (self.direction === 1 && self.scroll() > 260) hide();
          else if (self.direction === -1) show();
        },
      });
      header.addEventListener("focusin", show);
      return () => header.removeEventListener("focusin", show);
    },
    { scope: headerRef, dependencies: [reducedMotion] },
  );
  // Menu items slide in for the responsive and grouped navigation panels.
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header || reducedMotion) return;
      if (open && window.matchMedia("(max-width: 1240px)").matches) {
        gsap.from(header.querySelectorAll(".main-nav > *"), {
          opacity: 0,
          y: -8,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.05,
          delay: 0.06,
          clearProps: "opacity,transform",
        });
      }
      if (exploreOpen) {
        // opacity only: these links already have their own hover transform in CSS
        const links = header.querySelectorAll(
          ".nav-explore.is-open .nav-explore-item",
        );
        gsap.from(links, {
          opacity: 0,
          y: 7,
          duration: 0.3,
          ease: "power2.out",
          stagger: 0.035,
          clearProps: "opacity,transform",
        });
      }
    },
    { scope: headerRef, dependencies: [open, openMenu, reducedMotion] },
  );
  useEffect(() => {
    setOpen(false);
    setExploreOpen(false);
  }, [location]);
  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 72);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExploreOpen(false);
        setOpen(false);
        const openToggle = headerRef.current?.querySelector<HTMLButtonElement>(
          ".nav-explore.is-open .nav-explore-toggle",
        );
        if (
          openToggle &&
          openToggle.parentElement?.contains(document.activeElement)
        ) {
          openToggle.focus();
        } else {
          menuToggleRef.current?.focus();
        }
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      ) {
        setOpen(false);
        setExploreOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);
  return (
    <>
      <header
        className={`site-header backdrop-blur-xl${homeActive ? " is-home" : ""}${homeActive && scrolled ? " is-scrolled" : ""}${exploreOpen ? " is-explore-open" : ""}`}
        ref={headerRef}
      >
        <div className="wrap header-main">
          <Link
            href="/"
            className="brand"
            onClick={() => {
              setOpen(false);
              setExploreOpen(false);
            }}
          >
            <span className="brand-mark">
              <DynamicImage
                slotKey="site-logo"
                alt=""
                className="brand-image"
              />
            </span>
            <span className="brand-name">
              <strong>{translateText("Jagannath Foundation")}</strong>
              <small>
                {translateText("Serving with dignity \u00B7 Since 2026")}
              </small>
            </span>
          </Link>
          <button
            ref={menuToggleRef}
            className="menu-toggle"
            aria-label={translateText(
              open ? "Close navigation" : "Open navigation",
            )}
            aria-controls="site-navigation"
            aria-expanded={open}
            onClick={() => {
              setOpen((value) => !value);
              setExploreOpen(false);
            }}
          >
            <span>{localizeText(open ? "Close" : "Menu")}</span>
            <i aria-hidden="true" className={open ? "is-open" : ""}>
              <span />
              <span />
            </i>
          </button>
          <nav
            id="site-navigation"
            className={`main-nav ${open ? "is-open" : ""}`}
            aria-label={translateText("Main navigation")}
          >
            <Link
              href="/"
              onClick={() => {
                setOpen(false);
                setExploreOpen(false);
              }}
              className={`home-link${homeActive ? " active" : ""}`}
              aria-current={homeActive ? "page" : undefined}
            >
              {translateText("Home")}
            </Link>
            <Link
              href="/programmes"
              className={programmesActive ? "active" : ""}
              aria-current={programmesActive ? "page" : undefined}
              onClick={() => {
                setOpen(false);
                setExploreOpen(false);
              }}
            >
              {translateText("Programmes")}
            </Link>
            {navMenus.map((menu) => {
              const isOpen = openMenu === menu.id;
              return (
                <div
                  key={menu.id}
                  className={`nav-explore${isOpen ? " is-open" : ""}`}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setOpenMenu(menu.id);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === "mouse")
                      setOpenMenu((current) =>
                        current === menu.id ? null : current,
                      );
                  }}
                >
                  <button
                    type="button"
                    className={`nav-explore-toggle${menu.links.some((link) => isCurrentRoute(location, link.href)) ? " active" : ""}`}
                    aria-expanded={isOpen}
                    aria-controls={`nav-menu-${menu.id}`}
                    onClick={(event) => {
                      if (
                        event.nativeEvent.detail > 0 &&
                        window.matchMedia("(hover: hover) and (pointer: fine)")
                          .matches
                      ) {
                        setOpenMenu(menu.id);
                      } else {
                        setOpenMenu((current) =>
                          current === menu.id ? null : menu.id,
                        );
                      }
                    }}
                  >
                    {translateText(menu.title)}
                    <svg
                      className="nav-explore-chevron"
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M1 4 8 12 15 4Z"
                        fill="currentColor"
                        stroke="none"
                      />
                    </svg>
                  </button>
                  <ul
                    id={`nav-menu-${menu.id}`}
                    className="nav-explore-panel"
                    aria-hidden={!isOpen}
                  >
                    {menu.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          tabIndex={isOpen ? 0 : -1}
                          onClick={() => {
                            setOpen(false);
                            setExploreOpen(false);
                          }}
                          className={`nav-explore-item${isCurrentRoute(location, link.href) ? " active" : ""}`}
                          aria-current={
                            isCurrentRoute(location, link.href) ? "page" : undefined
                          }
                        >
                          <span className="nav-explore-item-title">
                            {localizeText(link.label)}
                            <i aria-hidden="true">↗</i>
                          </span>
                          <small>{localizeText(link.note)}</small>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <LanguageSwitcher />
            <Link
              href="/donate"
              className="nav-donate"
              onClick={() => {
                setOpen(false);
                setExploreOpen(false);
              }}
            >
              {translateText("Make a difference")}
              <span>↗</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
function isCurrentRoute(location: string, href: string) {
  return location === href || location.startsWith(`${href}/`);
}
