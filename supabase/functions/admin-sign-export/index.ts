import { handleCors } from "../_shared/cors.ts";
import { adminSignExport } from "../_shared/admin-handlers.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  return cors || adminSignExport(request);
});
