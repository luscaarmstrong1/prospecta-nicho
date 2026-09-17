import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrmRequestRealtimeDetail } from "@/components/admin/CrmRequestRealtimeDetail";

export const metadata: Metadata = { title: "Pedido CRM", robots: { index: false, follow: false } };

export default function AdminRequestRealtimeDetailPage() {
  return (
    <AdminShell title="Detalhe do pedido CRM" eyebrow="Controle operacional">
      <Suspense
        fallback={
          <div className="admin-panel">
            <p>Carregando pedido em tempo real pelo Supabase.</p>
          </div>
        }
      >
        <CrmRequestRealtimeDetail />
      </Suspense>
    </AdminShell>
  );
}
