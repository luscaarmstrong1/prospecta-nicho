const defaultAllowedOrigins = [
  "https://luscaarmstrong1.github.io",
  "https://prospectanicho.lssgroup.com.br",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3003",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3003",
];

function allowedOrigins() {
  const configured = (Deno.env.get("PUBLIC_ALLOWED_ORIGINS") || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  return new Set([...defaultAllowedOrigins, ...configured]);
}

export function isAllowedOrigin(origin: string) {
  return !origin || allowedOrigins().has(origin.replace(/\/+$/, ""));
}

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "access-control-allow-headers": "authorization, content-type, x-admin-session, x-admin-action, x-resource-id, x-prospectanicho-api-path",
    "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
    vary: "Origin",
  };
  if (origin && isAllowedOrigin(origin)) headers["access-control-allow-origin"] = origin;
  return headers;
}

export function handleCors(request: Request) {
  const origin = request.headers.get("origin") || "";
  if (!isAllowedOrigin(origin)) {
    return Response.json(
      { ok: false, code: "ORIGIN_NOT_ALLOWED", message: "Origem não autorizada." },
      { status: 403, headers: { "content-type": "application/json", vary: "Origin" } },
    );
  }
  if (request.method !== "OPTIONS") return null;
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
