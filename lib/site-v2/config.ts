// cspell:ignore glossario

export const siteConfig = {
  name: "Prospecta Nicho",
  tagline: "Dados. Presença. Automação. Crescimento.",
  description:
    "A ProspectaNicho transforma critérios comerciais em recortes de empresas prontos para prospecção no mercado B2B brasileiro.",
  url: "https://prospectanicho.app",
  email: "prospectanicho@gmail.com",
};

export interface SolutionItem {
  title: string;
  subtitle: string;
  href: string;
}

export const solutionsDropdown: SolutionItem[] = [
  {
    title: "Prospecta Dados",
    subtitle: "Bases B2B segmentadas",
    href: "/leads-b2b",
  },
  {
    title: "Prospecta Web",
    subtitle: "Sites & Landing Pages",
    href: "/sites",
  },
  {
    title: "Prospecta Flow",
    subtitle: "Automação comercial",
    href: "/automacao",
  },
];

export const mainNavigation = [
  { label: "Início", href: "/" },
  { label: "Soluções", href: "/solucoes", hasDropdown: true },
  { label: "Segmentos", href: "/segmentos" },
  { label: "Planos", href: "/planos" },
  { label: "Conteúdo", href: "/conteudo" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export const footerGroups = [
  {
    title: "Soluções",
    links: [
      { label: "Leads B2B", href: "/leads-b2b" },
      { label: "Sites", href: "/sites" },
      { label: "Landing pages", href: "/landing-pages" },
      { label: "Automação", href: "/automacao" },
    ],
  },
  {
    title: "Conteúdo",
    links: [
      { label: "Blog", href: "/conteudo" },
      { label: "Projetos", href: "/projetos" },
      { label: "Perguntas frequentes", href: "/planos#faq" },
      { label: "Materiais gratuitos", href: "/conteudo" },
    ],
  },
  {
    title: "Sobre",
    links: [
      { label: "Sobre nós", href: "/sobre" },
      { label: "Contato", href: "/contato" },
      { label: "Política de privacidade", href: "/politica-de-privacidade" },
      { label: "Termos de uso", href: "/termos-de-uso" },
    ],
  },
];
