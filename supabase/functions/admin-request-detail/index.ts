import { handleCors } from "../_shared/cors.ts";
import { adminRequestDetail } from "../_shared/admin-handlers.ts";

Deno.serve(async (request) => {
  const cors = handleCors(request);
  return cors || adminRequestDetail(request);
});
