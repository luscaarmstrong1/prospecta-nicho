import type { BuilderSchemaInput } from "@/lib/editor-schema";
import type { CustomRequestInput } from "@/src/schemas/custom-request";
import { cnpjFiltersSchema } from "@/src/schemas/cnpj.schema";
import type { CnpjRequestFilters, CrmRequest } from "@/src/types/crm";

const defaultFields = [
  "cnpj",
  "razao_social",
  "nome_fantasia",
  "cnae_principal",
  "municipio",
  "uf",
  "porte",
  "data_abertura",
  "situacao_cadastral",
] as const;

function nowIso() {
  return new Date().toISOString();
}

function createPublicCode() {
  return `PN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function normalizeQuantity(value?: string) {
  const numeric = Number(String(value || "").replace(/\D/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return 500;
  return Math.min(numeric, 50_000);
}

function normalizeUf(value?: string) {
  const uf = String(value || "").trim().toUpperCase().slice(0, 2);
  return uf.length === 2 ? uf : undefined;
}

function normalizeCnaes(value?: string) {
  return String(value || "")
    .split(/[,\s;]+/)
    .map((item) => item.replace(/\D/g, ""))
    .filter((item) => item.length >= 4 && item.length <= 7);
}

function normalizeCompanySize(values?: string[]): NonNullable<CnpjRequestFilters["companySize"]> {
  const joined = (values || []).join(" ").toUpperCase();
  const result: CnpjRequestFilters["companySize"] = [];
  if (joined.includes("MEI")) result.push("MEI");
  if (joined.includes("ME")) result.push("ME");
  if (joined.includes("EPP")) result.push("EPP");
  if (joined.includes("MÉD") || joined.includes("MED")) result.push("MEDIO");
  if (joined.includes("GRAN")) result.push("GRANDE");
  if (joined.includes("QUALQUER")) result.push("QUALQUER");
  return result.length ? result : ["ME", "EPP"];
}

export function createCrmRequest(input: {
  id?: string;
  source: string;
  productSlug?: CrmRequest["productSlug"];
  customer: CrmRequest["customer"];
  commercialGoal?: string;
  filters: Partial<CnpjRequestFilters> & Pick<CnpjRequestFilters, "segment">;
  notes?: string;
}): CrmRequest {
  const date = nowIso();
  const filters = cnpjFiltersSchema.parse({
    companySize: ["ME", "EPP"],
    registrationStatus: "ATIVA",
    branchType: "QUALQUER",
    quantity: 500,
    fields: [...defaultFields],
    deliveryFormat: "xlsx",
    ...input.filters,
  });

  return {
    id: input.id || crypto.randomUUID(),
    publicCode: createPublicCode(),
    createdAt: date,
    updatedAt: date,
    source: input.source,
    productSlug: input.productSlug || "gerador-planilhas-cnpj",
    status: "analysis",
    customer: input.customer,
    commercialGoal: input.commercialGoal,
    filters,
    enrichmentPaid: false,
    enrichmentEnabled: false,
    enrichmentStatus: "locked",
    paymentStatus: "pending",
    notes: input.notes,
  };
}

export function createCrmRequestFromQuickRequest(data: CustomRequestInput, id?: string): CrmRequest {
  return createCrmRequest({
    id,
    source: data.source || "quick-planilha",
    customer: {
      name: data.name,
      company: data.company || undefined,
      email: data.email || undefined,
      whatsapp: data.whatsapp,
    },
    commercialGoal: "Solicitação rápida de planilha CNPJ",
    filters: {
      segment: data.segment,
      uf: normalizeUf(data.state),
      city: data.location,
      openingPeriod: data.period,
      quantity: normalizeQuantity(data.quantity),
      companySize: ["ME", "EPP"],
      registrationStatus: "ATIVA",
      branchType: "QUALQUER",
      cnaes: [],
    },
    notes: data.notes,
  });
}

export function createCrmRequestFromBuilder(data: BuilderSchemaInput, id?: string): CrmRequest {
  return createCrmRequest({
    id,
    source: data.source || "base-builder",
    customer: {
      name: data.name,
      company: data.company,
      email: data.email,
      whatsapp: data.whatsapp,
    },
    commercialGoal: data.goal,
    filters: {
      segment: data.segment,
      uf: normalizeUf(data.state),
      city: data.city,
      openingPeriod: data.openedPeriod,
      companySize: normalizeCompanySize(data.companySize),
      registrationStatus: data.registrationStatus.toLowerCase().includes("ativa") ? "ATIVA" : "QUALQUER",
      branchType: data.branchType.toLowerCase().includes("matriz") ? "MATRIZ" : data.branchType.toLowerCase().includes("filial") ? "FILIAL" : "QUALQUER",
      cnaes: [...normalizeCnaes(data.primaryCnae), ...normalizeCnaes(data.secondaryCnaes)],
      quantity: normalizeQuantity(data.quantityRange),
      fields: [...defaultFields, ...(data.extraFields.includes("Capital social") ? ["capital_social" as const] : [])],
      deliveryFormat: data.deliveryFormat.toLowerCase().includes("csv") ? "csv" : "xlsx",
    },
    notes: [data.segmentNotes, data.deliveryNotes].filter(Boolean).join("\n"),
  });
}
