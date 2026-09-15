import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Produtos CRM", robots: { index: false, follow: false } };

export default function AdminProductsAliasPage() {
  return (
    <AdminShell title="Produtos CRM" eyebrow="Gerador CNPJ">
      <div className="admin-panel">
        <p>Produto principal: gerador de planilhas com dados públicos de CNPJ. Enriquecimento permanece add-on pago.</p>
        <Link className="button button-primary" href="/admin/produtos">
          Editar produtos comerciais
        </Link>
      </div>
    </AdminShell>
  );
}
