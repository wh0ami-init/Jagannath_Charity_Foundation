import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Layout from "../components/Layout";
import Reveal from "../components/Reveal";
import { DynamicImage, useImages } from "../lib/ImagesContext";
import { ImageSlot } from "../lib/api";

const galleryDefaults: ImageSlot[] = [
  ["gallery-kalam", "Dr A.P.J. Abdul Kalam", "Courtesy meeting with Dr A.P.J. Abdul Kalam, 11th President of India"],
  ["gallery-patil", "Smt. Pratibha Devisingh Patil", "Courtesy meeting with Smt. Pratibha Devisingh Patil, 12th President of India"],
  ["gallery-mukherjee", "Shri Pranab Mukherjee", "Courtesy meeting with Shri Pranab Mukherjee, 13th President of India"],
  ["gallery-kovind", "Shri Ram Nath Kovind", "Courtesy meeting with Shri Ram Nath Kovind, 14th President of India"],
  ["gallery-murmu", "Smt. Droupadi Murmu", "Courtesy meeting with Smt. Droupadi Murmu, 15th President of India"],
  ["gallery-pm-modi", "Prime Minister Shri Narendra Modi", "Courtesy meeting with Prime Minister Shri Narendra Modi"],
  ["gallery-manmohan-singh", "Dr Manmohan Singh", "Courtesy meeting with former Prime Minister Dr Manmohan Singh"],
  ["gallery-vp-dhankhar", "Vice President Shri Jagdeep Dhankhar", "Courtesy meeting with Vice President Shri Jagdeep Dhankhar"],
  ["gallery-amit-shah", "Shri Amit Shah", "Courtesy meeting with Union Home Minister Shri Amit Shah"],
  ["gallery-rajnath-singh", "Shri Rajnath Singh", "Courtesy meeting with Raksha Mantri Shri Rajnath Singh"],
  ["gallery-om-birla", "Shri Om Birla", "Courtesy meeting with Lok Sabha Speaker Shri Om Birla"],
  ["gallery-jp-nadda", "Shri J.P. Nadda", "Courtesy meeting with Shri J.P. Nadda"],
  ["gallery-dharmendra-pradhan", "Shri Dharmendra Pradhan", "Courtesy meeting with Union Minister Shri Dharmendra Pradhan"],
  ["gallery-anna-hazare", "Shri Anna Hazare", "Courtesy meeting with social activist Shri Anna Hazare"],
  ["gallery-sri-sri", "Sri Sri Ravi Shankar", "Courtesy meeting with Sri Sri Ravi Shankar"],
  ["gallery-baba-ramdev", "Swami Ramdev", "Courtesy meeting with Swami Ramdev"],
  ["gallery-hemant-soren", "Shri Hemant Soren", "Courtesy meeting with Jharkhand Chief Minister Shri Hemant Soren"],
  ["gallery-cm-sikkim", "Chief Minister, Sikkim", "Courtesy meeting with the Chief Minister of Sikkim"],
  ["gallery-governor-icfai", "Governor's visit, ICFAI University Sikkim", "Governor's visit at ICFAI University Sikkim"],
  ["gallery-bhutan-official", "Courtesy call, Bhutan", "Courtesy meeting with a Bhutanese official"],
  ["gallery-venkaiah-naidu", "Shri M. Venkaiah Naidu", "Courtesy meeting with former Vice President Shri M. Venkaiah Naidu"],
].map(([slot_key, label, alt_text]) => ({
  slot_key, label, alt_text, page: "Gallery", url: `/images/${slot_key}.jpg`, updated_at: "",
}));

const filters = [
  { id: "all", label: "All moments" },
  { id: "national", label: "Presidents & Prime Ministers" },
  { id: "public", label: "Public service" },
  { id: "regional", label: "Regional & international" },
  { id: "culture", label: "Culture & community" },
];

function categoryFor(slot: string) {
  if (["gallery-kalam", "gallery-patil", "gallery-mukherjee", "gallery-kovind", "gallery-murmu", "gallery-pm-modi", "gallery-manmohan-singh"].includes(slot)) return "national";
  if (["gallery-vp-dhankhar", "gallery-amit-shah", "gallery-rajnath-singh", "gallery-om-birla", "gallery-jp-nadda", "gallery-dharmendra-pradhan", "gallery-anna-hazare", "gallery-hemant-soren", "gallery-venkaiah-naidu"].includes(slot)) return "public";
  if (["gallery-cm-sikkim", "gallery-governor-icfai", "gallery-bhutan-official"].includes(slot)) return "regional";
  return "culture";
}

