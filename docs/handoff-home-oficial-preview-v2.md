# Handoff - Home oficial ProspectaNicho com Preview V2

## Objetivo aplicado

Substituir exclusivamente o frontend da home oficial `/` pela experiência visual aprovada da Preview V2 (`/preview/site-v2/`), preservando backend, Supabase, worker, CRM, rotas públicas, rotas administrativas, formulários, segurança e exportação estática para GitHub Pages.

## Regras preservadas

- O projeto não foi recriado do zero.
- A rota congelada `/preview/site-v2/` foi mantida como baseline visual demonstrativo.
- A rota `/preview/site-v2-gemini/` não foi usada como fonte da home oficial.
- Nenhuma migration, Edge Function, `.env`, `.env.worker`, segredo, worker Python ou configuração Supabase foi alterada.
- A home oficial não usa o modal fake da preview.
- CTAs da home oficial apontam para rotas reais do produto.
- O WhatsApp flutuante global e o banner de cookies continuam ativos na home oficial.

## Arquitetura criada

A Preview V2 foi copiada para uma camada independente de home oficial:

- `components/home-v2/HomeSiteV2.tsx`
- `components/home-v2/HomeHeader.tsx`
- `components/home-v2/home-v2.module.css`
- `components/home-v2/motion/HomeMotion.tsx`
- `lib/home-v2/mock-data.ts`
- `lib/home-v2/motion.ts`

Essa camada permite evoluir a home oficial sem alterar a preview congelada.

## Home oficial

Arquivo alterado:

- `app/page.tsx`

Agora a rota `/` renderiza:

```tsx
import type { Metadata } from "next";
import { HomeSiteV2 } from "@/components/home-v2/HomeSiteV2";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <HomeSiteV2 />;
}
```

## Shell global

Arquivo alterado:

- `components/AppShell.tsx`

Foi adicionado um tratamento específico para `/`, para evitar duplicidade de Header/Footer antigos sobre a nova home V2, mas preservando:

- `WhatsAppFloatingButton`
- `CookieBanner`

## CTAs reais configurados

Na home oficial, os CTAs foram convertidos para links reais:

- Header "Entrar" -> `/admin/login`
- Header "Solicitar planilha" -> `/solicitar-planilha?source=home-v2-header`
- Hero "Montar minha base" -> `/solicitar-planilha?source=home-v2-hero`
- Hero "Ver como funciona" -> `#amostra`
- Amostra gratuita -> `/solicitar-planilha?source=home-v2-amostra`
- Ver todos os segmentos -> `/produtos`
- Segmento Agências -> `/solucoes/agencias-de-marketing`
- Segmento Contabilidades -> `/solucoes/contabilidades`
- Segmento Energia Solar -> `/solucoes/energia-solar`
- Planos não customizados -> `/solicitar-planilha?...`
- Plano customizado -> WhatsApp oficial via `createWhatsAppLink(defaultWhatsAppMessage)`
- CTA final principal -> `/solicitar-planilha?source=home-v2-final`
- CTA final secundário -> WhatsApp oficial
- Links legais do footer -> rotas legais reais existentes

## Preview preservada

Arquivos da preview original não foram usados diretamente pela home oficial e continuam separados:

- `app/preview/site-v2/page.tsx`
- `components/preview-v2/PreviewSiteV2.tsx`
- `components/preview-v2/PreviewHeader.tsx`
- `components/preview-v2/PreviewModal.tsx`
- `components/preview-v2/motion/PreviewMotion.tsx`
- `components/preview-v2/preview-v2.module.css`
- `lib/preview-v2/mock-data.ts`
- `lib/preview-v2/motion.ts`
- `public/preview-v2/assets/*`

Observação: a home oficial reaproveita os assets públicos de `public/preview-v2/assets/*` para manter fidelidade visual.

## Teste E2E adicionado

Arquivo criado:

- `e2e/home-v2.spec.ts`

Coberturas:

- `/` renderiza a identidade visual V2.
- CTAs da home oficial têm `href` real.
- Modal demonstrativo não aparece na home oficial.
- Texto de versão visual de teste não aparece na home oficial.
- Mobile não gera overflow horizontal.
- `/preview/site-v2/` continua existindo como preview demonstrativa.

## Ajustes de tooling

Arquivos ajustados:

- `.gitignore`: adiciona `.tmp/`.
- `eslint.config.mjs`: ignora `.tmp/**` e caches de pytest sem permissão.
- `scripts/spellcheck.mjs`: adiciona fallback para ambientes em que `git ls-files` falha com `spawn EPERM`.

Esses ajustes não alteram lógica de produto.

## Validações executadas

Passaram:

- `npm run spellcheck`
- `npm run lint`
- `npm run typecheck`
- `npm run check:security`

Worker:

- `npm run worker:test` coletou 53 testes.
- A execução avançou, mas o pytest encontrou erro de permissão no diretório temporário ao finalizar.
- O problema observado é ambiental: `PermissionError: [WinError 5] Acesso negado`.

Bloqueios do ambiente atual:

- `npm test` falhou antes de executar testes reais porque o runner do Node tentou criar subprocesso e recebeu `spawn EPERM`.
- `npm run export:github` falhou no início do build do Next.js pelo mesmo tipo de bloqueio: `spawn EPERM`.
- Playwright encerrou com 0 testes executados no ambiente atual.

Esses bloqueios ocorreram por restrição local de criação/acesso a processos/pastas, não por erro TypeScript, lint, spellcheck ou segurança.

## Pendências recomendadas para o próximo ambiente

Em um ambiente sem bloqueio de subprocessos, rodar:

```bash
npm run spellcheck
npm run lint
npm run typecheck
npm test
npm run check:security
npm run worker:test
npm run export:github
npx playwright test e2e/home-v2.spec.ts --project=desktop --project=mobile-390 --project=tablet
```

Depois conferir manualmente:

- `/`
- `/preview/site-v2/`
- `/solicitar-planilha`
- `/admin/login`
- `/produtos`
- `/solucoes/agencias-de-marketing`
- `/solucoes/contabilidades`
- `/solucoes/energia-solar`

