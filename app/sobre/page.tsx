import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Database,
  Eye,
  Globe2,
  Headphones,
  Monitor,
  Network,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { assetPath } from "@/lib/asset-path";
import { JsonLd } from "@/components/seo/JsonLd";
import { SharedCTA } from "@/components/shared-v2/SharedCTA";
import { breadcrumbJsonLd, createMetadata } from "@/lib/seo";
import { createWhatsAppLink } from "@/lib/whatsapp";
import styles from "@/components/shared-v2/site-pages.module.css";

const description =
  "Conheça a Prospecta Nicho e como unimos dados, presença digital e automação para criar oportunidades e ajudar empresas a crescer.";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Sobre a Prospecta Nicho | Dados, Presença e Automação",
    description,
    path: "/sobre",
  }),
  alternates: {
    canonical: "https://prospectanicho.app/sobre/",
  },
};

const heroMicroBenefits = [
  {
    icon: Database,
    title: "Dados confiáveis e atualizados",
  },
  {
    icon: BarChart3,
    title: "Mais oportunidades de negócio",
  },
  {
    icon: Headphones,
    title: "Atendimento especializado",
  },
  {
    icon: Sparkles,
    title: "Resultados reais e mensuráveis",
  },
];

const pillarsList = [
  {
    id: "dados",
    icon: Database,
    title: "Dados",
    description:
      "Acesso a dados de mercado confiáveis e inteligentes para encontrar as melhores oportunidades.",
  },
  {
    id: "presenca",
    icon: Monitor,
    title: "Presença",
    description:
      "Sites e landing pages que comunicam valor, atraem mais clientes e fortalecem sua marca no digital.",
  },
  {
    id: "automacao",
    icon: Settings,
    title: "Automação",
    description:
      "Processos conectados que tornam sua operação mais eficiente e geram resultados em escala.",
  },
  {
    id: "crescimento",
    icon: TrendingUp,
    title: "Crescimento",
    description:
      "Estratégias orientadas por dados para aumentar suas vendas e expandir sua atuação no mercado.",
  },
];

const valuesList = [
  {
    id: "missao",
    icon: Target,
    title: "Missão",
    description:
      "Democratizar o acesso a dados confiáveis e inteligentes, ajudando empresas a encontrar, se conectar e crescer com mais oportunidades.",
  },
  {
    id: "visao",
    icon: Eye,
    title: "Visão",
    description:
      "Ser uma referência em inteligência de mercado B2B no Brasil, reconhecida por gerar resultados reais para empresas de todos os portes.",
  },
  {
    id: "posicionamento",
    icon: TrendingUp,
    title: "Posicionamento",
    description:
      "Mais que uma base de dados, somos um parceiro estratégico no crescimento do seu negócio, unindo tecnologia, simplicidade e um profundo conhecimento do mercado brasileiro.",
  },
];

