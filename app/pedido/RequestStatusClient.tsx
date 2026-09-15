"use client";

// cspell:words codigo
import { MessageCircle, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { apiFetch } from "@/src/lib/api/client";

type PublicStatus = {
  ok?: boolean;
  code?: string;
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

export function RequestStatusClient() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<PublicStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCode(params.get("codigo") || params.get("code") || "");
  }, []);

  const whatsappHref = useMemo(
    () => createWhatsAppLink(`Olá, quero falar sobre o pedido ${code || "da ProspectaNicho"}.`),
    [code],
  );

  async function loadStatus(nextCode = code) {
    if (!nextCode.trim()) return;
    setLoading(true);
    const response = await apiFetch(`/api/public/request-status?codigo=${encodeURIComponent(nextCode.trim())}`);
    const payload = (await response.json().catch(() => null)) as PublicStatus | null;
    setStatus(payload || { ok: false, message: "Não foi possível ler o status." });
    setLoading(false);
  }

  useEffect(() => {
    if (code) void loadStatus(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Pedido</p>
        <h1 className="h1">Acompanhamento da sua solicitação</h1>
        <div className="legal-card">
          <label className="field">
            Protocolo
            <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="PN-00000000" />
          </label>
          <button className="button button--primary" type="button" disabled={loading || !code.trim()} onClick={() => loadStatus()}>
            <RefreshCw size={18} />
            {loading ? "Consultando..." : "Consultar status"}
          </button>
          {status ? (
            <div className="status-result" role="status">
              {status.ok && status.request ? (
                <>
                  <h2 className="h3">Status atual: {status.request.status || "em validação"}</h2>
                  <p>
                    Produto: {status.request.product || "Gerador de planilhas CNPJ"}. Segmento:{" "}
                    {status.request.segment || "a validar"}. Região:{" "}
                    {[status.request.city, status.request.uf].filter(Boolean).join("/") || "a validar"}.
                  </p>
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
              ) : (
                <p>{status.message || "Pedido não encontrado para este protocolo."}</p>
              )}
            </div>
          ) : null}
          {whatsappHref ? (
            <a className="button button--teal" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} />
              Falar sobre meu pedido
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
