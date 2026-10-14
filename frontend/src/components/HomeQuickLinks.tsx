import { Link } from "wouter";
import "./HomeQuickLinks.css";

const actions = [
  {
    title: "Generate ID Card",
    icon: "id",
    href: "/services",
    description: "Ask about membership and ID cards",
  },
  {
    title: "Generate Certificate",
    icon: "seal",
    href: "/services",
    description: "Request a certificate",
  },
  {
    title: "Appointment Letter",
    icon: "document",
    href: "/services",
    description: "Ask about an application letter",
  },
  {
    title: "Donate Us",
    icon: "document",
    href: "/donate",
    description: "Support the Foundation’s work",
  },
];

function ActionIcon({ name }: { name: string }) {
  if (name === "seal") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" className="home-quick-icon">
        <path d="m24 3 4 5.2 6.3-2 1.1 6.5 6.5 1.1-2 6.3 5.2 4-5.2 4 2 6.3-6.5 1.1-1.1 6.5-6.3-2-4 5.2-4-5.2-6.3 2-1.1-6.5-6.5-1.1 2-6.3-5.2-4 5.2-4-2-6.3 6.5-1.1 1.1-6.5 6.3 2L24 3Z" fill="currentColor" />
      </svg>
    );
  }

  if (name === "id") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" className="home-quick-icon">
        <rect x="3" y="8" width="42" height="32" rx="3" fill="currentColor" />
        <circle cx="17" cy="19" r="5" fill="white" />
        <path d="M8 33c.7-5 3.7-7.5 9-7.5s8.3 2.5 9 7.5H8Z" fill="white" />
        <path d="M30 17h10M30 23h10M30 29h10" stroke="white" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="home-quick-icon home-quick-icon-document">
      <path d="M13 4h15l9 9v31H13a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm14 3v8h8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M18 31c5-1 8-7 9-12 1 6 3 9 7 10M17 34c7-7 12 2 18-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function HomeQuickLinks() {
  return (
    <section className="home-quick-links" aria-label="Quick links">
      <div className="home-quick-grid">
        {actions.map((action) => (
          <Link className="home-quick-card" href={action.href} key={action.title}>
            <ActionIcon name={action.icon} />
            <h2>{action.title}</h2>
            <span className="home-quick-description">{action.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
