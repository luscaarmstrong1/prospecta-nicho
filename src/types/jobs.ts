export type CnpjJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "ready_for_delivery"
  | "completed_partial"
  | "no_results"
  | "failed"
  | "cancelled";

export type CnpjJob = {
  id: string;
  requestId: string;
  createdAt: string;
  updatedAt: string;
  status: CnpjJobStatus;
  worker: "rfb_cnpj";
  filtersSnapshot: Record<string, unknown>;
  rowsMatched: number;
  rowsExported: number;
  progress?: number;
  currentStep?: string;
  searchProvider?: string;
  searchStats?: Record<string, unknown>;
  warningMessage?: string;
  logs: string[];
  error?: string;
};
