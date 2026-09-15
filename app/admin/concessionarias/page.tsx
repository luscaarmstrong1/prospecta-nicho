import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Concessionarias", robots: { index: false, follow: false } };

export default function AdminConcessionariasPage() {
  return (
    <AdminShell title="Concessionárias e regiões" eyebrow="Energia e território">
      <div className="admin-panel">
        <p>Cadastro de apoio para pedidos que precisam filtrar empresas por área de atendimento energético.</p>
        <div className="admin-table">
          <div className="admin-table-row">
            <strong>Modelo operacional</strong>
            <span>UF, cidade, concessionária, aliases e observações de cobertura.</span>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
