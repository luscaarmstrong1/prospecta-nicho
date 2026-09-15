"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FieldSelector } from "@/components/editor/FieldSelector";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { EditorStepper } from "@/components/editor/EditorStepper";
import { EditorSuccess } from "@/components/editor/EditorSuccess";
import { SegmentPresetCard } from "@/components/editor/SegmentPresetCard";
import {
  baseFieldOptions,
  builderSchema,
  companySizeOptions,
  extraFieldOptions,
  goalOptions,
  objectiveOptions,
  openedPeriodOptions,
} from "@/lib/editor-schema";
import { defaultBuilderData, segmentPresets } from "@/lib/editor-presets";
import { applyPreset, restorePublicFilters } from "@/lib/editor-utils";
import { createWhatsAppLink, defaultWhatsAppMessage } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/tracking";
import { apiFetch } from "@/src/lib/api/client";
import type { BaseBuilderData, BuilderStep, SegmentPreset } from "@/types/editor";

const storageKey = "prospectanicho:base-builder";
const steps: BuilderStep[] = ["objective", "segment", "region", "profile", "fields", "delivery"];

type Props = {
  initialSearch?: string;
};

export function BaseBuilder({ initialSearch = "" }: Props) {
  const [currentStep, setCurrentStep] = useState<BuilderStep>("objective");
  const [submitted, setSubmitted] = useState<BaseBuilderData | null>(null);
  const [submitError, setSubmitError] = useState("");
  const restoredDefaults = useMemo(() => restorePublicFilters(initialSearch, defaultBuilderData), [initialSearch]);
  const form = useForm<BaseBuilderData>({
    resolver: zodResolver(builderSchema),
    defaultValues: restoredDefaults,
    mode: "onBlur",
  });
  const data = form.watch();
  const currentIndex = steps.indexOf(currentStep);
  const whatsappHref = createWhatsAppLink(defaultWhatsAppMessage);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved && !initialSearch) {
      try {
        form.reset({ ...defaultBuilderData, ...JSON.parse(saved), name: "", email: "", whatsapp: "", company: "" });
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    trackEvent("editor_started");
  }, [form, initialSearch]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      const { name, email, whatsapp, company, consent, companySite, ...safeValue } = value;
      window.localStorage.setItem(storageKey, JSON.stringify(safeValue));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  function selectStep(step: BuilderStep) {
    setCurrentStep(step);
    trackEvent("editor_step_completed", { step });
  }

  function nextStep() {
    const next = steps[Math.min(currentIndex + 1, steps.length - 1)];
    selectStep(next);
  }

  function previousStep() {
    const previous = steps[Math.max(currentIndex - 1, 0)];
    setCurrentStep(previous);
  }

  function handlePreset(preset: SegmentPreset) {
    form.reset(applyPreset(form.getValues(), preset));
  }

  function clearConfiguration() {
    window.localStorage.removeItem(storageKey);
    form.reset(defaultBuilderData);
    setCurrentStep("objective");
  }

  async function submit(values: BaseBuilderData) {
    if (values.companySite) return;
    setSubmitError("");

    let response: Response;
    try {
      response = await apiFetch("/api/custom-base-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source: "base-builder" }),
      });
    } catch {
      setSubmitError("Não foi possível conectar agora. Tente novamente em instantes ou chame pelo WhatsApp.");
      return;
    }

    if (!response.ok) {
      setSubmitError("Não foi possível enviar agora. Revise os campos obrigatórios e tente novamente.");
      return;
    }

    window.localStorage.removeItem(storageKey);
    trackEvent("editor_submitted", { segment: values.segment, city: values.city });
    setSubmitted(values);
  }

  if (submitted) return <EditorSuccess data={submitted} />;

  return (
    <section className="section editor-section">
      <div className="container-wide editor-layout">
        <div className="editor-main">
          <div className="section-kicker">
            <p className="eyebrow">Monte sua base</p>
            <h1 className="h1">Transforme seu público ideal em um recorte comercial claro.</h1>
            <p className="lead">
              Escolha segmento, região, momento da empresa e formato de entrega. A equipe valida a disponibilidade
              antes de confirmar escopo e investimento final.
            </p>
          </div>

          <EditorStepper current={currentStep} onSelect={selectStep} />

          <form className="builder-form" onSubmit={form.handleSubmit(submit)}>
            {currentStep === "objective" ? (
              <div className="builder-panel">
                <h2 className="h3">Para quem você quer vender?</h2>
                <div className="option-grid">
                  {objectiveOptions.map((option) => (
                    <label key={option}>
                      <input type="radio" value={option} {...form.register("audience")} />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                <label className="field">
                  Objetivo comercial
                  <select {...form.register("goal")}>
                    {goalOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              </div>
            ) : null}

            {currentStep === "segment" ? (
              <div className="builder-panel">
                <h2 className="h3">Segmento e atividade</h2>
                <div className="preset-grid">
                  {segmentPresets.map((preset) => (
                    <SegmentPresetCard key={preset.id} preset={preset} onApply={handlePreset} />
                  ))}
                </div>
                <div className="form-grid">
                  <label className="field">
                    Segmento
                    <input {...form.register("segment")} />
                  </label>
                  <label className="field">
                    Palavra-chave
                    <input {...form.register("keyword")} />
                  </label>
                  <label className="field">
                    CNAE principal opcional
                    <input {...form.register("primaryCnae")} />
                  </label>
                  <label className="field">
                    CNAEs complementares opcionais
                    <input {...form.register("secondaryCnaes")} />
                  </label>
                  <label className="field field--full">
                    Observações
                    <textarea {...form.register("segmentNotes")} />
                  </label>
                </div>
              </div>
            ) : null}

            {currentStep === "region" ? (
              <div className="builder-panel">
                <h2 className="h3">Região e período</h2>
                <div className="form-grid">
                  <label className="field">
                    Estado
                    <input {...form.register("state")} />
                  </label>
                  <label className="field">
                    Cidade
                    <input {...form.register("city")} />
                  </label>
                  <label className="field">
                    Região
                    <input {...form.register("region")} />
                  </label>
                  <label className="field">
                    Bairro opcional
                    <input {...form.register("district")} />
                  </label>
                  <label className="field">
                    CEP inicial opcional
                    <input {...form.register("cepStart")} />
                  </label>
                  <label className="field">
                    CEP final opcional
                    <input {...form.register("cepEnd")} />
                  </label>
                  <label className="field field--full">
                    Empresas abertas
                    <select {...form.register("openedPeriod")}>
                      {openedPeriodOptions.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            ) : null}

            {currentStep === "profile" ? (
              <div className="builder-panel">
                <h2 className="h3">Perfil da empresa</h2>
                <Controller
                  control={form.control}
                  name="companySize"
                  render={({ field }) => (
                    <FieldSelector title="Porte" options={companySizeOptions} selected={field.value} onChange={field.onChange} />
                  )}
                />
                <div className="form-grid">
                  <label className="field">
                    Situação cadastral
                    <select {...form.register("registrationStatus")}>
                      <option>ativa</option>
                      <option>outras situações</option>
                      <option>sem preferência</option>
                    </select>
                  </label>
                  <label className="field">
                    Capital social
                    <select {...form.register("capitalRange")}>
                      <option>sem preferência</option>
                      <option>faixa baixa</option>
                      <option>faixa intermediária</option>
                      <option>faixa elevada</option>
                      <option>personalizado</option>
                    </select>
                  </label>
                  <label className="field">
                    Filial ou matriz
                    <select {...form.register("branchType")}>
                      <option>qualquer</option>
                      <option>matriz</option>
                      <option>filial</option>
                    </select>
                  </label>
                </div>
                <p className="editor-note">A disponibilidade de filtros e campos é confirmada após validação do recorte.</p>
              </div>
            ) : null}

            {currentStep === "fields" ? (
              <div className="builder-panel">
                <h2 className="h3">Campos desejados</h2>
                <Controller
                  control={form.control}
                  name="baseFields"
                  render={({ field }) => (
                    <FieldSelector title="Campos base" options={baseFieldOptions} selected={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="extraFields"
                  render={({ field }) => (
                    <FieldSelector
                      title="Campos adicionais, quando disponíveis"
                      note="Os campos adicionais dependem de disponibilidade, origem e escopo contratado."
                      options={extraFieldOptions}
                      selected={field.value || []}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            ) : null}

            {currentStep === "delivery" ? (
              <div className="builder-panel">
                <h2 className="h3">Volume, entrega e contato</h2>
                <div className="form-grid">
                  <label className="field">
                    Faixa de quantidade
                    <select {...form.register("quantityRange")}>
                      <option>até 100</option>
                      <option>101 a 500</option>
                      <option>501 a 1.000</option>
                      <option>1.001 a 5.000</option>
                      <option>acima de 5.000</option>
                      <option>preciso de ajuda para definir</option>
                    </select>
                  </label>
                  <label className="field">
                    Formato
                    <select {...form.register("deliveryFormat")}>
                      <option>Excel</option>
                      <option>CSV</option>
                      <option>Google Sheets</option>
                      <option>importação para CRM, quando aplicável</option>
                    </select>
                  </label>
                  <label className="field field--full">
                    Observações
                    <textarea {...form.register("deliveryNotes")} />
                  </label>
                  <label className="field">
                    Nome
                    <input {...form.register("name")} />
                    {form.formState.errors.name ? <span className="error">{form.formState.errors.name.message}</span> : null}
                  </label>
                  <label className="field">
                    WhatsApp
                    <input {...form.register("whatsapp")} />
                    {form.formState.errors.whatsapp ? <span className="error">{form.formState.errors.whatsapp.message}</span> : null}
                  </label>
                  <label className="field">
                    E-mail
                    <input type="email" {...form.register("email")} />
                    {form.formState.errors.email ? <span className="error">{form.formState.errors.email.message}</span> : null}
                  </label>
                  <label className="field">
                    Empresa opcional
                    <input {...form.register("company")} />
                  </label>
                  <input tabIndex={-1} autoComplete="off" style={{ display: "none" }} {...form.register("companySite")} />
                  <label className="consent field--full">
                    <input type="checkbox" {...form.register("consent")} />
                    <span>Li e concordo com os Termos de Uso e a Política de Privacidade.</span>
                  </label>
                  {form.formState.errors.consent ? <span className="error">{form.formState.errors.consent.message}</span> : null}
                </div>
              </div>
            ) : null}

            {submitError ? <p className="error" role="alert">{submitError}</p> : null}
            <div className="builder-actions">
              <button className="button button--secondary" type="button" onClick={previousStep} disabled={currentIndex === 0}>
                Voltar
              </button>
              {currentStep === "delivery" ? (
                <button className="button button--primary" type="submit" disabled={form.formState.isSubmitting}>
                  <CheckCircle2 size={18} />
                  Enviar meu recorte para validação
                </button>
              ) : (
                <button className="button button--primary" type="button" onClick={nextStep}>
                  Continuar
                  <ArrowRight size={18} />
                </button>
              )}
              <a
                className="button button--secondary"
                href={whatsappHref || "/contato"}
                target={whatsappHref ? "_blank" : undefined}
                rel={whatsappHref ? "noopener noreferrer" : undefined}
              >
                <MessageCircle size={18} />
                Falar sobre meu público
              </a>
            </div>
          </form>
        </div>

        <EditorSidebar data={data} onClear={clearConfiguration} />
      </div>
    </section>
  );
}
