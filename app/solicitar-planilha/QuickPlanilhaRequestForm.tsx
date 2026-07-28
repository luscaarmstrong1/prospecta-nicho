"use client";

import { ArrowRight, MessageCircle, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { assetPath } from "@/lib/asset-path";
import { getSegmentAsset } from "@/lib/segment-assets";
import { buildQuickRequestHref, getSegmentById, segmentCards } from "@/lib/segments";
import { isStaticExport } from "@/lib/static-export";
import { createWhatsAppLink } from "@/lib/whatsapp";

const periodOptions = [
  "últimos 30 dias",
  "últimos 60 dias",
  "últimos 90 dias",
  "últimos 6 meses",
  "sem filtro de abertura",
];

type FormState = {
  segment: string;
  location: string;
  state: string;
  period: string;
  name: string;
  whatsapp: string;
  quantity: string;
  company: string;
  email: string;
  notes: string;
  companySite: string;
  consent: boolean;
};

type SuccessState = {
  id?: string;
  whatsappUrl?: string;
  summary?: {
    segment?: string;
    location?: string;
    state?: string;
    period?: string;
    quantity?: string;
  };
};

function createIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function QuickPlanilhaRequestForm() {
  const searchParams = useSearchParams();
  const initialSegment = useMemo(() => getSegmentById(searchParams.get("segment")), [searchParams]);
  const source = searchParams.get("source") || "quick-request-page";
  const [idempotencyKey] = useState(createIdempotencyKey);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    segment: initialSegment.id,
    location: searchParams.get("city") || "",
    state: searchParams.get("state") || "",
    period: searchParams.get("period") || "últimos 90 dias",
    name: "",
    whatsapp: "",
    quantity: "",
    company: "",
    email: "",
    notes: "",
    companySite: "",
    consent: false,
  });

  const selectedSegment = getSegmentById(form.segment);
  const selectedAsset = getSegmentAsset(selectedSegment.id);
  const refineHref = `/montar-minha-base?segment=${encodeURIComponent(selectedSegment.id)}&audience=${encodeURIComponent(selectedSegment.label)}`;

  function updateField(field: keyof FormState, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.companySite) return;

    setError("");
    setIsSubmitting(true);

    if (isStaticExport) {
      const whatsappMessage =
        `Olá, quero solicitar uma planilha da ProspectaNicho.\n` +
        `Segmento: ${selectedSegment.label}\n` +
        `Região: ${form.location}${form.state ? `/${form.state}` : ""}\n` +
        `Período: ${form.period}\n` +
        `Nome: ${form.name}`;

      setIsSubmitting(false);
      setSuccess({
        id: `static-${idempotencyKey}`,
        whatsappUrl: createWhatsAppLink(whatsappMessage),
        summary: {
          segment: selectedSegment.label,
          location: form.location,
          state: form.state,
          period: form.period,
          quantity: form.quantity,
        },
      });
      return;
    }

    let response: Response;
    try {
      response = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source, idempotencyKey }),
      });
    } catch {
      setIsSubmitting(false);
      setError("Não foi possível conectar agora. Tente novamente em instantes ou chame pelo WhatsApp.");
      return;
    }
    const payload = (await response.json().catch(() => ({}))) as SuccessState & { ok?: boolean; message?: string };

    setIsSubmitting(false);
    if (!response.ok || payload.ok === false) {
      setError(payload.message || "Não foi possível salvar a solicitação agora.");
      return;
    }

    setSuccess(payload);
  }

  if (success) {
    return (
      <section className="section section--light quick-request-page">
        <div className="container-wide quick-request-layout">
          <div className="quick-request-copy">
            <p className="eyebrow">Solicitação recebida</p>
            <h1 className="h1">Sua planilha entrou para validação.</h1>
            <p className="lead">
              O pedido foi salvo antes de abrir qualquer conversa externa. Agora a equipe valida filtros, disponibilidade
              e escopo antes de qualquer cobrança.
            </p>
            <div className="quick-summary" aria-label="Resumo da solicitação">
              <span><strong>Segmento</strong>{success.summary?.segment || selectedSegment.label}</span>
              <span><strong>Região</strong>{success.summary?.location || form.location}</span>
              <span><strong>Período</strong>{success.summary?.period || form.period}</span>
              <span><strong>Protocolo</strong>{success.id || "registrado"}</span>
            </div>
            <div className="btn-row">
              {success.whatsappUrl ? (
                <a className="button button--teal" href={success.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} />
                  Falar pelo WhatsApp
                </a>
              ) : null}
              <Link className="button button--secondary" href={refineHref}>
                Quero refinar mais critérios
              </Link>
            </div>
          </div>
          <aside className="quick-proof-panel">
            {selectedAsset ? (
              <picture className="quick-segment-media">
                <source media="(max-width: 680px)" srcSet={assetPath(selectedAsset.mobileImage)} />
                <img src={assetPath(selectedAsset.image)} alt={selectedAsset.alt} />
              </picture>
            ) : null}
            <div className="quick-proof-panel__body">
              <ShieldCheck size={28} />
              <strong>Exemplo ilustrativo</strong>
              <p>Os campos da planilha são confirmados conforme origem, disponibilidade e recorte solicitado.</p>
            </div>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="section section--light quick-request-page">
      <div className="container-wide quick-request-layout">
        <div className="quick-request-copy">
          <p className="eyebrow">Solicitação rápida</p>
          <h1 className="h1">Solicite uma base para {selectedSegment.label}.</h1>
          <p className="lead">
            Preencha o essencial para a equipe validar sua planilha. Se precisar de critérios avançados, você pode
            refinar depois no montador completo.
          </p>
          <div className="quick-proof-list">
            <span><ShieldCheck size={17} /> Sem pagamento nesta etapa</span>
            <span><ShieldCheck size={17} /> Pedido salvo antes do WhatsApp</span>
            <span><ShieldCheck size={17} /> Dados usados só para atendimento</span>
          </div>
          {selectedAsset ? (
            <picture className="quick-segment-hero">
              <source media="(max-width: 680px)" srcSet={assetPath(selectedAsset.mobileImage)} />
              <img src={assetPath(selectedAsset.image)} alt={selectedAsset.alt} />
            </picture>
          ) : null}
        </div>

        <form className="quick-request-form" onSubmit={submit}>
          <div className="form-grid">
            <label className="field">
              <span>Segmento</span>
              <select value={form.segment} onChange={(event) => updateField("segment", event.target.value)} required>
                {segmentCards.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Cidade ou região</span>
              <input
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
                placeholder="Campinas, região metropolitana..."
                required
              />
            </label>
            <label className="field">
              <span>UF</span>
              <input
                value={form.state}
                onChange={(event) => updateField("state", event.target.value.toUpperCase().slice(0, 2))}
                placeholder="SP"
                maxLength={2}
              />
            </label>
            <label className="field">
              <span>Período de abertura</span>
              <select value={form.period} onChange={(event) => updateField("period", event.target.value)} required>
                {periodOptions.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Nome</span>
              <input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
            </label>
            <label className="field">
              <span>WhatsApp</span>
              <input
                value={form.whatsapp}
                onChange={(event) => updateField("whatsapp", event.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </label>
            <label className="field">
              <span>Quantidade aproximada</span>
              <input
                value={form.quantity}
                onChange={(event) => updateField("quantity", event.target.value)}
                placeholder="100, 500, 1000..."
              />
            </label>
            <label className="field">
              <span>Empresa</span>
              <input value={form.company} onChange={(event) => updateField("company", event.target.value)} />
            </label>
            <label className="field field--full">
              <span>E-mail</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="Opcional"
              />
            </label>
            <label className="field field--full">
              <span>Observações</span>
              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="CNAE, perfil desejado, bairros ou observações comerciais."
              />
            </label>
            <input
              tabIndex={-1}
              autoComplete="off"
              className="honeypot"
              value={form.companySite}
              onChange={(event) => updateField("companySite", event.target.value)}
            />
            <label className="consent field--full">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(event) => updateField("consent", event.target.checked)}
                required
              />
              <span>Li e concordo com os Termos de Uso e a Política de Privacidade.</span>
            </label>
          </div>
          {error ? <p className="error" role="alert">{error}</p> : null}
          <div className="quick-request-actions">
            <button className="button button--primary" type="submit" disabled={isSubmitting || !form.consent}>
              <Send size={18} />
              {isSubmitting ? "Salvando..." : "Solicitar esta planilha"}
            </button>
            <Link className="button button--secondary" href={refineHref}>
              Quero refinar mais critérios
              <ArrowRight size={18} />
            </Link>
          </div>
          <p className="quick-request-note">
            Não há checkout nem pagamento nesta tela. A validação acontece antes de qualquer cobrança.
          </p>
        </form>
      </div>
    </section>
  );
}

export { buildQuickRequestHref };
