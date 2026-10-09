import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { fetchImages, ImageSlot, API_URL } from "./api";

interface ImagesContextValue {
  images: Record<string, ImageSlot>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ImagesContext = createContext<ImagesContextValue>({
  images: {},
  loading: true,
  refresh: async () => {},
});

export function ImagesProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<Record<string, ImageSlot>>({});
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const slots = await fetchImages();
      const map: Record<string, ImageSlot> = {};
      for (const s of slots) map[s.slot_key] = s;
      setImages(map);
    } catch (e) {
      console.error("Could not load images from API", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <ImagesContext.Provider value={{ images, loading, refresh }}>
      {children}
    </ImagesContext.Provider>
  );
}

export function useImages() {
  return useContext(ImagesContext);
}

/** Renders an image whose source is controlled from the admin panel.
 * Falls back to a soft placeholder while loading or if the slot is empty. */
export function DynamicImage({
  slotKey,
  alt,
  className,
}: {
  slotKey: string;
  alt?: string;
  className?: string;
}) {
  const { images } = useImages();
  const slot = images[slotKey];
  const fallbackAssets: Record<string, string> = {
    "site-logo": "/images/logo-mark.png",
    "home-hero-education": "/images/hero-education.webp",
    "home-hero-health": "/images/hero-health.webp",
    "home-hero-livelihoods": "/images/hero-livelihoods.webp",
    "home-hero-solar": "/images/hero-solar.webp",
    "gallery-cover": "/images/gallery-cover.webp",
    "work-education": "/images/hero-education.webp",
    "work-health": "/images/hero-health.webp",
    "work-youth": "/images/hero-education.webp",
    "work-livelihoods": "/images/hero-livelihoods.webp",
    "work-environment": "/images/hero-solar.webp",
    "work-solar": "/images/hero-solar.webp",
    "about-founder-photo": "/images/founder-jagannath.webp",
    "team-jagannath-patnaik": "/images/founder-jagannath.webp",
    "team-shrabani-patnaik": "/images/team-shrabani-patnaik.webp",
    "team-prakriti-patnaik": "/images/team-prakriti-patnaik.webp",
    "team-purushraj-patnaik": "/images/team-purushraj-patnaik.webp",
    "team-sarita-patwal": "/images/sarita-patwal.webp",
    "team-prateek-nayak": "/images/prateek-nayak.webp",
    "team-samarendra-patra": "/images/samarendra-patra.webp",
    "team-reema-diddee": "/images/reema-diddee.webp",
    "team-lhamu-tshering-tamang": "/images/lhamu-tshering-tamang.webp",
  };
  const fallbackSrc =
    fallbackAssets[slotKey] ||
    (slotKey.startsWith("gallery-") ? `/images/${slotKey}.webp` : undefined);

  if (!slot && !fallbackSrc) {
    return (
      <div
        className={`${className || ""} image-fallback ${slotKey === "site-logo" ? "logo-fallback" : ""}`}
        aria-hidden="true"
      ></div>
    );
  }

  return (
    <img
      src={slot ? `${API_URL}${slot.url}` : fallbackSrc}
      alt={alt ?? slot?.alt_text ?? ""}
      className={className}
      loading={
        slotKey.startsWith("home-hero-") ||
        slotKey === "site-logo" ||
        slotKey === "gallery-cover"
          ? "eager"
          : "lazy"
      }
      onError={(event) => {
        if (!fallbackSrc || event.currentTarget.src.endsWith(fallbackSrc))
          return;
        event.currentTarget.src = fallbackSrc;
      }}
    />
  );
}
