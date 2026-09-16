"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/src/lib/api/client";

type CrmRequestActionsProps = {
  requestId: string;
  publicCode: string;
  exportId?: string;
  whatsapp?: string;
};

const actions = [
  { label: "Validar filtros", endpoint: "validate" },
  { label: "Marcar pagamento", endpoint: "mark-paid" },
  { label: "Criar job CNPJ", endpoint: "create-job" },
  { label: "Marcar entregue", endpoint: "mark-delivered" },
  { label: "Marcar enriquecimento pago", endpoint: "mark-enrichment-paid" },
  { label: "Rodar enriquecimento pago", endpoint: "run-enrichment" },
];

function whatsappUrl(phone: string | undefined, publicCode: string) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  const text = `Olá! A base ProspectaNicho do protocolo ${publicCode} já está pronta para envio. Posso te encaminhar a planilha por aqui?`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`;
}

export function CrmRequestActions({ requestId, publicCode, exportId, whatsapp }: CrmRequestActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function runAction(endpoint: string) {
    setPending(endpoint);
    setMessage("");
    const response = await apiFetch(`/api/admin/requests/${requestId}/${endpoint}`, { method: "POST" });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setPending(null);

    if (!response.ok) {
      setMessage(body?.message || "Não foi possível executar a ação.");
      return;
    }

    setMessage("Ação executada com sucesso.");
    router.refresh();
  }

  return (
    <div className="admin-panel">
      <h2 className="h3">Ações do CRM</h2>
      <p>
        Protocolo público: <strong>{publicCode}</strong>
      </p>
      <div className="admin-action-grid">
        {whatsappUrl(whatsapp, publicCode) ? (
          <a className="button button--secondary" href={whatsappUrl(whatsapp, publicCode)} rel="noreferrer" target="_blank">
            Abrir WhatsApp do cliente
          </a>
        ) : null}
        {actions.map((action) => (
          <button
            className="button button--secondary"
            disabled={pending !== null}
            key={action.endpoint}
            onClick={() => runAction(action.endpoint)}
            type="button"
          >
            {pending === action.endpoint ? "Processando..." : action.label}
          </button>
        ))}
      </div>
      {exportId ? (
        <p>
          Export vinculado: <strong>{exportId}</strong>. Gere o link temporário na página de exportações.
        </p>
      ) : (
        <p>O link de entrega só aparece depois que o worker registrar um export pronto.</p>
      )}
      {message ? <p role="status">{message}</p> : null}
    </div>
  );
}
