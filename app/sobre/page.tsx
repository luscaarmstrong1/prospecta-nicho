// cspell:ignore carlos rafael patricia
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Eye, Play, Shield, Target, TrendingUp } from "lucide-react";
import { assetPath } from "@/lib/asset-path";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { SharedCTA } from "@/components/shared-v2/SharedCTA";
import styles from "@/components/shared-v2/site-pages.module.css";

export const metadata: Metadata = {
  title: "Sobre | ProspectaNicho",
  description:
    "Dados que geram oportunidades reais para o seu negócio. A ProspectaNicho nasceu para tornar o mercado brasileiro mais acessível, conectado e cheio de oportunidades.",
};

const aboutMetrics = [
  { value: "5,8M", label: "registros no universo ilustrativo" },
  { value: "+ 600", label: "segmentos potencialmente mapeáveis" },
  { value: "5.570", label: "cidades cobertas" },
  { value: "Sob medida", label: "recortes definidos para cada operação" },
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

const operationalProfiles = [
  {
    name: "Operação comercial",
    role: "Perfil ilustrativo",
    quote: "Acreditamos em dados como ponte para grandes negócios.",
    avatar: "/preview-v2/assets/avatar-carlos.webp",
  },
  {
    name: "Inteligência de dados",
    role: "Perfil ilustrativo",
    quote: "Nosso foco é transformar informação em oportunidades reais.",
    avatar: "/preview-v2/assets/avatar-rafael.webp",
  },
  {
    name: "Sucesso do cliente",
    role: "Perfil ilustrativo",
    quote: "Mais empresas conectadas para um Brasil mais forte.",
    avatar: "/preview-v2/assets/avatar-patricia.webp",
  },
];

export default function SobrePage() {
  return (
    <div className={styles.pageWrapper}>
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
                  href={createWhatsAppLink(
                    "Olá, gostaria de conhecer melhor a ProspectaNicho.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play size={15} fill="#20edf0" color="#20edf0" /> Ver nosso vídeo
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

        {/* NOSSO TIME (1:1 COM O MOCKUP - 3 CARDS) */}
        <section className={styles.sectionBlock} data-testid="sobre-team">
          <div className={styles.containerWrap}>
            <div style={{ marginBottom: "2.5rem" }}>
              <span className={styles.eyebrowTag}>NOSSO TIME</span>
              <h2 className={styles.sectionHeadingH2}>
                Pessoas que acreditam em um mercado com mais oportunidades.
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                Representação visual das frentes que sustentam a operação. Os perfis e as imagens são ilustrativos.
              </p>
            </div>

            <div className={styles.teamCardsGrid3}>
              {operationalProfiles.map((member) => (
                <div key={member.name} className={styles.teamMemberCard}>
                  <div className={styles.teamMemberAvatar}>
                    <Image
                      src={assetPath(member.avatar)}
                      alt=""
                      fill
                      sizes="72px"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  </div>
                  <div className={styles.teamMemberInfo}>
                    <h4>{member.name}</h4>
                    <small>{member.role}</small>
                    <p>“{member.quote}”</p>
                  </div>
                </div>
              ))}
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
