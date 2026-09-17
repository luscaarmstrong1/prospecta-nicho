import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrmRequestsRealtimeList } from "@/components/admin/CrmRequestsRealtimeList";

export const metadata: Metadata = { title: "CRM CNPJ", robots: { index: false, follow: false } };

export default function AdminRequestsPage() {
  return (
    <AdminShell title="CRM de solicitacoes CNPJ" eyebrow="Gerador de planilhas">
      <p className="lead">
        Cada pedido publico vira uma oportunidade operacional com filtros, pagamento, job externo, export e add-on de
        enriquecimento bloqueado.
      </p>
      <div className="admin-panel">
        <div className="admin-table">
          <div className="admin-table-row">
            <strong>Fluxo</strong>
            <span>solicitacao - validacao - pagamento - job Python - export - entrega</span>
          </div>
          <div className="admin-table-row">
            <strong>Enriquecimento</strong>
            <span>bloqueado por padrao; liberacao manual somente apos pagamento do add-on</span>
          </div>
        </div>
      </div>
      <CrmRequestsRealtimeList />
    </AdminShell>
  );
}
