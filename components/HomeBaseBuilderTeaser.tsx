"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { assetPath } from "@/lib/asset-path";
import { getSegmentAsset } from "@/lib/segment-assets";
import { getSegmentById, segmentCards } from "@/lib/segments";

const audiences = segmentCards.slice(0, 8);

const periods = [
  "últimos 30 dias",
  "últimos 60 dias",
  "últimos 90 dias",
  "últimos 6 meses",
  "sem filtro de abertura",
];

export function HomeBaseBuilderTeaser() {
  const router = useRouter();
  const [segment, setSegment] = useState("agencias");
  const [city, setCity] = useState("");
  const [period, setPeriod] = useState("últimos 90 dias");
  const selectedSegment = getSegmentById(segment);
  const selectedAsset = getSegmentAsset(selectedSegment.id);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ segment, source: "home-quick-request" });
    if (city.trim()) params.set("city", city.trim());
    if (period) params.set("period", period);
    router.push(`/solicitar-planilha?${params.toString()}`);
  }

  return (
    <section className="section section--light builder-teaser-section">
      <div className="container-wide split-section">
        <div>
          <p className="eyebrow">Solicitação rápida</p>
          <h2 className="h2">Peça uma planilha sem passar pelo fluxo longo.</h2>
          <p className="lead">
            Escolha segmento, região e momento da empresa. Se precisar de filtros avançados, refinamos depois no
            montador completo.
          </p>
          <form className="builder-mini-form" onSubmit={submit}>
            <div className="teaser-choice-group">
              <span>Para quem você quer vender?</span>
              <div className="chip-grid" role="listbox" aria-label="Público desejado">
                {audiences.map((option) => (
                  <button
                    className="choice-chip"
                    data-active={segment === option.id}
                    type="button"
                    key={option.id}
                    onClick={() => setSegment(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="floating-field">
              <span>Em qual cidade ou região?</span>
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Digite uma cidade, região ou UF"
              />
            </label>
            <div className="teaser-choice-group">
              <span>Empresas abertas há quanto tempo?</span>
              <div className="chip-grid quick-period-options" role="listbox" aria-label="Período de abertura">
                {periods.map((option) => (
                  <button
                    className="choice-chip"
                    data-active={period === option}
                    type="button"
                    key={option}
                    onClick={() => setPeriod(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <button className="button button--primary" type="submit">
              Solicitar esta planilha
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
        <div className="teaser-radar-panel">
          <div className="teaser-radar-head">
            <span className="badge">Pedido rápido</span>
            <h3 className="h3">{selectedSegment.label} {city ? `em ${city}` : "com região a definir"}</h3>
          </div>
          {selectedAsset ? (
            <picture className="teaser-segment-media">
              <source media="(max-width: 680px)" srcSet={assetPath(selectedAsset.mobileImage)} />
              <img src={assetPath(selectedAsset.image)} alt={selectedAsset.alt} />
            </picture>
          ) : null}
          <div className="signal-chips">
            <span>{selectedSegment.label}</span>
            <span>{city || "Cidade ou região"}</span>
            <span>ME e EPP</span>
            <span>{period}</span>
            <span>Excel</span>
          </div>
        </div>
      </div>
    </section>
  );
}
