// cspell:ignore Ltda
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, Database, Filter, Layers, Play, Send, ShieldCheck } from "lucide-react";
import { SharedCTA } from "@/components/shared-v2/SharedCTA";
import { createWhatsAppLink } from "@/lib/whatsapp";
import styles from "@/components/shared-v2/site-pages.module.css";

export const metadata: Metadata = {
  title: "Soluções | ProspectaNicho",
  description:
    "Encontre, segmente e ative oportunidades B2B com mais resultado. Bases B2B, recorte personalizado e exportação para CRM.",
};

const solutionsList = [
  {
    id: "bases-b2b",
    icon: Database,
    title: "Bases B2B",
    description: "Acesse milhões de empresas atualizadas em todo o Brasil, com dados completos e confiáveis.",
    href: "/solicitar-planilha?source=solucoes-bases",
  },
  {
    id: "recorte-personalizado",
    icon: Filter,
    title: "Recorte personalizado",
    description: "Filtre por segmento, região, porte, faturamento e muito mais. Encontre exatamente o seu público.",
    href: "/solicitar-planilha?source=solucoes-recorte",
  },
  {
    id: "exportacao-crm",
    icon: Send,
    title: "Exportação para CRM",
    description: "Exporte suas listas com poucos cliques e leve os dados para o seu CRM ou time comercial.",
    href: "/amostra",
  },
  {
    id: "integracoes",
    icon: Layers,
    title: "Integrações",
    description: "Conecte o ProspectaNicho ao seu ecossistema de vendas com integrações simples e seguras.",
    href: "/contato",
  },
];

const stepsList = [
  {
    index: "1",
    icon: Database,
    title: "Acesse os dados",
    description: "Explore nossa base de empresas atualizada e confiável.",
  },
  {
    index: "2",
    icon: Filter,
    title: "Segmente seu mercado",
    description: "Aplique filtros e encontre o perfil ideal de empresas para o seu negócio.",
  },
  {
    index: "3",
    icon: Layers,
    title: "Ative oportunidades",
    description: "Exporte, integre e leve os dados para o seu time de vendas.",
  },
];

