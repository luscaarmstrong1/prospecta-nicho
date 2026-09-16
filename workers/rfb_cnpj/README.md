# Worker RFB CNPJ

Worker Python para gerar planilhas de dados publicos de CNPJ. O fluxo principal usa a Minha Receita como provider de busca paginada, normaliza os registros empresariais, aplica filtros comerciais, pontua e gera CSV/XLSX sem QSA, socios, CPF ou enriquecimento no export padrao.

## Fluxo principal

```bash
python -m workers.rfb_cnpj provider health
python -m workers.rfb_cnpj search --uf PE --city "Recife" --cnae 4321500 --quantity 100 --output resultado.xlsx
python -m workers.rfb_cnpj watch --once
```

O worker da fila precisa de Python, internet, `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Ele nao exige `RFB_CNPJ_DATA_DIR` no caminho principal. Por padrao, os exports ficam em `%USERPROFILE%\ProspectaNicho\Exports` e o cache da Minha Receita fica em `%USERPROFILE%\ProspectaNicho\Cache\minha_receita.sqlite`.

Origem exibida nos exports: "Dados publicos do CNPJ da Receita Federal, consultados por meio da API Minha Receita".

## Variaveis do provider

```bash
COMPANY_SEARCH_PROVIDER=minha_receita
MINHA_RECEITA_BASE_URL=https://minhareceita.org
MINHA_RECEITA_PAGE_LIMIT=1024
MINHA_RECEITA_TIMEOUT_SECONDS=40
MINHA_RECEITA_MAX_RETRIES=5
MINHA_RECEITA_MAX_CONCURRENCY=3
MINHA_RECEITA_MIN_INTERVAL_MS=200
MINHA_RECEITA_CACHE_TTL_HOURS=24
MINHA_RECEITA_MAX_PAGES_PER_QUERY=1000
MINHA_RECEITA_OVERSAMPLE_FACTOR=2
MINHA_RECEITA_CACHE_DIR=
```

## Comandos de desenvolvimento

```bash
python -m workers.rfb_cnpj run --sample
python -m workers.rfb_cnpj export --sample
python -m workers.rfb_cnpj run-local --filters filtros.json --output resultado.xlsx
```

O modo `--sample` nao processa base nacional e serve apenas para desenvolvimento e testes.

## Fallback legado dos Dados Abertos

Os comandos abaixo continuam disponiveis apenas como fallback/legado para snapshots locais. Eles nao sao requisito para o fluxo principal com Minha Receita.

```bash
python -m workers.rfb_cnpj discover
python -m workers.rfb_cnpj data latest
python -m workers.rfb_cnpj data setup --yes
python -m workers.rfb_cnpj data setup --dry-run --yes
python -m workers.rfb_cnpj data status
python -m workers.rfb_cnpj data validate
python -m workers.rfb_cnpj data update --yes
python -m workers.rfb_cnpj data prune --keep 1 --yes
```

Os arquivos de socios sao deliberadamente ignorados no fluxo padrao.
