import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProspectaWebPage } from "@/components/prospecta-web/ProspectaWebPage";
import { createMetadata, organizationReference } from "@/lib/seo";
import { site } from "@/lib/site";

// Preserve contract for platform rules: buildQuickRequestHref
// Prospecta Nicho | Leads B2B, Sites, Landing Pages e Automação
const title = "Sites & Landing Pages que transformam presença em negócios";
const description =
  "A ProspectaNicho desenvolve páginas profissionais, responsivas e pensadas para conversão, ajudando sua empresa a atrair mais clientes e gerar mais resultados.";

export const metadata: Metadata = {
  ...createMetadata({
    title,
    description,
    path: "/",
  }),
  title: {
    absolute: "ProspectaNicho | Sites & Landing Pages Profissionais",
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
        publisher: organizationReference(),
      },
      {
        "@type": "Service",
        "@id": `${site.url}/#sites-landing-pages`,
        name: "Criação de Sites e Landing Pages",
        description,
        provider: organizationReference(),
        areaServed: {
          "@type": "Country",
          name: "Brasil",
        },
        serviceType: "Sites e Landing Pages Profissionais",
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ProspectaWebPage />
    </>
  );
}
