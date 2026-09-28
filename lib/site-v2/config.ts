// cspell:ignore glossario

export const siteConfig = {
  name: "ProspectaNicho",
  tagline: "Dados que geram negócios.",
  description:
    "A ProspectaNicho transforma critérios comerciais em recortes de empresas prontos para prospecção no mercado B2B brasileiro.",
  url: "https://prospectanicho.com.br",
  email: "contato@prospectanicho.com.br",
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
    href: "/",
  },
  {
    title: "Prospecta Web",
    subtitle: "Sites & Landing Pages",
    href: "/solucoes/sites-landing-pages",
  },
  {
    title: "Prospecta Local",
    subtitle: "Google & Presença Local",
    href: "/solucoes#local",
  },
  {
    title: "Prospecta Brand",
    subtitle: "Identidade Visual",
    href: "/solucoes#brand",
  },
  {
    title: "Prospecta Flow",
    subtitle: "CRM, Automação & IA",
    href: "/solucoes#flow",
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
      { label: "Prospecta Dados", href: "/" },
      { label: "Prospecta Web", href: "/solucoes/sites-landing-pages" },
      { label: "Prospecta Local", href: "/solucoes#local" },
      { label: "Prospecta Brand", href: "/solucoes#brand" },
      { label: "Prospecta Flow", href: "/solucoes#flow" },
    ],
  },
  {
    title: "Conteúdo",
    links: [
      { label: "Blog", href: "/conteudo" },
      { label: "Cases", href: "/solucoes/sites-landing-pages#projetos" },
      { label: "Materiais", href: "/conteudo#materiais" },
      { label: "Perguntas frequentes", href: "/planos#faq" },
      { label: "Glossário", href: "/conteudo#glossario" },
    ],
  },
  {
    title: "Sobre",
    links: [
      { label: "Nossa História", href: "/sobre#historia" },
      { label: "Nosso Time", href: "/sobre#time" },
      { label: "Contato", href: "/contato" },
      { label: "Trabalhe Conosco", href: "/sobre#carreiras" },
      { label: "Seja um Parceiro", href: "/contato?assunto=parceria" },
    ],
  },
];
