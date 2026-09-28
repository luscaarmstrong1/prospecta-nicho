# Prospecta Nicho - Project State

<!-- cspell:words commitadas deduplica EPERM Pytest USERPROFILE -->

## Objetivo

Plataforma de inteligência comercial B2B para receber solicitações de bases segmentadas de empresas, administrar pedidos e gerar CSV/XLSX com dados públicos de CNPJ para prospecção comercial.

## Estado atual

O repositório contém o site público, painel administrativo, APIs Next.js para runtime server, integração de runtime estático com Supabase Edge Functions, schema/migrations Supabase e um worker Python local. A branch `main` possui alterações locais ainda não commitadas relacionadas à integração do frontend visual V2 e seus testes. Essas alterações devem ser preservadas.

O último commit local identificado em 2026-09-22 é `ae9eb27` (`security: finalize request and CRM hardening`). O site documentado para publicação é `https://luscaarmstrong1.github.io/prospecta-nicho/`.

## Arquitetura

```text
GitHub Pages / Next.js static export
  -> Supabase Edge Functions
  -> Supabase Postgres + Auth

Painel administrativo no navegador
  -> sessão Supabase Auth
  -> Edge Functions administrativas

Worker Python local
  -> fila/RPCs no Supabase
  -> Minha Receita + IBGE + cache SQLite local
  -> filtros, supressão e scoring
  -> CSV/XLSX local para conferência e entrega
```

Em runtime Next.js com servidor, Route Handlers também existem. No GitHub Pages, chamadas dinâmicas são roteadas no cliente por `src/lib/api/runtime.ts` para Edge Functions.

## Estrutura principal

- `app/`: App Router, páginas públicas, admin e Route Handlers.
- `components/`: componentes compartilhados, CRM, formulários e frontend visual.
- `components/home-v2/` e `components/shared-v2/`: frontend oficial V2 em integração local.
- `components/preview-v2/`: preview visual V2 preservada.
- `src/lib/api/`: cliente e mapeamento de runtime para Edge Functions.
- `src/features/`, `src/server/`, `lib/server/`: domínio, serviços e integrações server-side.
- `lib/`: helpers de rotas, assets, conteúdo, site, pagamentos e frontend V2.
- `supabase/migrations/`: schema, RLS, RPCs, fila e hardening.
- `supabase/functions/`: Edge Functions públicas e administrativas.
- `workers/rfb_cnpj/`: worker Python, providers, filtros, fila e exportação.
- `tests/` e `e2e/`: testes Node e Playwright.
- `.github/workflows/`: CI, segurança e deploy do GitHub Pages.
- `docs/`: arquitetura, operação, segurança, deploy, QA e handoffs anteriores.

## Frontend

- Next.js 15 App Router, React 19 e TypeScript estrito.
- CSS nativo e CSS Modules; não usa Tailwind.
- React Hook Form + Zod nos formulários.
- Framer Motion para movimento e Lucide React para ícones.
- Exportação estática usa `basePath` `/prospecta-nicho`, assets sem otimização do Next e trailing slash.
- A integração local em andamento substitui a experiência oficial por componentes V2 e adiciona rotas oficiais para home, soluções, segmentos, planos, conteúdo e sobre.

## Backend

- Route Handlers Next.js em `app/api/` para ambientes com servidor.
- Supabase Edge Functions em `supabase/functions/` são o backend de runtime do GitHub Pages.
- Operações administrativas exigem autenticação e autorização; o token de sessão é tratado no cliente administrativo, sem service role no navegador.

## Banco de dados

Supabase Postgres com migrations versionadas em `supabase/migrations/`. O schema contempla solicitações, perfis administrativos, jobs, exports, logs, supressões, mapeamentos de segmento/CNAE e configuração operacional. RLS, RPCs e funções de fila fazem parte das migrations e devem ser revisadas junto com qualquer mudança de contrato.

## APIs/serviços externos

- Supabase Postgres, Auth e Edge Functions.
- Minha Receita como provider principal de pesquisa empresarial no worker.
- API do IBGE para resolução de municípios.
- Integrações de pagamento, Resend, Turnstile e storage aparecem preparadas/configuráveis; sua ativação depende do ambiente e das variáveis correspondentes.

