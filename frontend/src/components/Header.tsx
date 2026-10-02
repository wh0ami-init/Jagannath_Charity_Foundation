import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { DynamicImage } from "../lib/ImagesContext";

const primaryLinks = [
  { href: "/about", label: "Our story" },
  { href: "/work", label: "Our work" },
  { href: "/projects", label: "Projects" },
  { href: "/impact", label: "Our impact" },
];

const exploreLinks = [
  { href: "/team", label: "People", note: "Trustees, leadership and advisors" },
  { href: "/partners", label: "Partners", note: "The organisations alongside us" },
  { href: "/gallery", label: "Gallery", note: "Moments from the Foundation" },
  { href: "/volunteer", label: "Volunteer", note: "Offer your time and experience" },
  { href: "/services", label: "Community portal", note: "Membership, opportunities and requests" },
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
        if (exploreToggleRef.current?.parentElement?.contains(document.activeElement)) {
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
          <Link href="/" className="brand" onClick={() => { setOpen(false); setExploreOpen(false); }}>
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
            <i aria-hidden="true" className={open ? "is-open" : ""}><span /><span /></i>
          </button>
          <nav
            id="site-navigation"
            className={`main-nav ${open ? "is-open" : ""}`}
            aria-label="Main navigation"
          >
            <Link
              href="/"
              onClick={() => { setOpen(false); setExploreOpen(false); }}
              className={`home-link${homeActive ? " active" : ""}`}
              aria-current={homeActive ? "page" : undefined}
            >
              Home
            </Link>
            {primaryLinks.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                onNavigate={() => { setOpen(false); setExploreOpen(false); }}
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
                  if (event.nativeEvent.detail > 0 && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                    setExploreOpen(true);
                  } else {
                    setExploreOpen((value) => !value);
                  }
                }}
              >
                Explore <span aria-hidden="true">⌄</span>
              </button>
              <div id="nav-explore-panel" className="nav-explore-panel" aria-hidden={!exploreOpen}>
                <p className="nav-explore-heading">More from the Foundation</p>
                <div className="nav-explore-grid">
                  {exploreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      tabIndex={exploreOpen ? 0 : -1}
                      onClick={() => { setOpen(false); setExploreOpen(false); }}
                      className="nav-explore-link"
                    >
                      <span>{link.label}<i aria-hidden="true">↗</i></span>
                      <small>{link.note}</small>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/donate"
              className="nav-donate"
              onClick={() => { setOpen(false); setExploreOpen(false); }}
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
