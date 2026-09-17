import { CalendarDays, Map, MonitorSmartphone, ScrollText, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { ProductVisual } from "@/components/ProductVisual";
import type { Product } from "@/lib/site";
import { isExternalHref, productHref, productPrimaryHref } from "@/lib/site";

const visualIcons = {
  "empresas-recem-abertas": CalendarDays,
  "agencias-marketing": MonitorSmartphone,
  contabilidades: ScrollText,
  "base-personalizada": SlidersHorizontal,
};

const visualVariants = {
  "empresas-recem-abertas": "calendar",
  "agencias-marketing": "marketing",
  contabilidades: "accounting",
  "base-personalizada": "custom",
} as const;

const copyBySlug: Record<string, { title: string; promise: string; audience: string; delivery: string; cta: string }> = {
  "empresas-recem-abertas": {
    title: "Empresas recém-abertas",
    promise: "Entre na conversa quando a empresa ainda está estruturando fornecedores, presença e operação.",
    audience: "Agências, contabilidades, ERP, certificado digital e comunicação visual.",
    delivery: "Planilha organizada para Excel ou Google Sheets.",
    cta: "Escolher esta base",
  },
  "agencias-marketing": {
    title: "Base para agências",
    promise: "Encontre empresas com potencial para site, tráfego, social media, branding e presença digital.",
    audience: "Agências, social medias, web designers e consultores de marketing.",
    delivery: "Recorte pronto para abordagem consultiva.",
    cta: "Escolher esta base",
  },
  contabilidades: {
    title: "Base para contabilidades",
    promise: "Aproxime-se de empresas recém-abertas antes da concorrência.",
    audience: "Escritórios contábeis, BPO financeiro e certificado digital.",
    delivery: "Planilha com critérios comerciais e cadastrais.",
    cta: "Escolher esta base",
  },
  "base-personalizada": {
    title: "Base personalizada",
    promise: "Defina cidade, nicho, porte, período e campos desejados para uma validação de escopo.",
    audience: "Operações B2B com público específico ou território definido.",
    delivery: "Recorte validado antes da confirmação final.",
    cta: "Montar meu recorte",
  },
};

export function ProductSignalCard({ product }: { product: Product }) {
  const Icon = visualIcons[product.slug as keyof typeof visualIcons] || Map;
  const href = productPrimaryHref(product);
  const copy = copyBySlug[product.slug] || {
    title: product.shortName,
    promise: product.description,
    audience: product.audience.join(", "),
    delivery: "Planilha organizada para rotina comercial.",
    cta: product.homeCta || "Escolher esta base",
  };

  return (
    <article
      className={[
        "product-signal-card",
        product.slug === "empresas-recem-abertas" ? "product-signal-card--featured" : "",
        product.slug === "base-personalizada" ? "product-signal-card--wide" : "",
      ].filter(Boolean).join(" ")}
    >
      <ProductVisual icon={Icon} variant={visualVariants[product.slug as keyof typeof visualVariants] || "custom"} />
      <span className="badge">{product.badge}</span>
      <h3 className="h3">{copy.title}</h3>
      <p>{copy.promise}</p>
      <p className="muted"><strong>Indicado para:</strong> {copy.audience}</p>
      <strong className="price">{product.price}</strong>
      <p className="muted">{copy.delivery}</p>
      <ButtonLink href={href} variant="primary" external={isExternalHref(href)}>
        {copy.cta}
      </ButtonLink>
      <Link className="secondary-link" href={productHref(product)}>
        Ver campos e detalhes
      </Link>
    </article>
  );
}
