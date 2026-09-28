import type { Metadata } from "next";
import { HomeSiteV2 } from "@/components/home-v2/HomeSiteV2";
import { site } from "@/lib/site";
import { serializeJsonLd } from "@/lib/structured-data";
// Preserve contract for platform rules: buildQuickRequestHref
export const metadata: Metadata = {
  title: "ProspectaNicho | Bases B2B Segmentadas para Prospecção",
  description:
    "Encontre empresas para prospecção com bases B2B segmentadas por nicho, região e perfil comercial. Solicite uma amostra ou monte uma base personalizada.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ProspectaNicho | Bases B2B Segmentadas para Prospecção",
    description: "Bases B2B segmentadas por nicho, região e perfil comercial para apoiar sua prospecção.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProspectaNicho | Bases B2B Segmentadas para Prospecção",
    description: "Bases B2B segmentadas por nicho, região e perfil comercial para apoiar sua prospecção.",
  },
};

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        url: site.url,
        inLanguage: "pt-BR",
      },
      {
        "@type": "Service",
        "@id": `${site.url}/#bases-b2b`,
        name: "Bases B2B segmentadas para prospecção",
        description:
          "Bases empresariais organizadas por nicho, região e perfil comercial para apoiar operações de prospecção B2B.",
        provider: {
          "@id": `${site.url}/#organization`,
        },
        areaServed: {
          "@type": "Country",
          name: "Brasil",
        },
        serviceType: "Inteligência comercial B2B",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <HomeSiteV2 includeHeaderFooter={false} />
    </>
  );
}
