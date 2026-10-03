import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { DynamicImage } from "../lib/ImagesContext";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const primaryLinks = [
  { href: "/about", label: "Our story" },
  { href: "/programmes", label: "Programmes" },
  { href: "/projects", label: "Projects" },
  { href: "/impact", label: "Our impact" },
];

const exploreLinks = [
  { href: "/team", label: "People", note: "Trustees, leadership and advisors" },
  {
    href: "/partners",
    label: "Partners",
    note: "The organisations alongside us",
  },
  { href: "/gallery", label: "Gallery", note: "Moments from the Foundation" },
  {
    href: "/volunteer",
    label: "Volunteer",
    note: "Offer your time and experience",
  },
  {
    href: "/services",
    label: "Community portal",
    note: "Membership, opportunities and requests",
  },
  { href: "/contact", label: "Contact", note: "Reach the Foundation team" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const [homeActive] = useRoute("/");
  const headerRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const exploreToggleRef = useRef<HTMLButtonElement>(null);

  const reducedMotion = useReducedMotion();
  const menuLocked = useRef(false);
  menuLocked.current = open || exploreOpen;

  // 1) Header hides when you scroll down and comes back when you scroll up
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

  // 2) Menu items slide in one by one (phone menu + "Explore" panel)
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header || reducedMotion) return;

      if (open && window.matchMedia("(max-width: 1000px)").matches) {
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
        gsap.from(header.querySelectorAll(".nav-explore-link"), {
          opacity: 0,
          duration: 0.4,
          ease: "power1.out",
          stagger: 0.045,
          clearProps: "opacity",
        });
      }
    },
    { scope: headerRef, dependencies: [open, exploreOpen, reducedMotion] },
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
        if (
          exploreToggleRef.current?.parentElement?.contains(
            document.activeElement,
          )
        ) {
          exploreToggleRef.current.focus();
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
        className={`site-header backdrop-blur-xl${homeActive ? " is-home" : ""}${homeActive && scrolled ? " is-scrolled" : ""}`}
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
              <strong>Jagannath Foundation</strong>
              <small>Serving with dignity · Since 2026</small>
            </span>
          </Link>
          <button
            ref={menuToggleRef}
            className="menu-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-controls="site-navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span>{open ? "Close" : "Menu"}</span>
            <i aria-hidden="true" className={open ? "is-open" : ""}>
              <span />
              <span />
            </i>
          </button>
          <nav
            id="site-navigation"
            className={`main-nav ${open ? "is-open" : ""}`}
            aria-label="Main navigation"
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
              Home
            </Link>
            {primaryLinks.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                onNavigate={() => {
                  setOpen(false);
                  setExploreOpen(false);
                }}
              />
            ))}
            <div
              className={`nav-explore${exploreOpen ? " is-open" : ""}`}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setExploreOpen(true);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") setExploreOpen(false);
              }}
            >
              <button
                ref={exploreToggleRef}
                type="button"
                className={`nav-explore-toggle${exploreLinks.some((link) => location === link.href || location.startsWith(`${link.href}/`)) ? " active" : ""}`}
                aria-expanded={exploreOpen}
                aria-controls="nav-explore-panel"
                onClick={(event) => {
                  if (
                    event.nativeEvent.detail > 0 &&
                    window.matchMedia("(hover: hover) and (pointer: fine)")
                      .matches
                  ) {
                    setExploreOpen(true);
                  } else {
                    setExploreOpen((value) => !value);
                  }
                }}
              >
                Explore <span aria-hidden="true">⌄</span>
              </button>
              <div
                id="nav-explore-panel"
                className="nav-explore-panel"
                aria-hidden={!exploreOpen}
              >
                <p className="nav-explore-heading">More from the Foundation</p>
                <div className="nav-explore-grid">
                  {exploreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      tabIndex={exploreOpen ? 0 : -1}
                      onClick={() => {
                        setOpen(false);
                        setExploreOpen(false);
                      }}
                      className="nav-explore-link"
                    >
                      <span>
                        {link.label}
                        <i aria-hidden="true">↗</i>
                      </span>
                      <small>{link.note}</small>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/donate"
              className="nav-donate"
              onClick={() => {
                setOpen(false);
                setExploreOpen(false);
              }}
            >
              Make a difference <span>↗</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  const [active] = useRoute(`${href}/*?`);
  return (
    <Link href={href} onClick={onNavigate} className={active ? "active" : ""}>
      {label}
    </Link>
  );
}
