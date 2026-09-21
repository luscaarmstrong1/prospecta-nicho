import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Shield, Target } from "lucide-react";
import { assetPath } from "@/lib/asset-path";
import { sobreData } from "@/lib/site-v2/content";
import { SharedCTA } from "@/components/shared-v2/SharedCTA";
import styles from "@/components/shared-v2/site-pages.module.css";

export const metadata: Metadata = {
  title: "Sobre Nós | ProspectaNicho",
  description:
    "Conheça a história, os valores e a equipe por trás da ProspectaNicho, inteligência de dados B2B para o mercado brasileiro.",
};

const valueIcons = {
  missao: Target,
  visao: Compass,
  posicionamento: Shield,
};

export default function SobrePage() {
  const { hero, metrics, values, teamSection } = sobreData;

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* HERO SECTION */}
        <section className={styles.pageHero} data-testid="sobre-hero">
          <span className={styles.heroTag}>{hero.tag}</span>
          <h1 className={styles.heroTitle}>
            Dados que geram <span>oportunidades reais</span> para o seu negócio crescer
          </h1>
          <p className={styles.heroSubtitle}>{hero.subtitle}</p>

          {/* METRICS BANNER */}
          <div className={styles.metricsGrid}>
            {metrics.map((m) => (
              <div key={m.label}>
                <div className={styles.metricValue}>{m.value}</div>
                <div className={styles.metricLabel}>{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* MISSION, VISION, VALUES */}
        <section className={styles.section} data-testid="sobre-values">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Nossos Pilares</span>
              <h2 className={styles.sectionTitle}>Como construímos relacionamentos sólidos</h2>
              <p className={styles.sectionSubtitle}>
                Transparência de dados, rigor técnico e compromisso com o resultado de vendas dos nossos clientes.
              </p>
            </div>

            <div className={styles.grid3}>
              {values.map((v) => {
                const IconComponent = valueIcons[v.id as keyof typeof valueIcons] || Shield;
                return (
                  <article key={v.id} className={styles.glassCard}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: "rgba(32, 237, 240, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#20edf0",
                        marginBottom: "1.25rem",
                      }}
                    >
                      <IconComponent size={24} aria-hidden="true" />
                    </div>

                    <span className={styles.cardBadge}>{v.tag}</span>
                    <h3 className={styles.cardTitle}>{v.title}</h3>
                    <p className={styles.cardDesc}>{v.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* TEAM & INFRASTRUCTURE SECTION */}
        <section className={styles.section} style={{ background: "rgba(0, 18, 31, 0.4)" }} data-testid="sobre-team">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>{teamSection.tag}</span>
              <h2 className={styles.sectionTitle}>{teamSection.title}</h2>
              <p className={styles.sectionSubtitle}>{teamSection.subtitle}</p>
            </div>

            <div
              style={{
                position: "relative",
                maxWidth: 1040,
                margin: "0 auto",
                borderRadius: "1.5rem",
                overflow: "hidden",
                border: "1px solid rgba(32, 237, 240, 0.2)",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
              }}
            >
              <div style={{ position: "relative", width: "100%", height: "460px" }}>
                <Image
                  src={assetPath(teamSection.image)}
                  alt="Equipe ProspectaNicho"
                  fill
                  sizes="(max-width: 1024px) 100vw, 1040px"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0, 18, 31, 0.85) 0%, rgba(0, 18, 31, 0.2) 60%, transparent 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "2rem",
                    left: "2rem",
                    right: "2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <span style={{ color: "#cbd5e1", fontSize: "0.95rem" }}>{teamSection.caption}</span>
                  <Link className={styles.btnPrimary} href="/contato">
                    Fale com nosso time <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL SHARED CTA */}
        <SharedCTA />
      </main>
    </div>
  );
}
