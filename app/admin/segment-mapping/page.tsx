import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Mapeamento de segmentos", robots: { index: false, follow: false } };

const mappings = [
  ["Agencias de marketing", "7311400, 7319002"],
  ["Contabilidades", "6920601"],
  ["Energia solar", "4321500, 3511501"],
  ["Seguros empresariais", "6622300"],
];

export default function AdminSegmentMappingPage() {
  return (
    <AdminShell title="Mapeamento segmento-CNAE" eyebrow="Filtros comerciais">
      <div className="admin-panel">
        <p>Use este mapa para traduzir nichos comerciais em CNAEs antes de acionar o worker.</p>
        <div className="admin-table">
          {mappings.map(([segment, cnaes]) => (
            <div className="admin-table-row" key={segment}>
              <strong>{segment}</strong>
              <span>{cnaes}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
