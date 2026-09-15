const demoRequest = {
  ok: true,
  source: "seed-demo",
  product: "Gerador de planilhas com dados publicos de CNPJ",
  customer: {
    name: "Lead Demo",
    company: "Empresa Demo",
    email: "demo@prospectanicho.com.br",
    whatsapp: "11999999999",
  },
  commercialGoal: "Demonstrar o CRM CNPJ",
  filters: {
    segment: "Energia solar",
    uf: "SP",
    city: "Campinas",
    cnaes: ["4321500"],
    quantity: 100,
    fields: ["cnpj", "razao_social", "nome_fantasia", "cnae_principal", "municipio", "uf", "porte"],
  },
  workflow: ["request_received", "admin_validates", "worker_generates_export", "admin_delivers_download"],
  enrichment: {
    includedByDefault: false,
    paidAddonOnly: true,
    manualAdminExecutionOnly: true,
  },
};

console.log(JSON.stringify(demoRequest, null, 2));
