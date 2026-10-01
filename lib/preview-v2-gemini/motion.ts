export const geminiMotion = {
  timing: {
    quick: 0.18,
    standard: 0.28,
    smooth: 0.45,
    reveal: 0.6,
  },
  ease: {
    standard: [0.22, 1, 0.36, 1],
    smooth: [0.16, 1, 0.3, 1],
  },
} as const;

export const geminiViewport = {
  once: true,
  amount: 0.18,
  margin: "0px 0px -40px 0px",
} as const;
