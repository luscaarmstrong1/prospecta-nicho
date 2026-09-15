import { readFileSync } from "node:fs";

const schema = [
  readFileSync("supabase/schema.sql", "utf8"),
  readFileSync("supabase/migrations/20260914000000_crm_cnpj_pipeline.sql", "utf8"),
  readFileSync("supabase/migrations/20260914001000_crm_cnpj_required_tables.sql", "utf8"),
].join("\n");
const requiredTables = [
  "profiles",
  "crm_leads",
  "crm_requests",
  "custom_requests",
  "request_filters",
  "request_fields",
  "request_status_events",
  "rfb_snapshots",
  "rfb_processing_jobs",
  "rfb_job_logs",
  "exports",
  "export_files",
  "export_downloads",
  "segment_cnae_mappings",
  "utilities",
  "utility_cities",
  "products",
  "payments",
  "suppression_list",
  "audit_logs",
  "system_settings",
  "cnpj_jobs",
  "crm_exports",
  "segment_mappings",
  "concessionarias",
  "enrichment_runs",
];

const missingTables = requiredTables.filter((table) => !schema.includes(`create table if not exists public.${table}`));
const missingRls = requiredTables.filter((table) => !schema.includes(`alter table public.${table} enable row level security`));
const missingPolicies = requiredTables.filter((table) => !schema.includes(`on public.${table}`) || !schema.includes("auth.role() = 'service_role'"));

const ok = missingTables.length === 0 && missingRls.length === 0 && missingPolicies.length === 0;

console.log(JSON.stringify({ ok, missingTables, missingRls, missingPolicies }, null, 2));

if (!ok) {
  process.exitCode = 1;
}
