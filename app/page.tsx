import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { HomeSiteV2 } from "@/components/home-v2/HomeSiteV2";
import { createMetadata, organizationReference } from "@/lib/seo";
import { site } from "@/lib/site";
// Preserve contract for platform rules: buildQuickRequestHref
export const metadata: Metadata = {
  ...createMetadata({ title: "Leads B2B, Sites, Landing Pages e Automação", description: site.description, path: "/" }),
  title: { absolute: "Prospecta Nicho | Leads B2B, Sites, Landing Pages e Automação" },
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
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <HomeSiteV2 includeHeaderFooter={false} />
    </>
  );
}
