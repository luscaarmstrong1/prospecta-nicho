export function text(value: unknown, max = 240) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export function phone(value: unknown) {
  return text(value, 32).replace(/[^\d+]/g, "");
}

export function publicCode() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return `PN-${Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

export function numberValue(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}
