# Operação Worker CNPJ

O worker `workers/rfb_cnpj` é responsável por processar Dados Abertos do CNPJ fora do runtime do Next.js. Ele controla leitura de arquivos RFB, filtros, score, CSV, XLSX, storage e logs operacionais.

O Next.js não processa a base nacional em API Route.

## Comandos

```bash
python -m workers.rfb_cnpj discover
python -m workers.rfb_cnpj validate
python -m workers.rfb_cnpj validate-data-dir
python -m workers.rfb_cnpj run --sample
python -m workers.rfb_cnpj export --sample
python -m workers.rfb_cnpj run-local --filters filters.json --output output.xlsx
python -m workers.rfb_cnpj run-job --job-id UUID
```

## Diretórios

- `RFB_CNPJ_DATA_DIR`: diretório dos arquivos brutos/transformados da Receita.
- `RFB_CNPJ_OUTPUT_DIR`: diretório de saída dos exports.
- `RFB_CNPJ_CNAE_MAPPING_FILE`: JSON opcional para mapear segmentos comerciais para CNAEs.
- `RFB_CNPJ_CITY_MAPPING_FILE`: JSON opcional para mapear concessionárias para cidades.

Quando os arquivos mínimos não existem, `validate` retorna `waiting_data`. Isso é esperado em ambiente local sem base RFB.

## Export

O export padrão gera:

- CSV com UTF-8 BOM;
- XLSX;
- aba `Leads`;
- aba `Resumo`;
- aba `Filtros aplicados`;
- aba `Leia-me`.

Campos de sócios, CPF, telefone particular, e-mail pessoal e enriquecimento pago são bloqueados no export padrão.

## Operação Real

1. Baixar/organizar arquivos da Receita no diretório configurado.
2. Rodar `validate-data-dir`.
3. Rodar `run-local` com um arquivo de filtros pequeno.
4. Conferir contagem, abas do XLSX e ausência de campos sensíveis.
5. Subir o export para storage privado.
6. Registrar o export no CRM e gerar link assinado pelo admin.

