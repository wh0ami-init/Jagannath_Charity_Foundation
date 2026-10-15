import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

type GsapDialogProps = {
  open: boolean;
  className: string;
  dialogClassName: string;
  labelledBy: string;
  reducedMotion: boolean;
  onBackdrop?: (event: MouseEvent<HTMLDivElement>) => void;
  children: ReactNode;
};

/** Animated accessible dialog shell. Page-specific artwork and content stay in the caller. */
export default function GsapDialog({
  open,
  className,
  dialogClassName,
  labelledBy,
  reducedMotion,
  onBackdrop,
  children,
}: GsapDialogProps) {
  const root = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  useGSAP(() => {
    const overlay = root.current;
    const dialog = overlay?.querySelector<HTMLElement>("[role=dialog]");
    if (!mounted || !overlay || !dialog) return;

    if (reducedMotion) {
      if (open) gsap.set([overlay, dialog], { autoAlpha: 1, clearProps: "transform" });
      else setMounted(false);
      return;
    }

    if (!open) {
      gsap.timeline({ onComplete: () => setMounted(false) })
        .to(dialog, { autoAlpha: 0, y: 12, scale: .98, duration: .2, ease: "power2.in" })
        .to(overlay, { autoAlpha: 0, duration: .18, ease: "power1.in" }, "-=.08");
      return;
    }

    const entrance = gsap.timeline();
    entrance.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: .26, ease: "power1.out" });
    entrance.fromTo(dialog, { autoAlpha: 0, y: 24, scale: .96 }, { autoAlpha: 1, y: 0, scale: 1, duration: .44, ease: "power3.out" }, 0);
  }, { scope: root, dependencies: [open, reducedMotion, mounted], revertOnUpdate: true });

  if (!mounted) return null;

  return (
    <div ref={root} className={className} role="presentation" onMouseDown={onBackdrop}>
      <section className={dialogClassName} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </section>
    </div>
  );
}
