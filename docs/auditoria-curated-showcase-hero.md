# Auditoria - primeira dobra premium ProspectaNicho

## Arquivos analisados

- `app/page.tsx`
- `app/globals.css`
- `components/OpportunityShowcase.tsx`
- `components/HomeBaseBuilderTeaser.tsx`
- `components/WhatsAppFloatingButton.tsx`
- `lib/asset-path.ts`
- `next.config.ts`
- `public/assets/images/segments/*`
- `e2e/home-flow.spec.ts`
- `e2e/layout.spec.ts`
- `e2e/responsive.spec.ts`
- `e2e/whatsapp-floating.spec.ts`
- `e2e/routes.spec.ts`

## Componentes da home antes da alteração

1. Hero premium antigo com texto institucional e `OpportunityShowcase`.
2. `HomeBaseBuilderTeaser` como solicitação rápida separada.
3. Demonstração da entrega.
4. Bases comerciais.
5. Operação guiada.
6. Para quem é.
7. Amostra gratuita.
8. CTA final.

## Problemas encontrados

- A primeira dobra estava dividida entre promessa comercial e solicitação rápida em blocos separados.
- O hero antigo não funcionava como vitrine direta de nichos, apesar de já existirem imagens por segmento.
- Os testes E2E ainda dependiam da seção antiga `.builder-teaser-section`.
- A home não tinha busca local por segmento, cidade ou objetivo comercial.
- A navegação para `/solicitar-planilha` por segmento ainda ficava mais diluída nas seções abaixo.

## Decisões aplicadas

- Criado um hero em formato Gallery Grid / Curated Showcase.
- A solicitação rápida da home foi absorvida pela nova primeira dobra por meio de busca, filtros e CTAs.
- A ordem final da home passou a ser: hero curado, demonstração, bases comerciais, operação guiada, para quem é, amostra gratuita, CTA final.
- Os seis assets obrigatórios de segmento existem no projeto, incluindo versões mobile. Nenhum fallback foi necessário.
- O WhatsApp flutuante foi preservado sem alteração de componente, rota ou número.

## Alterações que não foram feitas

- Não foram alterados backend, Supabase, pagamentos, admin, produtos ou formulários.
- Não foi recriado o projeto.
- Não foram removidas páginas internas, incluindo FAQ.
- Não foram alterados links de produção, `basePath`, metadata ou configuração de deploy nesta etapa.
- Não foram substituídas imagens de segmento já aprovadas.

## Referências visuais usadas como direção

- Curadoria e organização em galeria de referências: Refero Styles e Landingfolio.
- Clareza editorial de landing pages modernas: Relume, Linear e referências SaaS citadas no prompt.
- Linguagem visual aplicada sem cópia literal: cards escuros, busca central, filtros horizontais, hierarquia forte, imagens reais e CTAs diretos.
