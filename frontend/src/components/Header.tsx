import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { DynamicImage } from "../lib/ImagesContext";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type NavItem = { href: string; label: string; note: string };

const primaryLinks = [
  { href: "/about", label: "Our story" },
  { href: "/programmes", label: "Programmes" },
  { href: "/projects", label: "Projects" },
  { href: "/impact", label: "Our impact" },
];

const dropdownGroups: {
  id: string;
  label: string;
  heading: string;
  items: NavItem[];
}[] = [
  {
    id: "beneficiaries",
    label: "Beneficiaries",
    heading: "Beneficiaries",
    items: [
      {
        href: "/beneficiaries",
        label: "Active beneficiaries",
        note: "People we are supporting right now",
      },
      {
        href: "/beneficiaries/apply",
        label: "Apply for beneficiary",
        note: "Request support from the Foundation",
      },
    ],
  },
  {
    id: "internships",
    label: "Internships",
    heading: "Internships",
    items: [
      {
        href: "/internships",
        label: "Available internships",
        note: "Open roles and how to apply",
      },
      {
        href: "/certificate-verification",
        label: "Certificate verification",
        note: "Check the authenticity of a certificate",
      },
    ],
  },
  {
    id: "autopay",
    label: "Auto Pay Donation",
    heading: "Auto Pay Donation",
    items: [
      {
        href: "/auto-pay-donation",
        label: "Auto-pay donation registration",
        note: "Set up a recurring donation",
      },
      {
        href: "/auto-pay-status",
        label: "Auto-pay status",
        note: "Check or manage your auto-pay",
      },
    ],
  },
];

