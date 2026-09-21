import type { Variants } from "framer-motion";

export const previewMotion = {
  duration: {
    fast: 0.22,
    normal: 0.46,
    slow: 0.82,
  },
  stagger: 0.08,
  ease: [0.22, 1, 0.36, 1] as const,
  spring: {
    type: "spring" as const,
    stiffness: 220,
    damping: 26,
    mass: 0.75,
  },
};

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: previewMotion.duration.normal,
      ease: previewMotion.ease,
    },
  },
};

export const staggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: previewMotion.stagger,
      delayChildren: 0.04,
    },
  },
};

export const previewViewport = {
  once: true,
  amount: 0.12,
  margin: "0px 0px -6% 0px",
} as const;
