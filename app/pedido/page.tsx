import type { Metadata } from "next";
import { RequestStatusClient } from "@/app/pedido/RequestStatusClient";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Acompanhar pedido",
  robots: { index: false, follow: false },
};

export default function PedidoStatusPage() {
  return <RequestStatusClient />;
}
