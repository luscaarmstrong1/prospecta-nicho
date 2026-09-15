import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata: Metadata = { title: "Login administrativo", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <AdminShell title="Login administrativo" eyebrow="Área protegida">
      <div className="admin-panel">
        <p>
          Informe o token administrativo configurado no servidor. A sessão usa cookie httpOnly e não expõe service role no
          frontend.
        </p>
        <AdminLoginForm />
      </div>
    </AdminShell>
  );
}
