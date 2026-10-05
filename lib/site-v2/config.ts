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
    title: "Sites & Landing Pages",
    subtitle: "Sites profissionais e conversão",
    href: "/",
  },
  {
    title: "Leads B2B",
    subtitle: "Bases B2B segmentadas",
    href: "/leads",
  },
  {
    title: "Prospecta Flow",
    subtitle: "Automação comercial",
    href: "/automacao",
  },
];

export interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

export const mainNavigation: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Leads B2B", href: "/leads" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export function getMainNavigation(currentPath?: string): NavItem[] {
  const normalizedPath = (currentPath || "/").replace(/\/+$/, "") || "/";
  const isLeads =
    normalizedPath === "/leads" ||
    normalizedPath.startsWith("/leads/") ||
    normalizedPath === "/leads-b2b";

  if (isLeads) {
    return [
      { label: "Início", href: "/leads" },
      { label: "Sites & Landing Pages", href: "/" },
      { label: "Sobre", href: "/sobre" },
      { label: "Contato", href: "/contato" },
    ];
  }

  return [
    { label: "Início", href: "/" },
    { label: "Leads B2B", href: "/leads" },
    { label: "Sobre", href: "/sobre" },
    { label: "Contato", href: "/contato" },
  ];
}

export const footerGroups = [
  {
    title: "Soluções",
    links: [
      { label: "Sites & Landing Pages", href: "/" },
      { label: "Leads B2B", href: "/leads" },
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
