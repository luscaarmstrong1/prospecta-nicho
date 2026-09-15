"use client";

import { Eye, Monitor, RotateCcw, Save, Send, Smartphone, Tablet, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { editablePages } from "@/lib/content-studio";
import { apiFetch } from "@/src/lib/api/client";

type Device = "desktop" | "tablet" | "mobile";

export function ContentStudioEditor({ pageSlug = "home" }: { pageSlug?: string }) {
  const page = editablePages.find((item) => item.slug === pageSlug) || editablePages[0];
  const [values, setValues] = useState(() => Object.fromEntries(page.fields.map((field) => [field.key, field.value])));
  const [status, setStatus] = useState("Publicado");
  const [device, setDevice] = useState<Device>("desktop");

  useEffect(() => {
    setStatus("Alterações não publicadas");
    const timer = window.setTimeout(() => setStatus("Rascunho salvo"), 2000);
    return () => window.clearTimeout(timer);
  }, [values]);

  const blocked = useMemo(
    () => page.fields.some((field) => (values[field.key] || "").length > field.limit),
    [page.fields, values],
  );

  async function publish() {
    if (blocked) {
      setStatus("Erro ao salvar");
      return;
    }
    setStatus("Salvando");
    const response = await apiFetch("/api/admin/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType: "content_page", entityId: page.slug, version: Date.now(), routes: ["/"] }),
    });
    setStatus(response.ok ? "Publicado" : "Erro ao salvar");
  }

  return (
    <div className="content-studio">
      <div className="studio-editor">
        <div className="studio-toolbar" aria-label="Controles de publicação">
          <button type="button" className="button button--secondary" onClick={() => setStatus("Rascunho salvo")}>
            <Save size={17} /> Salvar rascunho
          </button>
          <button type="button" className="button button--primary" onClick={publish} disabled={blocked}>
            <Send size={17} /> Publicar agora
          </button>
          <button type="button" className="button button--secondary">
            <Eye size={17} /> Visualizar página
          </button>
          <button type="button" className="icon-action" aria-label="Restaurar versão" title="Restaurar versão">
            <RotateCcw size={18} />
          </button>
          <button type="button" className="icon-action" aria-label="Descartar alterações" title="Descartar alterações">
            <Trash2 size={18} />
          </button>
        </div>
        <p className={`studio-status ${blocked ? "studio-status--error" : ""}`}>{status}</p>
        {page.fields.map((field) => {
          const value = values[field.key] || "";
          const over = value.length > field.limit;
          return (
            <label className="studio-field" key={field.key}>
              <span>
                {field.label}
                <small className={over ? "limit-over" : ""}>
                  {value.length} / {field.limit}
                </small>
              </span>
              <textarea
                value={value}
                maxLength={field.limit + 40}
                onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
              />
            </label>
          );
        })}
      </div>
      <aside className="studio-preview">
        <div className="device-switcher" aria-label="Preview por dispositivo">
          <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")} title="Desktop">
            <Monitor size={18} />
          </button>
          <button type="button" aria-pressed={device === "tablet"} onClick={() => setDevice("tablet")} title="Tablet">
            <Tablet size={18} />
          </button>
          <button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")} title="Mobile">
            <Smartphone size={18} />
          </button>
        </div>
        <div className={`preview-frame preview-frame--${device}`}>
          <span>Prévia de rascunho - ainda não publicada.</span>
          <p className="eyebrow">{values.heroEyebrow || page.title}</p>
          <h2>{values.heroTitle || values.title || page.title}</h2>
          <p>{values.heroSubtitle || values.description || "Conteúdo em revisão."}</p>
          <button type="button">{values.primaryCta || "CTA"}</button>
        </div>
      </aside>
    </div>
  );
}
