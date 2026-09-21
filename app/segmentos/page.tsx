// cspell:ignore datacenter timeframe
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calculator, ChevronDown, Cpu, Factory, Heart, Megaphone, Play, Search, Sun, Zap } from "lucide-react";
import { assetPath } from "@/lib/asset-path";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { SharedCTA } from "@/components/shared-v2/SharedCTA";
import styles from "@/components/shared-v2/site-pages.module.css";

export const metadata: Metadata = {
  title: "Segmentos | ProspectaNicho",
  description:
    "Encontre oportunidades nos setores que mais movem o Brasil. Explore dados atualizados por segmento e descubra empresas prontas para prospecção.",
};

const segmentHeroPills = [
  { icon: Megaphone, title: "Agências", count: "+ 320 mil empresas" },
  { icon: Sun, title: "Energia Solar", count: "+ 28 mil empresas" },
  { icon: Calculator, title: "Contabilidades", count: "+ 518 mil empresas" },
  { icon: Factory, title: "Indústria", count: "+ 376 mil empresas" },
  { icon: Cpu, title: "Tecnologia", count: "+ 267 mil empresas" },
  { icon: Heart, title: "Saúde", count: "+ 315 mil empresas" },
];

const segmentCardsList = [
  {
    id: "agencias",
    icon: Megaphone,
    title: "Agências",
    description: "Marketing, publicidade e comunicação digital.",
    image: "/preview-v2/assets/segment-agencias.webp",
    href: "/solicitar-planilha?segmento=agencias",
  },
  {
    id: "contabilidades",
    icon: Calculator,
    title: "Contabilidades",
    description: "Escritórios contábeis e serviços financeiros.",
    image: "/preview-v2/assets/finance-accounting.png",
    href: "/solicitar-planilha?segmento=contabilidades",
  },
  {
    id: "energia-solar",
    icon: Sun,
    title: "Energia Solar",
    description: "Empresas de energia solar e soluções sustentáveis.",
    image: "/preview-v2/assets/solar-energy.png",
    href: "/solicitar-planilha?segmento=energia-solar",
  },
  {
    id: "industria",
    icon: Factory,
    title: "Indústria",
    description: "Indústrias, equipamentos e setor manufatureiro.",
    image: "/preview-v2/assets/industry-factory.png",
    href: "/solicitar-planilha?segmento=industria",
  },
  {
    id: "tecnologia",
    icon: Cpu,
    title: "Tecnologia",
    description: "Software, TI e soluções tecnológicas.",
    image: "/preview-v2/assets/server-datacenter.png",
    href: "/solicitar-planilha?segmento=tecnologia",
  },
  {
    id: "saude",
    icon: Heart,
    title: "Saúde",
    description: "Clínicas, hospitais e serviços de saúde.",
    image: "/preview-v2/assets/healthcare-hospital.png",
    href: "/solicitar-planilha?segmento=saude",
  },
];

const growthMarkets = [
  {
    icon: Sun,
    title: "Energia Solar",
    percentage: "+ 42%",
    timeframe: "no último ano",
    image: "/preview-v2/assets/solar-energy.png",
  },
  {
    icon: Cpu,
    title: "Tecnologia",
    percentage: "+ 37%",
    timeframe: "no último ano",
    image: "/preview-v2/assets/server-datacenter.png",
  },
  {
    icon: Heart,
    title: "Saúde",
    percentage: "+ 28%",
    timeframe: "no último ano",
    image: "/preview-v2/assets/healthcare-hospital.png",
  },
];

