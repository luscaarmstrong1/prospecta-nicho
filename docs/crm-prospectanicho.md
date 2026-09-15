# CRM ProspectaNicho

O CRM da ProspectaNicho centraliza pedidos reais de planilhas CNPJ vindos da solicitacao rapida, da amostra gratuita, do construtor de base e das rotas administrativas.

O produto principal e o gerador de planilhas com dados publicos de CNPJ. Enriquecimento comercial permanece bloqueado como add-on pago e nao faz parte do export padrao.

## Fluxo operacional

1. O visitante informa contato, segmento, cidade/UF, periodo, quantidade e objetivo comercial.
2. A API publica valida origem, payload, honeypot, rate limit e Turnstile quando configurado.
3. A solicitacao e registrada no CRM em `custom_requests`.
4. Os filtros sao normalizados em `request_filters`.
5. Os campos permitidos para entrega sao registrados em `request_fields`.
6. A timeline do pedido e gravada em `request_status_events`.
7. O admin acessa `/admin` com cookie httpOnly ou `Authorization: Bearer ADMIN_API_TOKEN`.
8. O admin valida filtros, registra pagamento quando aplicavel e cria um job real em `rfb_processing_jobs`.
9. O worker Python processa Dados Abertos da Receita Federal fora do Next.js.
10. O worker resolve CNAEs por segmento, cidades por concessionaria quando aplicavel, aplica filtros e calcula score.
11. O worker gera CSV UTF-8 BOM e XLSX com abas `Leads`, `Resumo`, `Filtros aplicados` e `Leia-me`.
12. O export e registrado em `exports` e os arquivos fisicos em `export_files`.
13. O download do cliente passa por link assinado e temporario, com auditoria em `export_downloads`.
14. O cliente acompanha o pedido em `/pedido/[public_code]` sem acesso a admin, URL direta do arquivo, filtros internos sensiveis ou dados do solicitante.

## Tabelas canonicas

- `custom_requests`;
- `request_filters`;
- `request_fields`;
- `request_status_events`;
- `rfb_processing_jobs`;
- `rfb_job_logs`;
- `exports`;
- `export_files`;
- `export_downloads`;
- `payments`;
- `segment_cnae_mappings`;
- `utilities`;
- `utility_cities`;
- `suppression_list`;
- `audit_logs`.

As tabelas antigas `crm_requests`, `cnpj_jobs` e `crm_exports` podem existir em migracoes historicas, mas nao sao a fonte operacional principal do CRM novo.

## Areas administrativas

- `/admin/requests`: lista operacional dos pedidos CNPJ.
- `/admin/requests/[id]`: detalhe do pedido, filtros, acoes e timeline.
- `/admin/jobs`: visao dos jobs do worker.
- `/admin/exportacoes`: exports e geracao de link assinado.
- `/admin/segment-mapping`: mapeamento segmento-CNAE.
- `/admin/concessionarias`: mapeamento concessionaria-cidades.
- `/admin/suppression-list`: controle operacional de supressao.
- `/pedido/[id]`: acompanhamento publico por protocolo.

## Seguranca

As rotas `/admin/*` sao protegidas por `middleware.ts`. O login usa `/api/admin/session`, grava cookie httpOnly e nunca expoe `SUPABASE_SERVICE_ROLE_KEY` no client.

APIs administrativas tambem aceitam `Authorization: Bearer ADMIN_API_TOKEN` para automacoes controladas. O publico nao deve listar pedidos, baixar exports privados nem acionar processamento.

## Ambiente

Producao exige, no minimo:

- `NEXT_PUBLIC_SITE_URL`;
- `ADMIN_API_TOKEN`;
- `EXPORT_SIGNING_SECRET`;
- `SUPABASE_URL`;
- `SUPABASE_SERVICE_ROLE_KEY`;
- storage privado para exports;
- arquivos reais da Receita em `RFB_CNPJ_DATA_DIR`;
- mapeamentos de CNAE e concessionarias revisados.

Sem Supabase configurado, o projeto usa fallback local apenas para desenvolvimento e testes. Isso nao substitui banco, storage e dados reais em producao.

## Runtime GitHub Pages

No deploy estatico em `https://luscaarmstrong1.github.io/prospecta-nicho/`, o frontend nao chama API Routes do Next.js diretamente. As chamadas publicas e administrativas passam por `src/lib/api/client.ts`, que roteia para Supabase Edge Functions quando `NEXT_PUBLIC_RUNTIME_TARGET=github-pages`.

Rotas importantes nesse modo:

- `/pedido/?codigo=PN-...`: acompanhamento publico por protocolo, sem dados internos nem arquivo privado.
- `/health/`: verificacao publica do estado das integracoes sem expor segredos.
- `/admin/*`: interface estatica; as acoes reais exigem `ADMIN_API_TOKEN` validado pelas Edge Functions.

Segredos como `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_TOKEN`, `EXPORT_SIGNING_SECRET`, credenciais de storage e diretorios RFB ficam no Supabase/worker. O GitHub Pages recebe apenas variaveis `NEXT_PUBLIC_*`.
