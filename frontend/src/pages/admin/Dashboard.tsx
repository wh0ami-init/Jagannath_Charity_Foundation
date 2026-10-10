import {
  ChangeEvent,
  DragEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "wouter";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  API_URL,
  addGalleryImage,
  deleteGalleryImage,
  deleteSubmission,
  fetchContent,
  fetchSession,
  fetchSubmissions,
  FormSubmission,
  ImageSlot,
  logout as apiLogout,
  replaceImage,
  updateGalleryImage,
  SiteContent,
  updateContent,
} from "../../lib/api";
import { useImages } from "../../lib/ImagesContext";
import "./admin.css";

gsap.registerPlugin(useGSAP);

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

type Section = "home" | "photos" | "words" | "messages";
type Toast = { id: number; tone: "ok" | "bad"; text: string } | null;
type Kind = FormSubmission["kind"];
type GalleryCategory = "national" | "public" | "regional" | "culture";
const GALLERY_CATEGORIES: { value: GalleryCategory; label: string }[] = [
  { value: "national", label: "Presidents & Prime Ministers" },
  { value: "public", label: "Public service" },
  { value: "regional", label: "Regional & international" },
  { value: "culture", label: "Culture & community" },
];
function galleryCategory(slot: ImageSlot): GalleryCategory {
  if (slot.category) return slot.category;
  const key = slot.slot_key;
  if (["gallery-kalam", "gallery-patil", "gallery-mukherjee", "gallery-kovind", "gallery-murmu", "gallery-pm-modi", "gallery-manmohan-singh"].includes(key) || /^gallery-extra-president-(kovind|mukherjee|murmu)-/.test(key)) return "national";
  if (["gallery-vp-dhankhar", "gallery-amit-shah", "gallery-rajnath-singh", "gallery-om-birla", "gallery-jp-nadda", "gallery-dharmendra-pradhan", "gallery-anna-hazare", "gallery-hemant-soren", "gallery-venkaiah-naidu"].includes(key) || /^gallery-extra-(arjun-ram-meghwal|baba-ramdev-2|dharmendra-pradhan-2|hemant-soren-2|jitendra-singh|jp-nadda-2|law-minister|manohar-lal|rajnath-2|union-minister-greet)$/.test(key)) return "public";
  if (["gallery-cm-sikkim", "gallery-governor-icfai", "gallery-bhutan-official"].includes(key) || /^gallery-extra-(bhutan-flag|chhattisgarh-assembly|cm-|embassy-thimphu|goa-rajbhavan|governor-|international-guest|lok-bhavan-odisha|nepal-dignitary|odisha)/.test(key)) return "regional";
  return "culture";
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 8 * 1024 * 1024;

// Friendly names so nobody has to guess what "Global" or "Work" means.
const PAGE_NAMES: Record<string, string> = {
  Home: "Home page",
  Team: "Team page",
  Gallery: "Gallery page",
  Global: "All pages",
  About: "About page",
  Work: "Programmes",
  Impact: "Impact page",
};
const PAGE_ORDER = [
  "Home",
  "About",
  "Work",
  "Impact",
  "Team",
  "Gallery",
  "Global",
];
const pageName = (page: string) => PAGE_NAMES[page] ?? page;
const pageRank = (page: string) => {
  const i = PAGE_ORDER.indexOf(page);
  return i < 0 ? 99 : i;
};

const KIND_NAMES: Record<Kind, string> = {
  contact: "Message",
  volunteer: "Volunteer",
  pledge: "Pledge",
  newsletter: "Updates request",
  service: "Service request",
};

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function photoSrc(slot: ImageSlot) {
  const join = slot.url.includes("?") ? "&" : "?";
  return `${API_URL}${slot.url}${join}v=${encodeURIComponent(slot.updated_at)}`;
}

function isEmptyPhoto(slot: ImageSlot) {
  return slot.url.endsWith("/placeholder.jpg");
}

function timeAgo(value: string) {
  const date = new Date(value);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  if (Number.isNaN(seconds)) return "";
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size)
      return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Gold "seeds" that float up inside the welcome card.
const SEEDS = Array.from({ length: 12 }, (_, i) => ({
  x: `${(i * 41 + 6) % 94}%`,
  s: `${9 + ((i * 7) % 11)}px`,
  d: `${8 + ((i * 5) % 8)}s`,
  delay: `${-((i * 3) % 9)}s`,
}));

/* ------------------------------------------------------------------ */
/* Icons (tiny inline SVGs)                                            */
/* ------------------------------------------------------------------ */

type IconName =
  | "home"
  | "photo"
  | "text"
  | "mail"
  | "arrow"
  | "check"
  | "x"
  | "search"
  | "download"
  | "external"
  | "logout"
  | "trash"
  | "reply"
  | "phone"
  | "upload";

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    home: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
    photo: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <circle cx="9" cy="10" r="1.8" />
        <path d="M21 16l-5-5-8 8" />
      </>
    ),
    text: <path d="M4 6h16M4 12h16M4 18h10" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M3.5 7l8.5 6 8.5-6" />
      </>
    ),
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    x: <path d="M6 6l12 12M18 6L6 18" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </>
    ),
    download: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,
    external: (
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    ),
    logout: (
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" />
    ),
    trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
    reply: <path d="M9 7L4 12l5 5M4 12h10a6 6 0 0 1 6 6" />,
    phone: (
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    ),
    upload: <path d="M12 16V5M7 9l5-5 5 5M5 20h14" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

