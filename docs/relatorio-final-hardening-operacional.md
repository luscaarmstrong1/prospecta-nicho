# Relatório final de hardening operacional

Data da validação: 17/09/2026  
Projeto: ProspectaNicho  
Repositório: `luscaarmstrong1/prospecta-nicho`  
Commit inicial auditado: `2d088202245f621a687446bc040d821ab79c9edf`  
Commit técnico validado: `52df6383d6347350400ca791c196f2b02f2aafce`

## Classificação final

**OPERACIONAL COM BLOQUEIO EXTERNO**

O código, a fila transacional, a migração no Supabase, o provedor Minha Receita,
o resolvedor IBGE, a geração local de CSV/XLSX, o frontend estático e os testes
estão operacionais. A classificação não é `OPERACIONAL` porque duas ativações
dependem de credenciais secretas que não existem no ambiente local e não devem
ser inventadas ou versionadas:

1. o worker contínuo precisa de um `.env.worker` local com `SUPABASE_URL` e
   `SUPABASE_SERVICE_ROLE_KEY`;
2. as Edge Functions revisadas precisam ser republicadas com um
   `SUPABASE_ACCESS_TOKEN` válido. A função de health pública ainda corresponde
   à versão anterior, embora responda `200`.

O Supabase Storage e links assinados permanecem opcionais. A operação principal
gera os arquivos localmente e permite entrega manual controlada.

## Escopo entregue

- Normalização canônica de CNPJ, CNAE, situação cadastral, matriz/filial, porte,
  MEI, Simples, datas, valores decimais, e-mail e telefone.
- Planejamento de consultas por CNAE e múltiplos municípios resolvidos pelo
  IBGE, sem cidades fixas no código.
- Integração real com Minha Receita, paginação limitada, distribuição
  round-robin, cache sanitizado e métricas operacionais.
- Filtros, deduplicação, scoring e supressão por CNPJ, e-mail, domínio, telefone
  e razão social.
- Exportação atômica em CSV com UTF-8 BOM e XLSX com as abas `Leads`, `Resumo`,
  `Filtros aplicados` e `Leia-me`, incluindo defesa contra formula injection.
- Fila com claim atômico, `FOR UPDATE SKIP LOCKED`, lease, heartbeat, fencing por
  `worker_id` e `run_id`, cancelamento, retry, recuperação de jobs travados e
  finalização transacional idempotente.
- Remoção da finalização manual/fictícia de jobs no CRM. Um job só pode ser
  concluído pelo worker que possui o lease da execução.
- RBAC e privacidade revisados, sem acesso público a pedidos, exports ou funções
  administrativas e sem exposição de service role no cliente.
- Documentação operacional, schema de referência, exemplo de ambiente local e
  CI atualizados.

## Migração Supabase

A migração
`supabase/migrations/20260917090000_finalize_rfb_worker_integrity.sql` foi
executada no projeto `bsirvqrxkosqisiiqpcg` pelo SQL Editor do Supabase.

A consulta de verificação após a aplicação retornou `true` para os oito itens:

- RPC `claim_next_rfb_job`;
- RPC `heartbeat_rfb_job`;
- RPC `transition_rfb_job`;
- RPC `finalize_local_rfb_job`;
- RPC `recover_stale_rfb_jobs`;
- coluna `exports.run_id`;
- índice único de idempotência por job/run/formato;
- índice único de idempotência por export/formato.

Nenhum segredo, token pessoal, chave de serviço ou credencial de administrador
foi copiado para o repositório ou para este relatório.

## Validação funcional real

Foi executada uma consulta online pequena contra Minha Receita com os seguintes
critérios: Campinas/SP, CNAE `6209100`, quantidade final `1`, formatos CSV e
XLSX.

Resultados observados:

- 1 requisição ao provedor e 1 página consultada;
- 1.024 registros recebidos;
- 626 registros válidos e únicos;
- 398 registros removidos pelos filtros;
- 1 lead gravado no export final;
- cache do provedor: 1 miss;
- cache IBGE: 1 hit;
- duração aproximada: 3,959 segundos;
- CSV: 291 bytes, UTF-8 BOM confirmado;
- XLSX: 8.223 bytes, quatro abas obrigatórias confirmadas;
- diretório temporário removido após a verificação.

