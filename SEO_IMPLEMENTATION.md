# Implementação SEO da Prospecta Nicho

## Fonte de verdade

- Domínio: `https://prospectanicho.app`
- Marca: `Prospecta Nicho`
- Nome alternativo: `ProspectaNicho`
- Slogan: `Dados. Presença. Automação. Crescimento.`
- Imagem social: `/assets/brand/og-image.png`

As informações institucionais ficam centralizadas em `lib/site.ts` e a resolução segura da origem fica em `lib/site-url.ts`.

## Metadata

`app/layout.tsx` define os padrões globais de título, descrição, canonical, robots, Open Graph, Twitter Card, ícones e verificação do Google. `lib/seo.ts` fornece metadados canônicos reutilizáveis para páginas internas.

As páginas estratégicas possuem URL canônica e conteúdo específico:

- `/leads-b2b`
- `/sites`
- `/landing-pages`
- `/automacao`
- `/projetos`
- `/sobre`
- `/contato`

Aliases antigos de serviços permanecem acessíveis, mas usam `noindex` e canonical para a página principal correspondente.

## Dados estruturados

- `Organization`: layout raiz.
- `WebSite`: home.
- `Service`: páginas de serviço.
- `BreadcrumbList`: páginas internas estratégicas.
- `Article`: não foi adicionado porque não há artigos editoriais completos e verificáveis publicados nesta rodada.

## Rastreamento e indexação

- `app/sitemap.ts` gera URLs no domínio oficial.
- `app/robots.ts` publica o sitemap e bloqueia áreas não destinadas à busca.
- `app/manifest.ts` fornece metadados instaláveis e identidade básica.
- `public/CNAME` preserva o domínio personalizado no GitHub Pages.

## Conteúdo e links

A navegação conecta a home às quatro frentes principais. Páginas de serviço possuem links contextuais para outras soluções, projetos e contato. O projeto Omega Imports é apresentado somente com o endereço público verificável `https://omegaimports.vercel.app/`.

Números, clientes, avaliações e depoimentos sem fonte foram removidos. CTAs de WhatsApp usam a configuração central do projeto; quando ela não existe, a interface usa `/contato`.

## Verificação automatizada

- `npm run check:seo`: domínio, páginas, sitemap, H1, schemas e variável de verificação.
- `npm run check:metadata`: hosts locais e metadados básicos.
- `npm run check:links`: integridade dos links internos.
- `npm run check:security`: prevenção contra exposição de segredos.
- `npm run export:github`: exportação estática usada no deploy.

## Variáveis

```text
NEXT_PUBLIC_SITE_URL=https://prospectanicho.app
NEXT_PUBLIC_BASE_PATH=
GOOGLE_SITE_VERIFICATION=<conteúdo fornecido pelo Google>
```

`GOOGLE_SITE_VERIFICATION` deve ser salvo como segredo ou variável do ambiente de build. Não versionar o valor.
