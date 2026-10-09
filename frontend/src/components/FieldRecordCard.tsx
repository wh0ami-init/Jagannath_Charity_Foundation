import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Photo = readonly [image: string, alt: string, caption: string];

type FieldRecordCardProps = {
  index: number;
  title: string;
  description: string;
  photos: readonly Photo[];
};

export default function FieldRecordCard({
  index,
  title,
  description,
  photos,
}: FieldRecordCardProps) {
  const root = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || reducedMotion) return; // reduced motion: everything just stays visible

      // 1) Card intro: label, drawing line, title, description
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        })
        .from(el.querySelector(".fr-number"), {
          autoAlpha: 0,
          y: 14,
          duration: 0.7,
        })
        .from(
          el.querySelector(".fr-line"),
          {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.1,
            ease: "power2.inOut",
          },
          "<",
        )
        .from(
          el.querySelector(".fr-title"),
          { autoAlpha: 0, y: 26, duration: 0.95 },
          "-=0.75",
        )
        .from(
          el.querySelector(".fr-desc"),
          { autoAlpha: 0, y: 20, duration: 0.95 },
          "-=0.7",
        );

      // 2) Photos: hide first, then reveal row by row
      const photosEls = gsap.utils.toArray<HTMLElement>(".fr-photo", el);
      gsap.set(photosEls, { autoAlpha: 0, y: 36 });
      gsap.set(el.querySelectorAll(".fr-clip"), {
        clipPath: "inset(0% 0% 100% 0%)",
      });
      gsap.set(el.querySelectorAll(".fr-zoom"), { scale: 1.16 });
      gsap.set(el.querySelectorAll(".fr-caption"), { autoAlpha: 0, y: 10 });

      ScrollTrigger.batch(photosEls, {
        start: "top 90%",
        once: true,
        interval: 0.1,
        onEnter: (batch) => {
          batch.forEach((fig, i) => {
            gsap
              .timeline({ delay: i * 0.14, defaults: { ease: "power3.out" } })
              .to(fig, { autoAlpha: 1, y: 0, duration: 0.9 }, 0)
              .to(
                fig.querySelector(".fr-clip"),
                {
                  clipPath: "inset(0% 0% 0% 0%)",
                  duration: 1.25,
                  ease: "power4.inOut",
                },
                0,
              )
              .to(fig.querySelector(".fr-zoom"), { scale: 1, duration: 1.6 }, 0)
              .to(
                fig.querySelector(".fr-caption"),
                { autoAlpha: 1, y: 0, duration: 0.8 },
                0.55,
              );
          });
        },
      });
    },
    { scope: root, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <article
      ref={root}
      className="rounded-2xl border border-navy-900/10 bg-white/80 p-6 sm:p-8"
    >
      <div className="flex items-center gap-4">
        <span className="fr-number text-xs font-semibold uppercase tracking-[.19em] text-orange-600">
          Record {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className="fr-line h-px flex-1 bg-navy-900/15"
          aria-hidden="true"
        />
      </div>

      <h3 className="fr-title mt-4 font-serif-heading text-xl font-bold text-navy-950 sm:text-2xl">
        {title}
      </h3>
      <p className="fr-desc mt-3 max-w-4xl leading-7 text-navy-900/70">
        {description}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map(([image, alt, caption]) => (
          <figure
            key={image}
            className="fr-photo group overflow-hidden rounded-xl border border-navy-900/10 bg-[#f8f7f2]"
          >
            <div className="fr-clip aspect-[4/3] overflow-hidden">
              <div className="fr-zoom h-full w-full">
                <img
                  src={`/images/activities/${image}.webp`}
                  alt={alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
            </div>
            <figcaption className="fr-caption px-4 py-3 text-sm leading-6 text-navy-900/70">
              {caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </article>
  );
}
