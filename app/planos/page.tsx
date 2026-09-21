"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calculator, Check, ChevronDown, Layers, Megaphone, Play, Rocket, Settings, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { assetPath } from "@/lib/asset-path";
import { getCatalogProduct } from "@/lib/products";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { SharedCTA } from "@/components/shared-v2/SharedCTA";
import styles from "@/components/shared-v2/site-pages.module.css";

const plansList = [
  {
    id: "recem-abertas",
    icon: Rocket,
    title: "Empresas recém-abertas",
    description: "Seja o primeiro a chegar. Empresas recentes e com alto potencial para o seu negócio.",
    startingFrom: "A partir de",
    price: getCatalogProduct("empresas-recem-abertas")?.price ?? "R$ 147,00",
    period: "por lista",
    ctaText: "Ver detalhes",
    ctaHref: "/solicitar-planilha?plano=recem-abertas",
    popular: false,
  },
  {
    id: "agencias",
    icon: Megaphone,
    title: "Base para agências",
    description: "Agências, estúdios, produtoras e empresas de marketing digital.",
    startingFrom: "A partir de",
    price: getCatalogProduct("agencias-marketing")?.price ?? "R$ 197,00",
    period: "por lista",
    ctaText: "Ver detalhes",
    ctaHref: "/solicitar-planilha?plano=agencias",
    popular: true,
  },
  {
    id: "contabilidades",
    icon: Calculator,
    title: "Contabilidades",
    description: "Escritórios contábeis e empresas de serviços financeiros.",
    startingFrom: "A partir de",
    price: getCatalogProduct("contabilidades")?.price ?? "R$ 197,00",
    period: "por lista",
    ctaText: "Ver detalhes",
    ctaHref: "/solicitar-planilha?plano=contabilidades",
    popular: false,
  },
  {
    id: "personalizada",
    icon: Settings,
    title: "Base personalizada",
    description: "Fale com nosso time e monte uma base sob medida para o seu nicho.",
    startingFrom: "A partir de",
    price: getCatalogProduct("base-personalizada")?.price ?? "A partir de R$ 497,00",
    period: "De acordo com o seu segmento.",
    ctaText: "Falar com um especialista",
    ctaHref: createWhatsAppLink(
      "Olá, gostaria de montar uma base personalizada na ProspectaNicho.",
    ),
    popular: false,
    custom: true,
  },
];

const includedBenefits = [
  { icon: ShieldCheck, title: "Dados confiáveis e atualizados" },
  { icon: Zap, title: "Segmentação por região e setor" },
  { icon: Megaphone, title: "Suporte especializado do nosso time" },
  { icon: Layers, title: "Exportação simples e rápida" },
];

const faqsList = [
  {
    question: "Posso testar antes de contratar?",
    answer: "Sim! Disponibilizamos amostras gratuitas para você validar a qualidade, o formato e a estrutura dos nossos dados antes de qualquer contratação.",
  },
  {
    question: "Os dados são realmente atualizados?",
    answer: "Sim. Nossas bases passam por processos contínuos de enriquecimento cadastral, eliminando CNPJs inativos e garantindo alta acurácia nos telefones comerciais.",
  },
  {
    question: "Em quais formatos recebo a base?",
    answer: "Você recebe os arquivos prontos em .XLSX (Microsoft Excel) e .CSV (compatível com Google Sheets e os principais CRMs do mercado).",
  },
  {
    question: "Posso solicitar um plano personalizado?",
    answer: "Com certeza. Montamos recortes sob medida para operações de qualquer porte com filtros avançados por CNAE, região, capital social e faturamento.",
  },
];

