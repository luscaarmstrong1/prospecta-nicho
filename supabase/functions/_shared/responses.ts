import { corsHeaders } from "./cors.ts";

export function json(request: Request, body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders(request),
      "content-type": "application/json",
    },
  });
}

export function errorJson(request: Request, code: string, message: string, status = 400, extra: Record<string, unknown> = {}) {
  return json(request, { ok: false, code, message, ...extra }, status);
}
