import { isAllowedOrigin } from "./cors.ts";
import { serviceClient } from "./db.ts";
import { RequestBodyError } from "./request-body.ts";
import { errorJson } from "./responses.ts";
export { readJsonBody } from "./request-body.ts";

export function bodyErrorResponse(request: Request, error: unknown) {
  if (!(error instanceof RequestBodyError)) return null;
  const message = error.code === "PAYLOAD_TOO_LARGE" ? "A solicitação excede o tamanho permitido." : "O corpo JSON é inválido.";
  return errorJson(request, error.code, message, error.status);
}

async function fingerprint(request: Request) {
  const forwarded = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const normalizedIp = forwarded.trim().toLowerCase().slice(0, 80);
  const userAgent = (request.headers.get("user-agent") || "unknown").trim().toLowerCase().slice(0, 300);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${normalizedIp}|${userAgent}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function enforceRateLimit(request: Request, scope: string, limit: number, windowSeconds: number) {
  const supabase = serviceClient();
  const { data, error } = await supabase.rpc("consume_edge_rate_limit", {
    p_scope: scope,
    p_fingerprint_hash: await fingerprint(request),
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) return errorJson(request, "RATE_LIMIT_UNAVAILABLE", "A proteção de acesso está temporariamente indisponível.", 503);
  const result = data as { allowed?: boolean; retry_after?: number } | null;
  if (result?.allowed !== false) return null;
  const retryAfter = Math.max(1, Number(result.retry_after || windowSeconds));
  return errorJson(request, "RATE_LIMITED", "Muitas tentativas. Aguarde antes de tentar novamente.", 429, {}, { "retry-after": String(retryAfter) });
}

type TurnstileResult = { success?: boolean; hostname?: string; "error-codes"?: string[] };

export async function verifyTurnstile(request: Request, token: unknown) {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY") || "";
  if (!secret) return null;
  if (typeof token !== "string" || !token.trim()) {
    return errorJson(request, "TURNSTILE_FAILED", "Confirme a verificação de segurança.", 403);
  }
  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token.trim());
  const remoteIp = request.headers.get("cf-connecting-ip");
  if (remoteIp) form.set("remoteip", remoteIp);
  let result: TurnstileResult;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    result = await response.json() as TurnstileResult;
  } catch {
    return errorJson(request, "TURNSTILE_UNAVAILABLE", "Não foi possível validar a verificação de segurança.", 503);
  }
  const origin = request.headers.get("origin") || "";
  const hostnameAllowed = !result.hostname || isAllowedOrigin(origin) && (!origin || new URL(origin).hostname === result.hostname);
  if (!result.success || !hostnameAllowed) return errorJson(request, "TURNSTILE_FAILED", "Verificação de segurança inválida.", 403);
  return null;
}

export function uuidValue(value: unknown) {
  const candidate = typeof value === "string" ? value.trim() : "";
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate) ? candidate : "";
}
