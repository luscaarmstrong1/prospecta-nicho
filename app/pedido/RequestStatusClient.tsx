"use client";

// cspell:words codigo
import { MessageCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { apiFetch } from "@/src/lib/api/client";

type PublicStatus = {
  ok?: boolean;
  message?: string;
  request?: {
    publicCode?: string;
    status?: string;
    product?: string;
    segment?: string;
    city?: string;
    uf?: string;
    updatedAt?: string;
  };
  events?: Array<{ status?: string; message?: string; createdAt?: string }>;
};

const infrastructureError = "Não foi possível consultar o pedido agora. Tente novamente.";
const notFoundError = "Pedido não encontrado para este protocolo.";

export function RequestStatusClient() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<PublicStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);

  const whatsappHref = useMemo(
    () => createWhatsAppLink(`Olá, quero falar sobre o pedido ${code || "da ProspectaNicho"}.`),
    [code],
  );

  const loadStatus = useCallback(async (nextCode: string) => {
    const normalizedCode = nextCode.trim().toUpperCase();
    if (!normalizedCode || activeRequest.current) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    activeRequest.current = controller;
    setCode(normalizedCode);
    setStatus(null);
    setLoading(true);

    try {
      const response = await apiFetch(
        `/api/public/request-status?codigo=${encodeURIComponent(normalizedCode)}`,
        { signal: controller.signal },
      );
      const payload = (await response.json().catch(() => null)) as PublicStatus | null;

      if (response.status === 404) {
        setStatus({ ok: false, message: notFoundError });
      } else if (!response.ok || !payload || typeof payload !== "object") {
        setStatus({ ok: false, message: infrastructureError });
      } else if (payload.ok !== true || !payload.request) {
        setStatus({ ok: false, message: payload.message || notFoundError });
      } else {
        setStatus(payload);
      }
    } catch {
      setStatus({ ok: false, message: infrastructureError });
    } finally {
      window.clearTimeout(timeout);
      activeRequest.current = null;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialCode = (params.get("codigo") || params.get("code") || "").toUpperCase();
    if (initialCode) void loadStatus(initialCode);
  }, [loadStatus]);

  useEffect(() => () => activeRequest.current?.abort(), []);

  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Pedido</p>
        <h1 className="h1">Acompanhamento da sua solicitação</h1>
        <div className="legal-card request-status-card">
          <label className="field">
            <span>Protocolo</span>
            <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="PN-00000000" autoComplete="off" />
          </label>
          <button className="button button--primary" type="button" disabled={loading || !code.trim()} onClick={() => void loadStatus(code)}>
            <RefreshCw size={18} />
            {loading ? "Consultando..." : status?.ok === false ? "Tentar novamente" : "Consultar status"}
          </button>
          {loading ? <p className="muted" role="status" aria-live="polite">Consultando seu pedido...</p> : null}
          {status ? (
            <div className="status-result" role={status.ok ? "status" : "alert"} aria-live="polite">
              {status.ok && status.request ? (
                <>
                  <h2 className="h3">Status atual: {status.request.status || "em validação"}</h2>
                  <p>Produto: {status.request.product || "Gerador de planilhas CNPJ"}. Segmento: {status.request.segment || "a validar"}. Região: {[status.request.city, status.request.uf].filter(Boolean).join("/") || "a validar"}.</p>
                  <p>Os arquivos finais permanecem privados e são entregues por link temporário gerado pela equipe.</p>
                  {status.events?.length ? (
                    <ul className="timeline-list">
                      {status.events.slice(0, 5).map((event, index) => (
                        <li key={`${event.createdAt}-${index}`}>
                          <strong>{event.status || "atualização"}</strong>
                          <span>{event.message || "Pedido atualizado."}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : <p>{status.message || notFoundError}</p>}
            </div>
          ) : null}
          <a className="button button--teal" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} />
            Falar sobre meu pedido
          </a>
        </div>
      </div>
    </section>
  );
}
