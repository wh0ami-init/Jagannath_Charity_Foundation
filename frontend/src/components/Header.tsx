import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { DynamicImage } from "../lib/ImagesContext";

const links = [
  { href: "/about", label: "Our story" },
  { href: "/work", label: "Our work" },
  { href: "/impact", label: "Impact" },
  { href: "/team", label: "People" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const [homeActive] = useRoute("/");
  const headerRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 72);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuToggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setOpen(false);
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
      <header className={`site-header${homeActive ? " is-home" : ""}${homeActive && scrolled ? " is-scrolled" : ""}`} ref={headerRef}>
        <div className="wrap header-main">
          <Link href="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-mark"><DynamicImage slotKey="site-logo" alt="" className="brand-image" /></span>
            <span className="brand-name"><strong>Jagannath Foundation</strong><small>Serving with dignity · Since 2026</small></span>
          </Link>
          <button ref={menuToggleRef} className="menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-controls="site-navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)}><span>{open ? "Close" : "Menu"}</span><i aria-hidden="true">{open ? "×" : "☰"}</i></button>
          <nav id="site-navigation" className={`main-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
            <Link href="/" onClick={() => setOpen(false)} className={`home-link${homeActive ? " active" : ""}`} aria-current={homeActive ? "page" : undefined}>Home</Link>
            {links.map((link) => <NavLink key={link.href} {...link} onNavigate={() => setOpen(false)} />)}
            <Link href="/donate" className="nav-donate" onClick={() => setOpen(false)}>Make a difference <span>↗</span></Link>
          </nav>
        </div>
      </header>
    </>
  );
}

function NavLink({ href, label, onNavigate }: { href: string; label: string; onNavigate: () => void }) {
  const [active] = useRoute(`${href}/*?`);
  return <Link href={href} onClick={onNavigate} className={active ? "active" : ""}>{label}</Link>;
}
