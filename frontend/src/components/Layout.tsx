import { ReactNode, useEffect, useRef, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Newsletter from "./Newsletter";
import { useLocation } from "wouter";

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
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }, [location]);

  useEffect(() => {
    let frame = 0;
    const updateScrollUI = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const range = document.documentElement.scrollHeight - window.innerHeight;
        const progress = range > 0 ? window.scrollY / range : 0;
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
        setShowTop(window.scrollY > 520);
      });
    };
    updateScrollUI();
    window.addEventListener("scroll", updateScrollUI, { passive: true });
    window.addEventListener("resize", updateScrollUI);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScrollUI);
      window.removeEventListener("resize", updateScrollUI);
    };
  }, []);

  return (
    <div className="site-shell min-h-screen flex flex-col">
      <div className="scroll-progress" ref={progressRef} aria-hidden="true" />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      {!hideNewsletter && <Newsletter />}
      <Footer />
      <button
        type="button"
        className={`back-to-top${showTop ? " is-visible" : ""}`}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        onClick={() => window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        })}
      >
        <span aria-hidden="true">↑</span>
      </button>
    </div>
  );
}
