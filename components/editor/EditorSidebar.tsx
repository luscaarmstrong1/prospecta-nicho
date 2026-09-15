"use client";

import { Copy, RotateCcw } from "lucide-react";
import { LeadPreview } from "@/components/editor/LeadPreview";
import { estimateInvestment, recommendProduct, serializePublicFilters, summarizeBuilder } from "@/lib/editor-utils";
import { withBasePath } from "@/src/lib/api/runtime";
import type { BaseBuilderData } from "@/types/editor";

type Props = {
  data: BaseBuilderData;
  onClear: () => void;
};

export function EditorSidebar({ data, onClear }: Props) {
  const recommendation = recommendProduct(data);
  const investment = estimateInvestment(recommendation);
  const query = serializePublicFilters(data);

  async function copyShareLink() {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${withBasePath(`/montar-minha-base${query ? `?${query}` : ""}`)}`;
    await navigator.clipboard?.writeText(url);
  }

  return (
    <aside className="editor-sidebar" aria-label="Resumo do recorte comercial">
      <div className="sidebar-card">
        <p className="eyebrow">Seu recorte comercial</p>
        <h2 className="h3">{summarizeBuilder(data)}</h2>
        <dl className="summary-list">
          <div><dt>Objetivo</dt><dd>{data.goal || "A definir"}</dd></div>
          <div><dt>Segmento</dt><dd>{data.segment || data.audience || "A definir"}</dd></div>
          <div><dt>Região</dt><dd>{[data.city, data.state].filter(Boolean).join(" / ") || data.region || "A definir"}</dd></div>
          <div><dt>Porte</dt><dd>{data.companySize.join(", ") || "A definir"}</dd></div>
          <div><dt>Período</dt><dd>{data.openedPeriod || "A definir"}</dd></div>
          <div><dt>Volume</dt><dd>{data.quantityRange || "A definir"}</dd></div>
          <div><dt>Formato</dt><dd>{data.deliveryFormat || "A definir"}</dd></div>
        </dl>
      </div>

      <div className="sidebar-card sidebar-card--accent">
        <span className="badge">Produto recomendado</span>
        <h3 className="h3">{recommendation}</h3>
        <p className="price">{investment}</p>
        <p className="muted">
          {recommendation === "Base Personalizada"
            ? "O valor final depende de volume, filtros e disponibilidade."
            : "Produto pronto com checkout quando o link estiver configurado."}
        </p>
      </div>

      <LeadPreview data={data} />

      <div className="sidebar-actions">
        <button type="button" className="button button--secondary" onClick={copyShareLink}>
          <Copy size={17} />
          Compartilhar filtros
        </button>
        <button type="button" className="button button--secondary" onClick={onClear}>
          <RotateCcw size={17} />
          Limpar configuração
        </button>
      </div>
    </aside>
  );
}
