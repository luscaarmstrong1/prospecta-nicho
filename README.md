# Prospecta Nicho

## Objetivo do projeto

Aplicação para prospecção B2B e organização estratégica de bases comerciais.

## Problema que resolve

Apoia organização de nichos, leads e dados comerciais para captação e análise operacional.

## Demonstração visual

![Screenshot desktop](docs/screenshots/home-desktop.png)

![Screenshot mobile](docs/screenshots/home-mobile.png)

## Tecnologias utilizadas

- Next.js
- React
- TypeScript
- Zod
- React Hook Form
- Framer Motion
- Lucide React
- Playwright
- GitHub Actions
- Preview estático opcional

## Recursos principais

- Editor de bases B2B
- Validações de formulário
- Componentes React
- Testes e scripts de checagem
- Publicação estática

## Acesso público

Produção canônica: configurar `NEXT_PUBLIC_SITE_URL=https://prospectanicho.com.br` em Vercel ou infraestrutura equivalente com suporte a rotas server-side do Next.js.

Preview estático temporário: GitHub Pages pode ser usado apenas quando o export estático estiver explicitamente habilitado, sem tratar `github.io` como canonical de produção.

## Como executar localmente

Pré-requisitos: Node.js compatível com o projeto e o gerenciador indicado pelo lockfile (`package-lock.json` ou `pnpm-lock.yaml`).

```bash
npm install
npm run build
```

Quando houver scripts específicos no `package.json`, use também `npm run dev`, `npm run test`, `npm run lint` ou os comandos equivalentes documentados no próprio arquivo.

## Estrutura do projeto

- `src/`, `app/` ou `apps/`: código da interface, conforme o framework do repositório.
- `public/`: assets estáticos publicados com a aplicação.
- `docs/screenshots/`: capturas reais da página publicada.
- `.github/workflows/`: automações de build/deploy quando presentes.
- `scripts/`: rotinas auxiliares de build, auditoria ou validação quando presentes.

## Limitações e avisos técnicos

Este repositório é uma demonstração técnica ou produto em evolução. O conteúdo não substitui projeto executivo, estudo de conexão, validação regulatória, parecer técnico, proposta comercial definitiva ou análise jurídica. Funcionalidades, cálculos e textos devem ser revisados antes de uso profissional.

## Privacidade e segurança

Não inclua tokens, chaves, credenciais, dados pessoais sensíveis ou arquivos `.env` em commits. Em demonstrações públicas, use dados fictícios ou anonimizados. Quando houver `.env.example`, trate-o apenas como referência de configuração.

## Status

Produto digital em evolução.
