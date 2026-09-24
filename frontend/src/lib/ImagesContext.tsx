import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
  const { images, loading } = useImages();
  const slot = images[slotKey];

  if (!slot) {
    return (
      <div
        className={`${className || ""} bg-navy-800/10 flex items-center justify-center text-xs text-navy-900/40`}
        aria-hidden={loading}
      >
        {loading ? "" : slotKey}
      </div>
    );
  }

  return (
    <img
      src={`${API_URL}${slot.url}`}
      alt={alt ?? slot.alt_text}
      className={className}
      loading="lazy"
    />
  );
}
