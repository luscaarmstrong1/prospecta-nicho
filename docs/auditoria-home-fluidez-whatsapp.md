# Auditoria da home, fluidez e WhatsApp flutuante

Data: 2026-07-28

## Arquivos analisados

- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `next.config.ts`
- `components/AppShell.tsx`
- `components/Header.tsx`
- `components/Footer.tsx`
- `components/WhatsAppButton.tsx`
- `components/HomeBaseBuilderTeaser.tsx`
- `components/LeadDeliveryPreview.tsx`
- `components/ProductSignalCard.tsx`
- `components/SampleConversionSection.tsx`
- `lib/asset-path.ts`
- `lib/site-url.ts`
- `lib/routes.ts`
- `lib/site.ts`
- `lib/whatsapp.ts`
- `app/sitemap.ts`
- `app/robots.ts`
- `e2e/layout.spec.ts`
- `e2e/links.spec.ts`
- `tests/platform-rules.test.mjs`
- `docs/deployment.md`
- `docs/preview-and-release-process.md`

## Componentes da home

- `Header`, montado pelo `AppShell`.
- Hero premium em `app/page.tsx`, com `BrandWatermark` e `OpportunityShowcase`.
- `HomeBaseBuilderTeaser`, para solicitação rápida.
- `LeadDeliveryPreview`, para demonstração da entrega.
- `ProductSignalCard`, para bases comerciais.
- Bloco de operação guiada em `app/page.tsx`.
- Bloco "Para quem é" em `app/page.tsx`, usando `segmentCards`.
- `SampleConversionSection`, para amostra gratuita.
- CTA final em `app/page.tsx`.
- `Footer`, `PreviewBanner`, `WhatsAppButton` e `CookieBanner`, montados pelo `AppShell`.

## Ordem atual das seções

1. Header
2. Hero com "INTELIGÊNCIA COMERCIAL PARA QUEM PRECISA CRESCER"
3. Solicitação rápida
4. Demonstração da entrega
5. Bases comerciais
6. Operação guiada
7. Para quem é
8. Amostra gratuita
9. CTA final
10. Footer

A seção de FAQ não aparece mais como seção da home. A rota `/faq` continua existindo.

## Problemas encontrados

- A home já está na ordem correta, mas a leitura visual ainda parece formada por blocos muito independentes.
- O sistema de espaçamento usa `--section-y`, mas ainda não separa claramente espaçamento grande, padrão, compacto e gap narrativo.
- Hero, solicitação rápida, demonstração e operação guiada repetem muitas vezes a ideia de critério/recorte/validação, o que enfraquece a progressão comercial.
- Algumas seções alternam fundos fortes sem classes narrativas próprias, criando transições duras entre blocos.
- `ProductSignalCard` concentra bastante texto por card. Será mantido, mas a home precisa de espaçamento e largura mais previsíveis para reduzir a sensação de acúmulo.
- O botão flutuante de WhatsApp usa as classes genéricas `button button--teal whatsapp`. Isso herda hover/transition de botão comum e mistura responsabilidade de CTA fixo com botão inline.
- O WhatsApp flutuante fica com `z-index: 45`, apenas um nível acima do cookie banner (`z-index: 44`) e próximo do header (`z-index: 40`), deixando pouca margem para overlays.
- `assetPath` aplica `NEXT_PUBLIC_BASE_PATH` sempre que a variável existe. Isso é correto para preview/export estático, mas arriscado para produção real se a variável ficar configurada por engano.
- `next.config.ts` mantém GitHub Pages de forma condicional via `GITHUB_PAGES=true`, mas a separação conceitual entre preview estático e produção real pode ficar mais explícita.
- `lib/site-url.ts` já bloqueia hosts públicos indevidos como `localhost`, `127.0.0.1`, portas locais, `github.io` e `luscaarmstrong1` quando preview estático não está liberado.

## Causa provável do WhatsApp desaparecer

