import { z } from "zod";

export const publicCnpjFields = [
  "cnpj",
  "razao_social",
  "nome_fantasia",
  "cnae_principal",
  "cnaes_secundarios",
  "municipio",
  "uf",
  "endereco_comercial",
  "porte",
  "capital_social",
  "data_abertura",
  "situacao_cadastral",
  "tipo_matriz_filial",
] as const;

export const prohibitedDefaultFields = [
  "cpf",
  "nome_socio",
  "socio",
  "representante_legal",
  "telefone_particular",
  "email_pessoal",
] as const;

export const cnpjFiltersSchema = z.object({
  segment: z.string().min(2).max(160),
  uf: z.string().length(2).optional(),
  city: z.string().min(2).max(160).optional(),
  concessionaria: z.string().max(160).optional(),
  openingPeriod: z.string().max(80).optional(),
  openingDateStart: z.string().optional(),
  openingDateEnd: z.string().optional(),
  companySize: z.array(z.enum(["MEI", "ME", "EPP", "MEDIO", "GRANDE", "QUALQUER"])).default(["ME", "EPP"]),
  registrationStatus: z.enum(["ATIVA", "INAPTA", "BAIXADA", "SUSPENSA", "QUALQUER"]).default("ATIVA"),
  branchType: z.enum(["MATRIZ", "FILIAL", "QUALQUER"]).default("QUALQUER"),
  cnaes: z.array(z.string().max(12)).default([]),
  minCapital: z.number().nonnegative().optional(),
  maxCapital: z.number().nonnegative().optional(),
  quantity: z.number().int().min(1).max(50_000).default(500),
  fields: z.array(z.enum(publicCnpjFields)).min(1).default(["cnpj", "razao_social", "municipio", "uf"]),
  deliveryFormat: z.enum(["xlsx", "csv", "both"]).default("xlsx"),
});

export type CnpjFiltersInput = z.infer<typeof cnpjFiltersSchema>;

export function assertNoDefaultEnrichment(fields: readonly string[]) {
  const blocked = fields.filter((field) => prohibitedDefaultFields.includes(field as (typeof prohibitedDefaultFields)[number]));
  if (blocked.length) {
    throw new Error(`Campos bloqueados no produto padrão: ${blocked.join(", ")}`);
  }
}