export default function SegmentosPage() {
  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* HERO (1:1 COM MOCKUP 02) */}
        <section className={styles.heroSplitSection} data-testid="segmentos-hero">
          <div className={styles.heroSplitInner}>
            <div className={styles.heroTextCol}>
              <span className={styles.eyebrowTag}>SEGMENTOS DE MERCADO</span>
              <h1 className={styles.heroMainTitle}>
                Encontre oportunidades nos setores que mais movem <span className={styles.cyanHighlight}>o Brasil.</span>
              </h1>
              <p className={styles.heroLeadText}>
                Explore dados atualizados por segmento e descubra empresas prontas para prospecção. Escolha o setor ideal, filtre sua região e encontre novos clientes com mais rapidez e assertividade.
              </p>
              <div className={styles.heroBtnGroup}>
                <Link className={styles.btnPrimarySolid} href="#explore-segmentos">
                  Explorar segmentos <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a
                  className={styles.btnGhostOutline}
                  href={createWhatsAppLink(
                    "Olá, gostaria de saber mais sobre os segmentos da ProspectaNicho.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play size={15} fill="#20edf0" color="#20edf0" /> Ver como funciona
                </a>
              </div>
            </div>

            {/* FLOATING SECTOR PILLS GRID (1:1 COM O MOCKUP) */}
            <div className={styles.heroVisualCol}>
              <div className={styles.segmentHeroFloatingGrid}>
                {segmentHeroPills.map((pill) => {
                  const IconComp = pill.icon;
                  return (
                    <div key={pill.title} className={styles.segmentHeroPill}>
                      <div className={styles.segmentHeroPillIcon}>
                        <IconComp size={20} />
                      </div>
                      <div className={styles.segmentHeroPillText}>
                        <h4>{pill.title}</h4>
                        <span>{pill.count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className={styles.floatingScriptNote} style={{ bottom: "-20px", right: "20px" }}>
                Setores reais. Oportunidades reais.
              </div>
            </div>
          </div>
        </section>

        {/* EXPLORE NOSSOS SEGMENTOS (1:1 COM O MOCKUP) */}
        <section className={styles.sectionBlock} id="explore-segmentos" data-testid="segmentos-grid">
          <div className={styles.containerWrap}>
            <div style={{ marginBottom: "2rem" }}>
              <span className={styles.eyebrowTag}>ESCOLHA UM SEGMENTO</span>
              <h2 className={styles.sectionHeadingH2}>Explore nossos segmentos</h2>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                Encontre o setor ideal para o seu negócio e descubra milhares de empresas com dados atualizados.
              </p>
            </div>

            {/* SEARCH & FILTER CLUSTER */}
            <div className={styles.segmentSearchFilterCluster}>
              <div className={styles.searchBoxWide}>
                <Search size={18} color="#20edf0" />
                <input
                  type="text"
                  placeholder="Buscar segmento (ex.: contabilidade, saúde, indústria...)"
                  aria-label="Buscar segmento"
                />
              </div>

              <div className={styles.filterSelectBtn}>
                <span>Todas as regiões</span>
                <ChevronDown size={16} />
              </div>

              <div className={styles.filterSelectBtn}>
                <span>Ordenar por relevância</span>
                <ChevronDown size={16} />
              </div>
            </div>

            {/* 6 SEGMENT PHOTO CARDS (2 LINHAS X 3 COLUNAS) */}
            <div className={styles.segmentPhotosGrid}>
              {segmentCardsList.map((card) => {
                const IconComp = card.icon;
                return (
                  <article key={card.id} className={styles.segmentPhotoCard}>
                    <div className={styles.segmentPhotoThumb}>
                      <Image
                        src={assetPath(card.image)}
                        alt={card.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    </div>
                    <div className={styles.segmentPhotoContent}>
                      <div className={styles.segmentCardIconRow}>
                        <IconComp size={18} />
                        <h3 className={styles.segmentCardHeading}>{card.title}</h3>
                      </div>
                      <p className={styles.segmentCardParagraph}>{card.description}</p>
                      <Link className={styles.linkCardDetails} href={card.href}>
                        Ver empresas <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* MERCADOS EM CRESCIMENTO (1:1 COM O MOCKUP) */}
        <section className={styles.sectionBlockAlt} data-testid="segmentos-growth">
          <div className={styles.containerWrap}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <span className={styles.eyebrowTag}>SEGMENTOS EM DESTAQUE</span>
                <h2 className={styles.sectionHeadingH2}>Mercados em crescimento</h2>
                <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                  Setores com maior potencial de oportunidades no momento.
                </p>
              </div>
              <Link className={styles.linkViewAll} href="/segmentos">
                Ver todos os segmentos <ArrowRight size={14} />
              </Link>
            </div>

            <div className={styles.growthMarketsRow3}>
              {growthMarkets.map((m) => {
                const IconComp = m.icon;
                return (
                  <div key={m.title} className={styles.growthMarketCard}>
                    <div className={styles.growthMarketThumb}>
                      <Image
                        src={assetPath(m.image)}
                        alt={m.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    </div>
                    <div className={styles.growthMarketBody}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#20edf0" }}>
                        <IconComp size={16} />
                        <h3 className={styles.growthMarketTitle}>{m.title}</h3>
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Crescimento de</span>
                      <div className={styles.growthPercentage}>{m.percentage}</div>
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{m.timeframe}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL SHARED CTA BANNER (1:1 COM O MOCKUP) */}
        <SharedCTA
          asideHeadline="Comece agora e encontre novos clientes no seu setor."
          secondaryCtaLabel="Criar minha conta"
        />
      </main>
    </div>
  );
}
