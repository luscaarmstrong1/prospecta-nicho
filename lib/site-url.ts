const productionUrl = "https://prospectanicho.com.br";
// cspell:ignore luscaarmstrong
const blockedPublicHosts = /localhost|127\.0\.0\.1|:3000|:3001|github\.io|luscaarmstrong1/i;
const allowStaticPreviewUrl =
  process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" ||
  process.env.NEXT_PUBLIC_ALLOW_GITHUB_PAGES === "true" ||
  process.env.GITHUB_PAGES === "true";

function cleanBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function isPreviewEnvironment() {
  return process.env.NEXT_PUBLIC_DEPLOY_ENV === "preview" || process.env.VERCEL_ENV === "preview";
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || productionUrl;
  if (blockedPublicHosts.test(configured) && !allowStaticPreviewUrl) return productionUrl;
  const normalized = configured.startsWith("http") ? configured : `https://${configured}`;
  return cleanBaseUrl(normalized);
}

export function getAbsoluteUrl(path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${cleanPath}`;
}
