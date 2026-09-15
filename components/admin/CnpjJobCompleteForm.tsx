"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/src/lib/api/client";

type CnpjJobCompleteFormProps = {
  jobId: string;
};

export function CnpjJobCompleteForm({ jobId }: CnpjJobCompleteFormProps) {
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState("");
  const [rowCount, setRowCount] = useState("0");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const response = await apiFetch(`/api/admin/jobs/${jobId}/complete`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fileUrl, rowCount: Number(rowCount), format: "xlsx" }),
    });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setPending(false);

    if (!response.ok) {
      setMessage(body?.message || "Não foi possível registrar o export.");
      return;
    }

    setFileUrl("");
    setMessage("Export registrado. O link assinado já pode ser gerado.");
    router.refresh();
  }

  return (
    <form className="admin-inline-form" onSubmit={submit}>
      <label>
        URL privada/controlada do XLSX
        <input
          onChange={(event) => setFileUrl(event.target.value)}
          placeholder="https://storage.example.com/private/export.xlsx"
          type="url"
          value={fileUrl}
        />
      </label>
      <label>
        Linhas
        <input min="0" onChange={(event) => setRowCount(event.target.value)} type="number" value={rowCount} />
      </label>
      <button className="button button--primary" disabled={pending || !fileUrl.trim()} type="submit">
        {pending ? "Registrando..." : "Registrar export"}
      </button>
      {message ? <p role="status">{message}</p> : null}
    </form>
  );
}
