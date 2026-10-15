import { tr as translateText, localize as localizeText, trError as translateError } from "../i18n";
import { useTranslation as usePageTranslation } from "react-i18next";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "wouter";
import { DynamicImage } from "../lib/ImagesContext";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type GalleryPhoto = { slot: string; caption: string; role?: string };

export default function HomeGallerySlider({
  photos,
  reducedMotion,
  href = "/gallery",
  variant = "gallery",
}: {
  photos: GalleryPhoto[];
  reducedMotion: boolean;
  href?: string;
  variant?: "gallery" | "people";
}) {
  usePageTranslation();
  const viewport = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const entranceTimeline = useRef<gsap.core.Timeline | null>(null);
  const userPaused = useRef(false);
  const activeSlide = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const collectionLabel = variant === "people" ? "person" : "gallery image";

  const updateSlideIndex = (index: number) => {
    activeSlide.current = index;
    setSlideIndex(index);
  };

  useGSAP(() => {
    const rail = track.current;
    const windowElement = viewport.current;
    if (!rail || !windowElement || reducedMotion || photos.length < 2) return;

    const gap = () => {
      const first = rail.children[0] as HTMLElement | undefined;
      const second = rail.children[1] as HTMLElement | undefined;
      return first && second ? second.offsetLeft - first.offsetLeft : 0;
    };

    const animation = gsap.timeline({ paused: true, repeat: -1 });
    photos.forEach((_, index) => {
      animation.to(rail, {
        x: () => -(gap() * (index + 1)),
        duration: 1.35,
        ease: "power2.inOut",
      });
      animation.call(() => updateSlideIndex((index + 1) % photos.length));
      animation.to({}, { duration: 3.25 });
    });
    const originalSlides = Array.from(rail.children).slice(0, photos.length);
    const captions = originalSlides
      .map((slide) => slide.querySelector<HTMLElement>(".gallery-frame-caption"))
      .filter((caption): caption is HTMLElement => Boolean(caption));
    gsap.set(originalSlides, {
      autoAlpha: 0,
      y: variant === "people" ? 24 : 15,
      scale: variant === "people" ? 0.97 : 0.99,
    });
    gsap.set(captions, { autoAlpha: 0, y: 14 });
    const entrance = gsap.timeline({ paused: true });
    entrance
      .to(originalSlides, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.72,
        stagger: 0.08,
        ease: "power3.out",
      })
      .to(
        captions,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.62,
          stagger: 0.07,
          ease: "power3.out",
        },
        0.18,
      );
    entranceTimeline.current = entrance;

    const startCarousel = () => {
      if (userPaused.current) return;
      if (entrance && entrance.progress() < 1) entrance.play();
      animation.play();
    };
    // The second half mirrors the first, so this reset is visually seamless.
    animation.set(rail, { x: 0 });
    timeline.current = animation;

    const observer = ScrollTrigger.create({
      trigger: windowElement,
      start: "top 90%",
      end: "bottom 10%",
      invalidateOnRefresh: true,
      onEnter: startCarousel,
      onEnterBack: startCarousel,
      onLeave: () => {
        animation.pause();
        entrance?.pause();
      },
      onLeaveBack: () => {
        animation.pause();
        entrance?.pause();
      },
    });

    return () => {
      observer.kill();
      entrance?.kill();
      if (timeline.current === animation) timeline.current = null;
      if (entranceTimeline.current === entrance) entranceTimeline.current = null;
    };
  }, { scope: viewport, dependencies: [photos, reducedMotion, variant], revertOnUpdate: true });

  const togglePlayback = () => {
    userPaused.current = !userPaused.current;
    setIsPaused(userPaused.current);
    if (userPaused.current) {
      timeline.current?.pause();
      entranceTimeline.current?.pause();
    }
    else if (viewport.current) {
      ScrollTrigger.refresh();
      if (ScrollTrigger.isInViewport(viewport.current, 0.1)) {
        const entrance = entranceTimeline.current;
        if (entrance && entrance.progress() < 1) entrance.play();
        timeline.current?.play();
      }
    }
  };

  const moveSlide = (direction: -1 | 1) => {
    const rail = track.current;
    if (!rail || !photos.length) return;
    const nextIndex = (activeSlide.current + direction + photos.length) % photos.length;
    userPaused.current = true;
    setIsPaused(true);
    entranceTimeline.current?.progress(1);
    timeline.current?.pause();
    gsap.to(rail, {
      x: () => -(gapDistance(rail) * nextIndex),
      duration: 0.75,
      ease: "power3.inOut",
      overwrite: true,
      onComplete: () => {
        updateSlideIndex(nextIndex);
        timeline.current?.time(nextIndex * 4.6, false);
      },
    });
  };

  const gapDistance = (rail: HTMLDivElement) => {
    const first = rail.children[0] as HTMLElement | undefined;
    const second = rail.children[1] as HTMLElement | undefined;
    return first && second ? second.offsetLeft - first.offsetLeft : 0;
  };

  const renderPhoto = (photo: GalleryPhoto, index: number, duplicate = false) => (
    <div
      className={`gallery-reveal gallery-reveal-${(index % 6) + 1} gallery-slide`}
      key={`${duplicate ? "copy-" : ""}${photo.slot}`}
      aria-hidden={duplicate || undefined}
      role={duplicate ? undefined : "group"}
      aria-roledescription={duplicate ? undefined : "slide"}
      aria-label={duplicate ? undefined : translateText("{{index}} of {{total}}: {{caption}}", {index: index + 1, total: photos.length, caption: translateText(photo.caption)})}
    >
      <Link
        href={href}
        className={`gallery-frame gallery-frame-${(index % 6) + 1}`}
        tabIndex={duplicate ? -1 : undefined}
      >
        <div className="gallery-photo">
          <DynamicImage
            slotKey={photo.slot}
            alt=""
            className="gallery-image gallery-image-backdrop"
          />
          <DynamicImage
            slotKey={photo.slot}
            alt={localizeText(photo.caption)}
            className="gallery-image gallery-image-foreground"
          />
        </div>
        <span className="gallery-frame-caption">{localizeText(photo.caption)}</span>
      </Link>
    </div>
  );

  return (
    <div
      className={`home-gallery-carousel${variant === "people" ? " home-gallery-carousel--people" : ""}${reducedMotion ? " is-static" : ""}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={localizeText(variant === "people" ? "Foundation people" : "Foundation gallery")}
    >
      <div className="gallery-slider-viewport" ref={viewport}>
        <div className="gallery-slider-track" ref={track}>
          {localizeText(photos.map((photo, index) => renderPhoto(photo, index)))}
          {localizeText(!reducedMotion && photos.map((photo, index) => renderPhoto(photo, index, true)))}
        </div>
      </div>
      <div className="gallery-slider-footer">
        <span className="gallery-slider-hint">
          <span aria-hidden="true">↔</span>{localizeText(" ")}
          {reducedMotion ? translateText("Showing all {{count}}", {count: photos.length}) : translateText("Slide to explore")}
        </span>
        <div className="gallery-slider-controls">
          <span className="gallery-slider-count" aria-live="off">
            {localizeText(String(slideIndex + 1).padStart(2, "0"))} / {localizeText(String(photos.length).padStart(2, "0"))}
          </span>
          {localizeText(!reducedMotion && (
            <>
              <button
                type="button"
                className="gallery-slider-arrow"
                onClick={() => moveSlide(-1)}
                aria-label={localizeText(`Previous ${collectionLabel}`)}
              >
                ←
              </button>
              <button
                type="button"
                className="gallery-slider-arrow"
                onClick={() => moveSlide(1)}
                aria-label={localizeText(`Next ${collectionLabel}`)}
              >
                →
              </button>
              <button
                type="button"
                className="gallery-slider-toggle"
                onClick={togglePlayback}
                aria-pressed={isPaused}
                aria-label={localizeText(isPaused ? `Resume automatic ${variant === "people" ? "people slider" : "gallery"}` : `Pause automatic ${variant === "people" ? "people slider" : "gallery"}`)}
              >
                <span aria-hidden="true">{localizeText(isPaused ? "▶" : "Ⅱ")}</span>
                {localizeText(isPaused ? "Play" : "Pause")}
              </button>
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
