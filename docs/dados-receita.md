# Fonte de dados empresariais

## Fluxo principal

O worker consulta dados públicos de CNPJ por meio da API Minha Receita. A API do IBGE resolve nomes e códigos de municípios por UF. Ambas usam cache SQLite local com TTL configurável.

Não é necessário baixar a base nacional, manter `RFB_CNPJ_DATA_DIR`, provisionar ClickHouse ou processar arquivos da Receita em rotas do Next.js.

## Controles

- limite de páginas por consulta;
- round-robin entre combinações de município e CNAE;
- retry com backoff e respeito a erros do provider;
- métricas de cache hit/miss, páginas e requisições;
- deduplicação por CNPJ;
- falha fechada quando um município não é resolvido;
- normalização canônica antes dos filtros;
- supressão antes do score e do export.

## Dados exportados

O export padrão contém dados cadastrais empresariais necessários à prospecção B2B. QSA, CPF, sócios, representantes e enriquecimento pessoal não são consultados nem exportados.

A origem informada no arquivo é: `Dados públicos do CNPJ da Receita Federal, consultados por meio da API Minha Receita`.

## Fallback legado

Os comandos de descoberta e processamento de snapshots locais continuam isolados para compatibilidade técnica. Eles não fazem parte da operação diária e não devem ser ativados sem revisão específica de capacidade, armazenamento, segurança e LGPD.