export default function PlanosPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* HERO (1:1 COM MOCKUP 03) */}
        <section className={styles.heroSplitSection} data-testid="planos-hero">
          <div className={styles.heroSplitInner}>
            <div className={styles.heroTextCol}>
              <span className={styles.eyebrowTag}>PLANOS PARA TODOS OS MOMENTOS</span>
              <h1 className={styles.heroMainTitle}>
                Escolha o plano ideal para o <span className={styles.cyanHighlight}>seu negócio.</span>
              </h1>
              <p className={styles.heroLeadText}>
                Dados confiáveis e atualizados para você prospectar com mais eficiência. Planos flexíveis, pensados para diferentes necessidades e estágios de crescimento.
              </p>
              <div className={styles.heroBtnGroup}>
                <Link className={styles.btnPrimarySolid} href="#nossos-planos">
                  Ver planos <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a
                  className={styles.btnGhostOutline}
                  href={createWhatsAppLink(
                    "Olá, gostaria de saber como funcionam os planos da ProspectaNicho.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play size={15} fill="#20edf0" color="#20edf0" /> Ver como funciona
                </a>
              </div>
            </div>

            {/* EXECUTIVE LOOKING AT SCREEN WITH BRAZIL (1:1 COM O MOCKUP) */}
            <div className={styles.heroVisualCol}>
              <div style={{ position: "relative", width: "100%", maxWidth: 460, height: 320, borderRadius: "1.25rem", overflow: "hidden", border: "1px solid rgba(32, 237, 240, 0.25)" }}>
                <Image
                  src={assetPath("/preview-v2/assets/office-meeting-team.png")}
                  alt="Executivo analisando painel de dados"
                  fill
                  sizes="460px"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0, 12, 23, 0.9) 0%, rgba(0, 12, 23, 0.3) 60%, transparent 100%)" }} />
                <div style={{ position: "absolute", bottom: "1.2rem", left: "1.2rem", right: "1.2rem", background: "rgba(6, 22, 38, 0.85)", border: "1px solid rgba(32, 237, 240, 0.3)", borderRadius: "0.85rem", padding: "0.85rem 1.2rem", backdropFilter: "blur(8px)" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>Mais oportunidades para o seu crescimento.</span>
                </div>
              </div>
              <div className={styles.floatingScriptNote} style={{ bottom: "-15px", right: "10px" }}>
                Dados que geram oportunidades reais.
              </div>
            </div>
          </div>
        </section>

        {/* 4 PRICING CARDS (1:1 COM O MOCKUP) */}
        <section className={styles.sectionBlock} id="nossos-planos" data-testid="planos-grid">
          <div className={styles.containerWrap}>
            <div style={{ marginBottom: "3rem" }}>
              <span className={styles.eyebrowTag}>NOSSOS PLANOS</span>
              <h2 className={styles.sectionHeadingH2}>
                Dados de qualidade para cada fase do seu negócio.
              </h2>
            </div>

            <div className={styles.planCardsGrid4}>
              {plansList.map((plan) => {
                const IconComp = plan.icon;
                return (
                  <article
                    key={plan.id}
                    className={`${styles.planCardItem} ${plan.popular ? styles.planCardHighlight : ""}`}
                  >
                    <div className={styles.planTopIcon}>
                      <IconComp size={24} />
                    </div>
                    <h3 className={styles.planCardName}>{plan.title}</h3>
                    <p className={styles.planCardBrief}>{plan.description}</p>

                    <div style={{ marginTop: "auto" }}>
                      <span className={styles.planStartingFrom}>{plan.startingFrom}</span>
                      <div className={styles.planPriceValue}>
                        {plan.price} <span style={{ fontSize: "0.85rem" }}>{plan.period}</span>
                      </div>

                      {plan.custom ? (
                        <a
                          className={styles.btnPlanAction}
                          href={plan.ctaHref}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {plan.ctaText} <ArrowRight size={14} />
                        </a>
                      ) : (
                        <Link className={styles.btnPlanAction} href={plan.ctaHref}>
                          {plan.ctaText} <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* TODOS OS PLANOS INCLUEM (1:1 COM O MOCKUP) */}
        <section className={styles.sectionBlockAlt} data-testid="planos-benefits">
          <div className={styles.containerWrap}>
            <div style={{ marginBottom: "2.5rem" }}>
              <span className={styles.eyebrowTag}>TODOS OS PLANOS INCLUEM</span>
              <h2 className={styles.sectionHeadingH2}>Mais do que dados. Mais resultados.</h2>
            </div>

            <div className={styles.includedBenefitsRow4}>
              {includedBenefits.map((b) => {
                const IconComp = b.icon;
                return (
                  <div key={b.title} className={styles.includedBenefitCard}>
                    <div className={styles.benefitCircleIcon}>
                      <IconComp size={22} />
                    </div>
                    <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff" }}>{b.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* DÚVIDAS FREQUENTES (1:1 COM O MOCKUP) */}
        <section className={styles.sectionBlock} data-testid="planos-faq">
          <div className={styles.containerWrap}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <span className={styles.eyebrowTag}>DÚVIDAS FREQUENTES</span>
                <h2 className={styles.sectionHeadingH2}>Ainda tem alguma dúvida?</h2>
              </div>
              <Link className={styles.linkViewAll} href="/faq">
                Ver todas as perguntas <ArrowRight size={14} />
              </Link>
            </div>

            <div className={styles.faqAccordionList}>
              {faqsList.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={faq.question} className={styles.faqRowItem}>
                    <button
                      className={styles.faqQuestionBtn}
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={18}
                        color="#20edf0"
                        style={{
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.22s ease",
                        }}
                      />
                    </button>
                    {isOpen && <div className={styles.faqAnswerText}>{faq.answer}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL SHARED CTA BANNER (1:1 COM O MOCKUP) */}
        <SharedCTA
          titlePrimary="O próximo cliente"
          titleSecondary="pode estar mais perto"
          titleTertiary="do que você imagina."
          asideHeadline="Escolha seu plano e comece hoje a gerar mais oportunidades."
          primaryCtaLabel="Ver planos"
          primaryCtaHref="#nossos-planos"
          secondaryCtaLabel="Falar com um especialista"
        />
      </main>
    </div>
  );
}
