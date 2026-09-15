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

