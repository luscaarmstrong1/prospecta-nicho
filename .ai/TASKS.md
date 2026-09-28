# Prospecta Nicho - Tarefas compartilhadas

<!-- cspell:words commitadas frontends Pytest -->

## Em andamento

- [x] Aplicar a nova identidade PN final e preparar publicação
  - responsável: OpenAI Codex
  - status: implementação e verificações locais concluídas em 2026-09-28; publicação depende do commit/push e do GitHub Actions
  - contexto: lockups claro/escuro e símbolo fornecidos pelo proprietário foram incorporados sem alterar backend, CRM, Supabase ou worker

- [x] Auditar e consolidar a home do frontend oficial V2
  - responsável: Codex, com contribuição permitida do Antigravity
  - status: concluído tecnicamente em 2026-09-28; alterações locais ainda não commitadas
  - contexto: home, navegação, segmentos, planos, prova social, SEO e responsividade foram alinhados ao briefing aprovado; a Fase 2 de paridade textual e estrutural foi aplicada em 2026-09-28
  - dependências: preservar backend, Supabase, CRM, worker e contratos existentes; revisar `docs/handoff-home-oficial-preview-v2.md` e `handoff/prospectanicho-frontends-final/HANDOFF_CODEX.md`

- [ ] Executar a validação completa da integração V2 em ambiente sem bloqueio de subprocessos
  - responsável: próximo agente que assumir a integração
  - status: pendente de autorização do navegador para as capturas da Fase 2
  - contexto: typecheck, lint, spellcheck, 55 testes Node e exportação estática passaram nesta fase; segurança e 53 testes do worker já haviam passado na rodada anterior; falta a regressão visual com capturas em 1440, 1024 e 390 pixels
  - dependências: revisar primeiro o diff atual; executar verificações proporcionais e registrar resultados em `.ai/HANDOFF.md`

- [ ] Revisar fidelidade visual das cinco páginas internas V2
  - responsável: Antigravity ou Codex, com handoff ao final
  - status: pendente de decisão e refinamento
  - contexto: o handoff visual informa que home está próxima da referência, enquanto páginas internas ainda apresentam diferenças mensuradas
  - dependências: referências e screenshots em `handoff/prospectanicho-frontends-final/`; não alterar fluxos funcionais para obter fidelidade visual

## Concluído nesta sessão

- [x] Criar a camada de coordenação multiagente no mesmo checkout físico
  - responsável: OpenAI Codex
  - status: concluído em 2026-09-22
  - contexto: `AGENTS.md` e `.ai/` documentam papéis, estado, decisões, tarefas e handoff
  - dependências: nenhuma
