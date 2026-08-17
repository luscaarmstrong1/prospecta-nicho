# Auditoria - redesign premium da home ProspectaNicho

## Estrutura analisada

- `app/page.tsx`: home com hero, demonstracao da entrega, bases comerciais, operação guiada, para quem e, amostra gratuita e CTA final.
- `components/Header.tsx`: header sticky com logo oficial, links principais, CTA e drawer mobile.
- `components/AppShell.tsx`: montagem global com header, footer, banner de preview, WhatsApp flutuante e cookies.
- `components/HomeBaseBuilderTeaser.tsx`: solicitacao rapida antiga preservada como componente, mas removida da home para evitar redundancia.
- `components/LeadDeliveryPreview.tsx`: preview de planilha com dados ficticios, coluna Site ja ausente e cards mobile.
- `components/ProductSignalCard.tsx`: cards de produtos usados em bases comerciais.
- `components/SampleConversionSection.tsx`: bloco de amostra gratuita preservado.
- `components/WhatsAppFloatingButton.tsx`: renderizado no shell global, fora da home.
- `lib/site-url.ts`, `lib/asset-path.ts`, `next.config.ts`, `app/sitemap.ts`, `app/robots.ts`: ambiente, URL publica, metadata e preview estatico.
- `app/globals.css`: tokens globais, containers, header, hero, cards, entrega, produtos, segmentos, footer e responsividade.

## Diagnostico

1. A home anterior tinha hero institucional e solicitacao rapida em bloco separado; isso gerava duas chamadas muito proximas para a mesma acao.
2. A primeira dobra nao aproveitava as imagens por segmento como vitrine comercial imediata.
3. A demonstracao da entrega ja estava no formato correto de tabela mascarada, sem coluna Site, mas precisava permanecer logo apos o hero.
4. Bases comerciais, operação guiada, para quem e e amostra gratuita ja existiam e foram preservadas para nao descaracterizar o fluxo.
5. O WhatsApp flutuante ja estava no `AppShell`, portanto nao dependia de scroll, pathname ou secao da home.
6. Fontes atuais ja usam `Sora` e `Manrope` via `next/font/google`; nao foi necessario trocar familia tipografica.
7. O sistema visual ja usa navy, teal, canvas claro e cards editoriais; a melhoria principal ficou concentrada na primeira dobra.
8. `lib/site-url.ts` ja bloqueia URL publica local ou GitHub Pages em producao, salvo quando o preview estatico e explicitamente habilitado.
9. `next.config.ts` so aplica `basePath` e `assetPrefix` quando `GITHUB_PAGES` ou `NEXT_PUBLIC_STATIC_EXPORT` estao ativos.
10. As referencias a localhost em testes, scripts e documentacao sao tecnicas e nao sao renderizadas como links públicos da home.

## Alteracoes planejadas

- Substituir o hero antigo por uma primeira dobra dark premium em Curated Showcase.
- Integrar busca, filtros e cards de nichos na primeira dobra.
- Remover da home a solicitacao rapida redundante como secao independente.
- Manter a ordem final: hero, demonstracao, bases comerciais, operação guiada, para quem e, amostra gratuita e CTA final.
- Refinar header removendo link redundante de amostra do menu e mantendo a amostra como CTA.
- Atualizar testes E2E para validar showcase, busca, filtros, responsividade, links internos e WhatsApp.

## Alteracoes que nao serao feitas

- Nao alterar backend, Supabase, pagamentos, painel administrativo, formularios ou APIs.
- Nao substituir logo oficial nem imagens de segmentos existentes.
- Nao remover a rota `/faq`; apenas nao exibir FAQ como secao da home.
- Nao tratar GitHub Pages como producao canonica; ele segue como preview/export estatico.
- Nao introduzir fonte decorativa, carrossel automatico, GSAP ou efeitos pesados.

## Observacoes de ambiente

- Producao canonica deve usar `NEXT_PUBLIC_SITE_URL`, com fallback para `https://prospectanicho.com.br`.
- GitHub Pages usa `GITHUB_PAGES=true` e `NEXT_PUBLIC_BASE_PATH` apenas para export estatico.
- O HTML público da home deve permanecer sem `localhost`, `127.0.0.1`, portas locais ou `luscaarmstrong1.github.io`.