const exploreLinks: NavItem[] = [
  { href: "/team", label: "People", note: "Trustees, leadership and advisors" },
  {
    href: "/partners",
    label: "Partners",
    note: "The organisations alongside us",
  },
  { href: "/gallery", label: "Gallery", note: "Moments from the Foundation" },
  {
    href: "/video-gallery",
    label: "Video Gallery",
    note: "Watch our work in action",
  },
  {
    href: "/campaigns",
    label: "Campaigns",
    note: "Current and past fundraising drives",
  },
  {
    href: "/project-expenses",
    label: "Project Expenses",
    note: "How every rupee is spent",
  },
  { href: "/careers", label: "Careers", note: "Join the Foundation team" },
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

const navItemTw =
  "!font-nav min-[1001px]:!whitespace-nowrap min-[1001px]:!text-[clamp(12.5px,0.9vw,14.5px)] min-[1001px]:!font-medium min-[1001px]:!leading-tight min-[1001px]:!py-2";

const donateTw =
  "!font-nav min-[1001px]:!inline-flex min-[1001px]:!items-center min-[1001px]:!gap-2 min-[1001px]:!whitespace-nowrap min-[1001px]:!shrink-0 min-[1001px]:!h-auto min-[1001px]:!min-h-0 min-[1001px]:!px-5 min-[1001px]:!py-[11px] min-[1001px]:!text-[clamp(12.5px,0.9vw,14.5px)] min-[1001px]:!leading-tight";

const compactPanelTw = "min-[1001px]:!w-[300px] min-[1001px]:!min-w-0";
const compactGridTw = "min-[1001px]:!grid-cols-1";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const [homeActive] = useRoute("/");
  const headerRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  const reducedMotion = useReducedMotion();
  const menuLocked = useRef(false);
  menuLocked.current = open || openId !== null;

  const closeAll = () => {
    setOpen(false);
    setOpenId(null);
  };

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

      if (openId) {
        gsap.from(
          header.querySelectorAll(".nav-explore.is-open .nav-explore-link"),
          {
            opacity: 0,
            duration: 0.4,
            ease: "power1.out",
            stagger: 0.045,
            clearProps: "opacity",
          },
        );
      }
    },
    { scope: headerRef, dependencies: [open, openId, reducedMotion] },
  );

  useEffect(() => {
    setOpen(false);
    setOpenId(null);
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
        const group = (document.activeElement as HTMLElement | null)?.closest(
          ".nav-explore",
        );
        const toggle =
          group?.querySelector<HTMLElement>(".nav-explore-toggle");

        setOpenId(null);
        setOpen(false);
        (toggle ?? menuToggleRef.current)?.focus();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      ) {
        setOpen(false);
        setOpenId(null);
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
        <div className="wrap header-main min-[1001px]:!flex-nowrap min-[1001px]:!items-center min-[1001px]:!gap-[clamp(12px,1.6vw,28px)]">
          <Link
            href="/"
            className="brand shrink-0 min-[1001px]:!mr-[clamp(24px,3vw,56px)]"
            onClick={closeAll}
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
            className={`main-nav ${open ? "is-open" : ""} min-[1001px]:!flex min-[1001px]:!flex-nowrap min-[1001px]:!items-center min-[1001px]:!ml-auto min-[1001px]:!whitespace-nowrap min-[1001px]:!gap-[clamp(10px,1.1vw,22px)]`}
            aria-label="Main navigation"
          >
            <Link
              href="/"
              onClick={closeAll}
              className={`home-link ${navItemTw}${homeActive ? " active" : ""}`}
              aria-current={homeActive ? "page" : undefined}
            >
              Home
            </Link>

            {primaryLinks.map((link) => (
              <NavLink key={link.href} {...link} onNavigate={closeAll} />
            ))}

            {dropdownGroups.map((group) => (
              <NavDropdown
                key={group.id}
                id={group.id}
                label={group.label}
                heading={group.heading}
                items={group.items}
                openId={openId}
                setOpenId={setOpenId}
                onNavigate={closeAll}
                location={location}
                compact
              />
            ))}

            <NavDropdown
              id="explore"
              label="Explore"
              heading="More from the Foundation"
              items={exploreLinks}
              openId={openId}
              setOpenId={setOpenId}
              onNavigate={closeAll}
              location={location}
            />

            <Link
              href="/donate"
              className={`nav-donate ${donateTw}`}
              onClick={closeAll}
            >
              Make a difference <span>↗</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

function NavDropdown({
  id,
  label,
  heading,
  items,
  openId,
  setOpenId,
  onNavigate,
  location,
  compact = false,
}: {
  id: string;
  label: string;
  heading: string;
  items: NavItem[];
  openId: string | null;
  setOpenId: React.Dispatch<React.SetStateAction<string | null>>;
  onNavigate: () => void;
  location: string;
  compact?: boolean;
}) {
  const isOpen = openId === id;

  const isActive = items.some(
    (link) => location === link.href || location.startsWith(`${link.href}/`),
  );

  return (
    <div
      className={`nav-explore${isOpen ? " is-open" : ""}`}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setOpenId(id);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") {
          setOpenId((current) => (current === id ? null : current));
        }
      }}
    >
      <button
        type="button"
        className={`nav-explore-toggle ${navItemTw}${isActive ? " active" : ""}`}
        aria-expanded={isOpen}
        aria-controls={`nav-${id}-panel`}
        onClick={(event) => {
          if (
            event.nativeEvent.detail > 0 &&
            window.matchMedia("(hover: hover) and (pointer: fine)").matches
          ) {
            setOpenId(id);
          } else {
            setOpenId((current) => (current === id ? null : id));
          }
        }}
      >
        {label}
        <span
          aria-hidden="true"
          className={`ml-2 inline-block h-0 w-0 border-x-[7px] border-t-[8px] border-x-transparent border-t-current align-middle transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id={`nav-${id}-panel`}
        className={`nav-explore-panel${compact ? ` ${compactPanelTw}` : ""}`}
        aria-hidden={!isOpen}
      >
        <p className="nav-explore-heading">{heading}</p>

        <div
          className={`nav-explore-grid${compact ? ` ${compactGridTw}` : ""}`}
        >
          {items.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              tabIndex={isOpen ? 0 : -1}
              onClick={onNavigate}
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
    <Link
      href={href}
      onClick={onNavigate}
      className={`${navItemTw}${active ? " active" : ""}`}
    >
      {label}
    </Link>
  );
}
