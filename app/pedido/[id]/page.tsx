import type { Metadata } from "next";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { getPublicRequestStatusForProtocol } from "@/src/server/services/crm";

type Params = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: "demo" }];
}

export const metadata: Metadata = {
  title: "Pedido",
  robots: { index: false, follow: false },
};

export default async function PedidoPage({ params }: Params) {
  const { id } = await params;
  const status = await getPublicRequestStatusForProtocol(id);
  const whatsapp = createWhatsAppLink(`Ola, quero falar sobre o pedido ${id} da ProspectaNicho.`);

  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Pedido</p>
        <h1 className="h1">Acompanhamento do pedido {id}</h1>
        <div className="legal-card">
          {status ? (
            <>
              <p>Status atual: {status.status}.</p>
              <p>
                Produto: {status.product}. Segmento: {status.segment}. Região:{" "}
                {[status.city, status.uf].filter(Boolean).join("/") || "a validar"}.
              </p>
              <p>
                Arquivos finais não ficam públicos nesta página. Quando o export estiver pronto, a equipe envia a planilha
                pelo canal combinado.
              </p>
            </>
          ) : (
            <>
              <p>Pedido não encontrado nesta instância.</p>
              <p>
                Se você acabou de enviar a solicitação, aguarde a confirmação ou fale com a equipe informando o protocolo.
              </p>
            </>
          )}
          {whatsapp ? (
            <a className="button button--teal" href={whatsapp} target="_blank" rel="noopener noreferrer">
              Falar sobre meu pedido
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
