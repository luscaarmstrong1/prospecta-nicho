"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/api/client";
import { withBasePath } from "@/src/lib/api/runtime";

type RawRequest = Record<string, unknown>;

type AdminRequestsResponse = {
  ok?: boolean;
  message?: string;
  requests?: RawRequest[];
};

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function requestValue(item: RawRequest, snakeKey: string, camelKey: string, fallback = "") {
  return text(item[snakeKey], text(item[camelKey], fallback));
}

function customerName(item: RawRequest) {
  return requestValue(item, "requester_name", "requesterName", text(item.name, "Cliente sem nome"));
}

function productName(item: RawRequest) {
  return requestValue(item, "product_slug", "productSlug", text(item.product, "Gerador CNPJ"));
}

function segmentName(item: RawRequest) {
  return requestValue(item, "segment_label", "segmentLabel", requestValue(item, "segment_slug", "segment", "Segmento pendente"));
}

function publicCode(item: RawRequest) {
  return requestValue(item, "public_code", "publicCode", text(item.id, "sem código"));
}

function createdAt(item: RawRequest) {
  const raw = requestValue(item, "created_at", "createdAt");
  if (!raw) return "sem data";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export function CrmRequestsRealtimeList() {
  const [requests, setRequests] = useState<RawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch("/api/admin/requests");
      const body = (await response.json().catch(() => null)) as AdminRequestsResponse | null;

      if (response.status === 401) {
        window.location.assign(withBasePath("/admin/login/"));
        return;
      }

      if (!response.ok || !body?.ok) {
        setRequests([]);
        setError(body?.message || `Não foi possível carregar os pedidos. HTTP ${response.status}.`);
        return;
      }

      setRequests(Array.isArray(body.requests) ? body.requests : []);
    } catch (loadError) {
      setRequests([]);
      setError(loadError instanceof Error ? loadError.message : "Falha desconhecida ao carregar os pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  return (
    <div className="admin-panel">
      <div className="admin-toolbar">
        <h2 className="h3">Pedidos recentes</h2>
        <button className="button button--secondary" disabled={loading} onClick={() => void loadRequests()} type="button">
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>
      {error ? <p role="alert">{error}</p> : null}
      <div className="admin-table">
        <div className="admin-table-row">
          <strong>Código público</strong>
          <span>Cliente</span>
          <span>Segmento</span>
          <span>Produto</span>
          <span>Status</span>
          <span>Data</span>
        </div>
        {loading ? (
          <div className="admin-table-row">
            <strong>Carregando pedidos</strong>
            <span>Consultando o Supabase em tempo real pela Edge Function admin-requests.</span>
          </div>
        ) : requests.length ? (
          requests.map((item) => {
            const id = text(item.id);
            const href = id ? withBasePath(`/admin/requests/detalhe/?id=${encodeURIComponent(id)}`) : "#";
            return (
              <Link className="admin-table-row" href={href} key={id || publicCode(item)}>
                <strong>{publicCode(item)}</strong>
                <span>{customerName(item)}</span>
                <span>{segmentName(item)}</span>
                <span>{productName(item)}</span>
                <span>{text(item.status, "status pendente")}</span>
                <span>{createdAt(item)}</span>
              </Link>
            );
          })
        ) : (
          <div className="admin-table-row">
            <strong>Nenhum pedido encontrado no Supabase</strong>
            <span>Quando um formulário público criar um pedido, ele aparecerá aqui sem novo build.</span>
          </div>
        )}
      </div>
    </div>
  );
}
