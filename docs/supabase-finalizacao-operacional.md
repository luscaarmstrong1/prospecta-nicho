# Finalização operacional do Supabase

Projeto: `bsirvqrxkosqisiiqpcg`.

## Migrações

Aplicar os arquivos de `supabase/migrations` em ordem. A última migração obrigatória para o worker é:

```text
20260917090000_finalize_rfb_worker_integrity.sql
```

Ela adiciona fencing por `run_id`, claim atômico, heartbeat com lease, retry, recuperação de jobs travados, supressão normalizada e finalização transacional/idempotente.

## Autenticação e autorização

- O login administrativo usa Supabase Auth.
- O usuário precisa de registro em `public.admin_profiles`.
- `admin` tem acesso completo.
- `editor` não processa jobs, não altera pagamentos e não assina exports.
- `operador` executa o fluxo operacional permitido, sem criar links de export.
- `leitura` não altera dados.
- `ENABLE_BREAK_GLASS_ADMIN=false` deve permanecer como padrão.

Não envie o personal access token, a service role ou a senha do admin em chat, commit ou variável pública.

## Edge Functions

Publicação pelo terminal autenticado do proprietário:

```powershell
npx supabase login
npx supabase functions deploy --project-ref bsirvqrxkosqisiiqpcg --no-verify-jwt --use-api
```

As funções marcadas com `verify_jwt = false` validam a sessão e as permissões dentro do código. Isso não torna endpoints administrativos públicos.

## GitHub Pages

Variáveis públicas esperadas no workflow:

```env
NEXT_PUBLIC_RUNTIME_TARGET=github-pages
NEXT_PUBLIC_SITE_URL=https://luscaarmstrong1.github.io/prospecta-nicho
NEXT_PUBLIC_SUPABASE_URL=https://bsirvqrxkosqisiiqpcg.supabase.co
NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://bsirvqrxkosqisiiqpcg.supabase.co/functions/v1
NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave publica>
```

## Worker

Somente a máquina do operador recebe:

```env
SUPABASE_URL=https://bsirvqrxkosqisiiqpcg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<segredo>
EXPORT_DELIVERY_MODE=local
```

O health check deve aceitar o modo local sem storage e sem `ADMIN_API_TOKEN`. Storage e links assinados são opcionais.

## Validação

1. Abrir o site e criar um pedido de teste.
2. Entrar em `/admin/login/` com Supabase Auth.
3. Criar um job.
4. Executar o worker local.
5. Confirmar CSV/XLSX e status `Pronto para envio`.
6. Validar que o acompanhamento público não expõe contato, filtros internos ou caminho local.
