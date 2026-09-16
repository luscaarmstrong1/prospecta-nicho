import type { Metadata } from "next";
import { CnpjJobCompleteForm } from "@/components/admin/CnpjJobCompleteForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { listCnpjJobsForAdmin } from "@/src/server/services/crm";

export const metadata: Metadata = { title: "Jobs CNPJ", robots: { index: false, follow: false } };

export default async function AdminJobsPage() {
  const jobs = await listCnpjJobsForAdmin();

  return (
    <AdminShell title="Jobs do worker CNPJ" eyebrow="Processamento externo">
      <p className="lead">
        O Next.js controla a fila; o worker Python consulta dados públicos de CNPJ via Minha Receita, filtra, pontua e gera os exports.
      </p>
      <div className="admin-panel">
        <div className="admin-table">
          {jobs.length ? (
            jobs.map((job) => (
              <div className="admin-table-row" key={job.id}>
                <strong>{job.id}</strong>
                <span>{job.status}</span>
                <span>{job.searchProvider || job.worker}</span>
                <span>{job.progress ?? 0}%</span>
                <span>{job.rowsExported} linhas exportadas</span>
                {job.status === "queued" || job.status === "running" ? <CnpjJobCompleteForm jobId={job.id} /> : null}
              </div>
            ))
          ) : (
            <div className="admin-table-row">
              <strong>Fila vazia</strong>
              <span>Crie um job apenas depois de validar o pedido ou confirmar pagamento.</span>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
