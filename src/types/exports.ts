export type CrmExportStatus = "pending" | "generating" | "ready" | "expired" | "revoked";

export type CrmExport = {
  id: string;
  requestId: string;
  jobId?: string;
  createdAt: string;
  status: CrmExportStatus;
  format: "xlsx" | "csv" | "both";
  fields: string[];
  rowCount: number;
  fileUrl?: string;
  storageProvider: "supabase" | "r2" | "local";
  expiresAt?: string;
};
