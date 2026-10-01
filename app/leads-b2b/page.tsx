import { ServiceLandingPage } from "@/components/seo/ServiceLandingPage";
import { createMetadata } from "@/lib/seo";

const description = "Bases de leads B2B organizadas por segmento, CNAE, região, porte e contexto comercial para apoiar uma prospecção mais objetiva.";
export const metadata = createMetadata({ title: "Leads B2B segmentados para prospecção", description, path: "/leads-b2b" });

export default function LeadsB2BPage() {
  return <ServiceLandingPage eyebrow="Prospecta Dados" title="Leads B2B segmentados para o seu mercado." description={description} path="/leads-b2b" serviceType="Inteligência comercial e bases B2B" ctaLabel="Solicitar uma base" ctaHref="/solicitar-planilha" sections={[
    { title: "Segmentação por atividade", description: "Defina nicho, CNAE e perfil empresarial para concentrar a pesquisa nas empresas relevantes para sua oferta." },
    { title: "Recorte geográfico", description: "Combine estados, cidades e regiões de interesse para organizar territórios e campanhas comerciais." },
    { title: "Dados públicos organizados", description: "Receba informações empresariais públicas em uma estrutura pronta para análise e prospecção responsável." },
  ]} />;
}
