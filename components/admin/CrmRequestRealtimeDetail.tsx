"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CrmRequestActions } from "@/components/admin/CrmRequestActions";
import { apiFetch } from "@/src/lib/api/client";
import { withBasePath } from "@/src/lib/api/runtime";

type RawRow = Record<string, unknown>;

type AdminRequestDetailResponse = {
  ok?: boolean;
  message?: string;
  request?: RawRow;
  filters?: RawRow | null;
  fields?: RawRow[];
  events?: RawRow[];
  jobs?: RawRow[];
  exports?: RawRow[];
};

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function value(row: RawRow | null | undefined, snakeKey: string, camelKey: string, fallback = "") {
  if (!row) return fallback;
  return text(row[snakeKey], text(row[camelKey], fallback));
}

function formatDate(value: unknown) {
  const raw = text(value);
  if (!raw) return "sem data";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function publicCode(request: RawRow) {
  return value(request, "public_code", "publicCode", text(request.id, "sem codigo"));
}

function customerName(request: RawRow) {
  return value(request, "requester_name", "requesterName", text(request.name, "Cliente sem nome"));
}

function customerWhatsapp(request: RawRow) {
  return value(request, "requester_whatsapp", "requesterWhatsapp", text(request.whatsapp));
}

function customerEmail(request: RawRow) {
  return value(request, "requester_email", "requesterEmail", text(request.email, "sem e-mail"));
}

function latestExportId(request: RawRow, exports: RawRow[]) {
  return value(request, "export_id", "exportId", text(exports[0]?.id));
}

function paymentStatus(request: RawRow) {
  return text(request.payment_status, request.is_paid === true ? "paid" : "pending");
}

export function CrmRequestRealtimeDetail() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("id") || "";
  const [payload, setPayload] = useState<AdminRequestDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequest = useCallback(async () => {
    if (!requestId) {
      setLoading(false);
      setError("Pedido nao informado. Volte para a listagem e abra um pedido valido.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await apiFetch(`/api/admin/requests/${encodeURIComponent(requestId)}`);
      const body = (await response.json().catch(() => null)) as AdminRequestDetailResponse | null;

      if (response.status === 401) {
        window.location.assign(withBasePath("/admin/login/"));
        return;
      }

      if (!response.ok || !body?.ok) {
        setPayload(null);
        setError(body?.message || `Nao foi possivel carregar o pedido. HTTP ${response.status}.`);
        return;
      }

      setPayload(body);
    } catch (loadError) {
      setPayload(null);
      setError(loadError instanceof Error ? loadError.message : "Falha desconhecida ao carregar o pedido.");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void loadRequest();
  }, [loadRequest]);

  const request = payload?.request || null;
  const filters = payload?.filters || null;
  const events = useMemo(() => payload?.events || [], [payload?.events]);
  const jobs = useMemo(() => payload?.jobs || [], [payload?.jobs]);
  const exports = useMemo(() => payload?.exports || [], [payload?.exports]);

  if (loading) {
    return (
      <div className="admin-panel">
        <p>Carregando pedido em tempo real pelo Supabase.</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="admin-panel">
        <p role={error ? "alert" : undefined}>{error || "Pedido nao encontrado."}</p>
        <Link className="button button--secondary" href={withBasePath("/admin/requests/")}>
          Voltar para pedidos
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="admin-toolbar">
        <p className="lead">{publicCode(request)}</p>
        <button className="button button--secondary" disabled={loading} onClick={() => void loadRequest()} type="button">
          Atualizar
        </button>
      </div>
      <CrmRequestActions
        requestId={text(request.id, requestId)}
        publicCode={publicCode(request)}
        exportId={latestExportId(request, exports)}
        whatsapp={customerWhatsapp(request)}
        onActionComplete={loadRequest}
      />
      <div className="admin-panel">
        <h2 className="h3">Resumo do pedido</h2>
        <div className="admin-table">
          <div className="admin-table-row">
            <strong>Cliente</strong>
            <span>{customerName(request)}</span>
            <span>{customerEmail(request)}</span>
            <span>{customerWhatsapp(request) || "sem WhatsApp"}</span>
          </div>
          <div className="admin-table-row">
            <strong>Filtros</strong>
            <span>{value(request, "segment_label", "segmentLabel", value(request, "segment_slug", "segment", "segmento pendente"))}</span>
            <span>{value(filters, "city", "city", "qualquer cidade")}</span>
            <span>{value(filters, "uf", "uf", "qualquer UF")}</span>
          </div>
          <div className="admin-table-row">
            <strong>Status</strong>
            <span>{text(request.status, "status pendente")}</span>
            <span>{paymentStatus(request)}</span>
            <span>{text(request.enrichment_status, "locked")}</span>
          </div>
          <div className="admin-table-row">
            <strong>Produto</strong>
            <span>{value(request, "product_slug", "productSlug", "Gerador CNPJ")}</span>
            <span>{formatDate(request.created_at || request.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className="admin-panel">
        <h2 className="h3">Jobs e exports</h2>
        <div className="admin-table">
          {jobs.length ? (
            jobs.map((job) => (
              <div className="admin-table-row" key={text(job.id)}>
                <strong>{text(job.id)}</strong>
                <span>{text(job.status, "queued")}</span>
                <span>{text(job.current_step, "sem etapa")}</span>
                <span>{formatDate(job.created_at)}</span>
              </div>
            ))
          ) : (
            <div className="admin-table-row">
              <strong>Nenhum job criado</strong>
              <span>Use a acao Criar job CNPJ depois da validacao operacional.</span>
            </div>
          )}
          {exports.map((item) => (
            <div className="admin-table-row" key={text(item.id)}>
              <strong>Export {text(item.id)}</strong>
              <span>{text(item.status, "pending")}</span>
              <span>{text(item.file_format, text(item.format, "xlsx"))}</span>
              <span>{formatDate(item.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="admin-panel">
        <h2 className="h3">Timeline operacional</h2>
        <div className="admin-table">
          {events.length ? (
            events.map((event) => (
              <div className="admin-table-row" key={`${text(event.id)}-${text(event.created_at)}-${text(event.message)}`}>
                <strong>{formatDate(event.created_at)}</strong>
                <span>{text(event.status, "evento")}</span>
                <span>{text(event.message, "Evento sem mensagem.")}</span>
              </div>
            ))
          ) : (
            <div className="admin-table-row">
              <span>Nenhum evento registrado para este pedido.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
