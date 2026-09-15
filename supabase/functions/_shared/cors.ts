const allowedOrigins = new Set([
  "https://luscaarmstrong1.github.io",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3003",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3003",
]);

export function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "";
  return {
    "access-control-allow-origin": allowedOrigins.has(origin) ? origin : "https://luscaarmstrong1.github.io",
    "access-control-allow-headers": "authorization, content-type, x-admin-session, x-admin-action, x-resource-id, x-prospectanicho-api-path",
    "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
    vary: "Origin",
  };
}

export function handleCors(request: Request) {
  if (request.method !== "OPTIONS") return null;
  return new Response("ok", { headers: corsHeaders(request) });
}
