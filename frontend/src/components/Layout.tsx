import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Newsletter from "./Newsletter";
import { useLocation } from "wouter";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Layout({
  children,
  hideNewsletter = false,
}: {
  children: ReactNode;
  hideNewsletter?: boolean;
}) {
  const progressRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [location]);

  // Scroll progress bar + "back to top" button, driven by ScrollTrigger
  useGSAP(() => {
    const bar = progressRef.current;
    if (!bar) return;

    let lastShow = false;
    const syncTopButton = (self: ScrollTrigger) => {
      const show = self.scroll() > 520;
      if (show !== lastShow) {
        lastShow = show;
        setShowTop(show);
      }
    };

    gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
    gsap.to(bar, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        start: 0,
        end: "max",
        scrub: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? true
          : 0.3,
        onUpdate: syncTopButton,
        onRefresh: syncTopButton,
      },
    });
  }, []);

  return (
    <div className="site-shell min-h-screen flex flex-col">
      <div className="scroll-progress" ref={progressRef} aria-hidden="true" />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {!hideNewsletter && <Newsletter />}
      <Footer />
      <button
        type="button"
        className={`back-to-top${showTop ? " is-visible" : ""}`}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
          })
        }
      >
        <span aria-hidden="true">↑</span>
      </button>
    </div>
  );
}
