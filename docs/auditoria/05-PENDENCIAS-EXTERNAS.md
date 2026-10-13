# 05-PENDENCIAS-EXTERNAS — CONFIGURAÇÕES E AÇÕES EXTERNAS PENDENTES

Este documento elenca exclusivamente as ações que dependem de credenciais de produção, painéis externos ou decisão do gestor do projeto.

---

## 1. Google Search Console & Bing Webmaster Tools
- **Status:** **PENDENTE DE ACESSO / VERIFICAÇÃO EXTERNA**.
- **Contexto:** Os arquivos técnicos (`robots.txt` e `sitemap.xml`) já estão configurados e apontando para as URLs oficiais de produção.
- **Ação Necessária:**
  1. Acessar o Google Search Console e adicionar a propriedade de domínio `prospectanicho.app`.
  2. Verificar a propriedade via DNS (registro TXT) ou via meta tag adicionando `GOOGLE_SITE_VERIFICATION` nas variáveis de ambiente da hospedagem.
  3. Enviar a URL do sitemap: `https://prospectanicho.app/sitemap.xml`.
  4. Replicar no Bing Webmaster Tools conectando com a conta do Search Console.

---

## 2. Google Analytics 4 (GA4) / Google Tag Manager
- **Status:** **PENDENTE DE CONFIGURAÇÃO DE VARIÁVEL**.
- **Contexto:** O projeto já possui a chave preparada no `.env.example` (`NEXT_PUBLIC_GA_ID`).
- **Ação Necessária:**
  1. Obter o Measurement ID no painel do Google Analytics (ex.: `G-XXXXXXXXXX`).
  2. Inserir a variável `NEXT_PUBLIC_GA_ID` nas variáveis de ambiente da plataforma de deploy (Vercel ou servidor próprio).

---

## 3. Provedor de E-mail Transacional (Resend)
- **Status:** **PENDENTE DE INSERÇÃO DE CHAVE EM PRODUÇÃO**.
- **Contexto:** A integração com Resend está implementada no backend com fallbacks seguros.
- **Ação Necessária:**
  1. No painel da Resend, configurar e validar o domínio `prospectanicho.app` (adicionar registros SPF, DKIM e DMARC no DNS).
  2. Gerar a chave de API e cadastrar `RESEND_API_KEY` e `CONTACT_EMAIL` nas variáveis de ambiente.

---

## 4. Cloudflare Turnstile (Proteção Antispam)
- **Status:** **PREPARADO / PENDENTE DE CHAVES DE PRODUÇÃO**.
- **Contexto:** Os formulários públicos suportam o desafio Turnstile transparente.
- **Ação Necessária:**
  1. No painel Cloudflare Turnstile, criar um widget para o domínio `prospectanicho.app`.
  2. Definir `NEXT_PUBLIC_TURNSTILE_SITE_KEY` e `TURNSTILE_SECRET_KEY` no ambiente.

---

## 5. Gateway de Pagamento (Mercado Pago / Asaas)
- **Status:** **PENDENTE DE CHAVES REAIS DE PRODUÇÃO**.
- **Contexto:** Endpoints de checkout e webhooks com assinatura criptográfica implementados.
- **Ação Necessária:**
  1. Inserir credenciais reais de produção (`MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET` ou `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`).
  2. Configurar a URL de webhook no painel do meio de pagamento apontando para `https://prospectanicho.app/api/payments/webhook`.
