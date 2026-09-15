import { getSupabaseFunctionsBaseUrl, isGithubPagesRuntime, resolveEdgeRoute } from "@/src/lib/api/runtime";

export const adminSessionStorageKey = "prospectanicho:admin-token";

export function saveAdminSessionToken(token: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(adminSessionStorageKey, token);
}

export function getAdminSessionToken() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(adminSessionStorageKey) || "";
}

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  if (!isGithubPagesRuntime()) return fetch(path, init);

  const edgeRoute = resolveEdgeRoute(path);
  const functionsBaseUrl = getSupabaseFunctionsBaseUrl();
  if (!edgeRoute || !functionsBaseUrl) {
    return jsonResponse(
      {
        ok: false,
        code: "EDGE_FUNCTIONS_NOT_CONFIGURED",
        message: "Backend Supabase Functions nao configurado para o site estatico.",
      },
      503,
    );
  }

  const sourceUrl = new URL(path, "https://prospectanicho.local");
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  headers.set("x-prospectanicho-api-path", sourceUrl.pathname);
  if (edgeRoute.resourceId) headers.set("x-resource-id", edgeRoute.resourceId);
  if (edgeRoute.action) headers.set("x-admin-action", edgeRoute.action);

  const adminToken = getAdminSessionToken();
  if (sourceUrl.pathname.startsWith("/api/admin/") && sourceUrl.pathname !== "/api/admin/session" && adminToken) {
    headers.set("authorization", `Bearer ${adminToken}`);
    headers.set("x-admin-session", adminToken);
  }

  return fetch(`${functionsBaseUrl}/${edgeRoute.functionName}${sourceUrl.search}`, { ...init, headers });
}
