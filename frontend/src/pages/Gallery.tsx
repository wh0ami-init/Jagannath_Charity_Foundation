import {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Layout from "../components/Layout";
import Reveal from "../components/Reveal";
import { DynamicImage, useImages } from "../lib/ImagesContext";
import { ImageSlot } from "../lib/api";

const galleryDefaults: ImageSlot[] = [
  [
    "gallery-kalam",
    "Dr A.P.J. Abdul Kalam",
    "Courtesy meeting with Dr A.P.J. Abdul Kalam, 11th President of India",
  ],
  [
    "gallery-patil",
    "Smt. Pratibha Devisingh Patil",
    "Courtesy meeting with Smt. Pratibha Devisingh Patil, 12th President of India",
  ],
  [
    "gallery-mukherjee",
    "Shri Pranab Mukherjee",
    "Courtesy meeting with Shri Pranab Mukherjee, 13th President of India",
  ],
  [
    "gallery-kovind",
    "Shri Ram Nath Kovind",
    "Courtesy meeting with Shri Ram Nath Kovind, 14th President of India",
  ],
  [
    "gallery-murmu",
    "Smt. Droupadi Murmu",
    "Courtesy meeting with Smt. Droupadi Murmu, 15th President of India",
  ],
  [
    "gallery-pm-modi",
    "Prime Minister Shri Narendra Modi",
    "Courtesy meeting with Prime Minister Shri Narendra Modi",
  ],
  [
    "gallery-manmohan-singh",
    "Dr Manmohan Singh",
    "Courtesy meeting with former Prime Minister Dr Manmohan Singh",
  ],
  [
    "gallery-vp-dhankhar",
    "Vice President Shri Jagdeep Dhankhar",
    "Courtesy meeting with Vice President Shri Jagdeep Dhankhar",
  ],
  [
    "gallery-amit-shah",
    "Shri Amit Shah",
    "Courtesy meeting with Union Home Minister Shri Amit Shah",
  ],
  [
    "gallery-rajnath-singh",
    "Shri Rajnath Singh",
    "Courtesy meeting with Raksha Mantri Shri Rajnath Singh",
  ],
  [
    "gallery-om-birla",
    "Shri Om Birla",
    "Courtesy meeting with Lok Sabha Speaker Shri Om Birla",
  ],
  [
    "gallery-jp-nadda",
    "Shri J.P. Nadda",
    "Courtesy meeting with Shri J.P. Nadda",
  ],
  [
    "gallery-dharmendra-pradhan",
    "Shri Dharmendra Pradhan",
    "Courtesy meeting with Union Minister Shri Dharmendra Pradhan",
  ],
  [
    "gallery-anna-hazare",
    "Shri Anna Hazare",
    "Courtesy meeting with social activist Shri Anna Hazare",
  ],
  [
    "gallery-sri-sri",
    "Sri Sri Ravi Shankar",
    "Courtesy meeting with Sri Sri Ravi Shankar",
  ],
  ["gallery-baba-ramdev", "Swami Ramdev", "Courtesy meeting with Swami Ramdev"],
  [
    "gallery-hemant-soren",
    "Shri Hemant Soren",
    "Courtesy meeting with Jharkhand Chief Minister Shri Hemant Soren",
  ],
  [
    "gallery-cm-sikkim",
    "Chief Minister, Sikkim",
    "Courtesy meeting with the Chief Minister of Sikkim",
  ],
  [
    "gallery-governor-icfai",
    "Governor's visit, ICFAI University Sikkim",
    "Governor's visit at ICFAI University Sikkim",
  ],
  [
    "gallery-bhutan-official",
    "Courtesy call, Bhutan",
    "Courtesy meeting with a Bhutanese official",
  ],
  [
    "gallery-venkaiah-naidu",
    "Shri M. Venkaiah Naidu",
    "Courtesy meeting with former Vice President Shri M. Venkaiah Naidu",
  ],
].map(([slot_key, label, alt_text]) => ({
  slot_key,
  label,
  alt_text,
  page: "Gallery",
  url: `/images/${slot_key}.webp`,
  updated_at: "",
}));

const filters = [
  { id: "all", label: "All moments" },
  { id: "national", label: "Presidents & Prime Ministers" },
  { id: "public", label: "Public service" },
  { id: "regional", label: "Regional & international" },
  { id: "culture", label: "Culture & community" },
];

function categoryFor(slot: string) {
  const nationalLeaders = [
    "gallery-kalam",
    "gallery-patil",
    "gallery-mukherjee",
    "gallery-kovind",
    "gallery-murmu",
    "gallery-pm-modi",
    "gallery-manmohan-singh",
  ];
  const publicService = [
    "gallery-vp-dhankhar",
    "gallery-amit-shah",
    "gallery-rajnath-singh",
    "gallery-om-birla",
    "gallery-jp-nadda",
    "gallery-dharmendra-pradhan",
    "gallery-anna-hazare",
    "gallery-hemant-soren",
    "gallery-venkaiah-naidu",
  ];
  if (
    nationalLeaders.includes(slot) ||
    /^gallery-extra-president-(kovind|mukherjee|murmu)-/.test(slot)
  )
    return "national";
  if (
    publicService.includes(slot) ||
    /^gallery-extra-(arjun-ram-meghwal|baba-ramdev-2|dharmendra-pradhan-2|hemant-soren-2|jitendra-singh|jp-nadda-2|law-minister|manohar-lal|rajnath-2|union-minister-greet)$/.test(
      slot,
    )
  )
    return "public";
  if (
    [
      "gallery-cm-sikkim",
      "gallery-governor-icfai",
      "gallery-bhutan-official",
    ].includes(slot) ||
    /^gallery-extra-(bhutan-flag|chhattisgarh-assembly|cm-|embassy-thimphu|goa-rajbhavan|governor-|international-guest|lok-bhavan-odisha|nepal-dignitary|odisha)/.test(
      slot,
    )
  )
    return "regional";
  return "culture";
}

function GalleryLightbox({
  items,
  selectedKey,
  onClose,
  onSelect,
}: {
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
  const [slideDirection, setSlideDirection] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const changeImage = useCallback(
    (direction: number) => {
      const current = selectionRef.current;
      const currentIndex = current.items.findIndex(
        (entry) => entry.slot_key === current.selectedKey,
      );
      setSlideDirection(direction);
      onSelect(
        current.items[
          (currentIndex + direction + current.items.length) %
            current.items.length
        ].slot_key,
      );
    },
    [onSelect],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        changeImage(event.key === "ArrowRight" ? 1 : -1);
      }
      if (event.key === "Tab") {
        const controls = panelRef.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled)",
        );
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
  }, [changeImage, onClose]);

  if (!item) return null;

  return (
    <motion.div
      className={`gallery-lightbox${isFullscreen ? " is-fullscreen" : ""}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.42 }}
    >
      <motion.section
        ref={panelRef}
        className={`gallery-lightbox-panel${isFullscreen ? " is-fullscreen" : ""}`}
        layout
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-lightbox-title"
        initial={{
          opacity: 0,
          scale: reducedMotion ? 1 : 0.985,
          y: reducedMotion ? 0 : 14,
        }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{
          opacity: 0,
          scale: reducedMotion ? 1 : 0.99,
          y: reducedMotion ? 0 : 8,
        }}
        transition={{
          duration: reducedMotion ? 0 : 0.72,
          ease: [0.22, 0.7, 0.2, 1],
          layout: {
            duration: reducedMotion ? 0 : 0.48,
            ease: [0.22, 0.7, 0.2, 1],
          },
        }}
      >
        <div className="gallery-lightbox-backdrop" aria-hidden="true">
          <DynamicImage
            slotKey={item.slot_key}
            alt=""
            className="gallery-lightbox-backdrop-image"
          />
          <span className="gallery-lightbox-backdrop-shade" />
        </div>
        <header className="gallery-lightbox-head">
          <div>
            <p>JAGANNATH FOUNDATION · GALLERY</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={item.slot_key}
                id="gallery-lightbox-title"
                initial={{ opacity: 0, y: reducedMotion ? 0 : 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -3 }}
                transition={{ duration: reducedMotion ? 0 : 0.48 }}
              >
                {item.label}
              </motion.h2>
            </AnimatePresence>
          </div>
          <div className="gallery-lightbox-window-controls">
            <button
              className="gallery-lightbox-expand"
              type="button"
              onClick={() => setIsFullscreen((fullscreen) => !fullscreen)}
              aria-label={isFullscreen ? "Exit full-screen view" : "Expand to full screen"}
              aria-pressed={isFullscreen}
              title={isFullscreen ? "Exit full screen" : "Expand to full screen"}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 4v5H4M15 4v5h5M9 20v-5H4m11 5v-5h5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 9V4h5M20 9V4h-5M4 15v5h5m11-5v5h-5" />
                </svg>
              )}
            </button>
            <button
              ref={closeRef}
              className="gallery-lightbox-close"
              type="button"
              onClick={onClose}
              aria-label="Close image viewer"
            >
              ×
            </button>
          </div>
        </header>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            className="gallery-lightbox-image"
            key={item.slot_key}
            initial={{
              opacity: 0,
              x: reducedMotion ? 0 : slideDirection * 36,
              filter: reducedMotion ? "blur(0px)" : "blur(6px)",
            }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              x: reducedMotion ? 0 : slideDirection * -24,
              filter: reducedMotion ? "blur(0px)" : "blur(4px)",
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.48,
              ease: [0.22, 0.7, 0.2, 1],
            }}
          >
            <DynamicImage
              slotKey={item.slot_key}
              alt={item.alt_text || item.label}
              className="gallery-lightbox-photo"
            />
            <motion.button
              type="button"
              className="gallery-lightbox-nav gallery-lightbox-nav-previous"
              aria-label="Previous image"
              onClick={() => changeImage(-1)}
              whileTap={reducedMotion ? undefined : { scale: 0.92 }}
            >
              ←
            </motion.button>
            <motion.button
              type="button"
              className="gallery-lightbox-nav gallery-lightbox-nav-next"
              aria-label="Next image"
              onClick={() => changeImage(1)}
              whileTap={reducedMotion ? undefined : { scale: 0.92 }}
            >
              →
            </motion.button>
          </motion.div>
        </AnimatePresence>
        <footer className="gallery-lightbox-foot">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={item.slot_key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.36 }}
            >
              {item.alt_text || item.label}
            </motion.p>
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={item.slot_key}
              className="gallery-lightbox-count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.36 }}
            >
              {String(index + 1).padStart(2, "0")} <i>/</i>{" "}
              {String(items.length).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </footer>
      </motion.section>
    </motion.div>
  );
}

export default function Gallery() {
  const { images, loading: imagesLoading } = useImages();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOffset = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reducedMotion ? 0 : 48],
  );

  const allItems = useMemo(() => {
    const apiItems = Object.values(images).filter(
      (item) => item.page === "Gallery" && item.slot_key !== "gallery-cover",
    );
    const byKey = new Map(apiItems.map((item) => [item.slot_key, item]));
    const defaultKeys = new Set(galleryDefaults.map((item) => item.slot_key));
    // The defaults are only a temporary/offline fallback. Once the API has
    // loaded, a missing seeded row means an administrator intentionally deleted it.
    if (imagesLoading) return galleryDefaults;
    if (!apiItems.length && !Object.keys(images).length) return galleryDefaults;
    return [
      ...apiItems.filter((item) => defaultKeys.has(item.slot_key)),
      ...apiItems.filter((item) => !defaultKeys.has(item.slot_key)),
    ].sort((a, b) => a.label.localeCompare(b.label));
  }, [images, imagesLoading]);

  const visibleItems = useMemo(
    () =>
      allItems.filter(
        (item) =>
          (activeFilter === "all" ||
            (item.category || categoryFor(item.slot_key)) === activeFilter) &&
          item.label.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [allItems, activeFilter, search],
  );
  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(
      filters.map(({ id }) => [id, 0]),
    ) as Record<string, number>;
    counts.all = allItems.length;
    allItems.forEach((item) => {
      const category = item.category || categoryFor(item.slot_key);
      counts[category] += 1;
    });
    return counts;
  }, [allItems]);
  const selectedItem =
    selectedKey && visibleItems.some((item) => item.slot_key === selectedKey)
      ? selectedKey
      : null;
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const closeLightbox = useCallback(() => {
    setSelectedKey(null);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }, []);
  const openLightbox = (
    slotKey: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    lastTrigger.current = event.currentTarget;
    setSelectedKey(slotKey);
  };

  return (
    <Layout>
      <section className="gallery-hero" ref={heroRef}>
        <motion.div
          className="gallery-hero-media"
          style={{ y: heroOffset }}
          aria-hidden="true"
        >
          <DynamicImage
            slotKey="gallery-cover"
            alt=""
            className="gallery-hero-image"
          />
        </motion.div>
        <div className="gallery-hero-shade" />
        <div className="wrap gallery-hero-copy">
          <p className="eyebrow eyebrow-light">
            <span />
            People and partnerships
          </p>
          <h1>
            Moments of respect.
            <br />
            <i>Relationships that matter.</i>
          </h1>
          <p>
            Courtesy meetings and shared moments with leaders, public servants
            and friends of the Foundation.
          </p>
          <a href="#gallery-collection" className="gallery-hero-link">
            Explore the collection <span>↓</span>
          </a>
        </div>
        <div className="gallery-hero-caption">
          JAGANNATH FOUNDATION <span>·</span> A RECORD OF CONNECTION
        </div>
      </section>

      <LayoutGroup id="foundation-gallery">
        <Reveal
          as="section"
          className="gallery-section"
          id="gallery-collection"
        >
          <div className="wrap">
            <div className="gallery-intro">
              <div>
                <p className="eyebrow">
                  <span />
                  The collection
                </p>
                <h2>
                  Shared purpose,
                  <br />
                  captured in time.
                </h2>
              </div>
              <p>
                Browse the Foundation's courtesy meetings and moments of
                connection. Select a photograph to view it in detail.
              </p>
            </div>

            <div className="gallery-browse-layout">
              <aside
                className="gallery-filter-rail"
                aria-label="Gallery categories"
              >
                <p className="gallery-filter-heading">Browse by</p>
                <div
                  className="gallery-filters"
                  role="group"
                  aria-label="Filter gallery by category"
                >
                  {filters.map((filter) => (
                    <motion.button
                      key={filter.id}
                      type="button"
                      aria-pressed={activeFilter === filter.id}
                      className={activeFilter === filter.id ? "is-active" : ""}
                      onClick={() => {
                        setActiveFilter(filter.id);
                        setSelectedKey(null);
                      }}
                      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                    >
                      {activeFilter === filter.id && (
                        <motion.span
                          className="gallery-filter-active"
                          layoutId="gallery-active-filter"
                          transition={{
                            duration: reducedMotion ? 0 : 0.46,
                            ease: [0.22, 0.7, 0.2, 1],
                          }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="gallery-filter-label">
                        {filter.label}
                      </span>
                      <span className="gallery-filter-count" aria-hidden="true">
                        {categoryCounts[filter.id]}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </aside>

              <div className="gallery-content">
                <div className="gallery-toolbar">
                  <label className="gallery-search">
                    <span aria-hidden="true">⌕</span>
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setSelectedKey(null);
                      }}
                      placeholder="Find a moment"
                      aria-label="Search gallery"
                    />
                  </label>
                </div>

                <div className="gallery-results" aria-live="polite">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={`${visibleItems.length}-${activeFilter}-${search}`}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: reducedMotion ? 0 : 0.34 }}
                    >
                      {visibleItems.length}{" "}
                      {visibleItems.length === 1 ? "photograph" : "photographs"}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {visibleItems.length ? (
                  <motion.div
                    layout
                    id="gallery-photo-grid"
                    className="gallery-collection"
                    transition={{
                      layout: {
                        duration: reducedMotion ? 0 : 0.72,
                        ease: [0.22, 0.7, 0.2, 1],
                      },
                    }}
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      {visibleItems.map((item) => {
                        const tileIndex = allItems.findIndex(
                          (entry) => entry.slot_key === item.slot_key,
                        );
                        const selected = selectedItem === item.slot_key;
                        return (
                          <motion.button
                            type="button"
                            layout="position"
                            className="gallery-tile"
                            key={item.slot_key}
                            onClick={(event) =>
                              openLightbox(item.slot_key, event)
                            }
                            aria-label={`View ${item.label}`}
                            aria-hidden={selected || undefined}
                            tabIndex={selected ? -1 : 0}
                            initial={false}
                            animate={{ opacity: selected ? 0 : 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            whileHover={
                              reducedMotion
                                ? undefined
                                : { scale: 1.045, y: -4, zIndex: 2 }
                            }
                            whileTap={
                              reducedMotion ? undefined : { scale: 0.985 }
                            }
                            transition={{
                              duration: reducedMotion ? 0 : 0.55,
                              layout: {
                                duration: reducedMotion ? 0 : 0.72,
                                ease: [0.22, 0.7, 0.2, 1],
                              },
                            }}
                          >
                            <div className="gallery-tile-image-wrap">
                              <DynamicImage
                                slotKey={item.slot_key}
                                alt={item.alt_text || item.label}
                                className="gallery-tile-image"
                              />
                            </div>
                            <span className="gallery-tile-shade" />
                            <span className="gallery-tile-index">
                              {String(tileIndex + 1).padStart(2, "0")}
                            </span>
                            <span className="gallery-tile-caption">
                              <i>
                                {
                                  filters.find(
                                    (filter) =>
                                      filter.id === categoryFor(item.slot_key),
                                  )?.label
                                }
                              </i>
                              <strong>{item.label}</strong>
                              <b aria-hidden="true">↗</b>
                            </span>
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="gallery-empty">
                    <h2>No photographs match that search.</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setActiveFilter("all");
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        <AnimatePresence>
          {selectedItem && (
            <GalleryLightbox
              key="gallery-lightbox"
              items={visibleItems}
              selectedKey={selectedItem}
              onClose={closeLightbox}
              onSelect={setSelectedKey}
            />
          )}
        </AnimatePresence>
      </LayoutGroup>
    </Layout>
  );
}
