# Checklist da primeira base real

## Supabase

1. Aplicar todas as migrações, inclusive `20260917090000_finalize_rfb_worker_integrity.sql`.
2. Confirmar RLS nas tabelas operacionais.
3. Confirmar o usuário administrativo em `admin_profiles` com o papel correto.
4. Revisar `segment_cnae_mappings`, `utilities` e `utility_cities`.
5. Executar `npm run check:rls` e `npm run check:security`.

## Worker local

6. Criar `.env.worker` fora do Git com `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
7. Manter `EXPORT_DELIVERY_MODE=local`.
8. Executar `python -m workers.rfb_cnpj provider health`.
9. Iniciar `start-prospectanicho-worker.bat`.
10. Confirmar que o diretório `%USERPROFILE%\ProspectaNicho\Exports` é gravável.

`ADMIN_API_TOKEN`, storage e `RFB_CNPJ_DATA_DIR` não são requisitos deste fluxo.

## Pedido e processamento

11. Enviar uma solicitação pelo site.
12. Confirmar pedido, filtros e timeline no CRM.
13. Validar segmento, CNAEs, UF, municípios, período e quantidade.
14. Criar o job e confirmar que ele passa de `queued` para `running`.
15. Acompanhar heartbeat, progresso e logs reais.
16. Confirmar que município não resolvido falha de forma explícita.
17. Confirmar que a lista de supressão foi aplicada.
18. Aguardar `Pronto para envio`.

## Conferência dos arquivos

19. Abrir a pasta do protocolo.
20. Conferir CSV UTF-8 BOM e XLSX.
21. Conferir as abas `Leads`, `Resumo`, `Filtros aplicados` e `Leia-me`.
22. Comparar quantidade, filtros, CNAEs, cidades e período com o pedido.
23. Confirmar ausência de CPF, QSA, sócios e contatos pessoais.
24. Conferir tamanho e checksum registrados no CRM.
25. Enviar os arquivos pelo canal combinado.
26. Marcar o pedido como entregue.

## Qualidade antes da operação

```powershell
npm run worker:test
npm test
npm run typecheck
npm run lint
npm run spellcheck
npm run check:security
npm run check:rls
npm run build
npm run build:github
npm run test:e2e
git diff --check
```

Storage privado e links assinados são opções futuras. Se ativados, exigem uma rodada própria de segurança e testes; não devem ser presumidos como configurados.
