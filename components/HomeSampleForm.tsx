"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { isExternalHref, site } from "@/lib/site";
import { trackEvent } from "@/lib/tracking";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { apiFetch } from "@/src/lib/api/client";

export function HomeSampleForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  function markStarted() {
    if (!started) {
      setStarted(true);
      trackEvent("sample_form_started");
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    let response: Response;
    try {
      response = await apiFetch("/api/free-sample-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          company: form.get("company") || undefined,
          whatsapp: form.get("whatsapp"),
          niche: form.get("niche"),
          city: form.get("city"),
          consent: true,
          source: "home-short-sample",
        }),
      });
    } catch {
      setError("Não foi possível conectar agora. Tente novamente em instantes ou chame pelo WhatsApp.");
      setLoading(false);
      return;
    }

    if (!response.ok) {
      setError("Não foi possível enviar agora. Confira os campos e tente novamente.");
      setLoading(false);
      return;
    }

    trackEvent("sample_form_submitted");
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    const href = createWhatsAppLink("Olá, solicitei uma amostra gratuita pelo site e quero confirmar meu nicho/região.");
    const finalHref = href || "/produtos";
    const external = isExternalHref(finalHref);
    return (
      <div className="sample-success">
        <strong>Pedido de amostra recebido.</strong>
        <p>
          {site.whatsapp
            ? "Abra o WhatsApp para acelerar o envio e confirmar o melhor recorte."
            : "Recebemos sua solicitação. Configure o WhatsApp real para atendimento direto."}
        </p>
        <a
          className="button button--primary"
          href={finalHref}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {site.whatsapp ? "Falar sobre meu público" : "Ver bases a partir de R$ 147"}
        </a>
      </div>
    );
  }

  return (
    <form className="sample-form" onSubmit={submit} onFocus={markStarted}>
      <label>
        Nome
        <input name="name" required minLength={2} />
      </label>
      <label>
        WhatsApp
        <input name="whatsapp" required minLength={8} />
      </label>
      <label>
        Nicho desejado
        <input name="niche" required minLength={2} />
      </label>
      <label>
        Cidade ou região
        <input name="city" required minLength={2} />
      </label>
      <label>
        Empresa opcional
        <input name="company" />
      </label>
      {error ? <span className="error" role="alert">{error}</span> : null}
      <button className="button button--primary" type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Quero receber minha amostra grátis agora"}
        <ArrowRight size={18} />
      </button>
      <p>Sem cartão. Sem compromisso. Você valida o formato antes de contratar uma base.</p>
    </form>
  );
}
