// cspell:ignore comercios Ltda
// Conteúdo comercial centralizado para manter números e ofertas auditáveis.
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
  | "target"
  | "trendingUp"
  | "users"
  | "zap";

export const previewNavigation = [
  { label: "Início", href: "#inicio" },
  { label: "Soluções", href: "#solucoes", dropdown: true },
  { label: "Segmentos", href: "#segmentos" },
  { label: "Planos", href: "#planos" },
  { label: "Conteúdo", href: "#amostra", dropdown: true },
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "/contato" },
];

export const regionalReach = [
  { region: "Norte", total: "+ 125 mil", left: "20%", top: "18%" },
  { region: "Nordeste", total: "+ 298 mil", left: "70%", top: "24%" },
  { region: "Centro-Oeste", total: "+ 210 mil", left: "22%", top: "48%" },
  { region: "Sudeste", total: "+ 1,2 milhão", left: "62%", top: "54%" },
  { region: "Sul", total: "+ 420 mil", left: "34%", top: "76%" },
];

export const heroBenefits: Array<{ icon: PreviewIcon; label: string; line2?: string }> = [
  { icon: "shield", label: "Dados confiáveis", line2: "e atualizados" },
  { icon: "trendingUp", label: "Segmentação", line2: "por setor e região" },
  { icon: "target", label: "Mais agilidade", line2: "na prospecção" },
  { icon: "users", label: "Suporte", line2: "especializado" },
];

export const scaleMetrics = [
  { value: "5.8M", label: "empresas cadastradas" },
  { value: "+600", label: "segmentos mapeados" },
  { value: "5.570", label: "cidades cobertas" },
  { value: "", label: "Dados atualizados mensalmente" },
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
    title: "Indústrias",
    description: "Indústrias de diversos portes e segmentos em todo o Brasil.",
    image: "/preview-v2/assets/segment-industria.png",
    icon: "building",
  },
  {
    title: "Comércios",
    description: "Lojas, redes e comércios segmentados por região.",
    image: "/preview-v2/assets/segment-comercios-v2.png",
    icon: "search",
  },
  {
    title: "Serviços",
    description: "Empresas de serviços B2B e serviços especializados.",
    image: "/preview-v2/assets/office-meeting-team.png",
    icon: "settings",
  },
  {
    title: "Tecnologia",
    description: "Startups, software houses e empresas de tecnologia.",
    image: "/preview-v2/assets/segment-tecnologia.png",
    icon: "layers",
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
    price: "R$ 147,00",
    suffix: "por lista",
  },
  {
    icon: "megaphone",
    title: "Base para agências",
    description: "Agências, estúdios, produtoras e empresas de marketing digital.",
    price: "R$ 197,00",
    suffix: "por lista",
  },
  {
    icon: "calculator",
    title: "Contabilidades",
    description: "Escritórios contábeis, consultorias e serviços financeiros.",
    price: "R$ 197,00",
    suffix: "por lista",
  },
  {
    icon: "settings",
    title: "Base personalizada",
    description: "Fale com nosso time e monte uma base sob medida para o seu nicho.",
    price: "R$ 497,00",
    suffix: "por projeto",
    custom: true,
  },
];

export const testimonials: Array<{ quote: string; name: string; role: string; company: string; avatar: string }> = [];

export const finalTrustPoints = [
  { icon: "shield" as const, label: "Sem cartão de crédito" },
  { icon: "sparkles" as const, label: "Amostra gratuita" },
  { icon: "zap" as const, label: "Ativação rápida" },
];

export const footerGroups = [
  { title: "Soluções", links: ["Bases B2B", "Base personalizada", "Segmentos", "Planos"] },
  { title: "Conteúdo", links: ["Blog", "Cases", "Perguntas frequentes", "Materiais gratuitos"] },
  { title: "Sobre", links: ["Sobre nós", "Contato", "Política de privacidade", "Termos de uso"] },
];
