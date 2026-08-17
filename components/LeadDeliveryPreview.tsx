const columns = ["Empresa", "Segmento", "Cidade", "CNAE", "Porte", "Abertura", "Status"];

const rows = [
  ["Clínica A***", "Saúde", "Campinas", "8630-5/03", "ME", "05/2026", "Nova empresa"],
  ["Nexo S***", "Energia solar", "Ribeirão Preto", "4321-5/00", "EPP", "04/2026", "Perfil ideal"],
  ["Alpha F***", "Alimentação", "Jundiaí", "5611-2/01", "ME", "06/2026", "Prioridade"],
  ["Vértice E***", "Sistemas", "Sorocaba", "6201-5/01", "EPP", "03/2026", "Em expansão"],
];

export function LeadDeliveryPreview() {
  return (
    <div className="delivery-preview" aria-label="Prévia profissional de entrega de base B2B">
      <div className="delivery-preview__header">
        <strong>Prévia da entrega</strong>
        <span>Dados fictícios e mascarados</span>
      </div>
      <div className="delivery-body">
        <div className="delivery-badges" aria-label="Filtros demonstrativos">
          <span>Empresas ativas</span>
          <span>ME e EPP</span>
          <span>Últimos 90 dias</span>
        </div>
        <div className="delivery-row" aria-hidden="true">
          {columns.map((column) => <strong key={column}>{column}</strong>)}
        </div>
        {rows.map((row) => (
          <div className="delivery-row" key={row.join("-")}>
            {row.map((cell, index) => (
              index === 6 ? <span className="status-pill" key={cell}>{cell}</span> : <span title={cell} key={`${cell}-${index}`}>{cell}</span>
            ))}
          </div>
        ))}
      </div>
      <div className="delivery-card-list">
        {rows.map((row) => (
          <article className="delivery-card" key={row.join("-")}>
            <strong>{row[0]}</strong>
            <span>{row[1]} - {row[2]}</span>
            <span>Abertura: {row[5]}</span>
            <span className="status-pill">{row[6]}</span>
          </article>
        ))}
      </div>
      <p className="delivery-note">
        Exemplo ilustrativo. Campos e disponibilidade variam conforme produto, origem e escopo contratado.
      </p>
    </div>
  );
}
