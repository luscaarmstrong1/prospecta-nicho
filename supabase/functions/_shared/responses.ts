import { corsHeaders } from "./cors.ts";

export function json(request: Request, body: Record<string, unknown>, status = 200, extraHeaders: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders(request),
      "content-type": "application/json",
      ...extraHeaders,
    },
  });
}

export function errorJson(request: Request, code: string, message: string, status = 400, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return json(request, { ok: false, code, message, ...extra }, status, headers);
}
