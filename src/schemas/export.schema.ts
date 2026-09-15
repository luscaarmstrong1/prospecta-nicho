import { z } from "zod";

export const exportSignUrlSchema = z.object({
  exportId: z.string().min(6),
  expiresInSeconds: z.number().int().min(60).max(86_400).default(3600),
});
