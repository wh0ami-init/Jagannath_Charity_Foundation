import { createElement, HTMLAttributes, useEffect } from "react";
import { motion, useAnimate, useInView, useReducedMotion } from "motion/react";

const motionTags = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  h3: motion.h3,
  h2: motion.h2,
  aside: motion.aside,
  nav: motion.nav,
  address: motion.address,
  form: motion.form,
  button: motion.button,
  a: motion.a,
};

type RevealTag = keyof typeof motionTags;
type RevealProps = HTMLAttributes<any> & {
  as?: RevealTag;
  delay?: number;
  href?: string;
  type?: "button" | "submit" | "reset";
};

export default function Reveal({ as = "div", delay = 0, ...props }: RevealProps) {
  const [scope, animate] = useAnimate();
  const inView = useInView(scope, { once: true, amount: 0.12, margin: "0px 0px -40px 0px" });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!inView || reducedMotion || !scope.current) return;
    void animate(scope.current, { opacity: [0.58, 1], y: [28, 0] }, {
      duration: 1.1,
      delay: delay + 0.1,
      ease: [0.22, 0.7, 0.2, 1],
    });
  }, [animate, delay, inView, reducedMotion, scope]);

  const MotionTag = motionTags[as] as React.ElementType;
  return createElement(MotionTag, { ...props, ref: scope });
}
