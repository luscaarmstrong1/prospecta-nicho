import { handleCors } from "../_shared/cors.ts";
import { adminListRequests } from "../_shared/admin-handlers.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  return cors || adminListRequests(request);
});
