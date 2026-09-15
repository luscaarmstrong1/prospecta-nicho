export function env(name: string) {
  return Deno.env.get(name) || "";
}

export function publicSiteUrl() {
  return env("NEXT_PUBLIC_SITE_URL") || "https://luscaarmstrong1.github.io/prospecta-nicho";
}
