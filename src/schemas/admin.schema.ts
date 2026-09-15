import { z } from "zod";

export const adminRequestActionSchema = z.object({
  note: z.string().max(500).optional(),
});

export const adminMarkPaidSchema = z.object({
  paymentStatus: z.literal("paid").default("paid"),
  note: z.string().max(500).optional(),
});

export const adminEnableEnrichmentSchema = z.object({
  confirmPayment: z.literal(true),
  note: z.string().max(500).optional(),
});
