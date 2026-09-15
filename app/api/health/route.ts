import { existsSync } from "node:fs";
import { NextResponse } from "next/server";
import { assertProductionEnv } from "@/src/config/env";

export const dynamic = "force-dynamic";

type CheckStatus = "configured" | "missing" | "waiting_data" | "local_dev";

function isConfigured(...keys: string[]) {
  return keys.every((key) => Boolean(process.env[key]));
}

function configuredStatus(...keys: string[]): CheckStatus {
  return isConfigured(...keys) ? "configured" : "missing";
}

function rfbDirStatus(key: "RFB_CNPJ_DATA_DIR" | "RFB_CNPJ_OUTPUT_DIR"): CheckStatus {
  const value = process.env[key];
  if (!value) return "waiting_data";
  return existsSync(value) ? "configured" : "waiting_data";
}

function storageStatus(): CheckStatus {
  if (isConfigured("R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY") && Boolean(process.env.R2_BUCKET || process.env.R2_BUCKET_NAME)) {
    return "configured";
  }
  if (isConfigured("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY")) return "configured";
  return process.env.NODE_ENV === "production" ? "missing" : "local_dev";
}

export async function GET() {
  const envValidation = assertProductionEnv();
  const environment = process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_DEPLOY_ENV || process.env.NODE_ENV || "local";
  const checks = {
    siteUrl: configuredStatus("NEXT_PUBLIC_SITE_URL"),
    nextPublicSupabaseUrl: configuredStatus("NEXT_PUBLIC_SUPABASE_URL"),
    nextPublicSupabaseAnonKey: configuredStatus("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    supabaseUrl: configuredStatus("SUPABASE_URL"),
    serviceRole: configuredStatus("SUPABASE_SERVICE_ROLE_KEY"),
    adminToken: configuredStatus("ADMIN_API_TOKEN"),
    exportSigningSecret: configuredStatus("EXPORT_SIGNING_SECRET"),
    whatsapp: process.env.WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ? "configured" : "missing",
    rfbDataDir: rfbDirStatus("RFB_CNPJ_DATA_DIR"),
    rfbOutputDir: rfbDirStatus("RFB_CNPJ_OUTPUT_DIR"),
    storage: storageStatus(),
    payments: process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.ASAAS_API_KEY ? "configured" : "missing",
    email: configuredStatus("RESEND_API_KEY"),
    turnstile: configuredStatus("TURNSTILE_SECRET_KEY"),
    sentry: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN ? "configured" : "missing",
  } satisfies Record<string, CheckStatus>;

  const required = ["siteUrl", "supabaseUrl", "serviceRole", "adminToken", "exportSigningSecret"] as const;
  const ok = required.every((key) => checks[key] === "configured") && envValidation.ok;

  return NextResponse.json(
    {
      ok,
      environment,
      checks,
      env: {
        ok: envValidation.ok,
        issues: envValidation.issues,
      },
      generatedAt: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  );
}

