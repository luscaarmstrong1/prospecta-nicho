# Arquitetura ProspectaNicho

## Componentes

- `app/` e `components/`: site público e painel Next.js.
- `src/lib/api/client.ts`: roteamento das chamadas estáticas para Edge Functions.
- `src/server/` e `lib/server/`: regras e integrações server-side.
- `supabase/migrations/`: banco, RLS, RPCs e autorização.
- `supabase/functions/`: APIs públicas e administrativas.
- `workers/rfb_cnpj/`: busca, filtros, supressão, score e export local.

## Topologia atual

```text
GitHub Pages -> Supabase Edge Functions -> Supabase Postgres/Auth
                                            ^
                                            |
Worker Python local -> Minha Receita + IBGE + cache SQLite
Worker Python local -> CSV/XLSX local -> entrega manual
```

## Limites de confiança

- O navegador usa somente chaves públicas do Supabase.
- A Edge Function valida sessão e papel antes de qualquer ação administrativa.
- A service role fica somente no worker/ambiente seguro.
- O worker faz claim atômico e usa `run_id`, lease e heartbeat para impedir finalização por execução antiga.
- O público enxerga somente dados mínimos de acompanhamento.
- Arquivos locais não são servidos por URL pública.

## Evoluções opcionais

Storage privado, links temporários, domínio próprio e runtime Next.js server podem ser adicionados no futuro. Nenhum deles é requisito da arquitetura operacional gratuita atual.
