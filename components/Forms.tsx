"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { isExternalHref, site, waLink } from "@/lib/site";
import { apiFetch } from "@/src/lib/api/client";

const baseSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  company: z.string().min(2, "Informe sua empresa."),
  email: z.string().email("Informe um e-mail válido."),
  whatsapp: z.string().min(8, "Informe seu WhatsApp."),
  niche: z.string().min(2, "Informe o nicho desejado."),
  city: z.string().min(2, "Informe a cidade ou região."),
  state: z.string().optional(),
  cnae: z.string().optional(),
  quantity: z.string().optional(),
  goal: z.string().min(5, "Conte brevemente seu objetivo."),
  notes: z.string().optional(),
  consent: z.boolean().refine((value) => value, "Você precisa concordar com os termos."),
  companySite: z.string().max(0).optional(),
});

type FormData = z.infer<typeof baseSchema>;

type Props = {
  mode: "sample" | "custom" | "contact";
};

export function LeadForm({ mode }: Props) {
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(baseSchema),
    defaultValues: { consent: false },
  });

  async function submit(data: FormData) {
    if (data.companySite) return;
    setSubmitError("");

    const endpoint =
      mode === "sample" ? "/api/free-sample-request" : mode === "custom" ? "/api/custom-base-request" : "/api/contact";
    let response: Response;
    try {
      response = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      setSubmitError("Não foi possível conectar agora. Tente novamente em instantes ou chame pelo WhatsApp.");
      return;
    }

    if (!response.ok) {
      setSubmitError("Não foi possível enviar agora. Confira os campos e tente novamente.");
      return;
    }

    setDone(true);
  }

  if (done) {
    const href = waLink("Olá, acabei de enviar um pedido pelo site da ProspectaNicho e quero avançar no atendimento.");
    const external = isExternalHref(href);

    return (
      <div className="form-card">
        <h2 className="h2">Pedido recebido.</h2>
        <p className="lead">
          {site.whatsapp
            ? "Para acelerar o atendimento, abra a conversa no WhatsApp com os critérios já preenchidos."
            : "Recebemos sua solicitação. Configure NEXT_PUBLIC_WHATSAPP_NUMBER para atendimento direto pelo WhatsApp."}
        </p>
        <a
          className="button button--teal"
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {site.whatsapp ? "Abrir WhatsApp" : "Voltar ao contato"}
        </a>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={handleSubmit(submit)}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Nome</label>
          <input id="name" {...register("name")} />
          {errors.name ? <span className="error">{errors.name.message}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="company">Empresa</label>
          <input id="company" {...register("company")} />
          {errors.company ? <span className="error">{errors.company.message}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" {...register("email")} />
          {errors.email ? <span className="error">{errors.email.message}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="whatsapp">WhatsApp</label>
          <input id="whatsapp" {...register("whatsapp")} />
          {errors.whatsapp ? <span className="error">{errors.whatsapp.message}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="niche">Nicho / segmento desejado</label>
          <input id="niche" {...register("niche")} />
          {errors.niche ? <span className="error">{errors.niche.message}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="city">Cidade / região</label>
          <input id="city" {...register("city")} />
          {errors.city ? <span className="error">{errors.city.message}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="state">Estado</label>
          <input id="state" {...register("state")} />
        </div>
        <div className="field">
          <label htmlFor="cnae">CNAE, se souber</label>
          <input id="cnae" {...register("cnae")} />
        </div>
        <div className="field">
          <label htmlFor="quantity">Quantidade aproximada</label>
          <input id="quantity" {...register("quantity")} />
        </div>
        <div className="field field--full">
          <label htmlFor="goal">Objetivo comercial</label>
          <textarea id="goal" {...register("goal")} />
          {errors.goal ? <span className="error">{errors.goal.message}</span> : null}
        </div>
        <div className="field field--full">
          <label htmlFor="notes">Observações adicionais</label>
          <textarea id="notes" {...register("notes")} />
        </div>
        <input tabIndex={-1} autoComplete="off" style={{ display: "none" }} {...register("companySite")} />
        <div className="field field--full">
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <input type="checkbox" {...register("consent")} />
            <span>Li e concordo com os Termos de Uso e a Política de Privacidade.</span>
          </label>
          {errors.consent ? <span className="error">{errors.consent.message}</span> : null}
        </div>
      </div>
      {submitError ? <p className="error" role="alert">{submitError}</p> : null}
      <button className="button button--primary" type="submit" disabled={isSubmitting} style={{ marginTop: 20 }}>
        <Send size={18} />
        Enviar solicitação
      </button>
    </form>
  );
}
