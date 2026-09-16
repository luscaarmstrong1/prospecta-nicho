import { z } from "zod";
import { cnpjFiltersSchema } from "./cnpj.schema";

export const crmRequestSchema = z.object({
  source: z.string().max(80).default("crm"),
  customer: z.object({
    name: z.string().min(2).max(120),
    company: z.string().max(160).optional(),
    email: z.string().email().optional().or(z.literal("")),
    whatsapp: z.string().max(32).optional(),
  }),
  commercialGoal: z.string().max(240).optional(),
  filters: cnpjFiltersSchema,
  notes: z.string().max(1200).optional(),
});

export const crmRequestPatchSchema = z.object({
  status: z
    .enum(["new", "analysis", "validated", "waiting_payment", "paid", "queued", "processing", "ready", "ready_for_delivery", "delivered", "cancelled"])
    .optional(),
  notes: z.string().max(1200).optional(),
});

export type CrmRequestInput = z.infer<typeof crmRequestSchema>;
