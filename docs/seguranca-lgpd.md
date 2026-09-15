# Segurança e LGPD

O CRM CNPJ foi desenhado para vender bases B2B com dados públicos de empresas, não dados pessoais nem enriquecimento automático.

## Regras Aplicadas

- Export padrão usa somente campos empresariais de CNPJ.
- CPF, sócios, representantes legais, telefone particular, e-mail pessoal e score enriquecido são bloqueados.
- Lista de supressão deve ser aplicada antes da entrega final.
- Downloads não são públicos; o cliente recebe link assinado e temporário.
- Admin exige `ADMIN_API_TOKEN` por sessão httpOnly ou bearer token server-side.
- `SUPABASE_SERVICE_ROLE_KEY` só é lida em código server-side.
- Público não lista pedidos, não acessa admin e não baixa exports privados.
- `/pedido/[public_code]` mostra apenas status seguro do pedido.

## Auditoria

Eventos importantes devem ser registrados em `audit_logs`:

- criação de pedido;
- validação;
- pagamento;
- criação de job;
- conclusão de job;
- geração de export;
- assinatura de link;
- marcação de entrega;
- liberação de add-on pago.

## Enriquecimento

O enriquecimento é fail-closed:

- não roda em amostra gratuita;
- não roda no pedido padrão;
- não roda automaticamente;
- não roda sem confirmação manual de pagamento;
- não deve entrar no CSV/XLSX padrão.

## Produção

Em produção, configurar `CHECK_ENV_STRICT=1` ou `NODE_ENV=production` para impedir deploy sem variáveis críticas.

