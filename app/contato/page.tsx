import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, createMetadata } from "@/lib/seo";
import { createWhatsAppLink, defaultWhatsAppMessage } from "@/lib/whatsapp";

export const metadata: Metadata = createMetadata({
  title: "Contato",
  description: "Fale com a Prospecta Nicho sobre leads B2B, sites, landing pages, automação, pedidos, parcerias ou privacidade.",
  path: "/contato",
});

export default function ContactPage() {
  const whatsappHref = createWhatsAppLink(defaultWhatsAppMessage);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Contato", path: "/contato" }])} />
      <section className="hero">
        <div className="container-wide">
          <p className="eyebrow">Contato</p>
          <h1 className="h1">Fale sobre o público que você quer alcançar.</h1>
          <p className="lead">
            Conte qual é sua operação comercial e a ProspectaNicho orienta o melhor formato de base para seu objetivo.
          </p>
        </div>
      </section>
      <section className="section section--light">
        <div className="container-wide split-section">
          <div className="card">
            <p className="eyebrow">Quando usar este canal</p>
            <h2 className="h2">Suporte, pedidos e privacidade.</h2>
            <p className="lead">
              Use o contato para dúvidas comerciais, suporte de pedido, pagamento, parcerias, solicitações fora do editor
              ou temas de privacidade e supressão.
            </p>
            <div className="value-list">
              <span>Critérios definidos antes da entrega</span>
              <span>Campos confirmados conforme disponibilidade</span>
              <span>Formato preparado para rotina comercial</span>
              <span>Suporte humano para validar o recorte</span>
            </div>
            {whatsappHref ? (
              <a className="button button--teal" href={whatsappHref} target="_blank" rel="noopener noreferrer" style={{ marginTop: 22 }}>
                <MessageCircle size={18} />
                Falar sobre meu público no WhatsApp
              </a>
            ) : null}
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
