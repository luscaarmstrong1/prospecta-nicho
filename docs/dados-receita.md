# Dados Receita

O worker `workers/rfb_cnpj` foi preparado para operar sobre os Dados Abertos do CNPJ da Receita Federal em processamento externo ao Next.js.

## Arquivos Mínimos

- `Empresas`;
- `Estabelecimentos`;
- `Simples`;
- `Cnaes`;
- `Municipios`.

## Responsabilidade do Worker

- Descobrir arquivos disponíveis.
- Validar diretório de dados.
- Resolver segmentos para CNAEs.
- Resolver concessionárias para cidades quando aplicável.
- Aplicar filtros comerciais.
- Gerar score operacional.
- Exportar CSV e XLSX.
- Bloquear campos pessoais/sensíveis no export padrão.

## Responsabilidade do Next.js

- Receber pedidos públicos.
- Validar payload e origem.
- Salvar filtros no CRM.
- Proteger admin.
- Criar jobs.
- Mostrar timeline.
- Gerar links assinados para exports prontos.

## Limites

O processamento da base nacional não deve acontecer em API Route da Vercel. Downloads, validação, transformação e exports devem rodar em worker externo, máquina local controlada, job dedicado ou infraestrutura equivalente.

Campos sensíveis, dados pessoais de sócios e contatos pessoais ficam bloqueados no export padrão.



## Setup operacional local

Scripts adicionados na raiz: `setup-prospectanicho-local.bat`, `setup-dados-receita.bat`, `update-dados-receita.bat`, `status-prospectanicho.bat` e `start-prospectanicho-worker.bat <job-id>`.

Variaveis principais: `RFB_CNPJ_DATA_DIR`, `RFB_CNPJ_OUTPUT_DIR`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_STORAGE_BUCKET`. A service role e qualquer segredo devem ficar somente no ambiente servidor/worker.

O downloader exige empresas, estabelecimentos e tabelas auxiliares. Arquivos de socios ficam fora do fluxo padrao para reduzir risco LGPD e evitar exportacao de dados pessoais.
