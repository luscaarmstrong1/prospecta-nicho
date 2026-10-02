import type { Metadata } from "next";
import { ContactView } from "@/components/contact/ContactView";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, createMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { serializeJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = createMetadata({
  title: "Contato",
  description:
    "Fale com a Prospecta Nicho sobre Leads B2B, sites, landing pages, automação, suporte e novas oportunidades para o seu negócio.",
  path: "/contato",
});

export default function ContatoPage() {
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contato | Prospecta Nicho",
    url: "https://prospectanicho.app/contato/",
    description:
      "Fale com a Prospecta Nicho sobre Leads B2B, sites, landing pages, automação, suporte e novas oportunidades para o seu negócio.",
    mainEntity: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      email: site.email,
    },
  };

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Contato", path: "/contato" },
        ])}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(contactPageSchema) }}
      />
      <ContactView email={site.email} />
    </>
  );
}
