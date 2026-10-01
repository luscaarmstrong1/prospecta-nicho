import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { HomeSiteV2 } from "@/components/home-v2/HomeSiteV2";
import { createMetadata, organizationReference } from "@/lib/seo";
import { site } from "@/lib/site";

// Preserve contract for platform rules: buildQuickRequestHref
const title = "Bases B2B Segmentadas para Prospecção";
const description =
  "Encontre empresas para prospecção com bases B2B segmentadas por nicho, região e perfil comercial. Solicite uma amostra ou monte uma base personalizada.";

export const metadata: Metadata = {
  ...createMetadata({
    title,
    description,
    path: "/leads",
  }),
  title: {
    absolute: "ProspectaNicho | Leads B2B Segmentados para Prospecção",
  },
};

export default function LeadsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${site.url}/leads#webpage`,
        name: "Leads B2B Segmentados para Prospecção",
        url: `${site.url}/leads`,
        inLanguage: "pt-BR",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${site.url}/#website`,
        },
      },
      {
        "@type": "Service",
        "@id": `${site.url}/leads#service`,
        name: "Bases B2B segmentadas para prospecção",
        description,
        provider: organizationReference(),
        areaServed: {
          "@type": "Country",
          name: "Brasil",
        },
        serviceType: "Inteligência comercial e Leads B2B",
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <HomeSiteV2 includeHeaderFooter={false} />
    </>
  );
}
