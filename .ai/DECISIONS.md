# Prospecta Nicho - Decisões técnicas

<!-- cspell:words worktree -->

## 2026-09-28 - Conjunto PN final como identidade oficial

Contexto: o proprietário forneceu três arquivos oficiais da nova identidade ProspectaNicho, com lockups para fundos claro e escuro e símbolo PN.

Decisão: usar o lockup escuro nos headers e rodapés V2, manter a variante clara para superfícies claras e usar o símbolo fornecido em contextos compactos. Metadados estruturados e a biblioteca administrativa de mídia também passam a referenciar o conjunto PN final.

Motivo: impedir que a identidade anterior continue aparecendo em páginas secundárias ou dados estruturados e manter consistência entre a home oficial e o restante do site.

Impacto: mudança exclusivamente visual e de branding; nenhum contrato de API, banco, autenticação, pagamento, CRM, Supabase ou worker foi alterado.

Responsável: OpenAI Codex.

## 2026-09-22 - Coordenação multiagente no mesmo checkout

Contexto: Codex e Google Antigravity passarão a desenvolver o mesmo projeto físico.

Decisão: Codex permanece PRIMARY MAINTAINER / OWNER e Antigravity atua como FULL CO-EDITOR / CONTRIBUTOR. O protocolo compartilhado fica em `AGENTS.md` e `.ai/`. Não foi criada cópia, branch ou worktree adicional.

Motivo: permitir colaboração plena sem fragmentar o estado local nem perder decisões entre chats.

Impacto: ambos devem ler os arquivos de coordenação, conferir Git antes de editar, evitar edição simultânea do mesmo arquivo e atualizar o handoff depois de trabalho relevante.

Responsável: OpenAI Codex.

## 2026-09-22 - Preservar a arquitetura híbrida GitHub Pages e Supabase

Contexto: o frontend público é exportado estaticamente, mas formulários, acompanhamento e CRM exigem runtime.

Decisão: manter Next.js App Router com export para GitHub Pages e rotear chamadas de runtime para Supabase Edge Functions. Route Handlers continuam disponíveis para ambientes Next.js com servidor.

Motivo: GitHub Pages não executa API Routes; Edge Functions fornecem persistência, autenticação e operações administrativas sem expor credenciais privilegiadas.

Impacto: mudanças em rotas de API devem manter o mapeamento de `src/lib/api/runtime.ts` e ser verificadas no export estático.

Responsável: arquitetura existente, mantida pelo Codex.

## 2026-09-22 - Processamento de CNPJ fora do frontend e das APIs web

Contexto: pesquisa, filtragem e geração de planilhas podem ser tarefas longas e usam credenciais privilegiadas.

Decisão: o worker Python em `workers/rfb_cnpj/` é responsável por fila, providers, resolução de municípios, filtros, supressão, scoring e exportação CSV/XLSX.

Motivo: evitar limites de execução web, proteger secrets e manter processamento recuperável com claim, lease e heartbeat.

Impacto: não mover processamento pesado para o navegador, GitHub Pages ou Route Handlers da Vercel sem uma nova decisão arquitetural.

Responsável: arquitetura existente, mantida pelo Codex.

## 2026-09-22 - Privacidade e enriquecimento controlado

Contexto: o produto trabalha com dados empresariais públicos, mas alguns campos podem introduzir dados pessoais e risco LGPD.

Decisão: o export padrão exclui CPF, QSA, sócios, representantes legais e contatos particulares. Enriquecimento permanece como add-on bloqueado até pagamento e autorização operacional.

Motivo: minimizar dados e manter o produto dentro do escopo empresarial documentado.

Impacto: qualquer ampliação de campos exige revisão de privacidade, segurança e contrato de exportação.

Responsável: arquitetura existente, mantida pelo Codex.

## 2026-09-22 - Frontend V2 isolado durante integração

Contexto: existe uma preview visual aprovada e uma integração local em andamento para as páginas oficiais.

Decisão: manter camadas V2 em `components/home-v2`, `components/shared-v2`, `lib/home-v2` e `lib/site-v2`, preservando a preview em `components/preview-v2` como referência separada.

Motivo: permitir evolução da home oficial sem destruir a baseline visual nem afetar backend, CRM e worker.

Impacto: alterações visuais devem preservar CTAs e rotas reais, e não reintroduzir modais ou fluxos demonstrativos na home oficial.

Responsável: integração existente, sob revisão do Codex.

## 2026-09-28 - Prova social somente com fonte verificável

Contexto: a implementação visual anterior continha nomes e relatos demonstrativos sem uma fonte de autorização verificável no repositório.

Decisão: remover os depoimentos fictícios da home oficial e manter um estado editorial preparado, que só publica relatos após autorização e conferência da fonte.

Motivo: evitar alegações comerciais falsas e preservar a confiabilidade institucional.

Impacto: a estrutura de depoimentos permanece disponível, mas o array publicado fica vazio até existirem fontes aprovadas.

Responsável: OpenAI Codex.

## 2026-09-28 - Preservação de preços e contratos existentes

Contexto: o briefing visual propõe quatro ofertas, enquanto preços, rotas e contratos comerciais já estavam centralizados no projeto.

Decisão: preservar os valores e destinos vigentes no código e limitar esta rodada à apresentação visual e ao conteúdo público da home.

Motivo: uma mudança visual não deve alterar preço, pagamento, CRM ou contrato operacional sem validação comercial específica.

Impacto: nenhuma API, migration, Edge Function, regra de pagamento ou worker foi modificada.

Responsável: OpenAI Codex.

## 2026-09-28 - Paridade visual sem conteúdo comercial fictício

Contexto: a Fase 2 exige aproximar a home da referência visual sem redesenhar o produto e sem publicar afirmações sem fonte.

Decisão: preservar a composição de três cartões na prova social, identificando-os como demonstração em validação até existirem depoimentos autorizados. Manter também os preços reais centralizados no projeto, mesmo quando o documento visual apresentar valores ilustrativos diferentes.

Motivo: a geometria da referência pode ser reproduzida sem transformar conteúdo demonstrativo em alegação comercial e sem alterar contratos vigentes durante uma rodada exclusivamente visual.

Impacto: nenhuma API, migration, Edge Function, regra de pagamento, CRM, Supabase ou worker foi alterado. A aprovação final permanece condicionada às capturas comparativas.

Responsável: OpenAI Codex.
