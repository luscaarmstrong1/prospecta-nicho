const exportDeliveryMode = process.env.EXPORT_DELIVERY_MODE || "local";
const breakGlassAdmin = process.env.ENABLE_BREAK_GLASS_ADMIN === "true";
const required = [
  "NEXT_PUBLIC_SITE_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  ...(breakGlassAdmin ? ["ADMIN_API_TOKEN"] : []),
  ...(exportDeliveryMode === "local" ? [] : ["EXPORT_SIGNING_SECRET"]),
];
const optional = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "WHATSAPP_NUMBER",
  "NEXT_PUBLIC_WHATSAPP_NUMBER",
  "R2_BUCKET",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
  "RFB_CNPJ_DATA_DIR",
  "RFB_CNPJ_OUTPUT_DIR",
  "EXPORT_DELIVERY_MODE",
  "MINHA_RECEITA_CACHE_DIR",
  "MERCADO_PAGO_ACCESS_TOKEN",
  "ASAAS_API_KEY",
];
const strict = process.env.CHECK_ENV_STRICT === "1" || process.env.NODE_ENV === "production";

const missing = required.filter((key) => !process.env[key]);
const configuredOptional = optional.filter((key) => Boolean(process.env[key]));

console.log(JSON.stringify({ ok: missing.length === 0, strict, exportDeliveryMode, breakGlassAdmin, missing, configuredOptional }, null, 2));

if (strict && missing.length) {
  process.exitCode = 1;
}
