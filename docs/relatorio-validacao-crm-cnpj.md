# Relatorio de Validacao CRM CNPJ

Data: 2026-09-15

## Escopo validado

- Formularios publicos registram pedido real no CRM.
- CRM usa `custom_requests` como fonte canonica.
- Filtros, campos e timeline usam `request_filters`, `request_fields` e `request_status_events`.
- Admin e APIs administrativas exigem sessao httpOnly ou bearer token.
- Botao de processar cria job em `rfb_processing_jobs`; processamento pesado nao roda em API Route.
- Worker Python gera CSV UTF-8 BOM e XLSX.
- XLSX contem abas `Leads`, `Resumo`, `Filtros aplicados` e `Leia-me`.
- Export padrao bloqueia campos sensiveis e enriquecimento.
- Link de download e assinado e temporario.
- Pagina publica `/pedido/[public_code]` nao lista pedidos, nao mostra arquivo privado e nao expoe admin.
- RLS e politicas service role existem para as tabelas operacionais.

## Comandos executados

```bash
npm run typecheck
npm run test
npm run lint
npm run spellcheck
npm run check:security
npm run check:links
npm run check:metadata
npm run check:content
npm run check:rls
npm run check:env
npm run build
npm run worker:test
npm run test:e2e
python -m workers.rfb_cnpj discover
python -m workers.rfb_cnpj validate
python -m workers.rfb_cnpj validate-data-dir
python -m workers.rfb_cnpj run --sample
python -m workers.rfb_cnpj export --sample
python -m workers.rfb_cnpj run-local --filters outputs/rfb-cnpj/filters-sample.json --output outputs/rfb-cnpj/run-local-output.xlsx
python -m workers.rfb_cnpj run-job --job-id 00000000-0000-0000-0000-000000000000
git diff --check
```

## Resultado

- TypeScript: aprovado.
- ESLint: aprovado.
- Testes JS: 35 aprovados.
- Testes Python: 13 aprovados.
- Playwright: 63 aprovados e 1 skip esperado.
- Build Next.js: aprovado.
- Links, metadata, conteudo, RLS, spellcheck e seguranca: aprovados.
- `discover`: aprovado.
- `run --sample`: aprovado, gerou XLSX/CSV de amostra.
- `export --sample`: aprovado, confirmou mascara de preview e export.
- `run-local`: aprovado, gerou `outputs/rfb-cnpj/run-local-output.xlsx`.
- `git diff --check`: aprovado, apenas avisos LF/CRLF do Windows.

## Resultado esperado sem credenciais reais

- `npm run check:env` retornou `ok: false` em modo nao estrito porque faltam `NEXT_PUBLIC_SITE_URL`, `ADMIN_API_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `EXPORT_SIGNING_SECRET` no ambiente local.
- `python -m workers.rfb_cnpj validate` e `validate-data-dir` retornaram `waiting_data` porque `data/rfb-cnpj` nao contem os arquivos reais da Receita.
- `python -m workers.rfb_cnpj run-job` retornou `waiting_integration` porque Supabase/R2/banco do worker ainda nao estao configurados neste ambiente.

Esses estados nao sao falha de codigo local; sao pendencias obrigatorias para processamento de bases reais em producao.

## Pendencias de producao

- Configurar as variaveis obrigatorias no ambiente de deploy.
- Aplicar migracoes Supabase.
- Criar storage privado para exports.
- Carregar arquivos reais da Receita Federal em `RFB_CNPJ_DATA_DIR`.
- Revisar mapeamentos de CNAE e concessionarias antes da primeira entrega comercial.
- Executar `validate-data-dir` com dados reais.
- Rodar um primeiro job real pequeno e conferir manualmente o XLSX antes de vender em escala.
