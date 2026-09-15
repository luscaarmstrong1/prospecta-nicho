import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { listCrmRequestsForAdmin } from "@/src/server/services/crm";

export const metadata: Metadata = { title: "CRM CNPJ", robots: { index: false, follow: false } };

export default async function AdminRequestsPage() {
  const requests = await listCrmRequestsForAdmin();

  return (
    <AdminShell title="CRM de solicitações CNPJ" eyebrow="Gerador de planilhas">
      <p className="lead">
        Cada pedido público vira uma oportunidade operacional com filtros, pagamento, job externo, export e add-on de
        enriquecimento bloqueado.
      </p>
      <div className="admin-panel">
        <div className="admin-table">
          <div className="admin-table-row">
            <strong>Fluxo</strong>
            <span>solicitação - validação - pagamento - job Python - export - entrega</span>
          </div>
          <div className="admin-table-row">
            <strong>Enriquecimento</strong>
            <span>bloqueado por padrão; liberação manual somente após pagamento do add-on</span>
          </div>
        </div>
      </div>
      <div className="admin-panel">
        <h2 className="h3">Pedidos recentes</h2>
        <div className="admin-table">
          {requests.length ? (
            requests.map((item) => (
              <Link className="admin-table-row" href={`/admin/requests/${item.id}`} key={item.id}>
                <strong>{item.publicCode}</strong>
                <span>{item.customer.name}</span>
                <span>{item.filters.segment}</span>
                <span>{item.status}</span>
              </Link>
            ))
          ) : (
            <div className="admin-table-row">
              <strong>Nenhum pedido em memoria</strong>
              <span>Use os formulários públicos ou a API admin para criar o primeiro registro.</span>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
