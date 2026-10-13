# 03-SEO-PERFORMANCE — AUDITORIA DE SEO TÉCNICO, CORE WEB VITALS E ACESSIBILIDADE

## 1. SEO Técnico Página por Página

### 1.1 Metadados Globais e Canônicos
- **Origem Canônica:** Configurada estritamente como `https://prospectanicho.app` (sem duplicidade com localhost ou URLs de preview).
- **Validação de Links e Metadados:**
  - Script `npm run check:links`: **OK** (0 links internos quebrados em rotas públicas).
  - Script `npm run check:metadata`: **OK** (todas as páginas possuem `title` único, `description`, OpenGraph e Twitter cards).
  - Script `npm run check:seo`: **OK** (estruturas de títulos sem duplicação de H1, dados estruturados JSON-LD válidos com schema Organization e WebSite).

### 1.2 Auditoria de Indexação
- **`robots.txt` ([`app/robots.ts`](file:///C:/Users/lucas/Documents/Codex/2026-06-14/leads-b2b-recuperada/app/robots.ts)):**
  - Permite rastreamento completo da raiz `/`.
  - Bloqueia estritamente diretórios privados: `/admin/`, `/api/`, `/compra/`, `/pedido/`, `/preview/`.
  - Aponta para `https://prospectanicho.app/sitemap.xml`.
  - Em ambientes marcados como `preview`, ativa automaticamente `disallow: /` para evitar indexação indevida de homologação.
- **`sitemap.xml` ([`app/sitemap.ts`](file:///C:/Users/lucas/Documents/Codex/2026-06-14/leads-b2b-recuperada/app/sitemap.ts)):**
  - Gera dinamicamente todas as 23 rotas estáticas institucionais e comerciais mais os slugs de produtos segmentados.
  - Prioridades atribuídas de acordo com a relevância comercial (1.0 para Home, 0.9 para Leads e Soluções).

---

## 2. Core Web Vitals e Performance

### 2.1 Largest Contentful Paint (LCP)
- Imagens da primeira dobra (Hero de Sites & Landing Pages e Hero de Leads B2B) utilizam formato moderno `.webp`, atributo `priority` e dimensões explicitadas via container, evitando atrasos na descoberta do LCP.
- Efeito de fundo usa gradientes CSS combinados para reduzir peso total da transferência.

### 2.2 Cumulative Layout Shift (CLS)
- Todas as tags `Image` utilizam dimensões fixas ou `fill` com elemento pai estruturado via `aspect-ratio` ou dimensões mínimas explícitas.
- Fontes tipográficas (Manrope e Sora) carregadas via `next/font/google` com fallback tipográfico definido, minimizando FOIT/FOUT.
- CLS medido em testes E2E: $\approx 0.00$.

### 2.3 Interaction to Next Paint (INP) & TBT
- Listeners de eventos e animações de carrossel utilizam React state direto sem loops de recalculo pesado.
- Biblioteca `framer-motion` configurada para desativar transições quando o usuário possuir `prefers-reduced-motion` ativado no sistema operacional.

---

## 3. Acessibilidade (WCAG 2.2 AA)
- **Contraste de Cores:** Fundo escuro oficial `#000a17` e cards `#001326` com textos em `#e7eff4` e ciano `#09e2e8`, garantindo taxa de contraste superior a 4.5:1.
- **Acessibilidade por Teclado:**
  - Menu mobile fecha automaticamente na tecla `Escape`.
  - Botões de navegação, abas e links possuem `:focus-visible` com outline contrastante.
  - Alvos de toque (touch targets) calibrados com altura e largura mínimas $\ge 44\text{px}$.
- **Semântica HTML:**
  - Uso correto de tags `<main>`, `<header>`, `<nav>`, `<section>`, `<h1>` único por página e `<h2/h3>` hierárquicos.
