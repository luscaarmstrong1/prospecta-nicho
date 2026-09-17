import type { Metadata } from "next";
import { LegacyRequestRedirect } from "@/components/requests/LegacyRequestRedirect";

export const metadata: Metadata = { title: "Solicitar planilha", alternates: { canonical: "/solicitar-planilha/" } };

export default function MontarMinhaBasePage() {
  return <LegacyRequestRedirect />;
}
