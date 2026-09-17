import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrmExportLinkActions } from "@/components/admin/CrmExportLinkActions";
import { listCrmExportsForAdmin } from "@/src/server/services/crm";

export const metadata: Metadata = { title: "Exportações", robots: { index: false, follow: false } };

export default async function AdminExportsPage() {
  const exports = await listCrmExportsForAdmin();

  return (
    <AdminShell title="Exportações" eyebrow="Arquivos temporários">
      <div className="admin-panel">
        <p>No modo local, o worker registra o caminho controlado do arquivo para o operador copiar e entregar manualmente.</p>
        <div className="admin-table">
          {exports.length ? (
            exports.map((item) => (
              <div className="admin-table-row" key={item.id}>
                <strong>{item.id}</strong>
                <span>{item.status}</span>
                <span>{item.storageProvider}</span>
                <span>{item.rowCount} linhas</span>
                <span>{item.fileUrl ? "arquivo registrado" : "sem arquivo"}</span>
                <CrmExportLinkActions
                  exportId={item.id}
                  fileName={item.fileUrl?.split(/[\\/]/).pop()}
                  fileUrl={item.fileUrl}
                  storageProvider={item.storageProvider}
                />
              </div>
            ))
          ) : (
            <div className="admin-table-row">
              <strong>Nenhum export pronto</strong>
              <span>Inicie o worker local; o arquivo validado será registrado automaticamente ao final do job.</span>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
