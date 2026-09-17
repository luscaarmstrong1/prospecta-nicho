"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/src/lib/api/client";
import { withBasePath } from "@/src/lib/api/runtime";

type CrmRequestActionsProps = {
  requestId: string;
  publicCode: string;
  exportId?: string;
  whatsapp?: string;
  status: string;
  productSlug: string;
  isPaid: boolean;
  enrichmentRequested: boolean;
  enrichmentPaid: boolean;
  enrichmentEnabled: boolean;
  hasReadyExport: boolean;
  hasActiveJob: boolean;
  onActionComplete?: () => void | Promise<void>;
};

function whatsappUrl(phone: string | undefined, publicCode: string) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  const text = `Olá! A base ProspectaNicho do protocolo ${publicCode} já está pronta para envio. Posso te encaminhar a planilha por aqui?`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`;
}

export function CrmRequestActions({
  requestId, publicCode, exportId, whatsapp, status, productSlug, isPaid,
  enrichmentRequested, enrichmentPaid, enrichmentEnabled, hasReadyExport, hasActiveJob, onActionComplete,
}: CrmRequestActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const isSample = productSlug === "amostra-gratuita";
  const actions = [
    { label: "Validar filtros", endpoint: "validate", enabled: status === "analysis", reason: "Disponível apenas para pedidos em análise." },
    ...(!isSample ? [{ label: "Marcar pagamento", endpoint: "mark-paid", enabled: status === "validated" && !isPaid, reason: "Valide os filtros antes de confirmar o pagamento.", confirm: true }] : []),
    {
      label: "Criar job CNPJ", endpoint: "create-job",
      enabled: !hasActiveJob && (isSample ? status === "validated" : status === "paid" && isPaid),
      reason: hasActiveJob ? "Já existe um job em fila ou processamento." : isSample ? "Valide a amostra antes de criar o job." : "Valide o pedido e confirme o pagamento antes de criar o job.",
      confirm: true,
    },
    { label: "Marcar entregue", endpoint: "mark-delivered", enabled: status === "ready_for_delivery" && hasReadyExport, reason: "A entrega só pode ser confirmada depois que o worker registrar um export pronto.", confirm: true },
    { label: "Oferecer enriquecimento", endpoint: "offer-enrichment", enabled: !enrichmentRequested && ["validated", "paid", "queued", "running", "ready_for_delivery", "delivered"].includes(status), reason: "Valide o pedido antes de oferecer o complemento." },
    { label: "Marcar enriquecimento pago", endpoint: "mark-enrichment-paid", enabled: enrichmentRequested && !enrichmentPaid, reason: "Ofereça o enriquecimento antes de confirmar o pagamento.", confirm: true },
    { label: "Rodar enriquecimento pago", endpoint: "run-enrichment", enabled: enrichmentPaid && enrichmentEnabled, reason: "O enriquecimento precisa estar pago e liberado." },
  ];

  async function runAction(endpoint: string, needsConfirmation = false) {
    if (needsConfirmation && !window.confirm("Confirma esta ação administrativa?")) return;
    setPending(endpoint);
    setMessage("");
    try {
      const response = await apiFetch(`/api/admin/requests/${requestId}/${endpoint}`, { method: "POST" });
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      if (response.status === 401) {
        window.location.assign(withBasePath("/admin/login/"));
        return;
      }
      if (!response.ok) {
        setMessage(body?.message || `Não foi possível executar a ação. HTTP ${response.status}.`);
        return;
      }
      setMessage("Ação executada com sucesso.");
      await onActionComplete?.();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha de rede ao executar a ação.");
    } finally {
      setPending(null);
    }
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
            disabled={pending !== null || !action.enabled}
            key={action.endpoint}
            onClick={() => runAction(action.endpoint, action.confirm)}
            title={action.enabled ? action.label : action.reason}
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
