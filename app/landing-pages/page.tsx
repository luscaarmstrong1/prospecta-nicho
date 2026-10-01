import { ServiceLandingPage } from "@/components/seo/ServiceLandingPage";
import { createMetadata } from "@/lib/seo";

const description = "Landing pages para campanhas, ofertas e captação de contatos, com mensagem direta, formulário, WhatsApp e chamadas para conversão.";
export const metadata = createMetadata({ title: "Landing pages para campanhas e conversão", description, path: "/landing-pages" });

export default function LandingPagesPage() {
  return <ServiceLandingPage eyebrow="Prospecta Web" title="Landing pages focadas em uma ação clara." description={description} path="/landing-pages" serviceType="Desenvolvimento de landing pages" ctaLabel="Criar uma landing page" ctaHref="/contato" sections={[
    { title: "Mensagem objetiva", description: "A oferta, o benefício e a ação esperada aparecem com clareza para reduzir distrações durante a campanha." },
    { title: "Captação integrada", description: "Formulários e contato por WhatsApp podem ser conectados ao fluxo comercial definido para a operação." },
    { title: "Medição e evolução", description: "A estrutura permite acompanhar eventos e ajustar conteúdo, origem de tráfego e conversão ao longo do tempo." },
  ]} />;
}
