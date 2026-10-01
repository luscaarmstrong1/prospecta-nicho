import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Planos e bases B2B",
  description: "Conheça opções de bases de empresas da Prospecta Nicho e solicite um recorte alinhado à sua operação comercial.",
  path: "/planos",
});

export default function PlanosLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Planos", path: "/planos" }])} />
      {children}
    </>
  );
}
