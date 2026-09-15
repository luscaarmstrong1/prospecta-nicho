import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));
const optionalSecret = z.string().min(1).optional().or(z.literal(""));

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_DEPLOY_ENV: z.enum(["development", "preview", "production"]).optional().or(z.literal("")),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalSecret,
  NEXT_PUBLIC_GA_ID: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_BASE_PATH: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_STATIC_EXPORT: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_ALLOW_GITHUB_PAGES: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_RUNTIME_TARGET: z.string().optional().or(z.literal("")),
});

export const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_URL: optionalUrl,
  SUPABASE_ANON_KEY: optionalSecret,
  SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
  RESEND_API_KEY: optionalSecret,
  CONTACT_EMAIL: z.string().email().optional().or(z.literal("")),
  MERCADO_PAGO_ACCESS_TOKEN: optionalSecret,
  MERCADO_PAGO_WEBHOOK_SECRET: optionalSecret,
  ASAAS_API_KEY: optionalSecret,
  ASAAS_WEBHOOK_TOKEN: optionalSecret,
  R2_ACCOUNT_ID: optionalSecret,
  R2_ACCESS_KEY_ID: optionalSecret,
  R2_SECRET_ACCESS_KEY: optionalSecret,
  R2_BUCKET: optionalSecret,
  R2_BUCKET_NAME: optionalSecret,
  R2_ENDPOINT: optionalUrl,
  R2_PUBLIC_BASE_URL: optionalUrl,
  CLICKHOUSE_URL: optionalUrl,
  CLICKHOUSE_USERNAME: optionalSecret,
  CLICKHOUSE_PASSWORD: optionalSecret,
  CLICKHOUSE_DATABASE: optionalSecret,
  REDIS_URL: optionalUrl,
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: optionalSecret,
  RFB_CNPJ_BASE_URL: optionalUrl,
  RFB_CNPJ_DATA_DIR: z.string().optional().or(z.literal("")),
  RFB_CNPJ_OUTPUT_DIR: z.string().optional().or(z.literal("")),
  WHATSAPP_NUMBER: z.string().optional().or(z.literal("")),
  TURNSTILE_SECRET_KEY: optionalSecret,
  ADMIN_API_TOKEN: optionalSecret,
  EXPORT_SIGNING_SECRET: optionalSecret,
  SENTRY_DSN: optionalUrl,
  NEXT_PUBLIC_SENTRY_DSN: optionalUrl,
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

const productionRequiredKeys = [
  "NEXT_PUBLIC_SITE_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "ADMIN_API_TOKEN",
  "EXPORT_SIGNING_SECRET",
] as const;

export function isStaticHostingEnv(env: NodeJS.ProcessEnv = process.env) {
  return (
    env.GITHUB_PAGES === "true" ||
    env.NEXT_PUBLIC_STATIC_EXPORT === "true" ||
    env.DEPLOY_TARGET === "github-pages" ||
    env.NEXT_PUBLIC_RUNTIME_TARGET === "github-pages"
  );
}

export function readPublicEnv(env: NodeJS.ProcessEnv = process.env) {
  return publicEnvSchema.parse(env);
}

export function readServerEnv(env: NodeJS.ProcessEnv = process.env) {
  return serverEnvSchema.parse(env);
}

export function getMissingProductionEnv(env: NodeJS.ProcessEnv = process.env) {
  if (env.NODE_ENV !== "production" || isStaticHostingEnv(env)) return [];
  return productionRequiredKeys.filter((key) => !env[key]);
}

export function assertProductionEnv(env: NodeJS.ProcessEnv = process.env) {
  const parsed = serverEnvSchema.safeParse(env);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    };
  }

  const missing = getMissingProductionEnv(env);
  return {
    ok: missing.length === 0,
    issues: missing.map((key) => `${key} não configurada em produção`),
  };
}
