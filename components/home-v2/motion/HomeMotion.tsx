"use client";

import {
  MotionConfig,
  motion,
  useAnimationControls,
  useInView,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PropsWithChildren,
} from "react";
import {
  previewMotion,
  previewViewport,
  revealVariants,
  staggerVariants,
} from "@/lib/home-v2/motion";

type MotionContextValue = {
  motionOff: boolean;
  reducedMotion: boolean;
  pointerFine: boolean;
};

const HomeMotionContext = createContext<MotionContextValue>({
  motionOff: false,
  reducedMotion: false,
  pointerFine: false,
});

export function HomeMotionProvider({ children }: PropsWithChildren) {
  const [motionOff, setMotionOff] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [pointerFine, setPointerFine] = useState(false);

  useEffect(() => {
    setMotionOff(new URLSearchParams(window.location.search).get("motion") === "off");
    const pointerMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePointer = () => setPointerFine(pointerMedia.matches);
    const updateReducedMotion = () => setSystemReducedMotion(reducedMotionMedia.matches);
    updatePointer();
    updateReducedMotion();
    pointerMedia.addEventListener("change", updatePointer);
    reducedMotionMedia.addEventListener("change", updateReducedMotion);
    return () => {
      pointerMedia.removeEventListener("change", updatePointer);
      reducedMotionMedia.removeEventListener("change", updateReducedMotion);
    };
  }, []);

  const reducedMotion = systemReducedMotion || motionOff;

  return (
    <HomeMotionContext.Provider value={{ motionOff, reducedMotion, pointerFine }}>
      <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
        {children}
      </MotionConfig>
    </HomeMotionContext.Provider>
  );
}

export function useHomeMotion() {
  return useContext(HomeMotionContext);
}

type RevealProps = PropsWithChildren<
  HTMLMotionProps<"div"> & {
    delay?: number;
  }
>;

function useSafeReveal() {
  const ref = useRef<HTMLElement>(null);
  const controls = useAnimationControls();
  const inView = useInView(ref, previewViewport);
  const { reducedMotion } = useHomeMotion();

  useEffect(() => {
    if (reducedMotion) {
      controls.set("visible");
      return;
    }

    if (inView) {
      void controls.start("visible");
      return;
    }

    controls.set("hidden");
    let fallback = 0;
    const ensureFinalState = () => {
      const box = ref.current?.getBoundingClientRect();
      if (!box || box.top <= window.innerHeight * 1.1 || box.bottom < 0) {
        void controls.start("visible");
        return;
      }
      fallback = window.setTimeout(ensureFinalState, 400);
    };
    fallback = window.setTimeout(ensureFinalState, 700);
    return () => window.clearTimeout(fallback);
  }, [controls, inView, reducedMotion]);

  return { controls, ref };
}

