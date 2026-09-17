"use client";

import Link from "next/link";
import { useEffect } from "react";
import { withBasePath } from "@/src/lib/api/runtime";

export function LegacyRequestRedirect() {
  const target = withBasePath("/solicitar-planilha/");

  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <section className="section">
      <div className="container-reading legal-card">
        <p className="eyebrow">Solicitação</p>
        <h1 className="h2">Abrindo a página de solicitação...</h1>
        <p>Agora todas as bases são solicitadas em uma única tela.</p>
        <Link className="button button--primary" href={target}>Continuar</Link>
      </div>
    </section>
  );
}
