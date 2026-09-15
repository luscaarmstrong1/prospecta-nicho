"use client";

import { useState } from "react";
import { apiFetch } from "@/src/lib/api/client";

type CrmExportLinkActionsProps = {
  exportId: string;
};

export function CrmExportLinkActions({ exportId }: CrmExportLinkActionsProps) {
  const [pending, setPending] = useState(false);
  const [signedUrl, setSignedUrl] = useState("");
  const [message, setMessage] = useState("");

  async function createLink() {
    setPending(true);
    setMessage("");
    setSignedUrl("");

    const response = await apiFetch(`/api/admin/exports/${exportId}/sign-url`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expiresInSeconds: 24 * 60 * 60 }),
    });
    const body = (await response.json().catch(() => null)) as { signed?: { url: string }; message?: string } | null;
    setPending(false);

    if (!response.ok || !body?.signed?.url) {
      setMessage(body?.message || "Não foi possível gerar o link assinado.");
      return;
    }

    setSignedUrl(body.signed.url.startsWith("http") ? body.signed.url : `${window.location.origin}${body.signed.url}`);
    setMessage("Link temporário gerado por 24 horas.");
  }

  return (
    <div className="admin-export-actions">
      <button className="button button--secondary" disabled={pending} onClick={createLink} type="button">
        {pending ? "Gerando..." : "Gerar link 24h"}
      </button>
      {signedUrl ? (
        <input aria-label="Link assinado do export" readOnly value={signedUrl} onFocus={(event) => event.currentTarget.select()} />
      ) : null}
      {message ? <p role="status">{message}</p> : null}
    </div>
  );
}
