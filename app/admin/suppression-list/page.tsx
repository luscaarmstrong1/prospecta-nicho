import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Lista de supressao", robots: { index: false, follow: false } };

export default function AdminSuppressionListPage() {
  return (
    <AdminShell title="Lista de supressao" eyebrow="LGPD">
      <div className="admin-panel">
        <p>Central para registrar exclusões, oposições e revisões antes de gerar ou entregar bases comerciais.</p>
        <div className="admin-table">
          <div className="admin-table-row">
            <strong>Regra</strong>
            <span>Aplicar supressão antes do export e manter log de auditoria.</span>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