export function Reveal({ children, delay = 0, ...props }: RevealProps) {
  const { controls, ref } = useSafeReveal();
  return (
    <motion.div
      ref={ref as React.Ref<HTMLDivElement>}
      initial={false}
      animate={controls}
      variants={revealVariants}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({ children, ...props }: PropsWithChildren<HTMLMotionProps<"div">>) {
  const { controls, ref } = useSafeReveal();
  return (
    <motion.div
      ref={ref as React.Ref<HTMLDivElement>}
      initial={false}
      animate={controls}
      variants={staggerVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: PropsWithChildren<HTMLMotionProps<"div">>) {
  return (
    <motion.div variants={revealVariants} {...props}>
      {children}
    </motion.div>
  );
}

export function SafeTableRow({ children, delay = 0, ...props }: PropsWithChildren<HTMLMotionProps<"tr"> & { delay?: number }>) {
  const { controls, ref } = useSafeReveal();
  return (
    <motion.tr
      ref={ref as React.Ref<HTMLTableRowElement>}
      initial={false}
      animate={controls}
      variants={{
        hidden: { opacity: 0, x: -8 },
        visible: { opacity: 1, x: 0 },
      }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.tr>
  );
}

export function ClipReveal({ children, ...props }: PropsWithChildren<HTMLMotionProps<"div">>) {
  const { controls, ref } = useSafeReveal();
  return (
    <motion.div
      ref={ref as React.Ref<HTMLDivElement>}
      initial={false}
      animate={controls}
      variants={{
        hidden: { clipPath: "inset(0 100% 0 0)" },
        visible: { clipPath: "inset(0 0% 0 0)" },
      }}
      transition={{ duration: 0.82 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type MagneticProps = PropsWithChildren<{ className?: string }>;

export function Magnetic({ children, className }: MagneticProps) {
  const { reducedMotion, pointerFine } = useHomeMotion();
  const x = useSpring(useMotionValue(0), previewMotion.spring);
  const y = useSpring(useMotionValue(0), previewMotion.spring);

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLSpanElement>) => {
      if (reducedMotion || !pointerFine) return;
      const rect = event.currentTarget.getBoundingClientRect();
      x.set(((event.clientX - rect.left) / rect.width - 0.5) * 8);
      y.set(((event.clientY - rect.top) / rect.height - 0.5) * 8);
    },
    [pointerFine, reducedMotion, x, y],
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.span
      className={className}
      style={{ x, y }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.span>
  );
}

type InteractiveCardProps = PropsWithChildren<
  HTMLMotionProps<"article"> & {
    tilt?: boolean;
  }
>;

export function InteractiveCard({ children, tilt = false, style, ...props }: InteractiveCardProps) {
  const { reducedMotion, pointerFine } = useHomeMotion();
  const { controls, ref } = useSafeReveal();
  const rotateX = useSpring(useMotionValue(0), previewMotion.spring);
  const rotateY = useSpring(useMotionValue(0), previewMotion.spring);

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (reducedMotion || !pointerFine) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      event.currentTarget.style.setProperty("--pointer-x", `${px * 100}%`);
      event.currentTarget.style.setProperty("--pointer-y", `${py * 100}%`);
      if (tilt) {
        rotateX.set((0.5 - py) * 5);
        rotateY.set((px - 0.5) * 5);
      }
    },
    [pointerFine, reducedMotion, rotateX, rotateY, tilt],
  );

  const reset = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    const element = ref.current;
    element?.style.setProperty("--pointer-x", "50%");
    element?.style.setProperty("--pointer-y", "50%");
  }, [ref, rotateX, rotateY]);

  return (
    <motion.article
      ref={ref as React.Ref<HTMLElement>}
      initial={false}
      animate={controls}
      variants={revealVariants}
      whileHover={reducedMotion || !pointerFine ? undefined : { y: -3 }}
      transition={previewMotion.spring}
      style={{
        ...style,
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      {...props}
    >
      {children}
    </motion.article>
  );
}

function parseMetric(value: string) {
  const prefix = value.startsWith("+") ? "+" : "";
  const suffix = value.endsWith("M") ? "M" : "";
  const raw = value.replace(/[+M]/g, "");
  const decimals = raw.includes(",") ? 1 : 0;
  const numeric = Number(raw.replace(/\./g, "").replace(",", "."));
  return { prefix, suffix, numeric, decimals };
}

export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const { reducedMotion } = useHomeMotion();
  const [display, setDisplay] = useState(value);
  const animated = useRef(false);

  useEffect(() => {
    if (!inView || animated.current) return;
    animated.current = true;
    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    const { prefix, suffix, numeric, decimals } = parseMetric(value);
    const startedAt = performance.now();
    const duration = 900;
    let frame = 0;
    setDisplay("0");
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numeric * eased;
      const formatted = new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(current);
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const fallback = window.setTimeout(() => setDisplay(value), duration + 240);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
    };
  }, [inView, reducedMotion, value]);

  return <span ref={ref}>{display}</span>;
}

export function PointerSpotlightStyle() {
  return { "--pointer-x": "50%", "--pointer-y": "50%" } as CSSProperties;
}
