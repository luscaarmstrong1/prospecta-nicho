import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, createMetadata } from "@/lib/seo";

const description = "Guias e referências da Prospecta Nicho sobre leads B2B, sites, landing pages, automação e presença digital.";
export const metadata = createMetadata({ title: "Conteúdo sobre crescimento B2B", description, path: "/conteudo" });

export default function ConteudoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Conteúdo", path: "/conteudo" }])} />{children}</>;
}
