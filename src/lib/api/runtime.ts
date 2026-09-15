export const githubPagesRuntime = "github-pages";

export function normalizeBasePath(value?: string) {
  if (!value) return "";
  const clean = value.trim().replace(/\/+$/, "");
  if (!clean || clean === "/") return "";
  return clean.startsWith("/") ? clean : `/${clean}`;
}

export function isGithubPagesRuntime() {
  return (
    process.env.NEXT_PUBLIC_RUNTIME_TARGET === githubPagesRuntime ||
    process.env.DEPLOY_TARGET === githubPagesRuntime ||
    process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" ||
    process.env.GITHUB_PAGES === "true"
  );
}

export function getPublicBasePath() {
  return isGithubPagesRuntime() ? normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH || "/prospecta-nicho") : "";
}

export function withBasePath(path: string) {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:") || path.startsWith("mailto:") || path.startsWith("tel:")) {
    return path;
  }
  const [pathname, suffix = ""] = path.split(/(?=[?#])/);
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const basePath = getPublicBasePath();
  if (!basePath || cleanPath === basePath || cleanPath.startsWith(`${basePath}/`)) return `${cleanPath}${suffix}`;
  return `${basePath}${cleanPath}${suffix}`;
}

export function getSupabaseFunctionsBaseUrl() {
  const direct = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL?.replace(/\/+$/, "");
  if (direct) return direct;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  return supabaseUrl ? `${supabaseUrl}/functions/v1` : "";
}

type EdgeRoute = {
  functionName: string;
  resourceId?: string;
  action?: string;
};

export function resolveEdgeRoute(path: string): EdgeRoute | null {
  const url = new URL(path, "https://prospectanicho.local");
  const pathname = url.pathname;

  if (pathname === "/api/contact") return { functionName: "public-contact" };
  if (pathname === "/api/free-sample-request" || pathname === "/api/sample-request") {
    return { functionName: "public-sample-request" };
  }
  if (pathname === "/api/custom-base-request" || pathname === "/api/custom-requests") {
    return { functionName: "public-create-request" };
  }
  if (pathname === "/api/public/request-status") return { functionName: "public-request-status" };
  if (pathname === "/api/health") return { functionName: "health" };
  if (pathname === "/api/admin/session") return { functionName: "admin-login" };
  if (pathname === "/api/admin/publish") return { functionName: "admin-update-request", action: "publish-content" };

  const requestAction = pathname.match(/^\/api\/admin\/requests\/([^/]+)\/([^/]+)$/);
  if (requestAction) {
    const [, resourceId, action] = requestAction;
    const functionByAction: Record<string, string> = {
      validate: "admin-update-request",
      process: "admin-process-request",
      "create-job": "admin-create-job",
      "mark-paid": "admin-mark-paid",
      "mark-delivered": "admin-mark-delivered",
      "mark-enrichment-paid": "admin-mark-enrichment-paid",
      "run-enrichment": "admin-run-enrichment",
      "offer-enrichment": "admin-offer-enrichment",
      "enable-enrichment": "admin-offer-enrichment",
    };
    return { functionName: functionByAction[action] || "admin-update-request", resourceId, action };
  }

  const jobAction = pathname.match(/^\/api\/admin\/jobs\/([^/]+)\/complete$/);
  if (jobAction) return { functionName: "admin-exports", resourceId: jobAction[1], action: "complete-job" };

  const exportAction = pathname.match(/^\/api\/admin\/exports\/([^/]+)\/sign-url$/);
  if (exportAction) return { functionName: "admin-sign-export", resourceId: exportAction[1], action: "sign-url" };

  return null;
}
