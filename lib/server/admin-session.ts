import type { AdminRole } from "@/lib/admin-permissions";

export interface AdminSessionPayload {
  userId: string;
  role: AdminRole;
  exp: number; // Unix timestamp in seconds
}

export const ADMIN_COOKIE_NAME = "prospecta_admin_session";

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_API_TOKEN ||
    "prospecta-nicho-default-dev-secret-32-chars-min"
  );
}

// Helper to convert string to Uint8Array
function strToBuf(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Base64Url encode
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Base64Url decode
function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  const secret = getSessionSecret();
  return crypto.subtle.importKey(
    "raw",
    strToBuf(secret) as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a signed admin session token: `${base64UrlPayload}.${base64UrlSignature}`
 */
export async function createAdminSession(
  payload: Omit<AdminSessionPayload, "exp">,
  ttlSeconds: number = 8 * 60 * 60
): Promise<string> {
  const fullPayload: AdminSessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const payloadJson = JSON.stringify(fullPayload);
  const payloadB64 = base64UrlEncode(strToBuf(payloadJson));

  const key = await getHmacKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    strToBuf(payloadB64) as unknown as BufferSource
  );
  const signatureB64 = base64UrlEncode(new Uint8Array(signature));

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verifies a signed admin session token. Returns null if invalid or expired.
 */
export async function verifyAdminSession(
  token: string
): Promise<AdminSessionPayload | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signatureB64] = parts;
  try {
    const key = await getHmacKey();
    const signature = base64UrlDecode(signatureB64);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature as unknown as BufferSource,
      strToBuf(payloadB64) as unknown as BufferSource
    );

    if (!valid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadJson) as AdminSessionPayload;

    if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
