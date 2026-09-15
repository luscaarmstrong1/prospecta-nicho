export type CrmRequestStatus =
  | "new"
  | "analysis"
  | "validated"
  | "waiting_payment"
  | "paid"
  | "queued"
  | "processing"
  | "ready"
  | "delivered"
  | "cancelled";

export type CompanySize = "MEI" | "ME" | "EPP" | "MEDIO" | "GRANDE" | "QUALQUER";
export type RegistrationStatus = "ATIVA" | "INAPTA" | "BAIXADA" | "SUSPENSA" | "QUALQUER";
export type BranchType = "MATRIZ" | "FILIAL" | "QUALQUER";
export type DeliveryFormat = "xlsx" | "csv" | "both";

export type CnpjRequestFilters = {
  segment: string;
  uf?: string;
  city?: string;
  concessionaria?: string;
  openingPeriod?: string;
  openingDateStart?: string;
  openingDateEnd?: string;
  companySize: CompanySize[];
  registrationStatus: RegistrationStatus;
  branchType: BranchType;
  cnaes: string[];
  minCapital?: number;
  maxCapital?: number;
  quantity: number;
  fields: string[];
  deliveryFormat: DeliveryFormat;
};

export type CrmRequest = {
  id: string;
  publicCode: string;
  createdAt: string;
  updatedAt: string;
  source: string;
  status: CrmRequestStatus;
  customer: {
    name: string;
    company?: string;
    email?: string;
    whatsapp?: string;
  };
  commercialGoal?: string;
  filters: CnpjRequestFilters;
  enrichmentPaid: boolean;
  enrichmentEnabled: boolean;
  enrichmentStatus: "locked" | "available" | "running" | "completed";
  paymentStatus: "not_required" | "pending" | "paid" | "refunded";
  jobId?: string;
  exportId?: string;
  notes?: string;
};