Nos testes em navegador antes da alteração, o elemento `.whatsapp` não desmontou durante scroll em desktop nem mobile: permaneceu com `display:flex`, `visibility:visible`, `opacity:1` e `position:fixed`.

A causa provável da sensação de "aparece e some" é visual/CSS, não estado React: o componente usa a classe genérica `.button`, herda `transform`/transition de hover e disputa camada com banner/cookie. Além disso, em ambiente sem número configurado o link fica como `https://wa.me/?text=...`, funcional, mas menos explícito para diagnóstico.

## Referências de GitHub Pages, localhost e basePath

- Produção real deve usar `NEXT_PUBLIC_SITE_URL`, preferencialmente `https://prospectanicho.com.br`.
- GitHub Pages deve permanecer tratado como preview/export estático, não como URL canônica de produção.
- `next.config.ts` só deve aplicar `output: "export"`, `basePath` e `assetPrefix` quando o ambiente de export estático estiver habilitado.
- Links internos públicos devem continuar relativos, como `/montar-minha-base`, `/produtos/amostra-gratuita`, `/solicitar-planilha`, `/para-quem-e`, `/como-funciona` e `/contato`.
- CSS/HTML injetado por extensão de navegador não foi encontrado no código-fonte e deve ser ignorado em auditoria do projeto.

## Alterações que serão feitas

- Criar tokens de espaçamento: `--section-y-large`, `--section-y`, `--section-y-compact`, `--section-gap`, `--content-default`, `--content-wide`, `--content-reading` e `--gutter`.
- Refinar espaçamentos da home com classes narrativas sem trocar a identidade visual.
- Reduzir repetição de copy em seções chave da home.
- Trocar o WhatsApp flutuante para uma classe própria estável, sem herdar comportamento visual de `.button`.
- Elevar o `z-index` do WhatsApp e garantir `opacity`, `visibility`, `display`, `pointer-events` e `transform` estáveis.
- Separar melhor basePath de preview/export estático em `lib/asset-path.ts` e `next.config.ts`.
- Ajustar documentação para deixar claro que GitHub Pages é preview/export estático e que produção real deve usar `NEXT_PUBLIC_SITE_URL`.
- Adicionar testes de estabilidade do WhatsApp e de ausência de URLs proibidas em metadata/render público.

## Alterações que NÃO serão feitas

- Não recriar o projeto.
- Não alterar paleta, logo oficial, tipografia principal, imagens existentes ou identidade visual completa.
- Não remover rotas, produtos, formulários, backend, Supabase, painel administrativo ou estrutura Next.js.
- Não remover a rota `/faq`.
- Não transformar GitHub Pages em produção canônica; ele será mantido apenas como preview/export estático quando explicitamente habilitado.

## Alterações aplicadas nesta etapa

- `lib/site-url.ts` passou a usar `NEXT_PUBLIC_SITE_URL` ou o domínio oficial padrão para metadata, sitemap, robots e JSON-LD, sem herdar automaticamente URLs temporárias.
- `lib/asset-path.ts` passou a aplicar `NEXT_PUBLIC_BASE_PATH` somente quando preview/export estático estiver explicitamente habilitado.
- `next.config.ts` passou a tratar `GITHUB_PAGES` e `NEXT_PUBLIC_STATIC_EXPORT` como modo de preview/export estático, separado da produção real.
- `components/WhatsAppButton.tsx` deixou de usar `button button--teal whatsapp` e passou a usar `whatsapp-floating`, com ícone Lucide e classe dedicada.
- `app/globals.css` ganhou tokens de espaçamento e regras estáveis para o WhatsApp flutuante.
- `app/page.tsx` teve textos repetitivos reduzidos e classes de seção adicionadas para melhorar continuidade visual.
- `README.md`, `docs/deployment.md` e `docs/github-security.md` foram ajustados para não tratar `github.io` como produção canônica.
- `e2e/layout.spec.ts` ganhou teste para validar que o WhatsApp permanece fixo e visível durante scroll.
- `tests/platform-rules.test.mjs` ganhou testes para proteger a separação entre produção real e preview/export estático.
