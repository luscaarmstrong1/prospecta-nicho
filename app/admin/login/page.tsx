import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata: Metadata = { title: "Login administrativo", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <AdminShell title="Login administrativo" eyebrow="Area protegida">
      <div className="admin-panel">
        <p>
          Entre com o usuário do Supabase Auth autorizado no CRM. A sessão usa cookie httpOnly no backend dinâmico e JWT
          temporário no site estático, sem expor service role no frontend.
        </p>
        <AdminLoginForm />
      </div>
    </AdminShell>
  );
}
