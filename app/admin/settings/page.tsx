import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCrmSettings } from "@/src/server/services/crm";

export const metadata: Metadata = { title: "Configuracoes CRM", robots: { index: false, follow: false } };

export default function AdminCrmSettingsPage() {
  const settings = getCrmSettings();

  return (
    <AdminShell title="Configuracoes do CRM" eyebrow="Ambiente">
      <div className="admin-panel">
        <div className="admin-table">
          {Object.entries(settings).map(([key, value]) => (
            <div className="admin-table-row" key={key}>
              <strong>{key}</strong>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
