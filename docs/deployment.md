# Deployment

## Runtime recomendado

Produção completa deve rodar em Vercel ou ambiente compatível com Next.js server routes. GitHub Pages serve apenas HTML/CSS/JS estático e não executa APIs.

## Preview estático / GitHub Pages

GitHub Pages deve ser tratado como preview/export estático temporário da ProspectaNicho. Formulários que dependem de API precisam de fallback estático ou endpoint externo nesse ambiente.

Se o repositório fonte estiver privado, GitHub Pages público pode ficar indisponível conforme o plano da conta. Em 2026-07-28, após a mudança para privado, a API de Pages e a URL antiga de Pages retornaram 404. Para manter acesso público sem expor o código-fonte, publique apenas o artefato estático em um repositório público separado ou use Vercel/hosting equivalente com repositório privado.

Em 2026-07-28, o repositório foi retornado para público e GitHub Pages foi reativado pela branch `gh-pages`, path `/`, com HTTPS enforced. Isso não torna `github.io` a URL canônica de produção.

Para gerar preview estático com basePath, habilite explicitamente:

- `GITHUB_PAGES=true` ou `NEXT_PUBLIC_STATIC_EXPORT=true`
- `NEXT_PUBLIC_BASE_PATH=/prospecta-nicho`
- `NEXT_PUBLIC_ALLOW_GITHUB_PAGES=true`

Sem essas variáveis, `NEXT_PUBLIC_BASE_PATH` não deve alterar assets ou metadata de produção.

## Variáveis mínimas em produção

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ADMIN_API_TOKEN`
- Segredos de pagamento, storage, Redis e Turnstile conforme módulos ativados.

## Rollback

Reverter deploy estático pelo branch `gh-pages` ou usar rollback da plataforma runtime. Nunca commitar `.env` para "corrigir rápido".
