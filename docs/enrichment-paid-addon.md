# Enrichment Paid Add-on

O enriquecimento comercial é um módulo premium bloqueado. Ele não faz parte do gerador padrão de planilhas CNPJ.

## O Que Não Pode Acontecer

- Rodar automaticamente.
- Rodar em amostra gratuita.
- Rodar antes de pagamento confirmado.
- Rodar por rota pública.
- Adicionar campos pessoais ao export padrão.
- Contornar o admin por parâmetro de URL ou payload client-side.

## Liberação Operacional

1. Admin oferece o add-on ao cliente.
2. Pagamento é confirmado fora do fluxo padrão.
3. Admin marca `enrichmentPaid`.
4. Admin executa a ação protegida.
5. Sistema registra auditoria em `enrichment_runs` e `audit_logs`.

Rotas sem confirmação retornam bloqueio e devem falhar fechado.

