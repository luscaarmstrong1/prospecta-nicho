# Deployment

## Runtime recomendado

O frontend público da ProspectaNicho pode rodar no GitHub Pages como site estatico em:

`https://luscaarmstrong1.github.io/prospecta-nicho/`

GitHub Pages nao executa API Routes do Next.js. Por isso, em producao estatica, formularios, CRM e status de pedido chamam Supabase Edge Functions. O worker Python continua externo ao Next.js e processa os Dados Abertos da Receita Federal fora do navegador.

## GitHub Pages + Supabase Functions

O build estatico deve usar:

`npm run export:github`

Esse script define:

- `DEPLOY_TARGET=github-pages`
- `NEXT_PUBLIC_RUNTIME_TARGET=github-pages`
- `NEXT_PUBLIC_STATIC_EXPORT=true`
- `NEXT_PUBLIC_ALLOW_GITHUB_PAGES=true`
- `NEXT_PUBLIC_BASE_PATH=/prospecta-nicho`
- `NEXT_PUBLIC_SITE_URL=https://luscaarmstrong1.github.io/prospecta-nicho`

As variaveis publicas do GitHub Actions podem incluir apenas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`

Segredos como `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_TOKEN`, `EXPORT_SIGNING_SECRET`, credenciais R2/S3 e diretorios RFB devem ficar no Supabase Functions ou no worker, nunca no frontend.

## Supabase Functions

As Functions ficam em `supabase/functions/*` e devem ser publicadas com o Supabase CLI, por exemplo:

`supabase functions deploy public-create-request public-sample-request public-contact public-request-status health admin-login admin-requests admin-request-detail admin-update-request admin-create-job admin-process-request admin-mark-paid admin-mark-delivered admin-jobs-logs admin-exports admin-export-detail admin-sign-export admin-offer-enrichment admin-mark-enrichment-paid admin-run-enrichment`

Configure no ambiente do Supabase:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_API_TOKEN`
- `EXPORTS_BUCKET` ou `SUPABASE_EXPORTS_BUCKET`
- segredos de storage/worker conforme infraestrutura adotada

## Variaveis minimas em producao Next.js server

Se a aplicacao for executada em Vercel ou ambiente compatível com Next.js server routes, producao exige:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ADMIN_API_TOKEN`
- `EXPORT_SIGNING_SECRET`
- segredos de pagamento, storage, Redis e Turnstile conforme modulos ativados

## Rollback

Reverter deploy estatico pelo GitHub Pages ou usar rollback da plataforma runtime. Nunca commitar `.env` para corrigir rapidamente uma integracao.
