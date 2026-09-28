"use client";

import {
  MotionConfig,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { geminiViewport } from "@/lib/preview-v2-gemini/motion";

type MotionContextValue = {
  motionOff: boolean;
  reducedMotion: boolean;
  pointerFine: boolean;
};

const GeminiMotionContext = createContext<MotionContextValue>({
  motionOff: false,
  reducedMotion: false,
  pointerFine: false,
});

export function GeminiMotionProvider({ children }: PropsWithChildren) {
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
    <GeminiMotionContext.Provider value={{ motionOff, reducedMotion, pointerFine }}>
      <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
        {children}
      </MotionConfig>
    </GeminiMotionContext.Provider>
  );
}

export function useGeminiMotion() {
  return useContext(GeminiMotionContext);
}

type RevealProps = PropsWithChildren<
  HTMLMotionProps<"div"> & {
    delay?: number;
  }
>;

export function Reveal({ children, className, delay = 0, ...props }: RevealProps) {
  const { reducedMotion } = useGeminiMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, geminiViewport);

  if (reducedMotion) {
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ClipReveal({ children, className, ...props }: PropsWithChildren<{ className?: string } & HTMLMotionProps<"div">>) {
  const { reducedMotion } = useGeminiMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, geminiViewport);

  if (reducedMotion) {
    return (
      <div className={className} style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", opacity: 1 }} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", opacity: 0.8 }}
      animate={inView ? { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", opacity: 1 } : { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", opacity: 0.8 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({ value }: { value: string }) {
  const { reducedMotion } = useGeminiMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reducedMotion || !inView) return;
    const match = value.match(/^([^0-9]*)([0-9]+(?:[.,][0-9]+)?)(.*)$/);
    if (!match) return;
    const [, prefix, numStr, suffix] = match;
    const isDecimal = numStr.includes(",");
    const isDot = numStr.includes(".");
    const target = parseFloat(numStr.replace(".", "").replace(",", "."));
    const startTime = performance.now();
    const duration = 1200;

    const frame = (now: number) => {
      const elapsed = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const current = target * eased;
      let formatted: string;
      if (isDecimal) {
        formatted = current.toFixed(1).replace(".", ",");
      } else if (isDot) {
        formatted = Math.round(current).toLocaleString("pt-BR");
      } else {
        formatted = Math.round(current).toString();
      }
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (elapsed < 1) requestAnimationFrame(frame);
      else setDisplay(value);
    };

    requestAnimationFrame(frame);
  }, [value, inView, reducedMotion]);

  return <span ref={ref}>{reducedMotion ? value : display}</span>;
}

export function Magnetic({ children, className }: PropsWithChildren<{ className?: string }>) {
  const { reducedMotion, pointerFine } = useGeminiMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });

  if (reducedMotion || !pointerFine) {
    return <div className={className}>{children}</div>;
  }

  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);
    x.set(offsetX * 0.22);
    y.set(offsetY * 0.22);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={handlePointer}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}

export function InteractiveCard({
  children,
  className,
  tilt = false,
  ...props
}: PropsWithChildren<HTMLMotionProps<"div"> & { tilt?: boolean }>) {
  const { reducedMotion, pointerFine } = useGeminiMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });

  if (reducedMotion || !tilt || !pointerFine) {
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-py * 8);
    rotateY.set(px * 8);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...props}
    >
      {children}
    </motion.div>
  );
}
