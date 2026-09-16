import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrmRequestActions } from "@/components/admin/CrmRequestActions";
import { getCrmRequestForAdmin, listCrmTimelineForAdmin } from "@/src/server/services/crm";

type Params = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Pedido CRM", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return [{ id: "demo" }];
}

export default async function AdminRequestDetailPage({ params }: Params) {
  const { id } = await params;
  const request = await getCrmRequestForAdmin(id);
  const timeline = request ? await listCrmTimelineForAdmin(request.id) : [];

  return (
    <AdminShell title="Detalhe do pedido CRM" eyebrow="Controle operacional">
      {request ? (
        <>
          <p className="lead">{request.publicCode}</p>
          <CrmRequestActions requestId={request.id} publicCode={request.publicCode} exportId={request.exportId} whatsapp={request.customer.whatsapp} />
          <div className="admin-panel">
            <div className="admin-table">
              <div className="admin-table-row">
                <strong>Cliente</strong>
                <span>{request.customer.name}</span>
                <span>{request.customer.email || "sem e-mail"}</span>
                <span>{request.customer.whatsapp}</span>
              </div>
              <div className="admin-table-row">
                <strong>Filtros</strong>
                <span>{request.filters.segment}</span>
                <span>{request.filters.city || "qualquer cidade"}</span>
                <span>{request.filters.uf || "qualquer UF"}</span>
              </div>
              <div className="admin-table-row">
                <strong>Status</strong>
                <span>{request.status}</span>
                <span>{request.paymentStatus}</span>
                <span>{request.enrichmentStatus}</span>
              </div>
            </div>
          </div>
          <div className="admin-panel">
            <h2 className="h3">Timeline operacional</h2>
            <div className="admin-table">
              {timeline.length ? (
                timeline.map((event) => (
                  <div className="admin-table-row" key={event}>
                    <span>{event}</span>
                  </div>
                ))
              ) : (
                <div className="admin-table-row">
                  <span>Nenhum evento registrado nesta instância.</span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="admin-panel">
          <p>Pedido não encontrado nesta instância. Consulte a API protegida ou o Supabase em produção.</p>
        </div>
      )}
    </AdminShell>
  );
}