## Fontes de dados

O fluxo operacional documentado consulta dados públicos de CNPJ por meio da Minha Receita. O worker mantém fallback legado para snapshots locais dos Dados Abertos da Receita Federal, mas esse fallback não é requisito do fluxo principal.

## Fluxo de prospecção

1. O visitante envia uma solicitação pública.
2. O pedido é persistido no Supabase e aparece no CRM.
3. Um administrador valida filtros, pagamento e processamento.
4. A criação de job alimenta a fila do worker.
5. O worker resolve municípios/CNAEs, pesquisa empresas, normaliza, filtra, deduplica, aplica supressões e scoring.
6. O worker gera CSV e XLSX, registra resultado e atualiza a timeline.
7. O operador confere a entrega local e marca o pedido como entregue.

## Enriquecimento de dados

Existe como add-on controlado por estados administrativos. Deve permanecer bloqueado até a confirmação de pagamento. O export padrão não contém QSA, CPF, sócios, representantes legais nem dados pessoais particulares.

## Automação

- GitHub Actions executa CI, segurança e deploy estático.
- O worker usa claim atômico, `run_id`, lease, heartbeat, retry e recuperação de jobs travados.
- A entrega local é operacional; storage privado e links assinados são extensões opcionais previstas no código/documentação.

## Persistência

