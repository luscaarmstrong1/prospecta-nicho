import type { Metadata } from "next";
import { ProspectaWebPage } from "@/components/prospecta-web/ProspectaWebPage";
import { site } from "@/lib/site";
import { serializeJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Sites e Landing Pages Profissionais",
  description:
    "Sites e landing pages profissionais, responsivos e desenvolvidos para fortalecer sua presença digital e gerar novas oportunidades para sua empresa.",
  alternates: {
    canonical: "/solucoes/sites-landing-pages",
  },
  openGraph: {
    title: "Sites e Landing Pages Profissionais | ProspectaNicho",
    description:
      "Sites e landing pages profissionais, responsivos e desenvolvidos para fortalecer sua presença digital e gerar novas oportunidades para sua empresa.",
    type: "website",
    url: `${site.url}/solucoes/sites-landing-pages`,
    images: [`${site.url}/assets/brand/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sites e Landing Pages Profissionais | ProspectaNicho",
    description:
      "Sites e landing pages profissionais, responsivos e desenvolvidos para fortalecer sua presença digital e gerar novas oportunidades para sua empresa.",
  },
};

export default function SitesLandingPagesRoute() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Prospecta Web | Sites & Landing Pages",
    serviceType: "Desenvolvimento de Sites e Landing Pages",
    provider: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: `${site.url}/assets/brand/logo-pn-final-dark.png`,
    },
    description:
      "Sites e landing pages profissionais, responsivos e desenvolvidos para fortalecer sua presença digital e gerar novas oportunidades para sua empresa.",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      areaServed: "BR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceJsonLd) }}
      />
      <ProspectaWebPage />
    </>
  );
}
