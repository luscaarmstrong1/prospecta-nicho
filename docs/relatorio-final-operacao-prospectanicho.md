# Relatorio Final Operacional ProspectaNicho

Data: 2026-09-15

## Escopo aplicado

Esta etapa reforcou a operacao real do CRM CNPJ sem recriar o projeto e sem depender de servicos pagos.

Alteracoes feitas:

- CLI `python -m workers.rfb_cnpj data ...` para descoberta, setup, status, validacao, update e limpeza de snapshots.
- Scripts `.bat` de setup/status/update/worker para uso local no Windows.
- Caminhos locais padrao fora do repositorio: `%USERPROFILE%\ProspectaNicho\RFB` e `%USERPROFILE%\ProspectaNicho\Exports`.
- Validacao dos ZIPs obrigatorios antes de marcar snapshot como pronto.
- Exclusao explicita dos arquivos de socios no fluxo padrao.
- `.env.worker.example` com placeholders sem segredos.
- Autenticacao administrativa preparada para Supabase Auth por email/senha, com fallback tecnico por `ADMIN_API_TOKEN`.
- `requireAdmin` local e Edge validando JWT administrativo via perfil em `admin_profiles` ou `profiles`.

## Fonte dos dados

O worker usa a fonte oficial historica:

`https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj`

Durante a validacao desta etapa, a origem remota nao expos um snapshot valido para descoberta automatica e o comando retornou:

`REMOTE_UNAVAILABLE`

Isso e um estado operacional esperado, nao uma quebra do sistema. O status local continua `WAITING_DATA` ate os ZIPs reais serem baixados.

## Arquivos baixados

Obrigatorios:

- `Empresas0.zip` a `Empresas9.zip`
- `Estabelecimentos0.zip` a `Estabelecimentos9.zip`
- `Municipios.zip`
- `Cnaes.zip`
- `Simples.zip`
- `Naturezas.zip`

Ignorados no padrao:

- `Socios0.zip` a `Socios9.zip`
- `Qualificacoes.zip`
- `Paises.zip`

## Acoes manuais ainda necessarias

- Criar usuario administrativo no Supabase Auth.
- Inserir o `id` do usuario em `admin_profiles` ou `profiles` com papel administrativo.
- Configurar secrets reais fora do repositorio: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_TOKEN` se desejar fallback e bucket privado de exports.
- Executar `setup-dados-receita.bat` quando a fonte remota da Receita estiver disponivel.

## Validacao executada

- `python -m pytest workers/rfb_cnpj/tests/test_data_cli.py`: passou.
- `python -m workers.rfb_cnpj data status`: executou e retornou `WAITING_DATA`, pois os ZIPs reais ainda nao existem localmente.
- `python -m workers.rfb_cnpj data latest`: executou sem traceback e retornou `REMOTE_UNAVAILABLE`.
- `python -m workers.rfb_cnpj data setup --dry-run --yes`: executou sem traceback e retornou `REMOTE_UNAVAILABLE`.
- `npm run typecheck`: passou.
