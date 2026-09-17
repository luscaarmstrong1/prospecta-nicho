import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { withBasePath } from "@/src/lib/api/runtime";

type Params = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Pedido CRM", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return [{ id: "demo" }];
}

export default async function AdminRequestDetailCompatPage({ params }: Params) {
  const { id } = await params;
  const detailHref = withBasePath(`/admin/requests/detalhe/?id=${encodeURIComponent(id)}`);

  return (
    <AdminShell title="Detalhe do pedido CRM" eyebrow="Controle operacional">
      <div className="admin-panel">
        <p>
          Esta rota dinâmica é mantida apenas por compatibilidade do build estático. Para abrir pedidos reais criados
          depois do deploy, use a página de detalhe em tempo real.
        </p>
        <Link className="button button--secondary" href={detailHref}>
          Abrir detalhe em tempo real
        </Link>
      </div>
    </AdminShell>
  );
}
