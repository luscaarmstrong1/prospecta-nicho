import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Target, TrendingUp } from "lucide-react";
import { assetPath } from "@/lib/asset-path";
import { JsonLd } from "@/components/seo/JsonLd";
import { SharedCTA } from "@/components/shared-v2/SharedCTA";
import { breadcrumbJsonLd, createMetadata } from "@/lib/seo";
import { createWhatsAppLink } from "@/lib/whatsapp";
import styles from "@/components/shared-v2/site-pages.module.css";

const description = "Conheça a Prospecta Nicho e sua proposta de unir inteligência comercial, presença digital e automação para apoiar empresas B2B.";
export const metadata: Metadata = createMetadata({ title: "Sobre a Prospecta Nicho", description, path: "/sobre" });

const aboutMetrics = [
  { value: "Dados", label: "recortes comerciais com contexto" },
  { value: "Presença", label: "sites e páginas para comunicar valor" },
  { value: "Automação", label: "processos conectados à operação" },
  { value: "Crescimento", label: "decisões apoiadas por informação" },
];

const valuesList = [
  {
    id: "missao",
    icon: Target,
    title: "Missão",
    description: "Democratizar o acesso a dados confiáveis e inteligentes, ajudando empresas a encontrar, se conectar e crescer com mais oportunidades.",
  },
  {
    id: "visao",
    icon: Eye,
    title: "Visão",
    description: "Ser a principal plataforma de inteligência de mercado B2B da América Latina, reconhecida por gerar resultados reais para empresas de todos os portes.",
  },
  {
    id: "posicionamento",
    icon: TrendingUp,
    title: "Posicionamento",
    description: "Mais que uma base de dados, somos um parceiro estratégico no crescimento do seu negócio, unindo tecnologia, simplicidade e um profundo conhecimento do mercado brasileiro.",
  },
];

export default function SobrePage() {
  return (
    <div className={styles.pageWrapper}>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Sobre", path: "/sobre" }])} />
      <main className={styles.mainContent}>
        {/* HERO (1:1 COM MOCKUP 05) */}
        <section className={styles.heroSplitSection} data-testid="sobre-hero">
          <div className={styles.heroSplitInner}>
            <div className={styles.heroTextCol}>
              <span className={styles.eyebrowTag}>SOBRE A PROSPECTANICHO</span>
              <h1 className={styles.heroMainTitle}>
                Dados que geram <span className={styles.cyanHighlight}>oportunidades reais</span> para o seu negócio.
              </h1>
              <p className={styles.heroLeadText}>
                A ProspectaNicho nasceu para tornar o mercado brasileiro mais acessível, conectado e cheio de oportunidades. Unimos tecnologia, dados e inteligência de mercado para ajudar empresas a encontrarem os melhores clientes e crescerem com mais previsibilidade.
              </p>
              <div className={styles.heroBtnGroup}>
                <Link className={styles.btnPrimarySolid} href="/solucoes">
                  Conheça nossas soluções <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a
                  className={styles.btnGhostOutline}
                  href={createWhatsAppLink("Olá, gostaria de conhecer melhor a Prospecta Nicho.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar com um especialista
                </a>
              </div>
            </div>

            {/* HERO SPECIALIST WITH PROSPECTANICHO POLO (1:1 COM O MOCKUP) */}
            <div className={styles.heroVisualCol}>
              <div style={{ position: "relative", width: "100%", maxWidth: 460, height: 320, borderRadius: "1.25rem", overflow: "hidden", border: "1px solid rgba(32, 237, 240, 0.25)" }}>
                <Image
                  src={assetPath("/preview-v2/assets/city-rio-hero.png")}
                  alt="Especialista ProspectaNicho analisando malha de conexões do Brasil"
                  fill
                  sizes="460px"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0, 12, 23, 0.85) 0%, rgba(0, 12, 23, 0.2) 60%, transparent 100%)" }} />
                <div style={{ position: "absolute", top: "1.2rem", right: "1.2rem", background: "rgba(6, 22, 38, 0.85)", border: "1px solid rgba(32, 237, 240, 0.3)", borderRadius: "8px", padding: "0.5rem 0.8rem", fontSize: "0.7rem", color: "#fff", lineHeight: 1.3 }}>
                  <strong>INTELIGÊNCIA DE MERCADO</strong><br />PARA UM BRASIL MAIS FORTE.
                </div>
              </div>
              <div className={styles.floatingScriptNote} style={{ bottom: "-15px", right: "10px" }}>
                Mais oportunidades para empresas reais.
              </div>
            </div>
          </div>
        </section>

        {/* 4 METRICS BAR (1:1 COM O MOCKUP) */}
        <section className={styles.sectionBlock} data-testid="sobre-metrics">
          <div className={styles.containerWrap}>
            <div style={{ marginBottom: "2rem", textAlign: "center" }}>
              <span className={styles.eyebrowTag}>NÚMEROS QUE REFLETEM O NOSSO PROPÓSITO</span>
            </div>

            <div className={styles.aboutMetricsBar4}>
              {aboutMetrics.map((m) => (
                <div key={m.label} className={styles.aboutMetricItem}>
                  <div className={styles.aboutMetricNumber}>{m.value}</div>
                  <div className={styles.aboutMetricLabel}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NOSSOS VALORES (1:1 COM O MOCKUP - 3 CARDS) */}
        <section className={styles.sectionBlockAlt} data-testid="sobre-values">
          <div className={styles.containerWrap}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <span className={styles.eyebrowTag}>NOSSOS VALORES</span>
                <h2 className={styles.sectionHeadingH2}>O que nos move todos os dias.</h2>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem", maxWidth: 360, textAlign: "right" }}>
                Acreditamos no poder dos dados para transformar negócios e impulsionar o desenvolvimento do Brasil.
              </p>
            </div>

            <div className={styles.valuesGrid3}>
              {valuesList.map((val) => {
                const IconComp = val.icon;
                return (
                  <article key={val.id} className={styles.valueCardItem}>
                    <div className={styles.cardTopIcon}>
                      <IconComp size={24} />
                    </div>
                    <h3 className={styles.solutionCardTitle}>{val.title}</h3>
                    <p className={styles.solutionCardDesc}>{val.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL SHARED CTA BANNER (1:1 COM O MOCKUP) */}
        <SharedCTA
          titlePrimary="O Brasil é cheio de"
          titleSecondary="oportunidades."
          titleTertiary="Vamos construir mais resultados juntos?"
          asideHeadline="Falar com um especialista é o primeiro passo para descobrir todo o potencial do seu mercado."
          secondaryCtaLabel="Começar agora"
        />
      </main>
    </div>
  );
}
