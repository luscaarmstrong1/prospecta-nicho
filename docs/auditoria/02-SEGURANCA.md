# 02-SEGURANCA — AUDITORIA DOS 21 CONTROLES OWASP, ADMIN, BANCO E LGPD

## 1. Auditoria Específica da Prospecta Nicho

### A. Painel Administrativo (`/admin/*`)
1. **Middleware de Autenticação:**
   - [`middleware.ts`](file:///C:/Users/lucas/Documents/Codex/2026-06-14/leads-b2b-recuperada/middleware.ts) intercepta todas as requisições para `/admin` e subrotas (exceto `/admin/login`).
   - Requisições sem o cookie `prospecta_admin_session` sofrem redirecionamento imediato 307 com preservação do parâmetro `?next=`.
2. **Validação Criptográfica HMAC & Sessão:**
   - A validação em [`lib/server/admin-session.ts`](file:///C:/Users/lucas/Documents/Codex/2026-06-14/leads-b2b-recuperada/lib/server/admin-session.ts) utiliza SHA-256 HMAC nativo (`crypto.subtle`).
   - Formato assinado: `${base64UrlPayload}.${base64UrlSignature}`.
   - O payload carrega expiração timestamp (`exp`) e `role`.
   - Modificações no cookie ou tentativas de forjar o perfil são rejeitadas com retorno `null`.
3. **Mecanismo Break-Glass:**
   - O acesso via token estático só é aceito quando explicitamente habilitado via `ENABLE_BREAK_GLASS_ADMIN=true`. Mesmo nesse modo, uma sessão assinada com expiração de 8 horas é gerada para o cookie HTTP-only.
4. **Proteção CSRF & Origem:**
   - A rota de sessão administrativa [`/api/admin/session`](file:///C:/Users/lucas/Documents/Codex/2026-06-14/leads-b2b-recuperada/app/api/admin/session/route.ts) valida cabeçalhos `Origin` e `Host`, bloqueando chamadas cross-site forjadas (status 403).

### B. Banco de Dados, Leads e RLS
1. **Isolamento e Leitura Anônima:**
   - O papel `anon` do Supabase **não tem permissão** de leitura direta (`SELECT`) na tabela de pedidos ou cadastros de clientes.
   - Consultas de leads B2B acontecem exclusivamente por APIs autenticadas ou pré-renderização controlada com filtros públicos (`lib/site.ts`, `lib/filters.ts`).
2. **Exportação de Bases:**
   - Downloads e exportações de leads exigem assinatura temporária criptográfica via URLs expiráveis de storage privado (Cloudflare R2 / S3), bloqueando download arbitrário de bases de terceiros.

### C. LGPD e Proteção de Dados Sensíveis
1. **Campos Bloqueados no Pipeline:**
   - Conforme atestado por `npm run check:security`, os campos pessoais:
     - `cpf`
     - `nome_socio`
     - `telefone_particular`
     - `email_pessoal`
     - `score_enriquecido`
     estão estritamente expurgados de qualquer export público, payload de API e logs.
2. **Mecanismo de Supressão (Opt-Out):**
   - Sistema de blacklist / suppression list validado em `workers/rfb_cnpj/tests/test_suppression.py`. Empresas e contatos que solicitam exclusão são normalizados por CNPJ, e-mail comercial, domínio e telefone, impedindo inclusão em novas bases geradas.
3. **Bloqueio de Enriquecimento não Autorizado:**
   - Teste `test_enrichment_fails_closed` comprova que dados adicionais e enriquecimento de bases falham fechados (geram `PermissionError`) se o pagamento do addon não estiver confirmado ou se o solicitante não for administrador.

### D. Workers Python & Consultas CNPJ
1. **Normalização e Validação:**
   - Sanitização de dígitos verificadores de CNPJ e tratamento de caracteres não numéricos em `workers/rfb_cnpj/models.py`.
2. **Controle de Taxa (Rate Limit) e Concorrência:**
   - Provedor Minha Receita (`minhareceita.org`) opera com intervalo mínimo de 200ms entre requisições, concorrência máxima de 3 workers, timeout de 40s e retentativas exponenciais com cache local em disco (TTL de 24h).
3. **Logs Seguros:**
   - Logs de importação mascaram telefones e e-mails pessoais, registrando apenas métricas quantitativas de processamento.

---

## 2. Auditoria dos 21 Controles OWASP

| Nº | Controle de Segurança | Status | Evidência Técnica |
| :--- | :--- | :--- | :--- |
| **01** | Chaves de API protegidas | CONFORME | `check:security` aprovado; segredos fora de `NEXT_PUBLIC_` |
| **02** | Arquivos `.env` protegidos | CONFORME | `.env.local` ignorado pelo `.gitignore`; `.env.example` sem valores |
| **03** | Ausência de segredos no frontend | CONFORME | Bundle inspecionado; nenhum token privado exposto no cliente |
| **04** | Autenticação efetiva | CONFORME | Middleware Next.js e Supabase Auth via credenciais seguras |
| **05** | Autorização no servidor | CONFORME | `verifyAdminRole` executado estritamente no backend |
| **06** | Proteção contra IDOR | CONFORME | IDs de pedidos baseados em UUID v4 não sequenciais |
| **07** | Isolamento de dados | CONFORME | RLS ativo; separação estrita por protocolo de pedido |
| **08** | Banco de dados (mínimo privilégio) | CONFORME | Role `anon` sem privilégio em tabelas de auditoria e clientes |
| **09** | Supabase, storage e funções | CONFORME | Buckets privados com presigned URLs expiráveis |
| **10** | Rotas administrativas protegidas | CONFORME | `/admin/*` protegido por HMAC e cookie HttpOnly/Lax |
| **11** | Ausência de debug público inseguro | CONFORME | `ENABLE_BREAK_GLASS_ADMIN=false` por padrão |
| **12** | Mensagens de erro sem vazamento | CONFORME | Respostas padronizadas com payloads genéricos em 401/403/500 |
| **13** | Validação de entradas no servidor | CONFORME | Schemas Zod em todos os endpoints (`contact`, `session`, `sample`) |
| **14** | Proteção contra XSS e injeções | CONFORME | Escapamento HTML nativo do React + sanitização com regex |
| **15** | Uploads seguros | CONFORME | Arquivos gerados no backend; ausência de upload público executável |
| **16** | Proteção contra SQL Injection | CONFORME | Parâmetros e queries REST do Supabase parametrizados |
| **17** | Rate limiting e prevenção de abuso | CONFORME | `rateLimit()` baseado em IP (6 req/min no formulário de contato) |
| **18** | Ausência de segredos no Git | CONFORME | Histórico recente limpo de credenciais e chaves privadas |
| **19** | Headers HTTP e CORS | CONFORME | CSP estrito, X-Frame-Options DENY, nosniff em `next.config.ts` |
| **20** | Testes de acesso indevido | CONFORME | Testes automatizados bloqueiam chamadas não assinadas |
| **21** | Auditoria automatizada comprovada | CONFORME | Scripts `check:security`, `check:rls` e `check:env` em CI/CD |
