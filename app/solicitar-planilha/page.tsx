import type { Metadata } from "next";
import { Suspense } from "react";
import { UnifiedRequestForm } from "@/components/requests/UnifiedRequestForm";

export const metadata: Metadata = {
  title: "Solicitar planilha",
  description: "Solicite uma amostra grátis ou uma base B2B personalizada em uma única página.",
  alternates: { canonical: "/solicitar-planilha/" },
};

export default function SolicitarPlanilhaPage() {
  return (
    <Suspense fallback={<div className="section"><div className="container"><p>Carregando solicitação...</p></div></div>}>
      <UnifiedRequestForm />
    </Suspense>
  );
}
