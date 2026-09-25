import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { fetchContent, SiteContent } from "./api";

const SiteContentContext = createContext<SiteContent>({});

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>({});
  useEffect(() => {
    const refresh = () => fetchContent().then(setContent).catch(() => undefined);
    refresh();
    window.addEventListener("site-content-updated", refresh);
    return () => window.removeEventListener("site-content-updated", refresh);
  }, []);
  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
