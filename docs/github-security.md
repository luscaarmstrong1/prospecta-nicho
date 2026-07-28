# GitHub Security

## Repositório fonte

- Repositório: `luscaarmstrong1/prospecta-nicho`
- Remote local: `https://github.com/luscaarmstrong1/prospecta-nicho.git`
- Publicação GitHub Pages: `https://luscaarmstrong1.github.io/prospecta-nicho/`
- O repositório não deve conter credenciais reais, exports de leads, dumps, planilhas comerciais ou tokens.

## Observação sobre GitHub Pages

Kairós Engenharia deve permanecer isolada em `luscaarmstrong1/kairos-engenharia`, com Pages próprio em `https://luscaarmstrong1.github.io/kairos-engenharia/`. Nenhum asset, workflow ou branch de deploy da Kairós deve ser usado pela ProspectaNicho.

## Secret scanning

A varredura local não encontrou valores reais de segredo. Foram encontrados apenas nomes de variáveis em `.env.example`, documentação e código.

Tentativa de habilitar secret scanning/push protection via GitHub CLI retornou que o recurso não está disponível para este repositório/plano. A proteção deve ser habilitada pela interface da conta caso o plano seja atualizado ou a opção fique disponível.

## Próximas ações recomendadas

- Conferir colaboradores no GitHub.
- Habilitar secret scanning e push protection se o plano da conta permitir.
- Proteger `main` exigindo CI verde antes de merge.
- Rotacionar qualquer chave que tenha sido usada em ambiente público anterior.

## Registro operacional - 2026-07-28

- Escopo: ProspectaNicho, repositório `luscaarmstrong1/prospecta-nicho`.
- Objetivo: preparar o projeto para repositório privado e reduzir risco de exposição de código, dados e segredos.
- Dependências: `package.json` usa `overrides` para manter `brace-expansion`, `postcss` e `sharp` em versões corrigidas pelo audit atual.
- CI de segurança: `dependency-audit` roda `npm audit --omit=dev --audit-level=high`; CodeQL fica condicionado a repositório público porque GitHub Advanced Security/CodeQL para repositórios privados depende do plano da conta.
- GitHub Pages: após a mudança para privado em 2026-07-28, `gh api repos/luscaarmstrong1/prospecta-nicho/pages` e `https://luscaarmstrong1.github.io/prospecta-nicho/` retornaram 404. Para manter acesso público sem expor o código-fonte, usar Vercel ou Pages em repositório público separado apenas com artefato estático.

## Registro operacional - 2026-07-28 - retorno para público

- O repositório `luscaarmstrong1/prospecta-nicho` foi alterado novamente para público a pedido do proprietário.
- GitHub Pages foi reativado pela branch `gh-pages`, path `/`, com HTTPS enforced.
- Link público esperado: `https://luscaarmstrong1.github.io/prospecta-nicho/`.
- Com o repositório público, CodeQL volta a ser elegível no workflow `Security`.
