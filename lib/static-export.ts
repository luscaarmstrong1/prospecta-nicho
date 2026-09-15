export const isStaticExport =
  process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" ||
  process.env.GITHUB_PAGES === "true" ||
  process.env.DEPLOY_TARGET === "github-pages" ||
  process.env.NEXT_PUBLIC_RUNTIME_TARGET === "github-pages";
