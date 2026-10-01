# Configuração do Google para a Prospecta Nicho

## Google Search Console

1. Acesse o Search Console com a conta proprietária da marca.
2. Crie uma propriedade de domínio para `prospectanicho.app`.
3. Prefira a verificação DNS quando o painel do domínio estiver disponível.
4. Se usar a tag HTML, copie somente o conteúdo do atributo `content` e salve no ambiente de build como `GOOGLE_SITE_VERIFICATION`.
5. Execute um novo deploy e confirme que a meta tag aparece no HTML da home.
6. Envie `https://prospectanicho.app/sitemap.xml` em **Sitemaps**.
7. Use **Inspeção de URL** para solicitar indexação da home e das páginas estratégicas.

Não coloque o token de verificação diretamente no repositório.

## URLs prioritárias

- `https://prospectanicho.app/`
- `https://prospectanicho.app/leads-b2b/`
- `https://prospectanicho.app/sites/`
- `https://prospectanicho.app/landing-pages/`
- `https://prospectanicho.app/automacao/`
- `https://prospectanicho.app/projetos/`
- `https://prospectanicho.app/sobre/`
- `https://prospectanicho.app/contato/`

## Validação pós-indexação

- Confirmar canonical selecionado pelo Google.
- Verificar cobertura do sitemap e páginas excluídas.
- Testar rich results nas páginas com `Organization`, `Service` e `BreadcrumbList`.
- Acompanhar Core Web Vitals em dados de campo.
- Revisar consultas de marca para `Prospecta Nicho` e `ProspectaNicho`.

## Perfil da Empresa no Google

O Perfil da Empresa não foi criado automaticamente. Antes de criar, confirme que a empresa atende aos critérios do Google e possui nome, categoria, área de atendimento, telefone e demais dados reais e autorizados. Não use endereço virtual, avaliações ou horário inventado.

## Limites desta configuração

O código prepara o site para rastreamento e verificação. O Google controla descoberta, renderização, indexação e posição. Nenhuma posição ou prazo de indexação é garantido.
