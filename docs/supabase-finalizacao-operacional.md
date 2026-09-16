# Finalizacao operacional Supabase

Este projeto ja teve o schema principal aplicado no Supabase do projeto `bsirvqrxkosqisiiqpcg`.

## Estado aplicado

- Schema consolidado aplicado via SQL Editor.
- Usuario `lucas.silva.santos.eng@gmail.com` vinculado em `public.admin_profiles` com papel `admin`.
- Seeds de segmentos aplicados em `public.segment_cnae_mappings`.
- Bucket privado `exports` criado em `storage.buckets`.
- Edge Functions configuradas em `supabase/config.toml` com `verify_jwt = false`, porque o app faz autenticacao e autorizacao dentro das funcoes.

## Secrets das Edge Functions

O Supabase ja fornece os secrets padrao:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Adicionar em Edge Functions > Secrets:

```env
EXPORTS_BUCKET=exports
NEXT_PUBLIC_SITE_URL=https://luscaarmstrong1.github.io/prospecta-nicho
ENABLE_BREAK_GLASS_ADMIN=false
```

Opcional para acesso emergencial por token, mantendo o valor fora do repositorio:

```env
ADMIN_API_TOKEN=<valor-forte-gerado-pelo-proprietario>
```

## Deploy das Edge Functions

No terminal local do proprietario, autenticar a CLI sem colar token no chat:

```powershell
cd C:\Users\lucas\Documents\Codex\2026-06-14\leads-b2b-recuperada
npx supabase login
```

Se o login automatico nao abrir, gerar um access token em Supabase Account > Access Tokens e executar localmente:

```powershell
$env:SUPABASE_ACCESS_TOKEN="COLE_O_TOKEN_SOMENTE_NO_SEU_TERMINAL"
```

Publicar todas as funcoes:

```powershell
npx supabase functions deploy --project-ref bsirvqrxkosqisiiqpcg --no-verify-jwt --use-api
```

## Variaveis do GitHub Pages

Em GitHub > Settings > Secrets and variables > Actions > Variables, conferir:

```env
NEXT_PUBLIC_SUPABASE_URL=https://bsirvqrxkosqisiiqpcg.supabase.co
NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://bsirvqrxkosqisiiqpcg.supabase.co/functions/v1
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable ou anon key publica do Supabase>
NEXT_PUBLIC_WHATSAPP_NUMBER=5535998905896
```

Depois, rodar novamente o workflow de Pages.

## Validação apos deploy

Validar a saude das funcoes:

```powershell
Invoke-RestMethod "https://bsirvqrxkosqisiiqpcg.supabase.co/functions/v1/health"
```

Validar no site:

- abrir `https://luscaarmstrong1.github.io/prospecta-nicho/`;
- criar uma solicitacao real pelo formulario;
- entrar em `/admin/login`;
- autenticar com `lucas.silva.santos.eng@gmail.com`;
- confirmar se a solicitacao aparece no CRM;
- criar job;
- executar o worker com `.env` local contendo `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`;
- confirmar geracao de CSV/XLSX e link assinado no admin.
