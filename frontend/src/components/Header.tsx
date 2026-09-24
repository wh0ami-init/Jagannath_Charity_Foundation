import { Link, useRoute } from "wouter";
import { DynamicImage } from "../lib/ImagesContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Who we are" },
  { href: "/work", label: "What we do" },
  { href: "/impact", label: "Impact" },
  { href: "/team", label: "Team" },
  { href: "/gallery", label: "Gallery" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  return (
    <>
      <div className="bg-navy-950 text-white/80 text-sm">
        <div className="wrap flex flex-wrap items-center justify-between py-2 gap-2">
          <div className="flex gap-4">
            <a href="tel:+919700643333" className="hover:text-white">+91 97006 43333</a>
            <a href="mailto:chairman@jagannathfoundation.charity" className="hover:text-white hidden sm:inline">
              chairman@jagannathfoundation.charity
            </a>
          </div>
          <div className="flex gap-3">
            <a href="https://www.facebook.com/" aria-label="Facebook" className="hover:text-white">f</a>
            <a href="https://www.instagram.com/" aria-label="Instagram" className="hover:text-white">ig</a>
            <a href="https://x.com/" aria-label="X" className="hover:text-white">x</a>
            <a href="https://www.linkedin.com/" aria-label="LinkedIn" className="hover:text-white">in</a>
          </div>
        </div>
      </div>

      <header className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="wrap flex items-center justify-between py-3 gap-4">
          <Link href="/" className="flex items-center gap-3">
            <DynamicImage slotKey="site-logo" alt="Jagannath Foundation" className="h-10 w-10 object-contain rounded-full" />
            <span className="leading-tight">
              <span className="block font-serif-heading font-bold text-navy-900 text-lg">Jagannath Foundation</span>
              <span className="block text-xs text-navy-900/60">Public charitable trust · Est. 2026</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-navy-900">
            {links.map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} />
            ))}
            <Link
              href="/donate"
              className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-full transition-colors"
            >
              Donate Now
            </Link>
          </nav>

          <Link
            href="/donate"
            className="lg:hidden bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            Donate
          </Link>
        </div>
        <nav className="lg:hidden flex overflow-x-auto gap-4 px-5 pb-3 text-sm text-navy-900/80">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} />
          ))}
        </nav>
      </header>
    </>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const [isActive] = useRoute(href === "/" ? "/" : `${href}/*?`);
  return (
    <Link
      href={href}
      className={`whitespace-nowrap hover:text-orange-500 transition-colors ${
        isActive ? "text-orange-500 font-semibold" : ""
      }`}
    >
      {label}
    </Link>
  );
}
