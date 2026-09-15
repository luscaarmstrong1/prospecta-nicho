# Checklist Operacional da Primeira Base Real

Use este checklist antes da primeira entrega comercial gerada pela plataforma ProspectaNicho.

## 1. Ambiente e segredos

1. Configurar `NEXT_PUBLIC_SITE_URL` com o dominio real de producao.
2. Configurar `ADMIN_API_TOKEN` forte e exclusivo para o admin.
3. Configurar `EXPORT_SIGNING_SECRET` forte e exclusivo para links temporarios.
4. Configurar `SUPABASE_URL` somente no ambiente server-side.
5. Configurar `SUPABASE_SERVICE_ROLE_KEY` somente no ambiente server-side.
6. Configurar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` quando o front precisar de recursos públicos do Supabase.
7. Confirmar que `.env` nao esta versionado.
8. Rodar `npm run check:env` e corrigir qualquer variavel critica ausente antes de producao.
9. Ativar `CHECK_ENV_STRICT=1` ou usar `NODE_ENV=production` em deploy real.

## 2. Banco Supabase

10. Aplicar a migracao `supabase/migrations/20260914001000_crm_cnpj_required_tables.sql`.
11. Confirmar que as tabelas canonicas existem: `custom_requests`, `request_filters`, `request_fields`, `request_status_events`, `rfb_processing_jobs`, `rfb_job_logs`, `exports`, `export_files`, `export_downloads`.
12. Confirmar que RLS esta ativo nas tabelas operacionais.
13. Confirmar que somente service role/admin consegue listar pedidos, jobs e exports.
14. Conferir mapeamentos `segment_cnae_mappings`, `utilities` e `utility_cities`.
15. Rodar `npm run check:rls`.

## 3. Storage e arquivos privados

16. Criar bucket privado de exports no Supabase Storage ou R2/S3.
17. Confirmar que o bucket nao permite listagem publica.
18. Configurar credenciais de storage no ambiente do worker.
19. Gerar um link assinado de teste e validar expiracao.
20. Confirmar que `/api/internal/exports/[id]` nao entrega arquivo sem token valido.

## 4. Dados da Receita Federal

21. Organizar os arquivos reais da Receita em `RFB_CNPJ_DATA_DIR`.
22. Confirmar presenca de arquivos de empresas, estabelecimentos, simples, CNAEs e municipios.
23. Rodar `python -m workers.rfb_cnpj validate-data-dir`.
24. Corrigir nomes, codificacao ou layout dos arquivos caso o validador retorne `waiting_data` ou erro estrutural.
25. Rodar um teste pequeno com filtros restritos antes de qualquer base grande.

## 5. Pedido real no CRM

26. Enviar um pedido pelo formulario público.
27. Confirmar que o pedido aparece em `/admin/requests`.
28. Conferir se contato, segmento, cidade/UF, periodo, quantidade e observacoes foram salvos corretamente.
29. Confirmar que filtros normalizados foram gravados em `request_filters`.
30. Confirmar que campos permitidos foram gravados em `request_fields`.
31. Confirmar que a timeline foi gravada em `request_status_events`.
32. Validar manualmente escopo e disponibilidade antes de gerar o job.
33. Registrar pagamento quando aplicavel.

## 6. Worker e export

34. Criar o job pelo admin.
35. Confirmar que ele foi registrado em `rfb_processing_jobs`.
36. Executar o worker fora do Next.js.
37. Confirmar logs em `rfb_job_logs`.
38. Gerar CSV com UTF-8 BOM.
39. Gerar XLSX com abas `Leads`, `Resumo`, `Filtros aplicados` e `Leia-me`.
40. Conferir que os filtros reais do pedido foram usados pelo worker.
41. Conferir que CNAEs vieram do mapeamento de segmento.
42. Conferir que cidades vieram do pedido ou do mapeamento de concessionaria quando aplicavel.
43. Confirmar que nao ha CPF, socios, representantes legais, telefone particular, e-mail pessoal ou enriquecimento no export padrao.
44. Aplicar lista de supressao antes da entrega.
45. Conferir amostra visual da planilha antes de liberar ao cliente.

## 7. Entrega

46. Salvar o arquivo no storage privado ou diretorio controlado.
47. Registrar `exports` e `export_files`.
48. Gerar link assinado pelo admin.
49. Testar o link em janela anonima.
50. Confirmar que o link expira.
51. Marcar o pedido como entregue somente depois da conferencia.
52. Confirmar que `/pedido/[public_code]` mostra status seguro e nao mostra URL direta do arquivo.

## 8. Validação final

53. Rodar `npm run typecheck`.
54. Rodar `npm run lint`.
55. Rodar `npm run test`.
56. Rodar `npm run test:e2e`.
57. Rodar `npm run worker:test`.
58. Rodar `npm run check:security`.
59. Rodar `npm run check:links`.
60. Rodar `npm run check:metadata`.
61. Rodar `git diff --check`.
