# CRM ProspectaNicho

O CRM registra solicitações reais de bases CNPJ, filtros, timeline, jobs e exports. O enriquecimento comercial continua bloqueado como add-on pago e não entra no export padrão.

## Fluxo

1. O formulário público valida e grava `custom_requests`.
2. Filtros e campos são persistidos em `request_filters` e `request_fields`.
3. A timeline é registrada em `request_status_events`.
4. Um administrador valida o escopo e cria o job.
5. O worker local consulta Minha Receita e IBGE, filtra, suprime, pontua e exporta.
6. A finalização transacional registra `exports`, `export_files` e `custom_requests.export_id`.
7. O painel mostra `Pronto para envio` e o caminho local ao usuário autorizado.
8. O operador confere, envia e marca a entrega.

## Painel

- `/admin/requests`: pedidos e filtros.
- `/admin/jobs`: fila, progresso, lease e logs.
- `/admin/exportacoes`: manifests e caminhos locais.
- `/admin/segment-mapping`: segmento para CNAE.
- `/admin/concessionarias`: concessionária para municípios.
- `/admin/suppression-list`: bloqueios de CNPJ, e-mail, domínio, telefone ou empresa.
- `/pedido/?codigo=PN-XXXXXX`: status público minimizado.

O painel não oferece conclusão manual falsa de job. Somente o worker pode finalizar processamento e registrar arquivos.

## Segurança

O acesso administrativo usa Supabase Auth, `admin_profiles`, RLS e permissões por papel. A service role existe apenas no worker e nas Edge Functions. `ADMIN_API_TOKEN` é opcional para emergência e fica desativado por padrão.

Endpoints públicos não listam pedidos, jobs ou exports e não retornam contatos, caminhos locais ou metadados internos. A página pública usa apenas protocolo e status seguro.

## Runtime estático

No GitHub Pages, `src/lib/api/client.ts` encaminha chamadas reais às Edge Functions. O navegador recebe apenas variáveis `NEXT_PUBLIC_*`. O worker continua separado e é executado localmente.

## Entrega

O modo operacional atual é `local`: arquivos em `%USERPROFILE%\ProspectaNicho\Exports\<protocolo>\`, conferência humana e envio manual. Storage privado e download assinado podem ser implementados depois, sem bloquear o fluxo atual.
