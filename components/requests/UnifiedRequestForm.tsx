"use client";

// cspell:words brazilian codigo
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { RequestTypeSelector, type RequestType } from "@/components/requests/RequestTypeSelector";
import { brazilianStates, createPublicRequestPayload, quantityOptions } from "@/lib/public-request";
import { publicRequestSchema, type PublicRequestInput } from "@/lib/public-request-schema";
import { segmentCards } from "@/lib/segments";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { apiFetch } from "@/src/lib/api/client";
import { withBasePath } from "@/src/lib/api/runtime";
import { TurnstileWidget, turnstileEnabled } from "@/components/security/TurnstileWidget";

type ApiResult = { ok?: boolean; publicCode?: string; message?: string; crm?: { publicCode?: string } };

function safeSubmitError(status: number) {
  if (status >= 500) return "Não foi possível enviar sua solicitação agora. Tente novamente.";
  return "Confira os campos destacados.";
}

export function UnifiedRequestForm() {
  const searchParams = useSearchParams();
  const source = (searchParams.get("source") || "unified-request").slice(0, 80);
  const [requestType, setRequestType] = useState<RequestType | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState<ApiResult | null>(null);
  const submitting = useRef(false);
  const idempotencyKey = useRef("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token), []);
  const form = useForm<PublicRequestInput>({
    resolver: zodResolver(publicRequestSchema),
    defaultValues: {
      requestType: "sample",
      segment: "",
      otherSegment: "",
      city: "",
      state: "",
      name: "",
      whatsapp: "",
      quantity: "",
      notes: "",
      companySite: "",
    },
  });

  const segment = form.watch("segment");
  const isSubmitting = form.formState.isSubmitting;

  function chooseType(value: RequestType) {
    setRequestType(value);
    setSubmitError("");
    setSuccess(null);
    form.setValue("requestType", value);
    if (value === "sample") {
      form.setValue("quantity", "");
      form.setValue("notes", "");
    }
    window.requestAnimationFrame(() => document.getElementById("request-details")?.focus());
  }

  async function submit(data: PublicRequestInput) {
    if (submitting.current || data.companySite) return;
    if (turnstileEnabled && !turnstileToken) {
      setSubmitError("Confirme a verificação de segurança antes de enviar.");
      return;
    }
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
    submitting.current = true;
    setSubmitError("");
    setSuccess(null);

    try {
      const endpoint = data.requestType === "sample" ? "/api/free-sample-request" : "/api/custom-base-request";
      const response = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPublicRequestPayload(data, source, idempotencyKey.current, turnstileToken)),
      });
      const payload = (await response.json().catch(() => null)) as ApiResult | null;
      if (!response.ok || !payload || payload.ok === false) {
        setSubmitError(safeSubmitError(response.status));
        setTurnstileReset((value) => value + 1);
        return;
      }

      setSuccess(payload);
      const publicCode = payload.publicCode || payload.crm?.publicCode;
      if (publicCode) {
        window.setTimeout(() => {
          try {
            window.location.assign(withBasePath(`/pedido/?codigo=${encodeURIComponent(publicCode)}`));
          } catch {
            setSubmitError("Pedido recebido. Use o botão abaixo para acompanhar o protocolo.");
          }
        }, 700);
      }
    } catch {
      setSubmitError("Não foi possível conectar agora. Tente novamente.");
      setTurnstileReset((value) => value + 1);
    } finally {
      submitting.current = false;
    }
  }

  const publicCode = success?.publicCode || success?.crm?.publicCode;
  const whatsappHref = createWhatsAppLink("Olá, enviei uma solicitação pelo site da ProspectaNicho e preciso de ajuda.");

  return (
    <section className="section section--light unified-request-page">
      <div className="container request-shell">
        <header className="request-intro">
          <p className="eyebrow">Solicitar planilha</p>
          <h1 className="h1">Como você quer começar?</h1>
          <p className="lead">Escolha uma opção. Você só precisa informar o essencial para a equipe validar o pedido.</p>
        </header>

        <RequestTypeSelector value={requestType} onChange={chooseType} />

        {requestType ? (
          <form className="unified-request-form" onSubmit={form.handleSubmit(submit)} noValidate>
            <div className="request-form-heading" id="request-details" tabIndex={-1}>
              <span>{requestType === "sample" ? "Amostra grátis" : "Base personalizada"}</span>
              <h2 className="h3">Conte para nós quem você quer encontrar.</h2>
            </div>

            <fieldset className="request-segment-fieldset">
              <legend>Segmento / tipo de empresa</legend>
              <div className="request-segment-options">
                {segmentCards.slice(0, 8).map((item) => (
                  <label className="request-chip" data-selected={segment === item.label} key={item.id}>
                    <input type="radio" value={item.label} {...form.register("segment")} />
                    <span>{item.label}</span>
                  </label>
                ))}
                <label className="request-chip" data-selected={segment === "outro"}>
                  <input type="radio" value="outro" {...form.register("segment")} />
                  <span>Outro segmento</span>
                </label>
              </div>
              {form.formState.errors.segment ? <span className="error">{form.formState.errors.segment.message}</span> : null}
            </fieldset>

            {segment === "outro" ? (
              <label className="field field--full">
                <span>Qual segmento?</span>
                <input {...form.register("otherSegment")} autoComplete="off" />
                {form.formState.errors.otherSegment ? <span className="error">{form.formState.errors.otherSegment.message}</span> : null}
              </label>
            ) : null}

            <div className="form-grid">
              <label className="field">
                <span>Cidade ou região</span>
                <input {...form.register("city")} placeholder="Campinas e região" autoComplete="address-level2" />
                {form.formState.errors.city ? <span className="error">{form.formState.errors.city.message}</span> : null}
              </label>
              <label className="field">
                <span>UF</span>
                <select {...form.register("state")} autoComplete="address-level1">
                  <option value="">Selecione</option>
                  {brazilianStates.map((state) => <option value={state} key={state}>{state}</option>)}
                </select>
                {form.formState.errors.state ? <span className="error">{form.formState.errors.state.message}</span> : null}
              </label>
              <label className="field">
                <span>Nome</span>
                <input {...form.register("name")} autoComplete="name" />
                {form.formState.errors.name ? <span className="error">{form.formState.errors.name.message}</span> : null}
              </label>
              <label className="field">
                <span>WhatsApp</span>
                <input {...form.register("whatsapp")} type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 99999-9999" />
                {form.formState.errors.whatsapp ? <span className="error">{form.formState.errors.whatsapp.message}</span> : null}
              </label>
              {requestType === "custom" ? (
                <>
                  <label className="field field--full">
                    <span>Quantidade aproximada</span>
                    <select {...form.register("quantity")}>
                      <option value="">Selecione</option>
                      {quantityOptions.map((quantity) => <option value={quantity} key={quantity}>{quantity}</option>)}
                    </select>
                    {form.formState.errors.quantity ? <span className="error">{form.formState.errors.quantity.message}</span> : null}
                  </label>
                  <label className="field field--full">
                    <span>Quer acrescentar algum critério? <small>(opcional)</small></span>
                    <textarea {...form.register("notes")} placeholder="Ex.: clínicas odontológicas, Campinas e região." />
                  </label>
                </>
              ) : null}
              <input className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" {...form.register("companySite")} />
              <label className="consent field--full">
                <input type="checkbox" {...form.register("consent")} />
                <span>Li e concordo com os <Link href="/termos-de-uso">Termos de Uso</Link> e a <Link href="/politica-de-privacidade">Política de Privacidade</Link>.</span>
              </label>
              {form.formState.errors.consent ? <span className="error field--full">{form.formState.errors.consent.message}</span> : null}
              <TurnstileWidget onToken={handleTurnstileToken} resetSignal={turnstileReset} />
            </div>

            {submitError ? <p className="request-feedback request-feedback--error" role="alert">{submitError}</p> : null}
            {success ? (
              <div className="request-feedback request-feedback--success" role="status" aria-live="polite">
                <CheckCircle2 size={22} />
                <div>
                  <strong>Pedido recebido</strong>
                  <p>{publicCode ? `Protocolo ${publicCode}. Abrindo o acompanhamento...` : "A equipe recebeu sua solicitação e entrará em contato."}</p>
                  {publicCode ? <Link href={withBasePath(`/pedido/?codigo=${encodeURIComponent(publicCode)}`)}>Acompanhar pedido</Link> : <a href={whatsappHref} target="_blank" rel="noopener noreferrer">Falar pelo WhatsApp</a>}
                </div>
              </div>
            ) : null}

            <div className="request-submit-row">
              <button className="button button--primary" type="submit" disabled={isSubmitting || Boolean(success)}>
                <Send size={18} />
                {isSubmitting ? "Enviando..." : requestType === "sample" ? "Solicitar amostra grátis" : "Solicitar base personalizada"}
              </button>
              <span><ShieldCheck size={17} /> Sem cobrança nesta etapa.</span>
            </div>
          </form>
        ) : null}
      </div>
    </section>
  );
}
