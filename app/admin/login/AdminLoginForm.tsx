"use client";

import { useState } from "react";
import { apiFetch, saveAdminSessionToken } from "@/src/lib/api/client";
import { withBasePath } from "@/src/lib/api/runtime";

export function AdminLoginForm() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const response = await apiFetch("/api/admin/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setMessage(body?.message || "Não foi possível iniciar a sessão administrativa.");
      setPending(false);
      return;
    }

    saveAdminSessionToken(token);
    window.location.href = withBasePath("/admin/");
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label>
        Token administrativo
        <input
          autoComplete="current-password"
          onChange={(event) => setToken(event.target.value)}
          placeholder="Cole o ADMIN_API_TOKEN"
          type="password"
          value={token}
        />
      </label>
      <button className="button button--primary" disabled={pending || !token.trim()} type="submit">
        {pending ? "Validando..." : "Entrar"}
      </button>
      {message ? <p role="alert">{message}</p> : null}
    </form>
  );
}
