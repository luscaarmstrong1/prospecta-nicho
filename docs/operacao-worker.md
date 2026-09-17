# Operação do worker CNPJ

O worker `workers/rfb_cnpj` consome jobs do Supabase, consulta a Minha Receita, resolve municípios no IBGE, aplica filtros e supressões e gera os arquivos locais. Nenhuma base nacional é processada em API Route ou no GitHub Pages.

## Pré-requisitos

- Python 3.12 e dependências instaladas;
- acesso à internet;
- `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env.worker` local;
- migrações do Supabase aplicadas até `20260917090000_finalize_rfb_worker_integrity.sql`.

## Comandos

```powershell
python -m workers.rfb_cnpj provider health
python -m workers.rfb_cnpj watch
python -m workers.rfb_cnpj watch --once
python -m workers.rfb_cnpj run-job --job-id UUID
python -m workers.rfb_cnpj search --uf SP --city Campinas --cnae 6209100 --quantity 10 --output resultado.xlsx
```

Use `start-prospectanicho-worker.bat` para a operação diária. Os comandos `discover`, `data setup` e `validate-data-dir` pertencem ao fallback legado e não são necessários no fluxo Minha Receita.

## Concorrência e recuperação

- O claim usa `FOR UPDATE SKIP LOCKED`.
- Cada execução recebe `run_id` próprio.
- Heartbeats renovam a lease durante busca, filtragem, exportação e finalização.
- Toda atualização crítica é cercada por `job_id + run_id + worker_id`.
- Três falhas consecutivas de heartbeat interrompem a execução.
- Jobs com lease vencida são recolocados na fila até o limite de tentativas; depois falham de forma explícita.
- Cancelamento é verificado entre etapas e páginas.

## Consulta e filtros

O município informado precisa ser resolvido pelo IBGE. Falha de resolução encerra o job e nunca amplia silenciosamente a consulta para todo o estado. Consultas com vários municípios/CNAEs são intercaladas em round-robin, com limite por consulta e cursor independente.

Os registros são normalizados antes dos filtros: CNPJ, CNAE, datas, capital social, situação cadastral, matriz/filial, porte, MEI, Simples, e-mail e telefone. A lista `suppression_list` pode bloquear por CNPJ, e-mail, domínio, telefone ou nome empresarial.

## Arquivos

O diretório padrão é `%USERPROFILE%\ProspectaNicho\Exports\<protocolo>\`.

- CSV: UTF-8 BOM, separador `;`, cabeçalho validado.
- XLSX: abas `Leads`, `Resumo`, `Filtros aplicados` e `Leia-me`.
- Células iniciadas por `=`, `+`, `-` ou `@` são neutralizadas contra formula injection.
- Cada arquivo é gravado em temporário, reaberto/validado e renomeado atomicamente.
- O manifest registra tamanho e checksum SHA-256.

Se um formato falhar, nenhum arquivo parcial é registrado como entrega pronta.

## Finalização

A RPC `finalize_rfb_job` registra export, arquivos e status do pedido em uma transação idempotente. O painel exibe `Pronto para envio` e o caminho local; ele não simula conclusão manual do worker.

Supabase Storage e links assinados podem ser adicionados no futuro. No modo atual, o operador confere os arquivos locais, envia ao cliente e marca a entrega no CRM.

## Diagnóstico

```powershell
status-prospectanicho.bat
python -m workers.rfb_cnpj provider health
npm run worker:test
```

Nunca inclua `.env.worker`, service role, arquivos exportados, cache SQLite ou logs com dados comerciais em commits.
