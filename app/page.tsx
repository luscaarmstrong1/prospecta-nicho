import { ArrowRight, BadgeCheck, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { BrandWatermark } from "@/components/BrandWatermark";
import { ButtonLink } from "@/components/ButtonLink";
import { LeadDeliveryPreview } from "@/components/LeadDeliveryPreview";
import { ProductSignalCard } from "@/components/ProductSignalCard";
import { SampleConversionSection } from "@/components/SampleConversionSection";
import { CuratedShowcaseHero } from "@/features/home/CuratedShowcaseHero";
import { assetPath } from "@/lib/asset-path";
import { buildQuickRequestHref, segmentCards } from "@/lib/segments";
import { createWhatsAppLink, defaultWhatsAppMessage } from "@/lib/whatsapp";
import { isExternalHref, products } from "@/lib/site";

const impactCards = [
  "Critérios definidos antes da busca",
  "Campos úteis para abordagem",
  "Planilha pronta para rotina comercial",
  "Suporte para ajustar o recorte",
];

export default function HomePage() {
  const mainProducts = products.filter((product) => product.slug !== "amostra-gratuita").slice(0, 4);
  const whatsappHref = createWhatsAppLink(defaultWhatsAppMessage);

  return (
    <>
      <CuratedShowcaseHero />

      <section className="section section--light delivery-section">
        <div className="container-wide delivery-grid">
          <div>
            <p className="eyebrow">DEMONSTRAÇÃO DA ENTREGA</p>
            <h2 className="h2">Veja como sua base chega para a equipe comercial.</h2>
            <p className="lead">
              Uma prévia simples do formato: empresa, segmento, cidade, CNAE, porte, abertura e status comercial
              ilustrativo, com dados fictícios e mascarados.
            </p>
            <div className="impact-stack">
              {impactCards.map((item) => (
                <span key={item}>
                  <BadgeCheck size={18} />
                  {item}
                </span>
              ))}
            </div>
            <div className="btn-row delivery-actions">
              <ButtonLink href="/produtos/amostra-gratuita" variant="teal">
                Solicitar tabela grátis de teste
                <ArrowRight size={18} />
              </ButtonLink>
              <ButtonLink href="/como-funciona" variant="secondary">
                Entender a entrega
              </ButtonLink>
            </div>
          </div>
          <LeadDeliveryPreview />
        </div>
      </section>

      <section className="section commercial-bases-section">
        <div className="container-wide">
          <div className="section-kicker">
            <p className="eyebrow">Bases comerciais</p>
            <h2 className="h2">Escolha o gatilho comercial da sua próxima venda.</h2>
            <p className="lead">
              Comece com uma base pronta ou solicite um recorte personalizado quando o público pedir filtros mais
              específicos.
            </p>
          </div>
          <div className="product-signal-grid">
            {mainProducts.map((product) => (
              <ProductSignalCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section conversion-system-section">
        <div className="container-wide conversion-system-grid">
          <div className="conversion-system-copy">
            <p className="eyebrow">OPERAÇÃO GUIADA</p>
            <h2 className="h2">Do nicho ao atendimento, cada etapa deixa a prospecção mais clara.</h2>
            <p className="lead">
              O pedido fica mais claro antes da entrega: público, critérios, formato e próximo passo comercial.
            </p>
            <div className="conversion-system-proof">
              <ShieldCheck size={20} />
              <span>Na base personalizada, a validação de escopo vem antes da cobrança.</span>
            </div>
            <div className="btn-row">
              <ButtonLink href={buildQuickRequestHref("agencias", "guided-flow")} variant="teal">
                Solicitar planilha rápida
                <ArrowRight size={18} />
              </ButtonLink>
              <ButtonLink href="/como-funciona" variant="secondary">
                Ver como funciona
              </ButtonLink>
            </div>
          </div>
          <div className="conversion-system-visual" aria-label="Fluxo comercial ilustrativo da ProspectaNicho">
            <picture>
              <source media="(max-width: 680px)" srcSet={assetPath("/assets/images/sections/operacao-guiada-mobile.webp")} />
              <img
                src={assetPath("/assets/images/sections/operacao-guiada.webp")}
                alt="Imagem ilustrativa da operação guiada da ProspectaNicho do nicho ao atendimento"
              />
            </picture>
            <div className="conversion-system-overlay">
              <span>Pedido validado</span>
              <strong>Critérios claros antes da entrega</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section dark-band segment-band">
        <BrandWatermark tone="light" />
        <div className="container-wide">
          <div className="section-kicker">
            <p className="eyebrow eyebrow--dark">Para quem é</p>
            <h2 className="h2">Uma base melhor começa com um público melhor definido.</h2>
          </div>
          <div className="segment-labels">
            {segmentCards.map((segment) => (
              <Link
                href={buildQuickRequestHref(segment.id)}
                key={segment.id}
                aria-label={`${segment.label}: ${segment.description}`}
              >
                <strong>{segment.title}</strong>
                <span>{segment.description}</span>
                <em>Solicitar base para este segmento</em>
              </Link>
            ))}
          </div>
          <ButtonLink href="/montar-minha-base" variant="teal">
            Montar meu recorte
          </ButtonLink>
        </div>
      </section>

      <SampleConversionSection />

      <section className="section final-cta">
        <BrandWatermark tone="light" />
        <div className="container-reading">
          <h2 className="h2">Menos tempo procurando. Mais tempo falando com empresas que fazem sentido.</h2>
          <p className="lead">
            Transforme seu público ideal em uma base pronta para prospecção, com critérios claros e validação humana.
          </p>
          <div className="btn-row">
            <ButtonLink href="/montar-minha-base" variant="teal">
              Montar minha base
            </ButtonLink>
            {whatsappHref ? (
              <ButtonLink href={whatsappHref} variant="secondary" external={isExternalHref(whatsappHref)}>
                <MessageCircle size={18} />
                Falar sobre meu público
              </ButtonLink>
            ) : (
              <ButtonLink href="/produtos" variant="secondary">
                Ver bases a partir de R$ 147
              </ButtonLink>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
