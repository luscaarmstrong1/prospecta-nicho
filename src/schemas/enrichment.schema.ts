import { z } from "zod";

export const enrichmentRunSchema = z.object({
  requestId: z.string().min(6),
  enrichmentPaid: z.literal(true),
  paymentConfirmedByAdmin: z.literal(true),
});
