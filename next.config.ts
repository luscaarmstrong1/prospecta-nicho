import type { NextConfig } from "next";

const isStaticPreviewExport =
  process.env.GITHUB_PAGES === "true" || process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "prospecta-nicho";
const staticPreviewBasePath = process.env.NEXT_PUBLIC_BASE_PATH || `/${repositoryName}`;
const scriptSrc =
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com"
    : "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com";
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      scriptSrc,
      "connect-src 'self' https://challenges.cloudflare.com https://*.supabase.co https://api.resend.com https://api.mercadopago.com https://api.asaas.com",
      "form-action 'self'",
    ].join("; "),
  },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    if (isStaticPreviewExport) return [];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  ...(isStaticPreviewExport
    ? {
        output: "export" as const,
        basePath: staticPreviewBasePath,
        assetPrefix: staticPreviewBasePath,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
