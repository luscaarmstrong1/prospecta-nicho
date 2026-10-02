"use client";

import { ArrowRight, CheckCircle2, Send } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useCallback, useState } from "react";
import { TurnstileWidget, turnstileEnabled } from "@/components/security/TurnstileWidget";
import { apiFetch } from "@/src/lib/api/client";
import styles from "./contact.module.css";

interface ContactFormCardProps {
  selectedSubject?: string;
  onSubjectChange?: (subject: string) => void;
}

const subjectsList = [
  "Leads B2B",
  "Sites e Landing Pages",
  "Sites",
  "Landing Pages",
  "Automação",
  "Suporte",
  "Parcerias",
  "Outro",
];

export function ContactFormCard({ selectedSubject, onSubjectChange }: ContactFormCardProps) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    whatsapp: "",
    subject: selectedSubject || "",
    message: "",
    consent: false,
    companySite: "", // honeypot
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);

  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token), []);

  const formatWhatsApp = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleFieldChange = (
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (formData.name.trim().length < 2) {
      errs.name = "Nome deve conter no mínimo 2 caracteres.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errs.email = "Informe um e-mail válido.";
    }
    const phoneDigits = formData.whatsapp.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      errs.whatsapp = "Informe um WhatsApp válido com DDD (mínimo 10 dígitos).";
    }
    if (!formData.subject) {
      errs.subject = "Selecione um assunto.";
    }
    if (formData.message.trim().length < 10) {
      errs.message = "Mensagem deve conter no mínimo 10 caracteres.";
    }
    if (!formData.consent) {
      errs.consent = "É necessário aceitar os Termos e a Política de Privacidade.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;

    if (!validate()) return;

    if (turnstileEnabled && !turnstileToken) {
      setStatus("error");
      setServerMessage("Confirme a verificação de segurança antes de enviar.");
      return;
    }

    setStatus("loading");
    setServerMessage("");

    try {
      const response = await apiFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          company: formData.company.trim() || formData.name.trim(),
          email: formData.email.trim(),
          whatsapp: formData.whatsapp.trim(),
          subject: formData.subject,
          message: formData.message.trim(),
          consent: true,
          companySite: formData.companySite,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        setStatus("error");
        setServerMessage(
          "Não foi possível enviar sua mensagem. Tente novamente ou utilize um de nossos canais de atendimento."
        );
        setTurnstileReset((v) => v + 1);
        return;
      }

      setStatus("success");
      setServerMessage(
        "Mensagem enviada com sucesso. Nossa equipe entrará em contato em breve."
      );
    } catch {
      setStatus("error");
      setServerMessage(
        "Não foi possível enviar sua mensagem. Tente novamente ou utilize um de nossos canais de atendimento."
      );
      setTurnstileReset((v) => v + 1);
    }
  };

  const handleResetSuccess = () => {
    setStatus("idle");
    setFormData({
      name: "",
      company: "",
      email: "",
      whatsapp: "",
      subject: "",
      message: "",
      consent: false,
      companySite: "",
    });
    setErrors({});
  };

  if (status === "success") {
    return (
      <div className={styles.formCard} role="status" aria-live="polite">
        <div className={styles.successCard}>
          <div className={styles.successIconWrap}>
            <CheckCircle2 size={36} />
          </div>
          <h3 className={styles.successTitle}>Mensagem enviada com sucesso!</h3>
          <p className={styles.successDesc}>
            {serverMessage || "Nossa equipe entrará em contato em breve."}
          </p>
          <button
            type="button"
            className={styles.btnPrimarySolid}
            onClick={handleResetSuccess}
            style={{ margin: "0 auto" }}
          >
            Enviar nova mensagem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formCard} id="formulario-contato">
      <div className={styles.formHeader}>
        <span className={styles.eyebrowTag}>ENVIE UMA MENSAGEM</span>
        <p className={styles.formSubtitle}>
          Preencha seus dados e nossa equipe entrará em contato.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.formGrid}>
          {/* Nome */}
          <div className={styles.fieldLabel}>
            <label htmlFor="field-name">
              Nome <span className={styles.fieldRequired}>*</span>
            </label>
            <input
              id="field-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Seu nome"
              className={styles.formInput}
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              aria-describedby={errors.name ? "error-name" : undefined}
              aria-invalid={Boolean(errors.name)}
              required
            />
            {errors.name ? (
              <span id="error-name" className={styles.fieldError}>
                {errors.name}
              </span>
            ) : null}
          </div>

          {/* Empresa */}
          <div className={styles.fieldLabel}>
            <label htmlFor="field-company">Empresa</label>
            <input
              id="field-company"
              name="company"
              type="text"
              autoComplete="organization"
              placeholder="Nome da sua empresa"
              className={styles.formInput}
              value={formData.company}
              onChange={(e) => handleFieldChange("company", e.target.value)}
            />
          </div>

          {/* E-mail */}
          <div className={styles.fieldLabel}>
            <label htmlFor="field-email">
              E-mail <span className={styles.fieldRequired}>*</span>
            </label>
            <input
              id="field-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              className={styles.formInput}
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              aria-describedby={errors.email ? "error-email" : undefined}
              aria-invalid={Boolean(errors.email)}
              required
            />
            {errors.email ? (
              <span id="error-email" className={styles.fieldError}>
                {errors.email}
              </span>
            ) : null}
          </div>

          {/* WhatsApp */}
          <div className={styles.fieldLabel}>
            <label htmlFor="field-whatsapp">
              WhatsApp <span className={styles.fieldRequired}>*</span>
            </label>
            <input
              id="field-whatsapp"
              name="whatsapp"
              type="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              className={styles.formInput}
              value={formData.whatsapp}
              onChange={(e) => handleFieldChange("whatsapp", formatWhatsApp(e.target.value))}
              aria-describedby={errors.whatsapp ? "error-whatsapp" : undefined}
              aria-invalid={Boolean(errors.whatsapp)}
              required
            />
            {errors.whatsapp ? (
              <span id="error-whatsapp" className={styles.fieldError}>
                {errors.whatsapp}
              </span>
            ) : null}
          </div>

          {/* Assunto */}
          <div className={`${styles.fieldLabel} ${styles.fieldFull}`}>
            <label htmlFor="field-subject">
              Assunto <span className={styles.fieldRequired}>*</span>
            </label>
            <select
              id="field-subject"
              name="subject"
              className={styles.formSelect}
              value={formData.subject}
              onChange={(e) => {
                handleFieldChange("subject", e.target.value);
                if (onSubjectChange) onSubjectChange(e.target.value);
              }}
              aria-describedby={errors.subject ? "error-subject" : undefined}
              aria-invalid={Boolean(errors.subject)}
              required
            >
              <option value="" disabled>
                Selecione o assunto
              </option>
              {subjectsList.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
            {errors.subject ? (
              <span id="error-subject" className={styles.fieldError}>
                {errors.subject}
              </span>
            ) : null}
          </div>

          {/* Mensagem */}
          <div className={`${styles.fieldLabel} ${styles.fieldFull}`}>
            <label htmlFor="field-message">
              Mensagem <span className={styles.fieldRequired}>*</span>
            </label>
            <textarea
              id="field-message"
              name="message"
              rows={4}
              placeholder="Conte mais sobre o seu projeto, dúvida ou necessidade..."
              className={styles.formTextarea}
              value={formData.message}
              onChange={(e) => handleFieldChange("message", e.target.value)}
              aria-describedby={errors.message ? "error-message" : undefined}
              aria-invalid={Boolean(errors.message)}
              required
            />
            {errors.message ? (
              <span id="error-message" className={styles.fieldError}>
                {errors.message}
              </span>
            ) : null}
          </div>

          {/* Honeypot field (hidden) */}
          <input
            name="companySite"
            tabIndex={-1}
            autoComplete="off"
            value={formData.companySite}
            onChange={(e) => handleFieldChange("companySite", e.target.value)}
            style={{ display: "none" }}
            aria-hidden="true"
          />

          {/* Checkbox de consentimento */}
          <div className={`${styles.consentWrap} ${styles.fieldFull}`}>
            <input
              id="field-consent"
              name="consent"
              type="checkbox"
              className={styles.consentCheckbox}
              checked={formData.consent}
              onChange={(e) => handleFieldChange("consent", e.target.checked)}
              aria-describedby={errors.consent ? "error-consent" : undefined}
              aria-invalid={Boolean(errors.consent)}
              required
            />
            <label htmlFor="field-consent">
              Li e concordo com os{" "}
              <Link href="/termos-de-uso" target="_blank" rel="noopener noreferrer">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer">
                Política de Privacidade
              </Link>
              .
            </label>
          </div>
          {errors.consent ? (
            <div className={styles.fieldFull}>
              <span id="error-consent" className={styles.fieldError}>
                {errors.consent}
              </span>
            </div>
          ) : null}

          {/* Turnstile se configurado */}
          <div className={styles.fieldFull}>
            <TurnstileWidget onToken={handleTurnstileToken} resetSignal={turnstileReset} />
          </div>

          {/* Erro de envio */}
          {status === "error" && serverMessage ? (
            <div className={`${styles.formAlertError} ${styles.fieldFull}`} role="alert">
              <span>{serverMessage}</span>
            </div>
          ) : null}

          {/* Botão de Envio */}
          <div className={styles.fieldFull}>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={status === "loading"}
              aria-busy={status === "loading"}
            >
              <Send size={18} aria-hidden="true" />
              {status === "loading" ? "Enviando..." : "Enviar mensagem →"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
