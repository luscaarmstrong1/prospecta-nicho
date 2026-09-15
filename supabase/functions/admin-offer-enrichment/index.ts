import { handleCors } from "../_shared/cors.ts";
import { adminUpdateRequest } from "../_shared/admin-handlers.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  return cors || adminUpdateRequest(request, "enrichment_offered");
});
