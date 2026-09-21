import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Database, Filter, LayoutGrid, Zap } from "lucide-react";
import { solucoesData } from "@/lib/site-v2/content";
import { SharedCTA } from "@/components/shared-v2/SharedCTA";
import styles from "@/components/shared-v2/site-pages.module.css";

export const metadata: Metadata = {
  title: "Soluções | ProspectaNicho",
  description:
    "Bases B2B completas, recortes personalizados por CNAE e região, e exportação facilitada para CRM e ferramentas comerciais.",
};

const iconMap = {
  database: Database,
  filter: Filter,
  crm: LayoutGrid,
  webhook: Zap,
};

export default function SolucoesPage() {
  const { hero, solutions, howItWorks } = solucoesData;

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* HERO SECTION */}
        <section className={styles.pageHero} data-testid="solucoes-hero">
          <span className={styles.heroTag}>{hero.tag}</span>
          <h1 className={styles.heroTitle}>
            Encontre, segmente e ative <span>oportunidades B2B</span> com mais resultado
          </h1>
          <p className={styles.heroSubtitle}>{hero.subtitle}</p>
          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} href={hero.ctaPrimary.href}>
              {hero.ctaPrimary.label} <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a
              className={styles.btnSecondary}
              href={hero.ctaSecondary.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {hero.ctaSecondary.label}
            </a>
          </div>
        </section>

        {/* SOLUTIONS GRID */}
        <section className={styles.section} id="bases-b2b" data-testid="solucoes-grid">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Nossas Ferramentas</span>
              <h2 className={styles.sectionTitle}>Estrutura completa para sua equipe comercial</h2>
              <p className={styles.sectionSubtitle}>
                Dados precisos, filtros cirúrgicos e compatibilidade total com o seu funil de vendas.
              </p>
            </div>

            <div className={styles.grid2}>
              {solutions.map((item) => {
                const IconComponent = iconMap[item.icon] || Database;
                return (
                  <article key={item.id} id={item.id} className={styles.glassCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span className={styles.cardBadge}>{item.badge}</span>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: "rgba(32, 237, 240, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#20edf0",
                        }}
                      >
                        <IconComponent size={22} aria-hidden="true" />
                      </div>
                    </div>

                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardDesc}>{item.description}</p>

                    <ul className={styles.featureList}>
                      {item.points.map((pt) => (
                        <li key={pt}>
                          <Check size={16} aria-hidden="true" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>

                    <div style={{ marginTop: "auto" }}>
                      <Link className={styles.btnOutline} href={item.ctaHref}>
                        {item.ctaText} <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className={styles.section} style={{ background: "rgba(0, 18, 31, 0.4)" }} data-testid="solucoes-steps">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>{howItWorks.tag}</span>
              <h2 className={styles.sectionTitle}>{howItWorks.title}</h2>
              <p className={styles.sectionSubtitle}>{howItWorks.subtitle}</p>
            </div>

            <div className={styles.grid3}>
              {howItWorks.steps.map((step) => (
                <div key={step.number} className={styles.stepCard}>
                  <div className={styles.stepNumber}>{step.number}</div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL SHARED CTA */}
        <SharedCTA />
      </main>
    </div>
  );
}
