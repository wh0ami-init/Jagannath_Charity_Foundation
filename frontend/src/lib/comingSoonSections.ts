export type HeroMotif =
  | "video-gallery"
  | "campaigns"
  | "events"
  | "expenses"
  | "internships"
  | "certificate-check"
  | "careers"
  | "beneficiary-directory"
  | "beneficiary-apply"
  | "id-card"
  | "certificate-service"
  | "appointment-letter";

export type ComingSoonSection = {
  id: string;
  href: string;
  label: string;
  note: string;
  message: string;
  emblem: "video" | "campaign" | "event" | "expenses" | "internship" | "certificate" | "career" | "beneficiary-directory" | "beneficiary-apply" | "id-card" | "appointment-letter";
  motif: HeroMotif;
  announcement?: boolean;
};

export const comingSoonSections: ComingSoonSection[] = [
  {
    id: "generate-id-card",
    href: "/generate-id-card",
    label: "Generate ID Card",
    note: "Foundation ID cards",
    message: "A secure way to create and access Foundation ID cards is being prepared.",
    emblem: "id-card",
    motif: "id-card",
    announcement: true,
  },
  {
    id: "generate-certificate",
    href: "/generate-certificate",
    label: "Generate Certificate",
    note: "Create a Foundation certificate",
    message: "Certificate creation tools are in progress and will be available here soon.",
    emblem: "certificate",
    motif: "certificate-service",
    announcement: true,
  },
  {
    id: "appointment-letter",
    href: "/appointment-letter",
    label: "Appointment Letter",
    note: "Appointment letters",
    message: "We’re preparing a simple way to access official appointment letters.",
    emblem: "appointment-letter",
    motif: "appointment-letter",
    announcement: true,
  },
  {
    id: "video-gallery",
    href: "/video-gallery",
    label: "Video Gallery",
    note: "Stories and films from the Foundation",
    message: "A closer look at the people, places, and moments behind our work.",
    emblem: "video",
    motif: "video-gallery",
  },
  {
    id: "campaigns",
    href: "/campaigns",
    label: "Campaigns",
    note: "Ways to take part in our campaigns",
    message: "New ways to stand with our communities are taking shape.",
    emblem: "campaign",
    motif: "campaigns",
  },
  {
    id: "programs-and-events",
    href: "/programs-and-events",
    label: "Programs and Events",
    note: "Upcoming programs and Foundation events",
    message: "Find the next gathering, workshop, and community moment here soon.",
    emblem: "event",
    motif: "events",
  },
  {
    id: "project-expenses",
    href: "/project-expenses",
    label: "Project Expenses",
    note: "Project spending and public updates",
    message: "Clear project-by-project spending updates are being prepared.",
    emblem: "expenses",
    motif: "expenses",
  },
  {
    id: "available-internships",
    href: "/internships/available",
    label: "Available Internships",
    note: "Internship opportunities",
    message: "Explore upcoming opportunities to learn through meaningful work.",
    emblem: "internship",
    motif: "internships",
  },
  {
    id: "certificate-verification",
    href: "/internships/certificate-verification",
    label: "Certificate Verification",
    note: "Verify an internship certificate",
    message: "A simple way to confirm Foundation internship certificates is on its way.",
    emblem: "certificate",
    motif: "certificate-check",
  },
  {
    id: "careers",
    href: "/careers",
    label: "Careers",
    note: "Work with the Foundation",
    message: "We’re shaping a page for people who want to build change with us.",
    emblem: "career",
    motif: "careers",
  },
  {
    id: "active-beneficiaries",
    href: "/beneficiaries/active",
    label: "Active Beneficiaries",
    note: "Support for people in our programmes",
    message: "Information about our active beneficiary communities is being prepared.",
    emblem: "beneficiary-directory",
    motif: "beneficiary-directory",
  },
  {
    id: "apply-for-beneficiary",
    href: "/beneficiaries/apply",
    label: "Apply For Beneficiary",
    note: "How to seek programme support",
    message: "We’re preparing clear guidance on eligibility and how to apply for support.",
    emblem: "beneficiary-apply",
    motif: "beneficiary-apply",
  },
];
