import {
  BarChart3,
  Building2,
  Calculator,
  CreditCard,
  FileSpreadsheet,
  Megaphone,
  PanelsTopLeft,
  PhoneCall,
  SearchCheck,
  ShieldCheck,
  SlidersHorizontal,
  SunMedium,
  Target,
} from "lucide-react";
import { productCatalog } from "@/lib/products";
import { getSiteUrl } from "@/lib/site-url";

export const site = {
  name: "ProspectaNicho",
  institutional: "Empresas no momento certo para a venda certa.",
  campaign: "Transforme seu público ideal em uma base pronta para prospecção.",
  tagline: "Menos tempo procurando. Mais tempo falando com empresas que fazem sentido para sua operação.",
  description: "A ProspectaNicho transforma critérios comerciais em recortes de empresas prontos para prospecção.",
  url: getSiteUrl(),
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  email: process.env.CONTACT_EMAIL || "contato@prospectanicho.com.br",
};

export type Product = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  price: string;
  badge?: string;
  homeTitle?: string;
  homeText?: string;
  homeCta?: string;
  audience: string[];
  includes: string[];
  faq: { question: string; answer: string }[];
  paymentEnv?: string;
};

export const products: Product[] = [
  ...productCatalog.map((product) => ({
    slug: product.slug,
    name: product.title,
    shortName: product.title,
    homeTitle: product.title,
    homeText: product.commercialPromise,
    homeCta: product.slug === "base-personalizada" ? "Montar meu recorte" : "Escolher esta base",
    description: product.shortDescription,
    price: product.price,
    badge: product.badge,
    paymentEnv: product.checkoutLinkEnvKey,
    audience: product.recommendedFor.split(",").map((item) => item.trim()),
    includes: product.defaultFields,
    faq: [
      {
        question: "Quais campos são entregues?",
        answer: "Os campos variam conforme produto, origem e escopo contratado. Não incluímos CPF, sócios ou contatos particulares.",
      },
      {
        question: "A disponibilidade é garantida?",
        answer: "Não. Filtros e campos são confirmados conforme disponibilidade e validação do recorte.",
      },
    ],
  })),
  {
    slug: "amostra-gratuita",
    name: "Amostra gratuita",
    shortName: "Amostra gratuita",
    description: "Envio de amostra com até 10 empresas mascaradas para validação do formato.",
    price: "Gratuito",
    badge: "SEM CARTÃO",
    audience: ["Novos clientes", "Agências", "Contabilidades", "Empresas B2B"],
    includes: ["Até 10 empresas mascaradas", "Formato da planilha", "Campos disponíveis", "Exemplo de recorte"],
    faq: [
      {
        question: "A amostra é personalizada?",
        answer: "A amostra considera nicho e região informados, conforme disponibilidade, e demonstra estrutura sem entregar base comercial completa.",
      },
    ],
  },
];

export const solutions = [
  {
    slug: "agencias-de-marketing",
    title: "Leads para agências que querem prospectar empresas com potencial digital.",
    icon: Megaphone,
    pain: "Agências precisam abrir conversas com negócios que tenham demanda clara por presença digital, site, tráfego, conteúdo ou marca.",
    filters: ["Empresas recém-abertas", "Comércio local", "Clínicas", "Restaurantes", "E-commerces", "Cidades específicas"],
    recommended: ["agencias-marketing", "empresas-recem-abertas", "base-personalizada"],
  },
  {
    slug: "contabilidades",
    title: "Empresas novas e segmentos certos para prospecção contábil.",
    icon: Calculator,
    pain: "Escritórios contábeis ganham velocidade quando encontram empresas em fase de abertura, regularização ou estruturação.",
    filters: ["Data de abertura", "Porte", "Simples ou MEI quando aplicável", "Cidade", "CNAE", "Situação ativa"],
    recommended: ["contabilidades", "empresas-recem-abertas"],
  },
  {
    slug: "energia-solar",
    title: "Bases para empresas de energia solar prospectarem com mais foco.",
    icon: SunMedium,
    pain: "Operações solares precisam priorizar empresas com perfil regional e atividade econômica compatível com consumo relevante.",
    filters: ["Comércios", "Pequenas indústrias", "Produtores rurais", "Cidade", "Porte", "Segmento"],
    recommended: ["base-personalizada", "empresas-recem-abertas"],
  },
  {
    slug: "erp-e-sistemas",
    title: "Listas segmentadas para ERP, sistemas e automação comercial.",
    icon: PanelsTopLeft,
    pain: "Softwares vendem melhor quando abordam empresas com rotina operacional, fiscal, estoque, atendimento ou vendas recorrentes.",
    filters: ["Varejo", "Distribuidoras", "Serviços", "E-commerce", "CNAE", "Porte"],
    recommended: ["base-personalizada", "empresas-recem-abertas"],
  },
  {
    slug: "maquininhas-e-meios-de-pagamento",
    title: "Leads para maquininhas e meios de pagamento por cidade e atividade.",
    icon: CreditCard,
    pain: "Empresas de pagamento precisam encontrar negócios que recebem clientes, vendem presencialmente ou estão começando operação.",
    filters: ["Comércio", "Alimentação", "Estética", "Oficinas", "Varejo", "Empresas novas"],
    recommended: ["empresas-recem-abertas", "base-personalizada"],
  },
  {
    slug: "consultorias-b2b",
    title: "Bases para consultorias B2B encontrarem empresas com dor operacional.",
    icon: SearchCheck,
    pain: "Consultorias precisam de recortes que revelem contexto comercial, porte, localização e momento provável da empresa.",
    filters: ["Porte", "CNAE", "Cidade", "Segmento", "Tempo de abertura", "Perfil comercial"],
    recommended: ["base-personalizada", "empresas-recem-abertas"],
  },
];