function GalleryLightbox({ items, selectedKey, onClose, onSelect }: {
  items: ImageSlot[];
  selectedKey: string;
  onClose: () => void;
  onSelect: (slotKey: string) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const selectionRef = useRef({ items, selectedKey });
  selectionRef.current = { items, selectedKey };
  const index = items.findIndex((item) => item.slot_key === selectedKey);
  const item = items[index];
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        const current = selectionRef.current;
        const currentIndex = current.items.findIndex((entry) => entry.slot_key === current.selectedKey);
        const direction = event.key === "ArrowRight" ? 1 : -1;
        onSelect(current.items[(currentIndex + direction + current.items.length) % current.items.length].slot_key);
      }
      if (event.key === "Tab") {
        const controls = panelRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled)");
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onSelect]);

  if (!item) return null;

  return (
    <motion.div className="gallery-lightbox" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.38 }}>
      <motion.section ref={panelRef} className="gallery-lightbox-panel" role="dialog" aria-modal="true" aria-labelledby="gallery-lightbox-title" initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.99 }} transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.22, 0.7, 0.2, 1] }}>
        <header className="gallery-lightbox-head">
          <div><p>JAGANNATH FOUNDATION · GALLERY</p><AnimatePresence mode="wait" initial={false}><motion.h2 key={item.slot_key} id="gallery-lightbox-title" initial={{ opacity: 0, y: reducedMotion ? 0 : 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -3 }} transition={{ duration: reducedMotion ? 0 : 0.36 }}>{item.label}</motion.h2></AnimatePresence></div>
          <button ref={closeRef} className="gallery-lightbox-close" type="button" onClick={onClose} aria-label="Close image viewer">×</button>
        </header>
        <AnimatePresence mode="wait" initial={false}><motion.div className="gallery-lightbox-image" key={item.slot_key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.48, ease: "easeInOut" }}><DynamicImage slotKey={item.slot_key} alt={item.alt_text || item.label} /></motion.div></AnimatePresence>
        <footer className="gallery-lightbox-foot">
          <AnimatePresence mode="wait" initial={false}><motion.p key={item.slot_key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.26 }}>{item.alt_text || item.label}</motion.p></AnimatePresence>
          <AnimatePresence mode="wait" initial={false}><motion.span key={item.slot_key} className="gallery-lightbox-count" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.26 }}>{String(index + 1).padStart(2, "0")} <i>/</i> {String(items.length).padStart(2, "0")}</motion.span></AnimatePresence>
          <div><motion.button type="button" aria-label="Previous image" onClick={() => onSelect(items[(index - 1 + items.length) % items.length].slot_key)} whileTap={reducedMotion ? undefined : { opacity: 0.55 }} transition={{ duration: 0.28 }}>←</motion.button><motion.button type="button" aria-label="Next image" onClick={() => onSelect(items[(index + 1) % items.length].slot_key)} whileTap={reducedMotion ? undefined : { opacity: 0.55 }} transition={{ duration: 0.28 }}>→</motion.button></div>
        </footer>
      </motion.section>
    </motion.div>
  );
}

