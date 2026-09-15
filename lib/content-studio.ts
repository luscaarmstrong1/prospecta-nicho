import { assetPath } from "@/lib/asset-path";
import { products, homeFaq, dataFields } from "@/lib/site";

export const adminRoles = [
  { role: "admin", label: "Admin", permissions: "Tudo" },
  { role: "editor", label: "Editor", permissions: "Conteúdo, SEO, FAQ, produtos e mídia" },
  { role: "operador", label: "Operador", permissions: "Leads, pedidos, amostras e exportações" },
  { role: "leitura", label: "Leitura", permissions: "Apenas visualização" },
];

export const editorialLimits = {
  heroEyebrow: { label: "Hero eyebrow", max: 55 },
  heroTitle: { label: "Hero título", max: 92 },
  heroSubtitle: { label: "Hero subtítulo", max: 240 },
  cta: { label: "CTA", max: 42 },
  productTitle: { label: "Título de produto", max: 55 },
  productDescription: { label: "Descrição de produto", max: 190 },
  benefit: { label: "Benefício", max: 90 },
  faqQuestion: { label: "Pergunta FAQ", max: 120 },
  faqAnswer: { label: "Resposta FAQ", max: 600 },
};

export const revalidationRoutes = [
  "/",
  "/produtos",
  "/montar-minha-base",
  "/para-quem-e",
  "/como-funciona",
  "/faq",
  "/contato",
  "/sobre",
];

export const contentStudioNav = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/requests", label: "CRM CNPJ" },
  { href: "/admin/jobs", label: "Jobs CNPJ" },
  { href: "/admin/exports", label: "Exports CRM" },
  { href: "/admin/segment-mapping", label: "Mapeamento" },
  { href: "/admin/concessionarias", label: "Concessionárias" },
  { href: "/admin/suppression-list", label: "Supressão" },
  { href: "/admin/conteudo", label: "Conteúdo" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/precos", label: "Preços" },
  { href: "/admin/segmentos", label: "Segmentos" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/menus", label: "Menus" },
  { href: "/admin/ctas", label: "CTAs" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/midias", label: "Mídias" },
  { href: "/admin/configuracoes", label: "Configurações" },
  { href: "/admin/revisoes", label: "Revisões" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/exportacoes", label: "Exportações" },
  { href: "/admin/preview", label: "Preview" },
];

export const editablePages = [
  {
    slug: "home",
    title: "Home",
    template: "landing",
    fields: [
      { key: "heroEyebrow", label: "Eyebrow do hero", value: "Bases B2B segmentadas", limit: editorialLimits.heroEyebrow.max },
      { key: "heroTitle", label: "Título", value: "Transforme seu público ideal em uma base pronta para prospecção.", limit: editorialLimits.heroTitle.max },
      { key: "heroSubtitle", label: "Subtítulo", value: "Critérios comerciais viram recortes de empresas organizados, auditáveis e prontos para abordagem.", limit: editorialLimits.heroSubtitle.max },
      { key: "primaryCta", label: "CTA principal", value: "Montar minha base", limit: editorialLimits.cta.max },
    ],
  },
  {
    slug: "produtos",
    title: "Produtos",
    template: "catalog",
    fields: [
      { key: "title", label: "Título", value: "Bases prontas e recortes sob demanda", limit: editorialLimits.heroTitle.max },
      { key: "description", label: "Descrição", value: "Escolha um pacote validado ou monte uma base personalizada com critérios comerciais.", limit: editorialLimits.heroSubtitle.max },
    ],
  },
];

export const adminProducts = products.map((product, index) => ({
  slug: product.slug,
  name: product.name,
  status: product.slug === "amostra-gratuita" ? "ativo" : "ativo",
  price: product.price,
  badge: product.badge || "Catálogo",
  description: product.description,
  image: assetPath("/assets/brand/logo-symbol.png"),
  cta: product.homeCta || "Escolher esta base",
  checkout: product.paymentEnv || "WhatsApp/fallback",
  order: index + 1,
  featured: product.slug === "empresas-recem-abertas",
  updatedAt: "2026-07-01",
}));

export const adminFaq = homeFaq.map((item, index) => ({
  ...item,
  category: index < 2 ? "Compra" : "Operação",
  order: index + 1,
  visible: true,
}));

const rawMediaAssets = [
  { name: "Logo matriz", path: "/assets/brand/logo-master-reference.png", type: "brand" },
  { name: "Logo principal", path: "/assets/brand/logo-horizontal.png", type: "brand" },
  { name: "Logo fundo escuro", path: "/assets/brand/logo-horizontal-dark-bg.png", type: "brand" },
  { name: "Símbolo", path: "/assets/brand/logo-symbol.png", type: "brand" },
  { name: "Favicon", path: "/assets/brand/favicon.png", type: "icon" },
  { name: "Open Graph", path: "/assets/brand/og-image.png", type: "social" },
  { name: "Brand cover", path: "/assets/brand/brand-cover.png", type: "social" },
];

export const mediaAssets = rawMediaAssets.map((asset) => ({ ...asset, path: assetPath(asset.path) }));

export const contentHealth = [
  { label: "Campos de base", value: dataFields.length.toString() },
  { label: "Produtos editáveis", value: adminProducts.length.toString() },
  { label: "FAQ editável", value: adminFaq.length.toString() },
  { label: "Rotas revalidadas", value: revalidationRoutes.length.toString() },
];