export default function SolucoesPage() {
  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* HERO (1:1 COM MOCKUP 01) */}
        <section className={styles.heroSplitSection} data-testid="solucoes-hero">
          <div className={styles.heroSplitInner}>
            <div className={styles.heroTextCol}>
              <span className={styles.eyebrowTag}>NOSSAS SOLUÇÕES</span>
              <h1 className={styles.heroMainTitle}>
                Encontre, segmente e ative <span className={styles.cyanHighlight}>oportunidades B2B</span> com mais resultado.
              </h1>
              <p className={styles.heroLeadText}>
                Dados confiáveis, segmentação precisa e integração com seus processos de vendas. Tudo em um só lugar para você prospectar melhor e mais rápido.
              </p>
              <div className={styles.heroBtnGroup}>
                <Link className={styles.btnPrimarySolid} href="/solicitar-planilha?source=solucoes-hero">
                  Começar agora <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a
                  className={styles.btnGhostOutline}
                  href={createWhatsAppLink(
                    "Olá, gostaria de entender como funciona a ProspectaNicho.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play size={15} fill="#20edf0" color="#20edf0" /> Ver como funciona
                </a>
              </div>
            </div>

            {/* PERSPECTIVE DASHBOARD CARD (1:1 COM O MOCKUP 01) */}
            <div className={styles.heroVisualCol}>
              <div className={styles.perspectiveDashboardFrame}>
                {/* Dashboard Header Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", paddingBottom: "0.6rem", borderBottom: "1px solid rgba(32, 237, 240, 0.12)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#20edf0", boxShadow: "0 0 8px #20edf0" }} />
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>ProspectaNicho</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "0.7rem", color: "#20edf0", background: "rgba(32, 237, 240, 0.08)", padding: "0.18rem 0.5rem", borderRadius: "4px", border: "1px solid rgba(32, 237, 240, 0.2)" }}>
                      Indústria Metalúrgica ▾
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8", background: "rgba(255, 255, 255, 0.04)", padding: "0.18rem 0.5rem", borderRadius: "4px" }}>
                      João Silva • Empresa Exemplo
                    </span>
                  </div>
                </div>

                {/* Dashboard Body with Left Nav & Right Table */}
                <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "0.85rem" }}>
                  {/* Left Mini Nav */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.7rem", color: "#64748b" }}>
                    <div style={{ color: "#20edf0", fontWeight: 700, padding: "0.25rem 0.4rem", background: "rgba(32, 237, 240, 0.08)", borderRadius: "4px" }}>• Início</div>
                    <div style={{ padding: "0.25rem 0.4rem" }}>• Bases B2B</div>
                    <div style={{ padding: "0.25rem 0.4rem" }}>• Segmentação</div>
                    <div style={{ padding: "0.25rem 0.4rem" }}>• Exportação</div>
                    <div style={{ padding: "0.25rem 0.4rem" }}>• Integrações</div>
                    <div style={{ padding: "0.25rem 0.4rem" }}>• Relatórios</div>
                    <div style={{ padding: "0.25rem 0.4rem" }}>• Configurações</div>
                  </div>

                  {/* Right Content */}
                  <div>
                    {/* Stat Card */}
                    <div style={{ background: "rgba(0, 14, 28, 0.95)", borderRadius: "0.6rem", padding: "0.75rem 1rem", marginBottom: "0.75rem", border: "1px solid rgba(32, 237, 240, 0.2)" }}>
                      <div style={{ fontSize: "0.68rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Empresas encontradas</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginTop: "0.15rem" }}>
                        <span style={{ fontFamily: "var(--font-sora, 'Sora', sans-serif)", fontSize: "1.75rem", fontWeight: 800, color: "#20edf0" }}>
                          125.430
                        </span>
                        <span style={{ color: "#4ade80", fontSize: "0.78rem", fontWeight: 700 }}>+ 12% este mês</span>
                      </div>
                    </div>

                    {/* Table */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      {[
                        { name: "Metalúrgica Horizonte Ltda", segment: "Indústria", city: "São Paulo - SP", status: "Ativo" },
                        { name: "Plásticos do Brasil S/A", segment: "Indústria", city: "Guarulhos - SP", status: "Ativo" },
                        { name: "Tech Indústria e Comércio", segment: "Máquinas", city: "Jundiaí - SP", status: "Ativo" },
                        { name: "Inova Embalagens Ltda", segment: "Embalagens", city: "Osasco - SP", status: "Ativo" },
                      ].map((row) => (
                        <div key={row.name} style={{ display: "grid", gridTemplateColumns: "1.4fr 0.9fr 1fr auto", alignItems: "center", padding: "0.45rem 0.6rem", background: "rgba(8, 26, 44, 0.7)", borderRadius: "5px", fontSize: "0.72rem", color: "#cbd5e1" }}>
                          <span style={{ fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</span>
                          <span style={{ color: "#94a3b8" }}>{row.segment}</span>
                          <span style={{ color: "#64748b" }}>{row.city}</span>
                          <span style={{ color: "#20edf0", fontWeight: 700, fontSize: "0.68rem" }}>{row.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.floatingScriptNote} style={{ bottom: "-12px", right: "-10px" }}>
                  Dados que geram oportunidades reais.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 HORIZONTAL SOLUTION CARDS (1:1 COM O MOCKUP) */}
        <section className={styles.sectionBlock} data-testid="solucoes-grid">
          <div className={styles.containerWrap}>
            <div style={{ marginBottom: "3rem" }}>
              <span className={styles.eyebrowTag}>SOLUÇÕES COMPLETAS PARA PROSPECTAR MELHOR</span>
              <h2 className={styles.sectionHeadingH2}>
                Tudo o que você precisa para transformar dados em negócios.
              </h2>
            </div>

            <div className={styles.solutionsGrid4}>
              {solutionsList.map((item) => {
                const IconComp = item.icon;
                return (
                  <article key={item.id} className={styles.solutionCardMockup}>
                    <div className={styles.cardTopIcon}>
                      <IconComp size={24} aria-hidden="true" />
                    </div>
                    <h3 className={styles.solutionCardTitle}>{item.title}</h3>
                    <p className={styles.solutionCardDesc}>{item.description}</p>
                    <Link className={styles.linkCardDetails} href={item.href}>
                      Ver detalhes <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA (1:1 COM O MOCKUP) */}
        <section className={styles.sectionBlockAlt} data-testid="solucoes-steps">
          <div className={styles.containerWrap}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <span className={styles.eyebrowTag}>COMO FUNCIONA</span>
                <h2 className={styles.sectionHeadingH2}>
                  Do dado à oportunidade, em 3 passos.
                </h2>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem", maxWidth: 360, textAlign: "right" }}>
                Um processo simples, rápido e eficiente para você gerar mais negócios.
              </p>
            </div>

            <div className={styles.stepsConnectedRow}>
              {/* Passo 1 */}
              <div className={styles.stepBlock}>
                <div className={styles.stepIconBadge}>
                  <span className={styles.stepIndexNumber}>1</span>
                  <Database size={26} aria-hidden="true" />
                </div>
                <h3 className={styles.stepBlockTitle}>Acesse os dados</h3>
                <p className={styles.stepBlockDesc}>Explore nossa base de empresas atualizada e confiável.</p>
              </div>

              <div className={styles.stepArrowDivider}>
                <ChevronRight size={32} />
              </div>

              {/* Passo 2 */}
              <div className={styles.stepBlock}>
                <div className={styles.stepIconBadge}>
                  <span className={styles.stepIndexNumber}>2</span>
                  <Filter size={26} aria-hidden="true" />
                </div>
                <h3 className={styles.stepBlockTitle}>Segmente seu mercado</h3>
                <p className={styles.stepBlockDesc}>Aplique filtros e encontre o perfil ideal de empresas para o seu negócio.</p>
              </div>

              <div className={styles.stepArrowDivider}>
                <ChevronRight size={32} />
              </div>

              {/* Passo 3 */}
              <div className={styles.stepBlock}>
                <div className={styles.stepIconBadge}>
                  <span className={styles.stepIndexNumber}>3</span>
                  <Layers size={26} aria-hidden="true" />
                </div>
                <h3 className={styles.stepBlockTitle}>Ative oportunidades</h3>
                <p className={styles.stepBlockDesc}>Exporte, integre e leve os dados para o seu time de vendas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL SHARED CTA BANNER (1:1 COM O MOCKUP) */}
        <SharedCTA />
      </main>
    </div>
  );
}