Nenhum dado empresarial retornado pela consulta foi registrado neste relatório.

## Testes e publicação

| Verificação | Resultado |
| --- | --- |
| Pytest do worker | 53 aprovados |
| Vitest/Node | 42 aprovados |
| TypeScript | aprovado |
| ESLint | aprovado |
| Spellcheck | 168 arquivos, 0 erros |
| Segurança local | aprovado |
| Auditoria RLS | aprovado |
| Links, metadata e conteúdo | aprovados |
| Build Next.js | aprovado, 92 páginas |
| Build GitHub Pages | aprovado, 77 páginas estáticas |
| Playwright local | 63 aprovados, 11 ignorados, 0 falhas |
| GitHub Actions - Deploy | aprovado (`35216841151`) |
| GitHub Actions - Security | aprovado (`35216841132`) |
| GitHub Actions - CI | aprovado (`35216841205`, 6 min 35 s) |
| Site público | home e `/health/` respondendo HTTP 200 |

O aviso de depreciação de Node.js 20 emitido pelas Actions é informativo: o
runner executou as actions afetadas em Node.js 24 e não houve falha de segurança.

## Matriz de aceite (74 itens)

| # | Item | Status | Evidência resumida |
| ---: | --- | --- | --- |
| 1 | HEAD inicial | OK | `2d088202245f621a687446bc040d821ab79c9edf` |
| 2 | HEAD técnico final | OK | `52df6383d6347350400ca791c196f2b02f2aafce` |
| 3 | Arquivos alterados | OK | 49 arquivos, mudança focada no CRM/worker/docs/CI |
| 4 | Migração criada | OK | `20260917090000_finalize_rfb_worker_integrity.sql` |
| 5 | Migração aplicada | OK | SQL Editor: sucesso; verificação estrutural 8/8 |
| 6 | Claim atômico | OK | RPC transacional de claim |
| 7 | `SKIP LOCKED` | OK | Concorrência sem claim duplicado |
| 8 | `run_id` | OK | Execução identificada em jobs e exports |
| 9 | Fencing no heartbeat | OK | `worker_id` e `run_id` obrigatórios |
| 10 | Heartbeat durante export | OK | Guard ativo em processamento e exportação |
| 11 | Recuperação de stale jobs | OK | Lease/owner/run limpos antes do retry |
| 12 | Retry | OK | Tentativas e transições controladas |
| 13 | Cancelamento | OK | Checagens entre fases do pipeline |
| 14 | Perda de ownership | OK | Execução interrompida sem concluir job alheio |
| 15 | Decimal | OK | Normalização canônica coberta por testes |
| 16 | Situação cadastral | OK | Aliases normalizados |
| 17 | Matriz/filial | OK | Valores heterogêneos normalizados |
| 18 | Porte | OK | Porte canônico e filtro operacional |
| 19 | MEI | OK | Booleanos e aliases tratados |
| 20 | Simples | OK | Booleanos e aliases tratados |
| 21 | Aliases de e-mail | OK | Campos alternativos aceitos e sanitizados |
| 22 | Aliases de telefone | OK | Campos alternativos aceitos e sanitizados |
| 23 | CNPJ | OK | Somente 14 dígitos válidos no pipeline |
| 24 | CNAE | OK | Dígitos e aliases normalizados |
| 25 | Datas | OK | Datas do provedor normalizadas e filtráveis |
| 26 | IBGE | OK | Resolução online por UF com cache TTL |
| 27 | Múltiplas cidades | OK | Planejamento sem hardcode e falha explícita |
| 28 | Limites de páginas/query | OK | Limites configuráveis e validados |
| 29 | Round-robin | OK | Distribuição entre consultas planejadas |
| 30 | Cursor/paginação | OK | Página avançada com limites e métricas |
| 31 | Cache do provedor | OK | Cache sanitizado, hit/miss medidos |
| 32 | Cache IBGE | OK | Cache local com TTL de 720 horas |
| 33 | Deduplicação | OK | CNPJ como chave de unicidade |
| 34 | Supressão | OK | CNPJ/e-mail/domínio/telefone/razão social |
| 35 | Score | OK | Scoring preservado após filtros e supressão |
| 36 | CSV | OK | UTF-8 BOM e validação de conteúdo |
| 37 | XLSX | OK | Quatro abas obrigatórias verificadas |
| 38 | Formula injection | OK | Prefixo defensivo para células perigosas |
| 39 | Arquivo temporário | OK | Gerado e validado antes da publicação |
| 40 | Rename atômico | OK | Substituição somente após validação |
| 41 | Checksum | OK | Hash calculado e registrado na finalização |
| 42 | Finalização transacional | OK | Export e job finalizados na mesma RPC |
| 43 | Idempotência | OK | Constraints por job/run/export/formato |
| 44 | `request_export_id` | OK | Vínculo preservado pela finalização |
| 45 | Falha parcial | OK | Temporários limpos e job não é concluído |
| 46 | Sem resultados | OK | Tratamento explícito sem export fictício |
| 47 | Health local | OK | Não exige Storage no modo local |
| 48 | Storage opcional | OK | Não bloqueia o fluxo de entrega manual |
| 49 | Admin token opcional | OK | Ausência não bloqueia o worker local |
| 50 | RBAC | OK | Editor restrito; operador sem assinatura de export |
| 51 | Privacidade pública | OK | Pedidos e exports não são enumeráveis pelo público |
| 52 | Documentação | OK | Operação, arquitetura, CRM e dados revisados |
| 53 | Minha Receita real | OK | Health e consulta online concluídos |
| 54 | Cidade real | OK | Campinas/SP |
| 55 | Código IBGE | OK | Resolvido pelo catálogo/cache IBGE |
| 56 | Quantidade | OK | 1 lead final solicitado e entregue |
| 57 | Páginas consultadas | OK | 1 |
| 58 | Requisições de API | OK | 1 |
| 59 | Arquivos gerados | OK | CSV e XLSX válidos |
| 60 | Pytest | OK | 53 aprovados |
| 61 | Testes Node | OK | 42 aprovados |
| 62 | Typecheck | OK | Sem erros |
| 63 | Lint | OK | Sem erros |
| 64 | Spellcheck | OK | 168 arquivos, 0 erros |
| 65 | Segurança | OK | Script local e workflow aprovados |
| 66 | RLS | OK | Auditoria automatizada aprovada |
| 67 | Build padrão | OK | 92 páginas |
| 68 | Build GitHub Pages | OK | 77 páginas estáticas |
| 69 | E2E local | OK | 63 aprovados, 11 ignorados, 0 falhas |
| 70 | CI remoto | OK | Run `35216841205` aprovado, incluindo E2E e worker |
| 71 | Security remoto | OK | Run `35216841132` aprovado |
| 72 | Deploy remoto | OK | Run `35216841151` aprovado |
| 73 | HTTP público | OK | Home e `/health/` retornam 200 |
| 74 | Ativação externa | BLOQUEIO EXTERNO | Credenciais locais do worker e token de deploy das Edge Functions ausentes |

## Pendências externas exatas

### 1. Ativar o worker contínuo

Criar localmente `.env.worker` a partir de `.env.worker.example`, preencher
`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` e iniciar o processo documentado em
documentação operacional do worker. O arquivo não pode ser commitado.

### 2. Republicar as Edge Functions

Autenticar o Supabase CLI com um token pessoal válido e executar o procedimento
de deploy descrito em `docs/supabase-finalizacao-operacional.md`. Alternativamente,
armazenar o token como secret protegido do GitHub Actions e usar um workflow de
deploy com escopo mínimo. O token nunca deve ser salvo em variável pública.

Até essas duas ações serem executadas pelo proprietário das credenciais, o site
estático continua público e funcional, a estrutura do banco está migrada e o
pipeline pode ser exercitado localmente sem persistir jobs reais do CRM.
