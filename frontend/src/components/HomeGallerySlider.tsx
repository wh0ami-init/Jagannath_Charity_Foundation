import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "wouter";
import { DynamicImage } from "../lib/ImagesContext";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type GalleryPhoto = { slot: string; caption: string };

export default function HomeGallerySlider({
  photos,
  reducedMotion,
}: {
  photos: GalleryPhoto[];
  reducedMotion: boolean;
}) {
  const viewport = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const userPaused = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

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
      animation.to({}, { duration: 3.25 });
    });
    // The second half mirrors the first, so this reset is visually seamless.
    animation.set(rail, { x: 0 });
    timeline.current = animation;

    const observer = ScrollTrigger.create({
      trigger: windowElement,
      start: "top 90%",
      end: "bottom 10%",
      invalidateOnRefresh: true,
      onEnter: () => {
        if (!userPaused.current) animation.play();
      },
      onEnterBack: () => {
        if (!userPaused.current) animation.play();
      },
      onLeave: () => animation.pause(),
      onLeaveBack: () => animation.pause(),
    });

    return () => {
      observer.kill();
      if (timeline.current === animation) timeline.current = null;
    };
  }, { scope: viewport, dependencies: [photos, reducedMotion], revertOnUpdate: true });

  const togglePlayback = () => {
    userPaused.current = !userPaused.current;
    setIsPaused(userPaused.current);
    if (userPaused.current) timeline.current?.pause();
    else if (viewport.current) {
      ScrollTrigger.refresh();
      if (ScrollTrigger.isInViewport(viewport.current, 0.1)) timeline.current?.play();
    }
  };

  const renderPhoto = (photo: GalleryPhoto, index: number, duplicate = false) => (
    <div
      className={`gallery-reveal gallery-reveal-${(index % 6) + 1} gallery-slide`}
      key={`${duplicate ? "copy-" : ""}${photo.slot}`}
      aria-hidden={duplicate || undefined}
    >
      <Link
        href="/gallery"
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
            alt={photo.caption}
            className="gallery-image gallery-image-foreground"
          />
        </div>
        <span>{photo.caption}</span>
      </Link>
    </div>
  );

  return (
    <div className={`home-gallery-carousel${reducedMotion ? " is-static" : ""}`}>
      <div className="gallery-slider-viewport" ref={viewport}>
        <div className="gallery-slider-track" ref={track}>
          {photos.map((photo, index) => renderPhoto(photo, index))}
          {!reducedMotion && photos.map((photo, index) => renderPhoto(photo, index, true))}
        </div>
      </div>
      {!reducedMotion && (
        <button
          type="button"
          className="gallery-slider-toggle"
          onClick={togglePlayback}
          aria-pressed={isPaused}
          aria-label={isPaused ? "Resume automatic gallery" : "Pause automatic gallery"}
        >
          <span aria-hidden="true">{isPaused ? "▶" : "Ⅱ"}</span>
          {isPaused ? "Play" : "Pause"}
        </button>
      )}
    </div>
  );
}
