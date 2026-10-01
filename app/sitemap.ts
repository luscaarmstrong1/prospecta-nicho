import type { MetadataRoute } from "next";
import { products, site } from "@/lib/site";

export const dynamic = "force-static";

const indexableRoutes = [
  ["/", "weekly", 1],
  ["/leads-b2b", "monthly", 0.9],
  ["/sites", "monthly", 0.9],
  ["/landing-pages", "monthly", 0.9],
  ["/automacao", "monthly", 0.9],
  ["/projetos", "monthly", 0.8],
  ["/solucoes", "monthly", 0.8],
  ["/segmentos", "monthly", 0.8],
  ["/planos", "monthly", 0.8],
  ["/conteudo", "weekly", 0.7],
  ["/sobre", "monthly", 0.7],
  ["/contato", "monthly", 0.7],
  ["/produtos", "monthly", 0.8],
  ["/para-quem-e", "monthly", 0.7],
  ["/como-funciona", "monthly", 0.7],
  ["/campos-da-base", "monthly", 0.6],
  ["/faq", "monthly", 0.6],
  ["/amostra", "monthly", 0.7],
  ["/politica-de-privacidade", "yearly", 0.3],
  ["/politica-de-cookies", "yearly", 0.3],
  ["/politica-de-supressao", "yearly", 0.3],
  ["/termos-de-uso", "yearly", 0.3],
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...indexableRoutes.map(([route, changeFrequency, priority]) => ({
      url: `${site.url}${route === "/" ? "" : route}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...products.map((product) => ({ url: `${site.url}/produtos/${product.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
