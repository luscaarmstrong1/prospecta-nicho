// cspell:ignore Ltda carlos rafael patricia
export type PreviewIcon =
  | "building"
  | "calculator"
  | "database"
  | "globe"
  | "layers"
  | "map"
  | "megaphone"
  | "search"
  | "settings"
  | "shield"
  | "sparkles"
  | "zap";

export const previewNavigation = [
  { label: "Soluções", href: "#solucoes" },
  { label: "Segmentos", href: "#segmentos" },
  { label: "Planos", href: "#planos" },
  { label: "Conteúdo", href: "#amostra" },
  { label: "Sobre", href: "#sobre" },
];

export const regionalReach = [
  { region: "Norte", total: "+ 125 mil", left: "28%", top: "22%" },
  { region: "Nordeste", total: "+ 298 mil", left: "73%", top: "29%" },
  { region: "Centro-Oeste", total: "+ 210 mil", left: "38%", top: "54%" },
  { region: "Sudeste", total: "+ 1,2 milhão", left: "71%", top: "64%" },
  { region: "Sul", total: "+ 420 mil", left: "50%", top: "82%" },
];

export const heroBenefits: Array<{ icon: PreviewIcon; label: string }> = [
  { icon: "shield", label: "Dados confiáveis e atualizados" },
  { icon: "settings", label: "Segmentação por região e setor" },
  { icon: "zap", label: "Mais agilidade na prospecção" },
  { icon: "database", label: "Resultados reais para o seu time" },
];

export const scaleMetrics = [
  { value: "5,8M", label: "empresas cadastradas" },
  { value: "+600", label: "segmentos mapeados" },
  { value: "5.570", label: "cidades cobertas" },
];

export const sampleColumns = ["CNPJ", "Razão Social", "Segmento", "Cidade", "Porte", "Telefone"];

export const sampleRows = [
  ["12.345.678/0001-90", "Metalúrgica Horizonte Ltda", "Indústria Metalúrgica", "São Paulo - SP", "Médio", "(11) 3456-7890"],
  ["23.456.789/0001-12", "Plásticos do Brasil S/A", "Indústria de Plásticos", "Guarulhos - SP", "Grande", "(11) 2478-1122"],
  ["34.567.890/0001-03", "Alfa Componentes Ltda", "Autopeças", "São Bernardo - SP", "Médio", "(11) 4332-5566"],
  ["45.678.901/0001-76", "Tech Indústria e Com.", "Máquinas e Equipamentos", "Osasco - SP", "Médio", "(11) 3601-7788"],
  ["56.789.012/0001-24", "Inova Embalagens Ltda", "Embalagens", "Jundiaí - SP", "Pequeno", "(11) 4521-9933"],
];

export const featuredSegments: Array<{
  title: string;
  description: string;
  image: string;
  icon: PreviewIcon;
}> = [
  {
    title: "Agências",
    description: "Agências de marketing, publicidade, digital e comunicação.",
    image: "/preview-v2/assets/segment-agencias.webp",
    icon: "megaphone",
  },
  {
    title: "Contabilidades",
    description: "Escritórios contábeis e empresas de consultoria financeira.",
    image: "/preview-v2/assets/segment-contabilidades.webp",
    icon: "calculator",
  },
  {
    title: "Energia Solar",
    description: "Empresas de energia solar, instaladoras e integradores.",
    image: "/preview-v2/assets/segment-energia-solar.webp",
    icon: "zap",
  },
];

export const plans: Array<{
  icon: PreviewIcon;
  title: string;
  description: string;
  price: string;
  suffix: string;
  custom?: boolean;
}> = [
  {
    icon: "calculator",
    title: "Empresas recém-abertas",
    description: "Seja o primeiro a chegar. Empresas recém-abertas, ideais para conhecer seus produtos e serviços.",
    price: "R$ 149",
    suffix: "por lista",
  },
  {
    icon: "megaphone",
    title: "Base para agências",
    description: "Agências, estúdios, produtoras e empresas de marketing digital.",
    price: "R$ 199",
    suffix: "por lista",
  },
  {
    icon: "calculator",
    title: "Contabilidades",
    description: "Escritórios contábeis, consultorias e serviços financeiros.",
    price: "R$ 199",
    suffix: "por lista",
  },
  {
    icon: "settings",
    title: "Base personalizada",
    description: "Fale com nosso time e monte uma base sob medida para o seu nicho.",
    price: "Sob consulta",
    suffix: "De acordo com o seu segmento",
    custom: true,
  },
];

export const testimonials = [
  {
    quote: "Com o Radar Nacional, nosso time comercial aumentou em 40% o número de reuniões em apenas 3 meses.",
    name: "Carlos Mendes",
    role: "Gerente Comercial",
    company: "Agência de Marketing",
    avatar: "/preview-v2/assets/avatar-carlos.webp",
  },
  {
    quote: "A qualidade dos dados é impressionante. Conseguimos encontrar empresas que realmente têm fit com a nossa solução.",
    name: "Rafael Costa",
    role: "Diretor de Vendas",
    company: "Software ERP",
    avatar: "/preview-v2/assets/avatar-rafael.webp",
  },
  {
    quote: "A plataforma é intuitiva, rápida e o suporte é excelente. Hoje é parte essencial da nossa operação comercial.",
    name: "Patrícia Lima",
    role: "Head de Prospecção",
    company: "Consultoria Empresarial",
    avatar: "/preview-v2/assets/avatar-patricia.webp",
  },
];

export const finalTrustPoints = [
  { icon: "shield" as const, label: "Sem cartão de crédito" },
  { icon: "sparkles" as const, label: "Amostra gratuita" },
  { icon: "zap" as const, label: "Ativação rápida" },
];

export const footerGroups = [
  { title: "Soluções", links: ["Bases B2B", "Recorte personalizado", "Integrações", "Planos"] },
  { title: "Segmentos", links: ["Indústria", "Comércio", "Serviços", "Saúde", "Construção", "Tecnologia", "Ver todos →"] },
  { title: "Conteúdo", links: ["Blog", "Materiais gratuitos", "Cases", "Perguntas frequentes"] },
  { title: "Institucional", links: ["Sobre nós", "Contato", "Política de privacidade", "Termos de uso"] },
];
