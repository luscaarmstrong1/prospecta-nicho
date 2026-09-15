"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { createWhatsAppLink, defaultWhatsAppMessage } from "@/lib/whatsapp";
import { apiFetch } from "@/src/lib/api/client";

const subjects = [
  "Dúvida sobre uma base",
  "Solicitar base personalizada",
  "Suporte sobre pedido",
  "Pagamento",
  "Parceria",
  "Privacidade",
  "Outro",
];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);

    let response: Response;
    try {
      response = await apiFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
    } catch {
      setStatus("error");
      setMessage("Não foi possível conectar agora. Tente novamente em instantes ou chame pelo WhatsApp.");
      return;
    }

    if (!response.ok) {
      setStatus("error");
      setMessage("Não foi possível enviar agora. Revise os campos e tente novamente.");
      return;
    }

    setStatus("success");
    setMessage("Recebemos sua mensagem. A equipe vai analisar o assunto e retornar pelo canal informado.");
    event.currentTarget.reset();
  }

  if (status === "success") {
    const href = createWhatsAppLink(defaultWhatsAppMessage);
    return (
      <div className="form-card">
        <h2 className="h2">Mensagem recebida.</h2>
        <p className="lead">{message}</p>
        {href ? (
          <a className="button button--teal" href={href} target="_blank" rel="noopener noreferrer">
            Falar sobre meu público
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <div className="form-grid">
        <label className="field">
          Nome
          <input name="name" required minLength={2} autoComplete="name" />
        </label>
        <label className="field">
          Empresa
          <input name="company" required minLength={2} autoComplete="organization" />
        </label>
        <label className="field">
          E-mail
          <input name="email" required type="email" autoComplete="email" />
        </label>
        <label className="field">
          WhatsApp
          <input name="whatsapp" required minLength={8} autoComplete="tel" />
        </label>
        <label className="field field--full">
          Assunto
          <select name="subject" required defaultValue="">
            <option value="" disabled>Selecione</option>
            {subjects.map((subject) => <option key={subject}>{subject}</option>)}
          </select>
        </label>
        <label className="field field--full">
          Mensagem
          <textarea name="message" required minLength={10} />
        </label>
        <input name="companySite" tabIndex={-1} autoComplete="off" style={{ display: "none" }} />
        <label className="consent field--full">
          <input name="consent" type="checkbox" value="true" required />
          <span>Li e concordo com os Termos de Uso e a Política de Privacidade.</span>
        </label>
      </div>
      {message ? (
        <p className={status === "error" ? "error" : "muted"} role={status === "error" ? "alert" : "status"}>
          {message}
        </p>
      ) : null}
      <button className="button button--primary" type="submit" disabled={status === "loading"} style={{ marginTop: 20 }}>
        <Send size={18} />
        {status === "loading" ? "Enviando..." : "Falar sobre meu público"}
      </button>
    </form>
  );
}
