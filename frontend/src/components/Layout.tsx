import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Newsletter from "./Newsletter";
import { useLocation, useRoute } from "wouter";
import { scrollToTop } from "../lib/scroll";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

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
  const [isHome] = useRoute("/");

  // ScrollSmoother transforms its content, so viewport controls stay outside
  // the wrapper and only the long-form page content is smoothed.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.05,
      smoothTouch: 0,
      effects: false,
    });
    // Images, fonts and tabs change the page height after first paint;
    // tell ScrollTrigger/ScrollSmoother so the page never gets cut off.
    let timer = 0;
    const content = document.getElementById("smooth-content");
    const observer = content
      ? new ResizeObserver(() => {
          window.clearTimeout(timer);
          timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
        })
      : null;
    if (content) observer?.observe(content);
    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
      smoother.kill();
    };
  }, []);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTo(0, false);
    else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
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
      <div id="smooth-wrapper">
        <div id="smooth-content" className={isHome ? "is-home" : undefined}>
          <main id="main-content" className="flex-1">
            {children}
          </main>
          {!hideNewsletter && <Newsletter />}
          <Footer />
        </div>
      </div>
      <button
        type="button"
        className={`back-to-top${showTop ? " is-visible" : ""}`}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        onClick={scrollToTop}
      >
        <span aria-hidden="true">↑</span>
      </button>
    </div>
  );
}
