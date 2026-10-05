import { ScrollSmoother } from "gsap/ScrollSmoother";

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Page-space Y of an element's top edge.
 * With ScrollSmoother the content is translated, so getBoundingClientRect()
 * lags behind the real scroll position; smoother.offset() is exact.
 */
export function pageTop(el: HTMLElement): number {
  const smoother = ScrollSmoother.get();
  if (smoother) return smoother.offset(el, "top top");
  return el.getBoundingClientRect().top + window.scrollY;
}

/** Scroll to an element, using ScrollSmoother when it is active. */
export function scrollToElement(
  el: HTMLElement,
  position = "top 96px",
  smooth = !prefersReducedMotion(),
) {
  const smoother = ScrollSmoother.get();
  if (smoother) {
    smoother.scrollTo(el, smooth, position);
    return;
  }
  el.scrollIntoView({
    behavior: smooth ? "smooth" : "auto",
    block: position.startsWith("center") ? "center" : "start",
  });
}

export function scrollToTop() {
  const smoother = ScrollSmoother.get();
  if (smoother) smoother.scrollTo(0, !prefersReducedMotion());
  else
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "instant" : "smooth",
    });
}