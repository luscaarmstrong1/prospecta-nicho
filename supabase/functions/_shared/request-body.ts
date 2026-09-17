export class RequestBodyError extends Error {
  code: "PAYLOAD_TOO_LARGE" | "INVALID_JSON";
  status: number;

  constructor(code: "PAYLOAD_TOO_LARGE" | "INVALID_JSON", status: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

export async function readJsonBody(request: Request, maxBytes: number): Promise<Record<string, unknown>> {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) throw new RequestBodyError("PAYLOAD_TOO_LARGE", 413);
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength > maxBytes) throw new RequestBodyError("PAYLOAD_TOO_LARGE", 413);
  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("invalid object");
    return parsed as Record<string, unknown>;
  } catch {
    throw new RequestBodyError("INVALID_JSON", 400);
  }
}
