export type ShowcaseFilterId =
  | "todos"
  | "agencias"
  | "contabilidades"
  | "energia-solar"
  | "erp"
  | "maquininhas"
  | "recem-abertas"
  | "amostra-gratis";

export type ShowcaseItem = {
  slug: string;
  title: string;
  style: string;
  description: string;
  tags: string[];
  image: string;
  mobileImage: string;
  href: string;
  filters: ShowcaseFilterId[];
};

export const showcaseFilters: Array<{ id: ShowcaseFilterId; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "agencias", label: "Agências" },
  { id: "contabilidades", label: "Contabilidades" },
  { id: "energia-solar", label: "Energia solar" },
  { id: "erp", label: "ERP" },
  { id: "maquininhas", label: "Maquininhas" },
  { id: "recem-abertas", label: "Recém-abertas" },
  { id: "amostra-gratis", label: "Amostra grátis" },
];

export const showcaseItems: ShowcaseItem[] = [
  {
    slug: "agencias",
    title: "Base para agências",
    style: "Digital Growth",
    description: "Empresas com potencial para site, tráfego, social media e presença digital.",
    tags: ["Marketing", "Presença digital", "ME/EPP"],
    image: "/assets/images/segments/agencias.webp",
    mobileImage: "/assets/images/segments/agencias-mobile.webp",
    href: "/solicitar-planilha?segment=agencias&source=showcase-grid",
    filters: ["agencias", "amostra-gratis"],
  },
  {
    slug: "contabilidades",
    title: "Base para contabilidades",
    style: "Trust Operations",
    description: "Empresas em fase inicial de abertura, organização e estruturação contábil.",
    tags: ["Recém-abertas", "Serviços B2B", "CNPJ"],
    image: "/assets/images/segments/contabilidades.webp",
    mobileImage: "/assets/images/segments/contabilidades-mobile.webp",
    href: "/solicitar-planilha?segment=contabilidades&source=showcase-grid",
    filters: ["contabilidades", "recem-abertas", "amostra-gratis"],
  },
  {
    slug: "energia-solar",
    title: "Base para energia solar",
    style: "Clean Tech",
    description: "Negócios por região, porte e atividade para prospecção comercial consultiva.",
    tags: ["B2B", "Região", "Potencial"],
    image: "/assets/images/segments/energia-solar.webp",
    mobileImage: "/assets/images/segments/energia-solar-mobile.webp",
    href: "/solicitar-planilha?segment=energia-solar&source=showcase-grid",
    filters: ["energia-solar"],
  },
  {
    slug: "erp-e-sistemas",
    title: "Base para ERP e sistemas",
    style: "Operational Intelligence",
    description: "Empresas com rotina operacional e necessidade de controle, gestão e automação.",
    tags: ["Sistemas", "Gestão", "Operação"],
    image: "/assets/images/segments/erp-e-sistemas.webp",
    mobileImage: "/assets/images/segments/erp-e-sistemas-mobile.webp",
    href: "/solicitar-planilha?segment=erp-e-sistemas&source=showcase-grid",
    filters: ["erp"],
  },
  {
    slug: "maquininhas",
    title: "Base para maquininhas",
    style: "Fintech Local",
    description: "Negócios presenciais e operações comerciais que precisam estruturar pagamentos.",
    tags: ["Comércio", "Pagamentos", "Local"],
    image: "/assets/images/segments/maquininhas.webp",
    mobileImage: "/assets/images/segments/maquininhas-mobile.webp",
    href: "/solicitar-planilha?segment=maquininhas&source=showcase-grid",
    filters: ["maquininhas"],
  },
  {
    slug: "comunicacao-visual",
    title: "Base para comunicação visual",
    style: "Brand Local",
    description: "Empresas que podem precisar de fachada, identidade visual, materiais e presença local.",
    tags: ["Branding", "Fachada", "Negócios locais"],
    image: "/assets/images/segments/comunicacao-visual.webp",
    mobileImage: "/assets/images/segments/comunicacao-visual-mobile.webp",
    href: "/solicitar-planilha?segment=comunicacao-visual&source=showcase-grid",
    filters: [],
  },
];

export function itemMatchesSearch(item: ShowcaseItem, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  if (!normalizedQuery) return true;

  const searchableText = [item.title, item.style, item.description, ...item.tags]
    .join(" ")
    .toLocaleLowerCase("pt-BR");

  return searchableText.includes(normalizedQuery);
}