export default function Gallery() {
  const { images } = useImages();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOffset = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : 48]);

  const allItems = useMemo(() => {
    const apiItems = Object.values(images).filter((item) => item.page === "Gallery" && item.slot_key !== "gallery-cover");
    const byKey = new Map(apiItems.map((item) => [item.slot_key, item]));
    const defaults = galleryDefaults.map((item) => byKey.get(item.slot_key) || item);
    const defaultKeys = new Set(galleryDefaults.map((item) => item.slot_key));
    return [...defaults, ...apiItems.filter((item) => !defaultKeys.has(item.slot_key))]
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [images]);

  const visibleItems = useMemo(() => allItems.filter((item) =>
    (activeFilter === "all" || categoryFor(item.slot_key) === activeFilter)
    && item.label.toLowerCase().includes(search.trim().toLowerCase()),
  ), [allItems, activeFilter, search]);
  const selectedItem = selectedKey && visibleItems.some((item) => item.slot_key === selectedKey) ? selectedKey : null;
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const closeLightbox = useCallback(() => {
    setSelectedKey(null);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }, []);
  const openLightbox = (slotKey: string, event: MouseEvent<HTMLButtonElement>) => {
    lastTrigger.current = event.currentTarget;
    setSelectedKey(slotKey);
  };

  return (
    <Layout>
      <section className="gallery-hero" ref={heroRef}>
        <motion.div className="gallery-hero-media" style={{ y: heroOffset }} aria-hidden="true">
          <DynamicImage slotKey="gallery-cover" alt="" className="gallery-hero-image" />
        </motion.div>
        <div className="gallery-hero-shade" />
        <div className="wrap gallery-hero-copy">
          <p className="eyebrow eyebrow-light"><span />People and partnerships</p>
          <h1>Moments of respect.<br /><i>Relationships that matter.</i></h1>
          <p>Courtesy meetings and shared moments with leaders, public servants and friends of the Foundation.</p>
          <a href="#gallery-collection" className="gallery-hero-link">Explore the collection <span>↓</span></a>
        </div>
        <div className="gallery-hero-caption">JAGANNATH FOUNDATION <span>·</span> A RECORD OF CONNECTION</div>
      </section>

      <LayoutGroup id="foundation-gallery">
      <Reveal as="section" className="gallery-section" id="gallery-collection">
        <div className="wrap">
          <div className="gallery-intro">
            <div><p className="eyebrow"><span />The collection</p><h2>Shared purpose,<br />captured in time.</h2></div>
            <p>Browse the Foundation's courtesy meetings and moments of connection. Select a photograph to view it in detail.</p>
          </div>

          <div className="gallery-toolbar">
            <div className="gallery-filters" role="group" aria-label="Filter gallery by category">
              {filters.map((filter) => <motion.button key={filter.id} type="button" aria-pressed={activeFilter === filter.id} className={activeFilter === filter.id ? "is-active" : ""} onClick={() => { setActiveFilter(filter.id); setSelectedKey(null); }} whileTap={reducedMotion ? undefined : { scale: 0.97 }}>
                {activeFilter === filter.id && <motion.span className="gallery-filter-active" layoutId="gallery-active-filter" transition={{ duration: reducedMotion ? 0 : 0.34, ease: "easeOut" }} aria-hidden="true" />}
                <span className="gallery-filter-label">{filter.label}</span>
              </motion.button>)}
            </div>
            <label className="gallery-search"><span aria-hidden="true">⌕</span><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setSelectedKey(null); }} placeholder="Find a moment" aria-label="Search gallery" /></label>
          </div>

          <div className="gallery-results" aria-live="polite"><AnimatePresence mode="wait" initial={false}><motion.span key={`${visibleItems.length}-${activeFilter}-${search}`} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: reducedMotion ? 0 : 0.24 }}>{visibleItems.length} {visibleItems.length === 1 ? "photograph" : "photographs"}</motion.span></AnimatePresence></div>
          {visibleItems.length ? (
            <motion.div layout id="gallery-photo-grid" className="gallery-collection" transition={{ layout: { duration: reducedMotion ? 0 : 0.56, ease: [0.22, 0.7, 0.2, 1] } }}>
              <AnimatePresence initial={false} mode="popLayout">
              {visibleItems.map((item) => {
                const tileIndex = allItems.findIndex((entry) => entry.slot_key === item.slot_key);
                const selected = selectedItem === item.slot_key;
                return <motion.button type="button" layout="position" className="gallery-tile" key={item.slot_key} onClick={(event) => openLightbox(item.slot_key, event)} aria-label={`View ${item.label}`} aria-hidden={selected || undefined} tabIndex={selected ? -1 : 0} initial={false} animate={{ opacity: selected ? 0 : 1 }} exit={{ opacity: 0, scale: 0.97 }} whileHover={reducedMotion ? undefined : { scale: 1.045, y: -4, zIndex: 2 }} whileTap={reducedMotion ? undefined : { scale: 0.985 }} transition={{ duration: reducedMotion ? 0 : 0.4, layout: { duration: reducedMotion ? 0 : 0.62, ease: [0.22, 0.7, 0.2, 1] } }}>
                <div className="gallery-tile-image-wrap">
                  <DynamicImage slotKey={item.slot_key} alt={item.alt_text || item.label} className="gallery-tile-image" />
                </div>
                <span className="gallery-tile-shade" />
                <span className="gallery-tile-index">{String(tileIndex + 1).padStart(2, "0")}</span>
                <span className="gallery-tile-caption"><i>{filters.find((filter) => filter.id === categoryFor(item.slot_key))?.label}</i><strong>{item.label}</strong><b aria-hidden="true">↗</b></span>
              </motion.button>;
              })}
              </AnimatePresence>
            </motion.div>
          ) : <div className="gallery-empty"><h2>No photographs match that search.</h2><button type="button" onClick={() => { setSearch(""); setActiveFilter("all"); }}>Clear filters</button></div>}
        </div>
      </Reveal>

      <AnimatePresence>{selectedItem && <GalleryLightbox key="gallery-lightbox" items={visibleItems} selectedKey={selectedItem} onClose={closeLightbox} onSelect={setSelectedKey} />}</AnimatePresence>
      </LayoutGroup>
    </Layout>
  );
}
