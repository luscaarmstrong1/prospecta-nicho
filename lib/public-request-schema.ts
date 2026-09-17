import { z } from "zod";

export const publicRequestSchema = z
  .object({
    requestType: z.enum(["sample", "custom"]),
    segment: z.string().min(1, "Escolha um segmento."),
    otherSegment: z.string().max(120).optional(),
    city: z.string().trim().min(2, "Informe a cidade ou região.").max(160),
    state: z.string().length(2, "Escolha a UF."),
    name: z.string().trim().min(2, "Informe seu nome.").max(120),
    whatsapp: z.string().min(8, "Informe um WhatsApp válido.").max(32),
    quantity: z.string().optional(),
    notes: z.string().max(500).optional(),
    consent: z.literal(true, { message: "Confirme que leu os termos." }),
    companySite: z.string().max(0).optional(),
  })
  .superRefine((data, context) => {
    if (data.segment === "outro" && (!data.otherSegment || data.otherSegment.trim().length < 2)) {
      context.addIssue({ code: "custom", path: ["otherSegment"], message: "Informe o segmento desejado." });
    }
    if (data.requestType === "custom" && !data.quantity) {
      context.addIssue({ code: "custom", path: ["quantity"], message: "Escolha uma quantidade aproximada." });
    }
  });

export type PublicRequestInput = z.infer<typeof publicRequestSchema>;
