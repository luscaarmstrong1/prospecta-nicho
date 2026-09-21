import type { Metadata } from "next";

export const siteConfig = {
  name: "ProspectaNicho",
  tagline: "Dados que criam negócios.",
  description:
    "A ProspectaNicho transforma critérios comerciais em recortes de empresas prontos para prospecção no mercado B2B brasileiro.",
  url: "https://prospectanicho.com.br",
  email: "contato@prospectanicho.com.br",
};

export const mainNavigation = [
  { label: "Soluções", href: "/solucoes" },
  { label: "Segmentos", href: "/segmentos" },
  { label: "Planos", href: "/planos" },
  { label: "Conteúdo", href: "/conteudo" },
  { label: "Sobre", href: "/sobre" },
];

export const footerGroups = [
  {
    title: "Soluções",
    links: [
      { label: "Bases B2B", href: "/solucoes#bases-b2b" },
      { label: "Recorte personalizado", href: "/solucoes#recorte-personalizado" },
      { label: "Integrações", href: "/solucoes#integracoes" },
      { label: "Planos", href: "/planos" },
    ],
  },
  {
    title: "Segmentos",
    links: [
      { label: "Indústria", href: "/segmentos" },
      { label: "Comércio", href: "/segmentos" },
      { label: "Serviços", href: "/segmentos" },
      { label: "Saúde", href: "/segmentos" },
      { label: "Construção", href: "/segmentos" },
      { label: "Tecnologia", href: "/segmentos" },
      { label: "Ver todos →", href: "/segmentos" },
    ],
  },
  {
    title: "Conteúdo",
    links: [
      { label: "Blog", href: "/conteudo" },
      { label: "Materiais gratuitos", href: "/conteudo#materiais" },
      { label: "Cases", href: "/conteudo#cases" },
      { label: "Perguntas frequentes", href: "/planos#faq" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Sobre nós", href: "/sobre" },
      { label: "Contato", href: "/contato" },
      { label: "Política de privacidade", href: "/politica-de-privacidade" },
      { label: "Termos de uso", href: "/termos-de-uso" },
    ],
  },
];