export const dataFields = [
  "Razão social",
  "Nome fantasia",
  "CNPJ",
  "CNAE principal",
  "CNAEs secundários",
  "Segmento",
  "Cidade",
  "Estado",
  "Bairro",
  "CEP",
  "Data de abertura",
  "Porte",
  "Situação cadastral",
  "Capital social, quando aplicável",
  "Telefone empresarial, quando disponível",
  "E-mail empresarial, quando disponível",
  "Site, quando disponível",
  "Redes e outros campos conforme escopo",
];

export const homeFaq = [
  {
    question: "Em qual formato recebo a base?",
    answer: "A entrega é feita em planilha organizada, pronta para uso em Excel, Google Sheets ou importação em ferramentas comerciais.",
  },
  {
    question: "Posso escolher cidade e segmento?",
    answer: "Sim. Os recortes podem considerar nicho, cidade, estado, CNAE, porte, data de abertura e situação cadastral.",
  },
  {
    question: "Como funciona a amostra gratuita?",
    answer: "Você informa nicho e região, recebe até 10 empresas demonstrativas mascaradas e valida o formato antes de comprar.",
  },
  {
    question: "A base pode ser personalizada?",
    answer: "Sim. A base sob demanda é indicada quando você precisa de critérios específicos ou um recorte que não esteja no catálogo.",
  },
  {
    question: "Qual é o prazo estimado de entrega?",
    answer: "O prazo depende do produto, volume e critérios. A confirmação acontece após alinhamento do escopo.",
  },
];

export const trustItems = [
  { label: "Segmentação por nicho", icon: Target },
  { label: "Recorte por cidade e estado", icon: SlidersHorizontal },
  { label: "Empresas recém-abertas", icon: Building2 },
  { label: "Bases personalizadas", icon: BarChart3 },
  { label: "Entrega em planilha", icon: FileSpreadsheet },
];

export const guardrails = [
  { title: "Sem promessas absolutas", text: "O site evita termos como 100% legal, dados exclusivos ou garantias de resultado." },
  { title: "Minimização de dados", text: "A oferta prioriza dados empresariais públicos e campos necessários ao escopo." },
  { title: "Uso responsável", text: "Termos e páginas legais deixam claro que o comprador responde pelo uso adequado da base." },
  { title: "Canal de privacidade", text: "A estrutura prevê solicitação de remoção, oposição e atendimento aos direitos do titular." },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getSolution(slug: string) {
  return solutions.find((solution) => solution.slug === slug);
}

export function waLink(message: string) {
  if (!site.whatsapp) return "";
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function productPaymentLink(product: Product) {
  if (!product.paymentEnv) return "";
  return process.env[product.paymentEnv] || "";
}

export function productHref(product: Product) {
  if (product.slug === "amostra-gratuita") return "/produtos/amostra-gratuita";
  if (product.slug === "base-personalizada") return "/produtos/base-personalizada";
  return `/produtos/${product.slug}`;
}

export function productPrimaryHref(product: Product) {
  return `/solicitar-planilha?source=produto-${encodeURIComponent(product.slug)}`;
}

export const confidenceSections = [
  {
    icon: ShieldCheck,
    title: "Governança desde a oferta",
    text: "Páginas legais, consentimento em formulários e comunicação clara sobre variação de campos e disponibilidade.",
  },
  {
    icon: PhoneCall,
    title: "Venda assistida por WhatsApp",
    text: "CTAs com mensagens prontas ajudam a qualificar o pedido antes da compra ou da base personalizada.",
  },
  {
    icon: SearchCheck,
    title: "Critérios antes de volume",
    text: "A proposta valoriza recortes comerciais úteis, não listas genéricas de CNPJ sem contexto.",
  },
];
