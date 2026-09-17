# ProspectaNicho

Plataforma de inteligência comercial B2B para solicitar, processar e entregar bases segmentadas de empresas com dados públicos de CNPJ.

## Arquitetura operacional

- Site e painel: Next.js App Router publicado no GitHub Pages.
- Banco, autenticação e APIs: Supabase Free (Postgres, Auth e Edge Functions).
- Pesquisa empresarial: API pública Minha Receita.
- Resolução de municípios: API do IBGE com cache local.
- Processamento: worker Python executado na máquina do operador.
- Entrega: CSV UTF-8 BOM e XLSX gravados localmente para conferência e envio manual.

O fluxo principal não baixa nem processa a base nacional da Receita Federal. Supabase Storage e links assinados são extensões opcionais e não são requisito para a operação local.

## Fluxo diário

1. Inicie o worker com `start-prospectanicho-worker.bat`.
2. Receba as solicitações criadas no site.
3. Valide o pedido e crie o job no CRM.
4. Aguarde o status `Pronto para envio`.
5. Abra a pasta `%USERPROFILE%\ProspectaNicho\Exports\PN-XXXXXX\`.
6. Confira e envie o CSV/XLSX ao cliente pelo canal combinado.
7. Marque o pedido como entregue no CRM.

## Configuração local

```powershell
npm install
Copy-Item .env.worker.example .env.worker
setup-prospectanicho-local.bat
start-prospectanicho-worker.bat
```

Preencha somente no arquivo local `.env.worker`:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SEGREDO_SOMENTE_DO_WORKER
EXPORT_DELIVERY_MODE=local
```

O worker não exige `ADMIN_API_TOKEN`, storage ou `RFB_CNPJ_DATA_DIR`. A service role nunca deve ir para o navegador, GitHub Actions público ou repositório.

## Endereços

- Site público: `https://luscaarmstrong1.github.io/prospecta-nicho/`
- Login administrativo: `https://luscaarmstrong1.github.io/prospecta-nicho/admin/login/`
- Acompanhamento público: `/pedido/?codigo=PN-XXXXXX`

O acesso administrativo usa Supabase Auth e perfis de `admin_profiles`. O token administrativo é apenas um mecanismo de emergência opcional e permanece desativado por padrão.

## Qualidade

```powershell
npm run worker:test
npm test
npm run typecheck
npm run lint
npm run spellcheck
npm run check:security
npm run check:rls
npm run build
npm run build:github
npm run test:e2e
```

## Privacidade

O export padrão contém somente dados empresariais permitidos. QSA, CPF, sócios, representantes legais e enriquecimento pessoal permanecem bloqueados. A lista de supressão é aplicada antes da geração dos arquivos.

Documentação operacional detalhada: [docs/operacao-worker.md](docs/operacao-worker.md).
