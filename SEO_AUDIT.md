# Auditoria SEO da Prospecta Nicho

Data: 2026-10-01

## Escopo auditado

- App Router em `app/` e Metadata API do Next.js.
- Domínio canônico, sitemap, robots, manifesto, favicons e imagem social.
- Home e páginas estratégicas de Leads B2B, Sites, Landing Pages, Automação, Projetos, Sobre e Contato.
- Navegação interna, conteúdo institucional, dados estruturados e exportação para GitHub Pages.
- Alegações públicas, formulários demonstrativos e referências legadas de domínio.

## Problemas encontrados

1. O fallback de produção ainda apontava para `prospectanicho.com.br`, embora o domínio oficial seja `https://prospectanicho.app`.
2. A oferta integrada não tinha páginas próprias para todas as frentes estratégicas.
3. Metadados e dados estruturados estavam distribuídos de forma inconsistente entre páginas novas e legadas.
4. A home não continha a marca de forma explícita no H1.
5. O sitemap não refletia a arquitetura comercial atual.
6. Havia números de mercado, depoimentos demonstrativos e cadastros de newsletter sem uma fonte operacional verificável.
7. Alguns CTAs ainda usavam um número de WhatsApp fictício.
8. A verificação do Google não possuía um ponto de configuração seguro por ambiente.

## Estado após a implementação

- Origem canônica centralizada em `https://prospectanicho.app`.
- Título principal: `Prospecta Nicho | Leads B2B, Sites, Landing Pages e Automação`.
- H1 da home inclui `Prospecta Nicho`.
- Open Graph e Twitter Card usam imagem de 1200 por 630 pixels.
- `Organization` e `WebSite` publicados na home; páginas de serviço usam `Service` e `BreadcrumbList`.
- Sitemap contém somente rotas públicas escolhidas como indexáveis e URLs de produto.
- Robots permite o conteúdo público e bloqueia admin, API, checkout, status de pedido e previews.
- Verificação do Google depende de `GOOGLE_SITE_VERIFICATION`; nenhum token é versionado.
- Depoimentos e estatísticas sem fonte foram removidos ou convertidos em conteúdo qualitativo.
- Formulários simulados de newsletter foram substituídos por contato real.

## Riscos e pendências externas

- Search Console precisa ser conectado pelo proprietário e o sitemap deve ser enviado manualmente.
- Indexação, rich results e posição de busca dependem do rastreamento do Google e não podem ser garantidos pelo build.
- O Perfil da Empresa no Google só deve ser criado se houver elegibilidade e dados reais de atendimento; nenhum endereço foi inventado.
- Métricas de Core Web Vitals devem ser acompanhadas em dados de campo após o novo deploy.

## Itens deliberadamente não alterados

- CRM, Supabase, autenticação, pagamentos, Edge Functions e worker de CNPJ.
- Estrutura visual aprovada da home.
- Rotas administrativas e fluxos de pedido.
- Dados comerciais que dependem de confirmação operacional externa.
