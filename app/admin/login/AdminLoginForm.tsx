"use client";

import { useState } from "react";
import { apiFetch, saveAdminSessionToken } from "@/src/lib/api/client";
import { withBasePath } from "@/src/lib/api/runtime";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const payload = email.trim() && password ? { email: email.trim(), password } : { token };
    const response = await apiFetch("/api/admin/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setMessage(body?.message || "Não foi possível iniciar a sessão administrativa.");
      setPending(false);
      return;
    }

    const body = (await response.json().catch(() => null)) as { session?: { accessToken?: string } } | null;
    saveAdminSessionToken(body?.session?.accessToken || token);
    window.location.href = withBasePath("/admin/");
  }

  const canSubmit = Boolean((email.trim() && password) || token.trim());

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label>
        Email administrativo
        <input
          autoComplete="email"
          inputMode="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@prospectanicho.com"
          type="email"
          value={email}
        />
      </label>
      <label>
        Senha
        <input
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Senha do Supabase Auth"
          type="password"
          value={password}
        />
      </label>
      <label>
        Token administrativo de fallback
        <input
          autoComplete="current-password"
          onChange={(event) => setToken(event.target.value)}
          placeholder="Cole o ADMIN_API_TOKEN"
          type="password"
          value={token}
        />
      </label>
      <button className="button button--primary" disabled={pending || !canSubmit} type="submit">
        {pending ? "Validando..." : "Entrar"}
      </button>
      {message ? <p role="alert">{message}</p> : null}
    </form>
  );
}