- Dados operacionais: Supabase Postgres.
- Cache de provider: SQLite local do worker.
- Exports: diretório local `%USERPROFILE%\ProspectaNicho\Exports\<protocolo>\` no modo atual.
- CSV usa UTF-8 BOM; XLSX contém `Leads`, `Resumo`, `Filtros aplicados` e `Leia-me`.

## Autenticação

Supabase Auth para login administrativo, com perfis/papéis em `admin_profiles`. Edge Functions administrativas validam sessão e autorização. Nunca usar service role no frontend.

## Configuração

- `package.json`: scripts e dependências Node.
- `next.config.ts`: export estático, base path e headers do runtime server.
- `tsconfig.json`: TypeScript estrito e aliases.
- `playwright.config.ts`: projetos E2E.
- `supabase/config.toml`: projeto local Supabase.
- `.github/workflows/`: CI, segurança e deploy.
- `.env.example` e `.env.worker.example`: nomes/documentação das variáveis, sem valores reais.

## Variáveis de ambiente relevantes

Somente nomes, nunca valores:

- públicas: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BASE_PATH`, `NEXT_PUBLIC_RUNTIME_TARGET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`;
- server/Edge Functions: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_TOKEN` e segredos dos provedores ativados;
- worker: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, configuração do provider Minha Receita, cache e diretório de exportação.

Arquivos `.env*` reais, exports, caches e credenciais são ignorados pelo Git e não devem ser lidos ou versionados sem necessidade operacional explícita.

## Build/deploy

- Desenvolvimento: `npm run dev`.
- Build Next.js: `npm run build`.
- Export GitHub Pages: `npm run export:github`.
- Deploy: workflow `.github/workflows/deploy-github-pages.yml` após push em `main` ou execução manual.
- O GitHub Pages não executa Route Handlers do Next.js.

## Funcionalidades existentes

- site público, formulários e acompanhamento por protocolo;
- CRM administrativo com listagem/detalhe em runtime e ações de pedido;
- Supabase Auth, Edge Functions, migrations, RLS e fila;
- worker Python com pesquisa, resolução geográfica, filtros, supressão, deduplicação, scoring, CSV e XLSX;
- páginas legais, conteúdo, produtos e soluções;
- validações de lint, TypeScript, spellcheck, segurança, links, metadata, conteúdo, Node, Playwright e Pytest.

## Funcionalidades em desenvolvimento

- Integração local do frontend oficial V2 nas seis páginas principais.
- Testes de regressão, movimento, responsividade e fidelidade visual da V2.
- Scripts auxiliares de captura e comparação visual ainda não rastreados.

## Problemas conhecidos

- O working tree contém muitas alterações e arquivos não rastreados da integração V2; ainda não há um commit consolidado nesse checkout.
- Handoffs anteriores registraram erros ambientais `spawn EPERM` e permissões de diretórios temporários em algumas execuções locais. É necessário distinguir falha ambiental de regressão antes de mudar código.
- As páginas internas V2 tinham diferenças visuais registradas em relação aos mockups; a home estava mais próxima da referência.
- Diretórios de cache do Pytest podem produzir avisos de acesso negado ao consultar o Git nesta máquina.

## Pontos sensíveis

- Nunca expor service role, tokens, `.env.worker`, exports ou dados de clientes.
- Preservar a compatibilidade entre GitHub Pages e Edge Functions.
- Não alterar contratos de migrations/RPCs/fila sem revisar worker e CRM juntos.
- Não executar processamento nacional em Route Handlers ou no navegador.
- Não remover proteções de idempotência, lease, heartbeat, supressão, RLS ou autorização.
- Não sobrescrever o frontend V2 local sem comparar o diff e os handoffs existentes.

## Próximos passos

Consultar `.ai/TASKS.md`. A prioridade imediata é validar e consolidar, sem perda, a integração frontend V2 já presente no working tree.

## Atualização da home oficial em 2026-09-28

- A home oficial usa `HomeSiteV2` e foi alinhada ao briefing B2B aprovado: hero nacional, métricas, amostra, quatro segmentos, quatro planos, prova social sem depoimentos inventados, CTA nacional e rodapé.
- A navegação compartilhada inclui Início, Soluções, Segmentos, Planos, Conteúdo, Sobre e Contato, preservando rotas e fluxos existentes.
- Metadados da home e dados estruturados `WebSite` e `Service` refletem a oferta real de bases B2B.
- Valores comerciais existentes foram preservados; nenhuma regra de CRM, Supabase, pagamento ou worker foi alterada.
- TypeScript, lint, ortografia, testes unitários, segurança, exportação GitHub Pages e testes do worker foram aprovados.
- A captura visual automatizada continua pendente: o Playwright e o servidor Next falharam com `spawn EPERM`, e o navegador integrado não recebeu permissão para abrir o servidor estático alternativo.

## Fase 2 de paridade visual em 2026-09-28

- A composição da home foi refinada sem redesenho: cabeçalho, hero, faixa editorial, métricas, amostra, segmentos, planos, prova social, CTA final e rodapé seguem a hierarquia solicitada.
- Navegação e rodapé foram reduzidos aos grupos previstos, com indicadores de submenu apenas em Soluções e Conteúdo e sem o atalho redundante de entrada no cabeçalho.
- Textos públicos da home foram sincronizados com o briefing, incluindo `Dados confiáveis`, `Dados que geram negócios.` e a mensagem da seção de amostra.
- A prova social preserva a geometria de três cartões, mas identifica explicitamente o conteúdo como demonstração enquanto não houver depoimentos verificados.
- Os preços e destinos comerciais reais do projeto foram preservados; esta fase não alterou backend, CRM, Supabase, pagamentos, worker ou contratos de runtime.
- TypeScript, lint, ortografia, 55 testes Node e exportação estática com 83 páginas foram aprovados nesta fase.
- O servidor estático está disponível localmente em `http://127.0.0.1:8090/prospecta-nicho/`, montado com o mesmo prefixo do GitHub Pages. A página e as 34 referências locais de assets responderam HTTP 200, mas as capturas comparativas continuam pendentes de autorização do navegador integrado. Não há aprovação visual final sem essas evidências.
- Não houve commit, push ou deploy nesta fase.

## Última atualização

## Identidade visual oficial em 2026-09-28

- O conjunto PN final fornecido pelo proprietário passou a ser a fonte oficial da marca no frontend.
- O lockup de fundo escuro é usado nos headers e rodapés V2, a variante clara permanece disponível para superfícies claras e o símbolo PN foi registrado para usos compactos.
- A identidade anterior não deve ser reintroduzida nas páginas oficiais.

2026-09-28

## Último agente

OpenAI Codex
