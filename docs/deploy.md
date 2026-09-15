# Deploy

O GitHub Pages pode continuar servindo preview estático da vitrine, mas o CRM CNPJ completo precisa de runtime server para API Routes, autenticação administrativa, Supabase e geração de links assinados.

## Produção Recomendada

- Next.js em Vercel ou infraestrutura equivalente com runtime server.
- Supabase Postgres com RLS.
- Supabase Storage, R2 ou S3 para exports privados.
- Worker Python externo para processamento dos arquivos da Receita.

## Variáveis Obrigatórias

- `NEXT_PUBLIC_SITE_URL`;
- `ADMIN_API_TOKEN`;
- `EXPORT_SIGNING_SECRET`;
- `SUPABASE_URL`;
- `SUPABASE_SERVICE_ROLE_KEY`;
- `RFB_CNPJ_DATA_DIR`;
- `RFB_CNPJ_OUTPUT_DIR`.

## Variáveis Opcionais

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
- `NEXT_PUBLIC_WHATSAPP_NUMBER`;
- `TURNSTILE_SECRET_KEY`;
- `RESEND_API_KEY`;
- `MERCADO_PAGO_ACCESS_TOKEN`;
- `MERCADO_PAGO_WEBHOOK_SECRET`;
- `ASAAS_API_KEY`;
- `ASAAS_WEBHOOK_TOKEN`;
- `RFB_CNPJ_CNAE_MAPPING_FILE`;
- `RFB_CNPJ_CITY_MAPPING_FILE`.

## Base Path

Produção real não deve depender de `github.io`, `localhost`, `127.0.0.1`, portas locais ou `/prospecta-nicho` como `basePath`.

Preview estático pode usar GitHub Pages de forma separada, desde que o deploy real do CRM fique em ambiente com servidor.

## Checklist de Deploy

1. Configurar variáveis no provedor.
2. Aplicar migrações Supabase.
3. Criar bucket privado de exports.
4. Definir token admin forte.
5. Rodar `npm run check:env` em modo estrito.
6. Rodar build e testes.
7. Rodar worker com amostra.
8. Rodar worker com um recorte real pequeno antes da primeira entrega comercial.

