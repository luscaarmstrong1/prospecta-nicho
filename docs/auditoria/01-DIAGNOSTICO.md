# 01-DIAGNOSTICO — ARQUITETURA, RISCOS E ESTADO DO PROJETO

## 1. Identificação Geral do Projeto
- **Nome do Projeto:** ProspectaNicho (`prospecta-nicho`)
- **Domínio Principal:** `https://prospectanicho.app`
- **Ambiente & Repositório:** `luscaarmstrong1/prospecta-nicho`, branch ativa `main`
- **Framework & Versões:**
  - Next.js 15.5.25 (com App Router, Server Actions e API routes)
  - React 19.1.2 & React DOM 19.1.2
  - TypeScript 5.7.2
  - Node.js runtime compatível com Node 20+ / Node 22
  - Python 3.12 (workers de dados da Receita Federal / CNPJ em `workers/rfb_cnpj`)
- **Gerenciador de Pacotes:** `npm` com overrides para `nanoid`, `sharp`, `postcss`, `brace-expansion`
- **Estilização & UI:** CSS Modules escopados (`prospecta-web.module.css`, `home-v2.module.css`), Lucide React 0.468, Framer Motion 12.23 (respeitando `prefers-reduced-motion`)

---

## 2. Topologia de Rotas e Páginas
- **Dobra Principal (Home):** `/` (Sites & Landing Pages — design system aprovado Prospecta Web)
- **Leads B2B:** `/leads` (Bases segmentadas com mapa interativo do Brasil e cards regionais)
- **Rotas Públicas Institucionais & Comerciais:**
  - `/solucoes` (Hub dinâmico de soluções com dropdown superior)
  - `/segmentos` (Segmentação industrial, varejo, tecnologia, serviços)
  - `/planos` (Planos comerciais e precificação de bases)
  - `/conteudo` (Conteúdos estratégicos e artigos de prospecção)
  - `/sobre` (História, diferenciais e missão ProspectaNicho)
  - `/contato` (Formulário comercial com proteção honeypot e rate limit)
  - `/amostra` (Solicitação rápida de amostra gratuita de leads)
  - `/faq` (Perguntas frequentes e dúvidas comuns)
  - `/como-funciona` & `/para-quem-e`
  - `/produtos/[slug]` (Bases segmentadas: empresas recém-abertas, marketing, contabilidades)
  - Legais: `/politica-de-privacidade`, `/politica-de-cookies`, `/politica-de-supressao`, `/termos-de-uso`
- **Rotas Administrativas & Privadas (Protegidas por Middleware):**
  - `/admin/login` (Login de operador)
  - `/admin` & `/admin/*` (Painel operacional de CRM, pedidos, filas de enriquecimento, suppression list)
- **APIs Internas e de Backend:**
  - `/api/contact` (Processamento de contato)
  - `/api/sample-request` & `/api/custom-base-request`
  - `/api/payments/*` (Mercado Pago / Asaas webhooks com validação criptográfica)
  - `/api/admin/*` (Operações administrativas com verificação estrita de sessão HMAC ou Bearer Token)

---

## 3. Integrações e Serviços Externos
1. **Banco de Dados & Autenticação:**
   - Supabase (PostgreSQL com Row Level Security estrito, tabelas `crm_orders`, `suppression_list`, `admin_profiles`)
   - Armazenamento em Cloudflare R2 / S3 compatível com URLs assinadas e expiráveis
2. **Provedores de Pagamento:**
   - Mercado Pago SDK & Webhooks
   - Asaas SDK & Webhooks
3. **Serviços de E-mail:**
   - Resend (`resend` via REST API)
4. **Proteção Antispam & Desafios:**
   - Cloudflare Turnstile (`challenges.cloudflare.com`)
5. **Observabilidade & Monitoramento:**
   - Sentry DSN preparado (`@sentry/nextjs` / endpoints estruturados)
6. **Dados Cadastrais Públicos:**
   - Minha Receita API (`minhareceita.org`) com rate limiting de 200ms e cache inteligente

---

## 4. Classificação de Riscos e Diagnóstico Inicial
| ID | Controle / Área | Risco Identificado | Severidade | Ação Necessária |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Segredos & .env | Variáveis obrigatórias de backend ausentes no ambiente local dev | P2 (Médio) | Documentar no checklist `.env.example` e validar `check:env` |
| **SEC-02** | Dependências NPM | Alerta de vulnerabilidade do Next.js e Sharp em scans gerais | P2 (Médio) | Avaliar mitigação segura e compatibilidade com React 19 |
| **SEO-01** | Metadados e Sitemap | Rotas canônicas e sitemap.xml 100% integrados | P3 (Baixo) | Verificado e validado (`check:seo`, `check:metadata`) |
| **PERF-01** | Core Web Vitals | LCP e WebP de imagens da Hero | P2 (Médio) | Assets WebP com dimensões corretas e `priority` aplicado |
| **RESP-01** | Responsividade | Menu mobile e paddings em telas $\le 390\text{px}$ | P2 (Médio) | Corrigido nas fases recentes e validado em 5 viewports |
