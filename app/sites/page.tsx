import { ServiceLandingPage } from "@/components/seo/ServiceLandingPage";
import { createMetadata } from "@/lib/seo";

const description = "Sites institucionais responsivos que apresentam a empresa com clareza, autoridade, boa experiência e base técnica para SEO.";
export const metadata = createMetadata({ title: "Sites institucionais para empresas", description, path: "/sites" });

export default function SitesPage() {
  return <ServiceLandingPage eyebrow="Prospecta Web" title="Sites que transformam presença digital em oportunidade." description={description} path="/sites" serviceType="Desenvolvimento de sites institucionais" ctaLabel="Planejar meu site" ctaHref="/contato" sections={[
    { title: "Estrutura orientada ao negócio", description: "Conteúdo, navegação e chamadas para ação organizados conforme os serviços, o público e os objetivos da empresa." },
    { title: "Experiência responsiva", description: "Interfaces adaptadas para celular e desktop, com leitura clara, hierarquia visual e caminhos de contato acessíveis." },
    { title: "Base técnica para SEO", description: "Páginas semânticas, metadados, indexação e desempenho considerados desde a implementação." },
  ]} />;
}
