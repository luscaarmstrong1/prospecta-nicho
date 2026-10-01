import { ServiceLandingPage } from "@/components/seo/ServiceLandingPage";
import { createMetadata } from "@/lib/seo";

const description = "Automação de formulários, atendimento, CRM e rotinas comerciais para reduzir tarefas repetitivas e dar continuidade aos contatos.";
export const metadata = createMetadata({ title: "Automação comercial e integrações", description, path: "/automacao" });

export default function AutomacaoPage() {
  return <ServiceLandingPage eyebrow="Prospecta Flow" title="Automação para manter oportunidades em movimento." description={description} path="/automacao" serviceType="Automação comercial e integrações" ctaLabel="Mapear meu processo" ctaHref="/contato" sections={[
    { title: "Entrada organizada", description: "Conecte formulários e canais de contato para registrar cada oportunidade com origem e contexto." },
    { title: "Rotinas comerciais", description: "Distribuição, alertas, tarefas e acompanhamentos podem seguir regras adequadas ao processo da equipe." },
    { title: "Integrações úteis", description: "CRM, WhatsApp, e-mail e relatórios podem participar de um fluxo único, conforme a viabilidade de cada serviço." },
  ]} />;
}