/* A number that counts up when it appears. */
function CountNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) {
      el.textContent = String(value);
      shown.current = value;
      return;
    }
    const counter = { n: shown.current };
    const tween = gsap.to(counter, {
      n: value,
      duration: 1.3,
      ease: "power2.out",
      onUpdate: () => {
        shown.current = counter.n;
        el.textContent = String(Math.round(counter.n));
      },
    });
    return () => {
      tween.kill();
    };
  }, [value]);
  return <span ref={ref}>0</span>;
}

/* A pop-up box. Closes with Esc or by clicking outside. */
function Dialog({
  title,
  text,
  onClose,
  children,
  actions,
}: {
  title: string;
  text?: string;
  onClose: () => void;
  children?: ReactNode;
  actions: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = before;
    };
  }, [onClose]);
  return (
    <div className="ac-overlay" onClick={onClose}>
      <div
        className="ac-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{title}</h3>
        {text && <p>{text}</p>}
        {children}
        <div className="ac-dialog-actions">{actions}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */

function HomeView({
  photos,
  words,
  messages,
  latest,
  go,
}: {
  photos: number;
  words: number;
  messages: number;
  latest: FormSubmission[];
  go: (s: Section) => void;
}) {
  const stats: {
    key: Section;
    icon: IconName;
    value: number;
    title: string;
    hint: string;
  }[] = [
    {
      key: "photos",
      icon: "photo",
      value: photos,
      title: "Website photos",
      hint: "Tap to change a photo",
    },
    {
      key: "words",
      icon: "text",
      value: words,
      title: "Website words",
      hint: "Tap to edit the text",
    },
    {
      key: "messages",
      icon: "mail",
      value: messages,
      title: "Messages",
      hint: "Tap to read them",
    },
  ];
  return (
    <div className="ac-view">
      <section className="ac-hero ac-reveal">
        <div className="ac-seeds" aria-hidden="true">
          {SEEDS.map((seed, i) => (
            <span
              key={i}
              style={
                {
                  "--x": seed.x,
                  "--s": seed.s,
                  "--d": seed.d,
                  "--delay": seed.delay,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <p className="ac-kicker">{greeting()}</p>
        <h2>Namaste 🙏</h2>
        <p>
          This is your control room. Change a photo or a line of text here, and
          your website is updated right away.
        </p>
        <div className="ac-hero-cta">
          <button
            className="ac-btn ac-btn--gold ac-btn--lg"
            onClick={() => go("photos")}
          >
            <Icon name="photo" size={20} /> Change a photo
          </button>
          <button
            className="ac-btn ac-btn--lg ac-btn--ghost"
            onClick={() => go("words")}
          >
            <Icon name="text" size={20} /> Edit text
          </button>
        </div>
      </section>

      <div className="ac-stats">
        {stats.map((s) => (
          <button
            key={s.key}
            className="ac-stat ac-reveal"
            onClick={() => go(s.key)}
          >
            <span className="ac-stat-go">
              <Icon name="arrow" />
            </span>
            <span className="ac-stat-ico">
              <Icon name={s.icon} size={26} />
            </span>
            <span className="ac-stat-num">
              <CountNumber value={s.value} />
            </span>
            <strong>{s.title}</strong>
            <span className="ac-hint">{s.hint}</span>
          </button>
        ))}
      </div>

      <div className="ac-two">
        <section className="ac-panel ac-reveal">
          <h3>How it works</h3>
          <p>Three easy steps. Nothing can break.</p>
          <ol className="ac-steps">
            <li>
              <b>1</b>
              <div>
                <strong>Pick what to change</strong>
                <span>Photos, words or messages, from the menu.</span>
              </div>
            </li>
            <li>
              <b>2</b>
              <div>
                <strong>Make your change</strong>
                <span>Choose a new photo, or type your new text.</span>
              </div>
            </li>
            <li>
              <b>3</b>
              <div>
                <strong>It goes live</strong>
                <span>Your public website shows it straight away.</span>
              </div>
            </li>
          </ol>
        </section>

        <section className="ac-panel ac-reveal">
          <h3>Latest messages</h3>
          <p>
            {latest.length
              ? "The newest people who wrote to you."
              : "No messages yet. They will show here."}
          </p>
          <div className="ac-mini">
            {latest.map((m) => (
              <button
                key={m.id}
                className="ac-mini-row"
                onClick={() => go("messages")}
              >
                <span className="ac-avatar">{initials(m.name || m.email)}</span>
                <div>
                  <strong>{m.name || "Updates request"}</strong>
                  <span>{m.subject || m.message || m.email}</span>
                </div>
                <time>{timeAgo(m.created_at)}</time>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

function PhotosView({
  images,
  freshKey,
  onPick,
  onAddGallery,
  onUpdateGallery,
  onDeleteGallery,
}: {
  images: Record<string, ImageSlot>;
  freshKey: string | null;
  onPick: (slot: ImageSlot, file: File) => void;
  onAddGallery: (input: { label: string; alt_text: string; category: GalleryCategory; file: File }) => void;
  onUpdateGallery: (slot: ImageSlot, input: { label: string; alt_text: string; category: GalleryCategory }) => void;
  onDeleteGallery: (slot: ImageSlot) => void;
}) {
  const groups = useMemo(() => {
    const map: Record<string, ImageSlot[]> = {};
    Object.values(images).forEach((slot) => (map[slot.page] ||= []).push(slot));
    Object.values(map).forEach((list) =>
      list.sort((a, b) => a.label.localeCompare(b.label)),
    );
    return map;
  }, [images]);
  const pages = Object.keys(groups).sort(
    (a, b) => pageRank(a) - pageRank(b) || a.localeCompare(b),
  );
  const [page, setPage] = useState(pages[0] ?? "");
  const [over, setOver] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const active = pages.includes(page) ? page : pages[0];
  const [newLabel, setNewLabel] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [newCategory, setNewCategory] = useState<GalleryCategory>("culture");
  const [newFile, setNewFile] = useState<File | null>(null);

  function handleFile(slot: ImageSlot, file?: File) {
    if (file) onPick(slot, file);
  }

  function onDrop(e: DragEvent, slot: ImageSlot) {
    e.preventDefault();
    setOver(null);
    handleFile(slot, e.dataTransfer.files?.[0]);
  }

  return (
    <div className="ac-view">
      <p className="ac-kicker ac-reveal">Photos</p>
      <h2 className="ac-h ac-reveal">Website photos</h2>
      <p className="ac-sub ac-reveal">
        Choose the page, then tap “Change this photo”. You can also drag a photo
        onto a picture.
      </p>

      {active === "Gallery" && <form className="ac-gallery-add ac-reveal" onSubmit={(e) => { e.preventDefault(); if (!newFile || !newLabel.trim()) return; onAddGallery({ label: newLabel.trim(), alt_text: newAlt.trim(), category: newCategory, file: newFile }); setNewLabel(""); setNewAlt(""); setNewFile(null); const input = e.currentTarget.elements.namedItem("gallery-file") as HTMLInputElement; input.value = ""; }}>
        <div><h3>Add a gallery photo</h3><p>Add a photo and its details to the public gallery.</p></div>
        <input aria-label="Photo title" placeholder="Photo title" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} required maxLength={200} />
        <input aria-label="Image description" placeholder="Image description (optional)" value={newAlt} onChange={(e) => setNewAlt(e.target.value)} maxLength={300} />
        <select aria-label="Gallery category" value={newCategory} onChange={(e) => setNewCategory(e.target.value as GalleryCategory)}>{GALLERY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
        <input name="gallery-file" aria-label="Choose photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setNewFile(e.target.files?.[0] ?? null)} required />
        <button className="ac-btn ac-btn--primary" type="submit" disabled={!newFile || !newLabel.trim()}><Icon name="upload" size={18} /> Add to gallery</button>
      </form>}

      <div className="ac-chips" role="group" aria-label="Choose a page">
        {pages.map((p) => (
          <button
            key={p}
            className="ac-chip ac-reveal"
            aria-pressed={active === p}
            onClick={() => setPage(p)}
          >
            {pageName(p)} <small>{groups[p].length}</small>
          </button>
        ))}
      </div>

      {!active ? (
        <div className="ac-empty">
          <Icon name="photo" size={44} />
          <strong>No photos found</strong>
          <span>Photos will appear here when the website has them.</span>
        </div>
      ) : (
        <div className="ac-photos">
          {groups[active].map((slot) => (
            <article
              key={slot.slot_key}
              className={`ac-photo ac-reveal${over === slot.slot_key ? " is-over" : ""}${freshKey === slot.slot_key ? " is-fresh" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(slot.slot_key);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => onDrop(e, slot)}
            >
              <div className="ac-photo-img">
                {isEmptyPhoto(slot) ? (
                  <div className="ac-photo-none">
                    <Icon name="photo" size={34} />
                    No photo yet
                  </div>
                ) : (
                  <img
                    src={photoSrc(slot)}
                    alt={slot.alt_text || slot.label}
                    loading="lazy"
                  />
                )}
                <div className="ac-photo-over">Drop to change</div>
              </div>
              <div className="ac-photo-body">
                <strong>{slot.label}</strong>
                <span>
                  {pageName(slot.page)} · changed{" "}
                  {timeAgo(slot.updated_at) || "earlier"}
                </span>
                <input
                  ref={(el) => {
                    inputs.current[slot.slot_key] = el;
                  }}
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    handleFile(slot, e.target.files?.[0]);
                    e.currentTarget.value = "";
                  }}
                />
                <button
                  className="ac-btn ac-btn--primary ac-btn--block"
                  onClick={() => inputs.current[slot.slot_key]?.click()}
                >
                  <Icon name="upload" size={18} />{" "}
                  {isEmptyPhoto(slot) ? "Add a photo" : "Change this photo"}
                </button>
                {slot.page === "Gallery" && slot.slot_key !== "gallery-cover" && <GalleryPhotoDetails slot={slot} onSave={onUpdateGallery} onDelete={onDeleteGallery} />}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryPhotoDetails({ slot, onSave, onDelete }: { slot: ImageSlot; onSave: PhotosViewProps["onUpdateGallery"]; onDelete: (slot: ImageSlot) => void }) {
  const [label, setLabel] = useState(slot.label);
  const [alt, setAlt] = useState(slot.alt_text);
  const savedCategory = galleryCategory(slot);
  const [category, setCategory] = useState<GalleryCategory>(savedCategory);
  useEffect(() => { setLabel(slot.label); setAlt(slot.alt_text); setCategory(galleryCategory(slot)); }, [slot.label, slot.alt_text, slot.category]);
  return <div className="ac-gallery-details">
    <label>Title<input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={200} /></label>
    <label>Description<input value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} /></label>
    <label>Category<select value={category} onChange={(e) => setCategory(e.target.value as GalleryCategory)}>{GALLERY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
    <button className="ac-btn ac-btn--primary ac-btn--block" disabled={!label.trim() || (label === slot.label && alt === slot.alt_text && category === savedCategory)} onClick={() => onSave(slot, { label: label.trim(), alt_text: alt.trim(), category })}>Save details</button>
    <button className="ac-btn ac-btn--danger ac-btn--block" onClick={() => onDelete(slot)}><Icon name="trash" size={17} /> Delete from gallery</button>
  </div>;
}

type PhotosViewProps = { onUpdateGallery: (slot: ImageSlot, input: { label: string; alt_text: string; category: GalleryCategory }) => void };

/* ------------------------------------------------------------------ */
/* Words                                                               */
/* ------------------------------------------------------------------ */

function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.max(el.scrollHeight + 2, 104)}px`;
}

function WordsView({
  content,
  drafts,
  setDrafts,
  saving,
  savedKey,
  onSave,
}: {
  content: SiteContent;
  drafts: Record<string, string>;
  setDrafts: (
    fn: (d: Record<string, string>) => Record<string, string>,
  ) => void;
  saving: string | null;
  savedKey: string | null;
  onSave: (key: string) => void;
}) {
  const pages = useMemo(
    () =>
      [...new Set(Object.values(content).map((f) => f.page))].sort(
        (a, b) => pageRank(a) - pageRank(b) || a.localeCompare(b),
      ),
    [content],
  );
  const [page, setPage] = useState(pages[0] ?? "");
  const active = pages.includes(page) ? page : pages[0];
  const entries = Object.entries(content).filter(([, f]) => f.page === active);
  const dirtyIn = (p: string) =>
    Object.entries(content).filter(
      ([k, f]) => f.page === p && (drafts[k] ?? f.value) !== f.value,
    ).length;

  return (
    <div className="ac-view">
      <p className="ac-kicker ac-reveal">Words</p>
      <h2 className="ac-h ac-reveal">Website words</h2>
      <p className="ac-sub ac-reveal">
        Click inside a box and type. When you are happy, press “Save and
        publish”.
      </p>

      <div className="ac-chips" role="group" aria-label="Choose a page">
        {pages.map((p) => (
          <button
            key={p}
            className="ac-chip ac-reveal"
            aria-pressed={active === p}
            onClick={() => setPage(p)}
          >
            {pageName(p)}
            {dirtyIn(p) > 0 ? (
              <small title="Not saved yet">{dirtyIn(p)}</small>
            ) : null}
          </button>
        ))}
      </div>

      {!entries.length ? (
        <div className="ac-empty">
          <Icon name="text" size={44} />
          <strong>No text found</strong>
          <span>Editable text will appear here.</span>
        </div>
      ) : (
        <div className="ac-fields">
          {entries.map(([key, field]) => {
            const value = drafts[key] ?? field.value;
            const dirty = value !== field.value;
            const busy = saving === key;
            const justSaved = savedKey === key && !dirty;
            return (
              <div
                key={key}
                className={`ac-field ac-reveal${dirty ? " is-dirty" : ""}`}
              >
                <label htmlFor={`ac-${key}`}>{field.label}</label>
                <textarea
                  id={`ac-${key}`}
                  maxLength={12000}
                  value={value}
                  ref={(el) => autosize(el)}
                  onChange={(e) => {
                    autosize(e.currentTarget);
                    setDrafts((d) => ({ ...d, [key]: e.target.value }));
                  }}
                />
                <div className="ac-field-foot">
                  {dirty ? (
                    <span className="ac-state">
                      <i /> You changed this. Not saved yet.
                    </span>
                  ) : justSaved ? (
                    <span className="ac-state is-ok">
                      <span className="ac-tick">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      Saved. It is live on your website.
                    </span>
                  ) : (
                    <span className="ac-state" />
                  )}
                  {dirty && (
                    <button
                      className="ac-btn ac-btn--ghost"
                      disabled={busy}
                      onClick={() =>
                        setDrafts((d) => ({ ...d, [key]: field.value }))
                      }
                    >
                      Undo
                    </button>
                  )}
                  <button
                    className="ac-btn ac-btn--primary"
                    disabled={!dirty || busy}
                    onClick={() => onSave(key)}
                  >
                    {busy ? (
                      <>
                        <span className="ac-spin" /> Saving…
                      </>
                    ) : (
                      "Save and publish"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

function MessagesView({
  items,
  onDelete,
  onExport,
}: {
  items: FormSubmission[];
  onDelete: (m: FormSubmission) => void;
  onExport: (list: FormSubmission[]) => void;
}) {
  const [filter, setFilter] = useState<"all" | Kind>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<number>>(new Set());

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach((m) => (c[m.kind] = (c[m.kind] ?? 0) + 1));
    return c;
  }, [items]);

  const q = query.trim().toLowerCase();
  const shown = items.filter(
    (m) =>
      (filter === "all" || m.kind === filter) &&
      (!q ||
        [m.name, m.email, m.phone, m.subject, m.message].some((v) =>
          (v ?? "").toLowerCase().includes(q),
        )),
  );

  const chips: ["all" | Kind, string][] = [
    ["all", "Everything"],
    ...(Object.keys(KIND_NAMES) as Kind[]).map((k): ["all" | Kind, string] => [
      k,
      KIND_NAMES[k],
    ]),
  ];

  return (
    <div className="ac-view">
      <p className="ac-kicker ac-reveal">Inbox</p>
      <h2 className="ac-h ac-reveal">Messages</h2>
      <p className="ac-sub ac-reveal">
        Everyone who wrote to the Foundation through the website. Newest first.
      </p>

      <div className="ac-chips" role="group" aria-label="Filter messages">
        {chips
          .filter(([k]) => k === "all" || counts[k])
          .map(([k, label]) => (
            <button
              key={k}
              className="ac-chip ac-reveal"
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
            >
              {label} <small>{counts[k] ?? 0}</small>
            </button>
          ))}
      </div>

      <div className="ac-toolbar ac-reveal">
        <label className="ac-search">
          <Icon name="search" size={20} />
          <input
            type="search"
            placeholder="Search by name, email or words…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search messages"
          />
        </label>
        <button
          className="ac-btn ac-btn--ghost"
          disabled={!shown.length}
          onClick={() => onExport(shown)}
        >
          <Icon name="download" size={18} /> Download list (Excel)
        </button>
      </div>

      {!items.length ? (
        <div className="ac-empty">
          <Icon name="mail" size={52} />
          <strong>No messages yet</strong>
          <span>
            When someone writes to you from the website, it will show up here.
          </span>
        </div>
      ) : !shown.length ? (
        <div className="ac-empty">
          <Icon name="search" size={48} />
          <strong>Nothing found</strong>
          <span>Try another word, or choose “Everything”.</span>
        </div>
      ) : (
        <div className="ac-msgs">
          {shown.map((m) => {
            const long = (m.message ?? "").length > 180;
            const expanded = open.has(m.id);
            return (
              <article key={m.id} className="ac-msg ac-reveal">
                <span className="ac-avatar">{initials(m.name || m.email)}</span>
                <div>
                  <div className="ac-msg-head">
                    <h3>{m.name || "Updates request"}</h3>
                    <span className="ac-pill" data-kind={m.kind}>
                      {KIND_NAMES[m.kind] ?? m.kind}
                    </span>
                    <time title={new Date(m.created_at).toLocaleString()}>
                      {timeAgo(m.created_at)}
                    </time>
                  </div>
                  {m.subject && <p className="ac-msg-subject">{m.subject}</p>}
                  {m.message && (
                    <p
                      className={`ac-msg-text${long && !expanded ? " is-clamped" : ""}`}
                    >
                      {m.message}
                    </p>
                  )}
                  {long && (
                    <button
                      className="ac-more"
                      onClick={() =>
                        setOpen((s) => {
                          const next = new Set(s);
                          if (next.has(m.id)) next.delete(m.id);
                          else next.add(m.id);
                          return next;
                        })
                      }
                    >
                      {expanded ? "Show less" : "Read all"}
                    </button>
                  )}
                  {(m.district || m.skill || m.cause || m.amount) && (
                    <ul className="ac-facts">
                      {m.district && (
                        <li>
                          <b>District:</b> {m.district}
                        </li>
                      )}
                      {m.skill && (
                        <li>
                          <b>Skill:</b> {m.skill}
                        </li>
                      )}
                      {m.cause && (
                        <li>
                          <b>Cause:</b> {m.cause}
                        </li>
                      )}
                      {m.amount ? (
                        <li>
                          <b>Pledge:</b> ₹
                          {Number(m.amount).toLocaleString("en-IN")}
                        </li>
                      ) : null}
                    </ul>
                  )}
                  <div className="ac-msg-actions">
                    <a
                      className="ac-btn ac-btn--primary"
                      href={`mailto:${m.email}${m.subject ? `?subject=${encodeURIComponent(`Re: ${m.subject}`)}` : ""}`}
                    >
                      <Icon name="reply" size={18} /> Reply by email
                    </a>
                    {m.phone && (
                      <a
                        className="ac-btn ac-btn--ghost"
                        href={`tel:${m.phone}`}
                      >
                        <Icon name="phone" size={18} /> Call {m.phone}
                      </a>
                    )}
                    <button
                      className="ac-btn ac-btn--ghost"
                      onClick={() => onDelete(m)}
                      aria-label={`Delete message from ${m.name || m.email}`}
                    >
                      <Icon name="trash" size={18} /> Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The console                                                         */
/* ------------------------------------------------------------------ */

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { images, refresh, loading } = useImages();
  const [booting, setBooting] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [section, setSection] = useState<Section>("home");
  const [content, setContent] = useState<SiteContent>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [toast, setToast] = useState<Toast>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [pending, setPending] = useState<{
    slot: ImageSlot;
    file: File;
    preview: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState<FormSubmission | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  /* ----- load everything ----- */
  const load = useCallback(async () => {
    setLoadFailed(false);
    setBooting(true);
    try {
      await fetchSession();
    } catch {
      navigate("/admin/login");
      return;
    }
    try {
      const [text, inbox] = await Promise.all([
        fetchContent(),
        fetchSubmissions(),
      ]);
      setContent(text);
      setSubmissions(
        [...inbox].sort(
          (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
        ),
      );
      setDrafts(
        Object.fromEntries(Object.entries(text).map(([k, f]) => [k, f.value])),
      );
    } catch {
      setLoadFailed(true);
    }
    setBooting(false);
  }, [navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  /* ----- toast ----- */
  const say = useCallback(
    (tone: "ok" | "bad", text: string) =>
      setToast({ id: Date.now(), tone, text }),
    [],
  );
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  /* ----- unsaved-text warning ----- */
  const dirtyCount = Object.keys(content).filter(
    (k) => (drafts[k] ?? content[k].value) !== content[k].value,
  ).length;
  useEffect(() => {
    if (!dirtyCount) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyCount]);

  /* ----- animations: cards slide in whenever the screen changes ----- */
  useGSAP(
    () => {
      if (booting || loadFailed || loading || reduced()) return;
      gsap.fromTo(
        ".ac-reveal",
        { autoAlpha: 0, y: 22 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.06,
          clearProps: "opacity,visibility,transform",
        },
      );
      window.scrollTo({ top: 0 });
    },
    { scope: mainRef, dependencies: [section, booting, loadFailed, loading] },
  );

  /* ----- actions ----- */
  function logout() {
    void apiLogout().finally(() => navigate("/admin/login"));
  }

  function chooseNewPhoto(slot: ImageSlot, file: File) {
    if (!ALLOWED_TYPES.includes(file.type))
      return say("bad", "Please choose a JPG, PNG, WEBP or GIF photo.");
    if (file.size > MAX_SIZE)
      return say(
        "bad",
        "That photo is bigger than 8 MB. Please choose a smaller one.",
      );
    setPending({ slot, file, preview: URL.createObjectURL(file) });
  }

  function closePending() {
    if (uploading) return;
    setPending((p) => {
      if (p) URL.revokeObjectURL(p.preview);
      return null;
    });
  }

  async function confirmPhoto() {
    if (!pending) return;
    setUploading(true);
    try {
      await replaceImage(pending.slot.slot_key, pending.file);
      await refresh();
      setFreshKey(pending.slot.slot_key);
      window.setTimeout(() => setFreshKey(null), 1600);
      URL.revokeObjectURL(pending.preview);
      setPending(null);
      say("ok", "Done! The new photo is now live on your website.");
    } catch (err) {
      say(
        "bad",
        err instanceof Error
          ? err.message
          : "The photo could not be uploaded. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function createGalleryPhoto(input: { label: string; alt_text: string; category: GalleryCategory; file: File }) {
    if (!ALLOWED_TYPES.includes(input.file.type)) return say("bad", "Please choose a JPG, PNG, WEBP or GIF photo.");
    if (input.file.size > MAX_SIZE) return say("bad", "That photo is bigger than 8 MB. Please choose a smaller one.");
    setUploading(true);
    try { await addGalleryImage(input); await refresh(); say("ok", "Photo added to the public gallery."); }
    catch (err) { say("bad", err instanceof Error ? err.message : "Could not add this photo."); }
    finally { setUploading(false); }
  }

  async function saveGalleryPhoto(slot: ImageSlot, input: { label: string; alt_text: string; category: GalleryCategory }) {
    try { await updateGalleryImage(slot.slot_key, input); await refresh(); say("ok", "Gallery photo details saved."); }
    catch (err) { say("bad", err instanceof Error ? err.message : "Could not save photo details."); }
  }

  async function removeGalleryPhoto(slot: ImageSlot) {
    if (!window.confirm(`Delete “${slot.label}” from the gallery? This also removes its uploaded image.`)) return;
    try { await deleteGalleryImage(slot.slot_key); await refresh(); say("ok", "Photo deleted from the gallery."); }
    catch (err) { say("bad", err instanceof Error ? err.message : "Could not delete this photo."); }
  }

  async function saveText(key: string) {
    setSaving(key);
    try {
      const value = drafts[key] ?? "";
      await updateContent(key, value);
      setContent((c) => ({ ...c, [key]: { ...c[key], value } }));
      window.dispatchEvent(new Event("site-content-updated"));
      setSavedKey(key);
      say("ok", `Saved “${content[key].label}”. Your website is updated.`);
    } catch (err) {
      say(
        "bad",
        err instanceof Error
          ? err.message
          : "This could not be saved. Please try again.",
      );
    } finally {
      setSaving(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteSubmission(toDelete.id);
      setSubmissions((list) => list.filter((m) => m.id !== toDelete.id));
      say("ok", "Message deleted.");
    } catch (err) {
      say(
        "bad",
        err instanceof Error ? err.message : "Could not delete this message.",
      );
    } finally {
      setToDelete(null);
    }
  }

  function exportList(list: FormSubmission[]) {
    const columns: (keyof FormSubmission)[] = [
      "id",
      "kind",
      "name",
      "email",
      "phone",
      "subject",
      "message",
      "district",
      "skill",
      "amount",
      "cause",
      "created_at",
    ];
    const cell = (v: string) =>
      `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
    const csv = [
      "﻿" + columns.join(","),
      ...list.map((m) =>
        columns.map((k) => cell(String(m[k] ?? ""))).join(","),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "foundation-messages.csv";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    say("ok", "Your list was downloaded. Open it with Excel.");
  }

  /* ----- loading / error screens ----- */
  if (booting || loading) {
    return (
      <div className="ac-boot">
        <div className="ac-boot-logo">
          <img src="/images/logo-mark.png" alt="" />
        </div>
        <p>Opening your console…</p>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="ac-boot">
        <div className="ac-boot-logo">
          <img src="/images/logo-mark.png" alt="" />
        </div>
        <p>
          We could not load your information. Please check the internet and try
          again.
        </p>
        <button
          className="ac-btn ac-btn--gold ac-btn--lg"
          onClick={() => void load()}
        >
          Try again
        </button>
      </div>
    );
  }

  const nav: {
    key: Section;
    icon: IconName;
    title: string;
    hint: string;
    badge?: ReactNode;
  }[] = [
    { key: "home", icon: "home", title: "Home", hint: "Your overview" },
    { key: "photos", icon: "photo", title: "Photos", hint: "Change pictures" },
    {
      key: "words",
      icon: "text",
      title: "Words",
      hint: "Edit the text",
      badge: dirtyCount ? (
        <span
          className="ac-badge ac-badge--dot"
          title="You have changes not saved yet"
        />
      ) : undefined,
    },
    {
      key: "messages",
      icon: "mail",
      title: "Messages",
      hint: "Read and reply",
      badge: submissions.length ? (
        <span className="ac-badge">{submissions.length}</span>
      ) : undefined,
    },
  ];

  return (
    <div className="ac" ref={rootRef}>
      <aside className="ac-side">
        <div className="ac-brand">
          <img src="/images/logo-mark.png" alt="" />
          <div>
            <strong>Jagannath Foundation</strong>
            <span>Admin console</span>
          </div>
        </div>
        <nav className="ac-nav" aria-label="Main menu">
          {nav.map((item) => (
            <button
              key={item.key}
              aria-current={section === item.key ? "page" : undefined}
              onClick={() => setSection(item.key)}
            >
              <span className="ac-ico">
                <Icon name={item.icon} size={20} />
              </span>
              <span className="ac-text">
                {item.title}
                <small>{item.hint}</small>
              </span>
              {item.badge}
            </button>
          ))}
        </nav>
        <div className="ac-side-foot">
          <span className="ac-live" />
          <span>Every change you save goes live on the website instantly.</span>
        </div>
      </aside>

      <div className="ac-main">
        <header className="ac-topbar">
          <div className="ac-brand">
            <img src="/images/logo-mark.png" alt="" />
            <div>
              <strong>Jagannath Foundation</strong>
              <span>Admin console</span>
            </div>
          </div>
          <div className="ac-top-actions">
            <a
              className="ac-btn ac-btn--ghost"
              href="/"
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="external" size={18} />{" "}
              <span className="ac-label">View website</span>
            </a>
            <button className="ac-btn ac-btn--ghost" onClick={logout}>
              <Icon name="logout" size={18} />{" "}
              <span className="ac-label">Sign out</span>
            </button>
          </div>
        </header>

        <main ref={mainRef} key={section}>
          {section === "home" && (
            <HomeView
              photos={Object.keys(images).length}
              words={Object.keys(content).length}
              messages={submissions.length}
              latest={submissions.slice(0, 4)}
              go={setSection}
            />
          )}
          {section === "photos" && (
            <PhotosView
              images={images}
              freshKey={freshKey}
              onPick={chooseNewPhoto}
              onAddGallery={(input) => void createGalleryPhoto(input)}
              onUpdateGallery={(slot, input) => void saveGalleryPhoto(slot, input)}
              onDeleteGallery={(slot) => void removeGalleryPhoto(slot)}
            />
          )}
          {section === "words" && (
            <WordsView
              content={content}
              drafts={drafts}
              setDrafts={setDrafts}
              saving={saving}
              savedKey={savedKey}
              onSave={(k) => void saveText(k)}
            />
          )}
          {section === "messages" && (
            <MessagesView
              items={submissions}
              onDelete={setToDelete}
              onExport={exportList}
            />
          )}
        </main>
      </div>

      {pending && (
        <Dialog
          title="Use this new photo?"
          text={`This will replace “${pending.slot.label}” on your website.`}
          onClose={closePending}
          actions={
            <>
              <button
                className="ac-btn ac-btn--ghost"
                onClick={closePending}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="ac-btn ac-btn--primary"
                onClick={() => void confirmPhoto()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span className="ac-spin" /> Uploading…
                  </>
                ) : (
                  <>
                    <Icon name="check" size={18} /> Yes, change it
                  </>
                )}
              </button>
            </>
          }
        >
          <div className="ac-compare">
            <figure>
              <figcaption>Now</figcaption>
              <div className="ac-frame">
                {isEmptyPhoto(pending.slot) ? (
                  "No photo yet"
                ) : (
                  <img src={photoSrc(pending.slot)} alt="Current photo" />
                )}
              </div>
            </figure>
            <figure>
              <figcaption>New</figcaption>
              <div className="ac-frame">
                <img src={pending.preview} alt="New photo" />
              </div>
            </figure>
          </div>
        </Dialog>
      )}

      {toDelete && (
        <Dialog
          title="Delete this message?"
          text={`The message from ${toDelete.name || toDelete.email} will be removed for good. You cannot undo this.`}
          onClose={() => setToDelete(null)}
          actions={
            <>
              <button
                className="ac-btn ac-btn--ghost"
                onClick={() => setToDelete(null)}
              >
                No, keep it
              </button>
              <button
                className="ac-btn ac-btn--danger"
                onClick={() => void confirmDelete()}
              >
                <Icon name="trash" size={18} /> Yes, delete
              </button>
            </>
          }
        />
      )}

      {toast && (
        <div
          key={toast.id}
          className={`ac-toast${toast.tone === "bad" ? " is-bad" : ""}`}
          role="status"
        >
          <span className="ac-toast-ico">
            <Icon name={toast.tone === "ok" ? "check" : "x"} size={18} />
          </span>
          {toast.text}
        </div>
      )}
    </div>
  );
}
