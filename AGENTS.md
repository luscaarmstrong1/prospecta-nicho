# Prospecta Nicho - Regras para agentes

<!-- cspell:words commitados commitar worktree worktrees -->

## Papéis

- **OpenAI Codex:** PRIMARY MAINTAINER / OWNER técnico. É a referência para arquitetura, integração, conflitos, mudanças de alto impacto, branch principal e coerência geral.
- **Google Antigravity:** FULL CO-EDITOR / CONTRIBUTOR. Pode ler e editar qualquer módulo, criar ou remover arquivos quando tecnicamente necessário, executar comandos, instalar dependências justificadas, implementar funcionalidades, corrigir bugs e trabalhar em frontend, backend, infraestrutura e configurações.

O Antigravity não é apenas um assistente secundário. Alterações de alto impacto feitas por qualquer agente devem ser registradas em `.ai/DECISIONS.md` e resumidas em `.ai/HANDOFF.md` para auditoria e continuidade.

## Antes de trabalhar

1. Ler este `AGENTS.md`.
2. Ler `.ai/PROJECT_STATE.md`.
3. Ler `.ai/TASKS.md`.
4. Ler `.ai/DECISIONS.md`.
5. Ler `.ai/HANDOFF.md`.
6. Executar `git status --short --branch`.
7. Examinar o diff e os commits recentes relevantes antes de modificar arquivos.

## Durante o trabalho

- Código e Git são a fonte de verdade. Chats individuais não são a fonte de verdade do projeto.
- Preservar a arquitetura atual. Não trocar stack, serviços ou fluxos estruturais sem necessidade concreta e decisão registrada.
- Nunca descartar silenciosamente alterações de outro agente. Mudanças não reconhecidas devem ser preservadas até serem compreendidas.
- Codex e Antigravity podem trabalhar simultaneamente na mesma pasta, mas devem evitar editar o mesmo arquivo ao mesmo tempo.
- Antes de editar um arquivo compartilhado, conferir `git status` e o diff desse arquivo. Depois de uma sessão longa, conferir novamente antes de gravar.
- Preferir buscas direcionadas e o contexto mínimo necessário. Evitar scans integrais e leituras repetitivas.
- Fazer mudanças pequenas e compatíveis com os padrões já existentes.
- Não criar cópias, branches ou worktrees apenas por precaução. Não mover o projeto sem necessidade.
- Não executar `git reset --hard`, `git clean`, checkout destrutivo, force push ou qualquer comando que apague trabalho local.
- Não commitar nem expor `.env`, `.env.worker`, chaves, tokens, credenciais, exports, bases de clientes ou dados pessoais.
- A `SUPABASE_SERVICE_ROLE_KEY` pertence somente a ambientes server-side seguros e ao worker local; nunca ao bundle do navegador.
- O frontend estático do GitHub Pages usa Supabase Edge Functions para operações de runtime. Não presumir que API Routes do Next.js executam no Pages.
- O processamento pesado de CNPJ pertence ao worker Python, não a Route Handlers do Next.js.
- Preservar as proteções de privacidade: o export padrão não deve incluir CPF, QSA, sócios, representantes legais ou contatos particulares.

## Mudanças de alto impacto

Exigem registro prévio ou imediato em `.ai/DECISIONS.md` e revisão do Codex:

- arquitetura, banco, migrations, RLS, autenticação ou modelo de autorização;
- contratos de Edge Functions, APIs públicas ou administrativas;
- fluxo de pedidos, pagamentos, jobs, exports ou enriquecimento;
- deploy, base path, GitHub Actions ou publicação;
- dependências estruturais ou alteração de stack;
- mudanças que atravessam vários módulos ou removem compatibilidade.

## Depois de trabalho relevante

1. Atualizar `.ai/PROJECT_STATE.md` se o estado real do sistema mudou.
2. Atualizar `.ai/TASKS.md` sem inventar backlog.
3. Registrar decisões arquiteturais relevantes em `.ai/DECISIONS.md`.
4. Atualizar `.ai/HANDOFF.md`.
5. Informar arquivos modificados.
6. Informar testes executados e resultados.
7. Informar pendências, riscos e qualquer ação manual necessária.

## Verificação proporcional

Começar pela verificação mais estreita e expandir conforme o risco:

- frontend/TypeScript: `npm run typecheck`, lint ou teste direcionado;
- documentação e textos públicos: `npm run spellcheck` quando aplicável;
- segurança: `npm run check:security` para alterações em auth, APIs, ambiente ou dados;
- worker: `npm run worker:test` para alterações em `workers/rfb_cnpj`;
- exportação estática: `npm run export:github` para rotas, assets, base path ou deploy;
- fluxo completo: `npm run test:e2e` quando a mudança afetar jornadas do navegador.

Não declarar uma validação como aprovada se ela não foi executada.
