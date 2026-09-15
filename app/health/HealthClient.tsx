"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/api/client";

type HealthPayload = {
  ok?: boolean;
  runtime?: string;
  checks?: Record<string, { ok: boolean; message: string }>;
  message?: string;
};

export function HealthClient() {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    setLoading(true);
    const response = await apiFetch("/api/health");
    const payload = (await response.json().catch(() => null)) as HealthPayload | null;
    setHealth(payload || { ok: false, message: "Não foi possível consultar a saúde do backend." });
    setLoading(false);
  }

  useEffect(() => {
    void check();
  }, []);

  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Health</p>
        <h1 className="h1">Status operacional</h1>
        <div className="legal-card">
          <button className="button button--secondary" onClick={check} disabled={loading} type="button">
            <RefreshCw size={18} />
            {loading ? "Verificando..." : "Verificar novamente"}
          </button>
          {health ? (
            <>
              <h2 className="h3">{health.ok ? "Backend operacional" : "Backend pendente"}</h2>
              <p>{health.message || "Consulta concluída."}</p>
              {health.checks ? (
                <ul className="timeline-list">
                  {Object.entries(health.checks).map(([key, item]) => (
                    <li key={key}>
                      <strong>{key}</strong>
                      <span>{item.ok ? "OK" : item.message}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