export default function SobrePage() {
  const whatsappSpecialistUrl = createWhatsAppLink(
    "Olá! Gostaria de falar com um especialista sobre as soluções da Prospecta Nicho."
  );

  return (
    <div className={styles.pageWrapper}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Sobre", path: "/sobre" },
        ])}
      />
      <main className={styles.mainContent}>
        {/* ==================================================================
            1. HERO DOBRA 1 - PANORÂMICO COM MOCKUP REALISTA DO DASHBOARD SAAS
            ================================================================== */}
        <section className={styles.aboutHeroSection} data-testid="sobre-hero">
          {/* Background do escritório corporativo noturno fornecido */}
          <div className={styles.aboutHeroBg} aria-hidden="true">
            <Image
              src={assetPath("/assets/sobre/hero-sobre-office.webp")}
              alt="Escritório corporativo premium noturno com vista urbana"
              fill
              priority
              sizes="100vw"
            />
          </div>

          {/* Overlays finos de profundidade */}
          <div className={styles.aboutHeroOverlayH} aria-hidden="true" />
          <div className={styles.aboutHeroOverlayV} aria-hidden="true" />
          <div className={styles.aboutHeroGlow} aria-hidden="true" />

          <div className={styles.aboutHeroInner}>
            {/* Coluna de Texto à Esquerda */}
            <div className={styles.aboutHeroTextCol}>
              <span className={styles.eyebrowTag}>SOBRE A PROSPECTA NICHO</span>
              <h1 className={styles.heroMainTitle}>
                Dados, presença, automação e crescimento para{" "}
                <span className={styles.cyanHighlight}>
                  gerar oportunidades reais para o seu negócio.
                </span>
              </h1>
              <p className={styles.heroLeadText}>
                A Prospecta Nicho conecta empresas ao crescimento por meio de
                dados de mercado, presença digital, automação de processos e
                inteligência estratégica, ajudando negócios em todo o Brasil a
                encontrarem mais clientes e gerarem mais resultados.
              </p>

              <div className={styles.heroBtnGroup}>
                <Link className={styles.btnPrimarySolid} href="/solucoes">
                  Conheça nossas soluções <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a
                  className={styles.btnGhostOutline}
                  href={whatsappSpecialistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar com um especialista
                </a>
              </div>

              {/* 4 Benefícios Lineares no Hero */}
              <div className={styles.heroBenefitsRow} data-testid="sobre-hero-benefits">
                {heroMicroBenefits.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className={styles.heroBenefitItem}>
                      <Icon size={16} aria-hidden="true" />
                      <span className={styles.heroBenefitText}>{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coluna da Direita - Mockup Realista de Dashboard SaaS B2B */}
            <div className={styles.aboutDashboardMockupWrap} data-testid="sobre-dashboard">
              <div className={styles.aboutDashboardCleanImage}>
                <Image
                  src={assetPath("/preview-v2/assets/about-hero-laptop-clean.png")}
                  alt="Interface SaaS B2B da Prospecta Nicho demonstrando visão geral de empresas, oportunidades e crescimento"
                  fill
                  sizes="(max-width: 1024px) 100vw, 580px"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            2. SEÇÃO QUATRO PILARES (4 CARDS)
            ================================================================== */}
        <section className={styles.sectionBlock} data-testid="sobre-pilares">
          <div className={styles.containerWrap}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <span className={styles.eyebrowTag}>NOSSOS PILARES</span>
                <h2 className={styles.sectionHeadingH2}>
                  Quatro pilares que impulsionam <br />
                  negócios <span className={styles.cyanHighlight}>em todo o Brasil.</span>
                </h2>
              </div>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.95rem",
                  maxWidth: 420,
                  textAlign: "right",
                  lineHeight: 1.6,
                }}
              >
                Unimos dados, tecnologia e inteligência de mercado para criar as
                condições ideais para que sua empresa encontre mais clientes, cresça
                com previsibilidade e conquiste resultados consistentes.
              </p>
            </div>

            <div className={styles.pillarsGrid4}>
              {pillarsList.map((pillar) => {
                const IconComp = pillar.icon;
                return (
                  <article key={pillar.id} className={styles.pillarCard}>
                    <div className={styles.cardTopIcon}>
                      <IconComp size={24} aria-hidden="true" />
                    </div>
                    <h3 className={styles.solutionCardTitle}>{pillar.title}</h3>
                    <p className={styles.solutionCardDesc}>{pillar.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================================================================
            3. SEÇÃO NOSSOS VALORES (3 CARDS GRANDES)
            ================================================================== */}
        <section className={styles.sectionBlockAlt} data-testid="sobre-valores">
          <div className={styles.containerWrap}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <span className={styles.eyebrowTag}>NOSSOS VALORES</span>
                <h2 className={styles.sectionHeadingH2}>O que nos move todos os dias.</h2>
              </div>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.95rem",
                  maxWidth: 380,
                  textAlign: "right",
                  lineHeight: 1.6,
                }}
              >
                Acreditamos no poder dos dados para transformar negócios e
                impulsionar o desenvolvimento do Brasil.
              </p>
            </div>

            <div className={styles.valuesGrid3Custom}>
              {valuesList.map((val, idx) => {
                const IconComp = val.icon;
                const formattedNum = String(idx + 1).padStart(2, "0");
                return (
                  <article key={val.id} className={styles.valueCardCustom}>
                    <span className={styles.valueCardNumber} aria-hidden="true">{formattedNum}</span>
                    <div className={styles.cardTopIcon}>
                      <IconComp size={24} aria-hidden="true" />
                    </div>
                    <h3 className={styles.solutionCardTitle}>{val.title}</h3>
                    <p className={styles.solutionCardDesc}>{val.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================================================================
            4. SEÇÃO POR QUE EXISTIMOS (COMPOSIÇÃO VISUAL SOFISTICADA)
            ================================================================== */}
        <section className={styles.sectionBlock} data-testid="sobre-proposito">
          <div className={styles.containerWrap}>
            <div className={styles.purposeGrid3Cols}>
              {/* Esquerda: Texto Institucional */}
              <div className={styles.purposeLeftCol}>
                <span className={styles.eyebrowTag}>POR QUE EXISTIMOS</span>
                <h2 className={styles.sectionHeadingH2}>
                  Mais oportunidades <br />
                  para um <span className={styles.cyanHighlight}>Brasil que produz.</span>
                </h2>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.95rem",
                    lineHeight: 1.65,
                    marginTop: "1.25rem",
                    marginBottom: "1rem",
                  }}
                >
                  O Brasil é um país de empreendedores, indústrias, comércios e
                  serviços que movimentam a nossa economia todos os dias.
                </p>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.95rem",
                    lineHeight: 1.65,
                    marginBottom: "2rem",
                  }}
                >
                  Existimos para aproximar essas empresas de novas oportunidades,
                  usando dados, tecnologia e inteligência que geram resultados reais.
                </p>
                <Link className={styles.linkViewAll} href="/solucoes">
                  Conheça nossa história <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>

              {/* Centro: Composição Visual com Cidade e Janela Corporativa */}
              <div className={styles.purposeCenterVisual}>
                <Image
                  src={assetPath("/assets/sobre/brasil-empresarial.webp")}
                  alt="Visualização corporativa com skyline urbano e janelas executivas"
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  style={{ objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(2, 15, 28, 0.15) 0%, rgba(2, 15, 28, 0.75) 100%)",
                  }}
                />
              </div>

              {/* Direita: 3 Benefícios de Mercado */}
              <div className={styles.purposeRightBenefits}>
                <div className={styles.purposeBenefitBlock}>
                  <div className={styles.purposeBenefitIconWrap}>
                    <Network size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={styles.purposeBenefitTitle}>
                      Conectamos empresas a novas oportunidades
                    </h3>
                    <p className={styles.purposeBenefitDesc}>
                      Ajudamos negócios a encontrarem clientes reais em todo o Brasil.
                    </p>
                  </div>
                </div>

                <div className={styles.purposeDivider} />

                <div className={styles.purposeBenefitBlock}>
                  <div className={styles.purposeBenefitIconWrap}>
                    <Globe2 size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={styles.purposeBenefitTitle}>
                      Fortalecemos o mercado brasileiro
                    </h3>
                    <p className={styles.purposeBenefitDesc}>
                      Impulsionamos empresas que geram empregos e desenvolvimento em
                      todas as regiões.
                    </p>
                  </div>
                </div>

                <div className={styles.purposeDivider} />

                <div className={styles.purposeBenefitBlock}>
                  <div className={styles.purposeBenefitIconWrap}>
                    <TrendingUp size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={styles.purposeBenefitTitle}>
                      Acreditamos em um futuro com mais negócios
                    </h3>
                    <p className={styles.purposeBenefitDesc}>
                      Usamos a tecnologia para tornar o mercado mais acessível,
                      competitivo e cheio de possibilidades.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            5. CTA FINAL (REUTILIZAÇÃO DO COMPONENTE OFICIAL DO SITE)
            ================================================================== */}
        <SharedCTA
          titlePrimary="O Brasil é cheio de"
          titleSecondary="oportunidades."
          titleTertiary="Vamos construir mais resultados juntos?"
          asideHeadline="Falar com um especialista é o primeiro passo para descobrir todo o potencial do seu mercado."
          primaryCtaLabel="Falar com um especialista"
          primaryCtaHref={whatsappSpecialistUrl}
          secondaryCtaLabel="Começar agora"
          secondaryCtaHref="/solicitar-planilha?source=sobre-cta"
          badgeText1="Sem cartão de crédito"
          badgeText2="Amostra gratuita"
          badgeText3="Ativação rápida"
        />
      </main>
    </div>
  );
}
