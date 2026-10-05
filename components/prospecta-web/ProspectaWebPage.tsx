"use client";

// cspell:ignore imobiliaria negó

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ChevronRight,
  ClipboardList,
  FileText,
  Headphones,
  Monitor,
  PanelsTopLeft,
  Rocket,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { assetPath } from "@/lib/asset-path";
import { createWhatsAppLink } from "@/lib/whatsapp";
import {
  CaseCard,
  ConversionChartIcon,
  FeatureCard,
  ProcessStep,
  ResponsiveDevicesIcon,
  SectionBadge,
  ServiceIncludedItem,
  WhatsAppIcon,
} from "./ProspectaWebComponents";
import styles from "./prospecta-web.module.css";

const benefitsList = [
  {
    icon: Monitor,
    title: "Design profissional",
    description: (
      <>
        Layouts modernos e<br />
        alinhados à identidade<br />
        da sua marca.
      </>
    ),
  },
  {
    icon: ResponsiveDevicesIcon,
    title: "Responsivo",
    description: (
      <>
        Experiência perfeita<br />
        em computadores,<br />
        tablets e celulares.
      </>
    ),
  },
  {
    icon: ConversionChartIcon,
    title: "Foco em conversão",
    description: (
      <>
        Estrutura pensada para<br />
        atrair, engajar e gerar<br />
        mais clientes.
      </>
    ),
  },
  {
    icon: WhatsAppIcon,
    title: "Integração com WhatsApp",
    description: (
      <>
        Seus clientes em contato<br />
        direto, de forma rápida<br />
        e prática.
      </>
    ),
  },
];

const includedServices = [
  {
    icon: Monitor,
    title: "Layout personalizado",
    description: "De acordo com a identidade da sua marca.",
  },
  {
    icon: FileText,
    title: "Copy estratégica",
    description: "Textos focados em conversão.",
  },
  {
    icon: Search,
    title: "SEO básico",
    description: "Estrutura otimizada para o Google.",
  },
  {
    icon: ClipboardList,
    title: "Formulário de contato",
    description: "Captação de leads de forma simples.",
  },
  {
    icon: WhatsAppIcon,
    title: "Integração com WhatsApp",
    description: "Atendimento direto e rápido.",
  },
  {
    icon: Smartphone,
    title: "Versão mobile",
    description: "Layout perfeito para todos os dispositivos.",
  },
];

const processSteps = [
  {
    number: "1",
    icon: FileText,
    title: "Briefing",
    description: "Entendemos suas necessidades, seus objetivos e o perfil do seu público.",
  },
  {
    number: "2",
    icon: Sparkles,
    title: "Criação",
    description: "Desenvolvemos o layout, os conteúdos e realizamos os ajustes com você.",
  },
  {
    number: "3",
    icon: Rocket,
    title: "Publicação",
    description: "Seu site no ar, pronto para atrair mais clientes e gerar resultados.",
  },
];

const projectCases = [
  {
    id: "conexium",
    title: "Conexium Engenharia",
    category: "Engenharia & Soluções Industriais",
    tags: ["Site Institucional", "Engenharia"],
    image: "/assets/prospecta-web/case-conexium.png",
    href: "https://conexium-engenharia.vercel.app/",
    external: true,
    alt: "Homepage do projeto Conexium Engenharia",
  },
  {
    id: "omega-imports",
    title: "Omega Imports",
    category: "E-commerce & Catálogo Técnico",
    tags: ["E-commerce", "Catálogo de Produtos"],
    image: "/assets/prospecta-web/case-omega-imports.png",
    href: "https://omegaimports.vercel.app/",
    external: true,
    alt: "Homepage do projeto Omega Imports",
  },
  {
    id: "imobiliaria",
    title: "Imobiliária",
    image: "/assets/prospecta-web/case-imobiliaria.png",
    tags: ["Site Institucional", "Apresentação de Imóveis"],
  },
];

export function ProspectaWebPage() {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);

  const whatsappProjectUrl = createWhatsAppLink(
    "Olá! Gostaria de solicitar um projeto de Site / Landing Page com a ProspectaNicho."
  );

  const whatsappSpecialistUrl = createWhatsAppLink(
    "Olá! Gostaria de falar com um especialista sobre criação de sites e landing pages para minha empresa."
  );

  const handlePrevCase = () => {
    setActiveCaseIndex((prev) => (prev > 0 ? prev - 1 : projectCases.length - 1));
  };

  const handleNextCase = () => {
    setActiveCaseIndex((prev) => (prev < projectCases.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* ==================================================================
            DOBRA 01 — HERO
            ================================================================== */}
        <section className={styles.heroSection} aria-labelledby="hero-heading">
          <div className={styles.heroBackground}>
            <Image
              src={assetPath("/assets/prospecta-web/hero-fold-final.webp")}
              alt="Ambiente corporativo com notebook e smartphone demonstrando site profissional ProspectaNicho"
              fill
              priority
              className={styles.heroBgImg}
              unoptimized
            />
            <div className={styles.heroOverlay} />
          </div>
          <div className={styles.container}>
            <div className={styles.heroContent}>
              <SectionBadge>SITES &amp; LANDING PAGES</SectionBadge>
              <h1 id="hero-heading" className={styles.heroTitle}>
                Sites &amp; Landing Pages<br />
                que <span className={styles.cyanHighlight}>transformam</span><br />
                presença em <span className={styles.cyanHighlight}>negócios.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                A ProspectaNicho desenvolve páginas profissionais,<br className={styles.desktopBreak} />
                responsivas e pensadas para conversão, ajudando sua<br className={styles.desktopBreak} />
                empresa a atrair mais clientes e gerar mais resultados.
              </p>

              <div className={styles.heroActions}>
                <a
                  href={whatsappProjectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.primaryButton}
                >
                  Solicitar projeto <ArrowRight size={17} aria-hidden="true" />
                </a>

                <a href="#projetos" className={styles.secondaryButton}>
                  <span className={styles.secondaryButtonPlayIcon} aria-hidden="true">
                    ▶
                  </span>
                  Ver exemplos
                </a>
              </div>

              <div className={styles.heroTrustRow} aria-label="Garantias de serviço">
                <div className={styles.heroTrustItem}>
                  <ShieldCheck size={28} strokeWidth={1.8} aria-hidden="true" />
                  <div className={styles.heroTrustText}>
                    <span>Entrega segura</span>
                    <span>e no prazo</span>
                  </div>
                </div>
                <div className={styles.heroTrustItem}>
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#09e2e8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={styles.trustIconSvg}
                  >
                    <path d="M4 14C8 14 11 9 24 5" />
                    <path d="M19 5H24V10" />
                    <rect x="4" y="19" width="3" height="5" rx="0.5" fill="#09e2e8" stroke="none" />
                    <rect x="10" y="15" width="3" height="9" rx="0.5" fill="#09e2e8" stroke="none" />
                    <rect x="16" y="11" width="3" height="13" rx="0.5" fill="#09e2e8" stroke="none" />
                    <rect x="22" y="7" width="3" height="17" rx="0.5" fill="#09e2e8" stroke="none" />
                  </svg>
                  <div className={styles.heroTrustText}>
                    <span>Foco em</span>
                    <span>resultados reais</span>
                  </div>
                </div>
                <div className={styles.heroTrustItem}>
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#09e2e8"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={styles.trustIconSvg}
                  >
                    <circle cx="14" cy="10.5" r="4.5" />
                    <path d="M6 24C6 19.5 9.5 17.5 14 17.5C18.5 17.5 22 19.5 22 24" />
                    <path d="M8 12C7.5 12 7 10.5 7 9.5C7 8.5 7.5 7 8 7" />
                    <path d="M20 12C20.5 12 21 10.5 21 9.5C21 8.5 20.5 7 20 7" />
                    <path d="M8 8C9 5.5 11.2 4 14 4C16.8 4 19 5.5 20 8" />
                  </svg>
                  <div className={styles.heroTrustText}>
                    <span>Suporte</span>
                    <span>especializado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            DOBRA 02 — BENEFÍCIOS + SERVIÇO COMPLETO (PARIDADE VISUAL 1:1)
            ================================================================== */}
        <section className={styles.serviceSection} id="servicos" aria-labelledby="services-heading">
          <div className={styles.serviceBackgroundWrapper}>
            <Image
              src={assetPath("/assets/prospecta-web/service-section-bg-final.webp")}
              alt=""
              fill
              loading="lazy"
              className={styles.serviceBackgroundImage}
              unoptimized
            />
            <div className={styles.serviceBackgroundOverlay} />
          </div>

          <div className={styles.serviceSectionContent}>
            {/* FAIXA A — 4 BENEFÍCIOS */}
            <div className={styles.serviceContainer}>
              <div className={styles.benefitsGrid} aria-label="Principais Benefícios">
                {benefitsList.map((benefit) => (
                  <FeatureCard
                    key={benefit.title}
                    icon={benefit.icon}
                    title={benefit.title}
                    description={benefit.description}
                  />
                ))}
              </div>
            </div>

            {/* DIVISOR HORIZONTAL ENTRE FAIXA A E FAIXA B */}
            <div className={styles.serviceDividerLine} aria-hidden="true" />

            {/* FAIXA B — SERVIÇO COMPLETO (GRID 3 COLUNAS) */}
            <div className={styles.serviceContainer}>
              <div className={styles.servicesMainGrid}>
                {/* COLUNA 1: BADGE + H2 + TEXTO */}
                <div className={styles.servicesTextCol}>
                  <SectionBadge>SERVIÇO COMPLETO</SectionBadge>
                  <h2 id="services-heading" className={styles.servicesTitle}>
                    O que está incluso<br />
                    no seu projeto
                  </h2>
                  <p className={styles.servicesSubtitle}>
                    Entregamos muito mais que um site bonito.<br />
                    Criamos páginas estratégicas, otimizadas<br />
                    e prontas para gerar resultados para<br />
                    o seu negócio.
                  </p>
                </div>

                {/* COLUNA 2: 6 ENTREGÁVEIS */}
                <div className={styles.servicesListCol}>
                  {includedServices.map((service) => (
                    <ServiceIncludedItem
                      key={service.title}
                      icon={service.icon}
                      title={service.title}
                      description={service.description}
                    />
                  ))}
                </div>

                {/* COLUNA 3: ZONA VISUAL DOS MOCKUPS (Transparente para expor mockups do fundo) */}
                <div className={styles.servicesVisualCol} aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            DOBRA 04 — COMO FUNCIONA (TIMELINE / PROCESSO)
            ================================================================== */}
        <section className={styles.processSection} aria-labelledby="process-heading">
          <div className={styles.container}>
            <div className={styles.processHeader}>
              <div className={styles.processHeaderLeft}>
                <SectionBadge>COMO FUNCIONA</SectionBadge>
                <h2 id="process-heading" className={styles.processTitle}>
                  Do briefing à publicação, sem complicação.
                </h2>
              </div>
              <p className={styles.processSubtext}>
                Um processo simples e transparente para você ter seu site no ar, pronto para gerar negócios.
              </p>
            </div>

            <div className={styles.processCardContainer}>
              <div className={styles.processStepsRow}>
                {processSteps.map((step, idx) => (
                  <React.Fragment key={step.number}>
                    <ProcessStep
                      number={step.number}
                      icon={step.icon}
                      title={step.title}
                      description={step.description}
                    />
                    {idx < processSteps.length - 1 && (
                      <div className={styles.processStepDivider} aria-hidden="true">
                        <ChevronRight size={24} className={styles.processStepDividerChevron} aria-hidden="true" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            DOBRA 05 — PORTFÓLIO / CASES
            ================================================================== */}
        <section
          id="projetos"
          className={styles.casesSection}
          aria-labelledby="cases-heading"
        >
          <div className={styles.container}>
            <div className={styles.casesHeader}>
              <div className={styles.casesHeaderLeft}>
                <SectionBadge>NOSSOS PROJETOS</SectionBadge>
                <h2 id="cases-heading" className={styles.casesTitle}>
                  Sites e landing pages que geram resultados.
                </h2>
              </div>
              <div className={styles.casesHeaderRight}>
                <p className={styles.casesSubtext}>
                  Conheça alguns dos nossos projetos e veja como ajudamos empresas de diferentes segmentos a crescerem no digital.
                </p>
                <div className={styles.casesNavControls} aria-label="Navegar entre projetos">
                  <button
                    type="button"
                    className={styles.casesNavBtn}
                    onClick={handlePrevCase}
                    aria-label="Projeto anterior"
                  >
                    <ArrowLeft size={17} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`${styles.casesNavBtn} ${styles.casesNavBtnPrimary}`}
                    onClick={handleNextCase}
                    aria-label="Próximo projeto"
                  >
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.casesGrid}>
              {projectCases.map((proj) => (
                <CaseCard
                  key={proj.id}
                  title={proj.title}
                  image={proj.image}
                  tags={proj.tags}
                  href={"href" in proj ? proj.href : undefined}
                  external={"external" in proj ? proj.external : undefined}
                  alt={"alt" in proj ? proj.alt : undefined}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            DOBRA 06 — CTA FINAL
            ================================================================== */}
        <section
          id="contato"
          className={styles.ctaFinalSection}
          aria-labelledby="cta-heading"
        >
          <div className={styles.ctaBackground}>
            <Image
              src={assetPath("/assets/prospecta-web/final-cta-bg.webp")}
              alt="Ambiente corporativo de alta tecnologia com notebook apresentando a ProspectaNicho"
              fill
              loading="lazy"
              className={styles.ctaBgImg}
              unoptimized
            />
            <div className={styles.ctaOverlay} />
          </div>
          <div className={`${styles.container} ${styles.ctaFinalContainer}`}>
            <div className={styles.ctaFinalTextCol}>
              <SectionBadge className={styles.ctaSectionBadge}>VAMOS CONVERSAR JUNTOS?</SectionBadge>
              <h2 id="cta-heading" className={styles.ctaFinalTitle}>
                Sua presença digital<br />
                precisa <span className={styles.cyanHighlight}>vender por você.</span>
              </h2>
              <p className={styles.ctaFinalLead}>
                Solicite seu projeto agora e dê o próximo passo para atrair mais clientes,<br className={styles.ctaLeadBreak} />
                fortalecer sua marca e gerar mais negócios com um site profissional.
              </p>

              <div className={styles.ctaFinalActions}>
                <a
                  href={whatsappProjectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.primaryButton}
                >
                  Solicitar projeto <ArrowRight size={17} aria-hidden="true" />
                </a>

                <a
                  href={whatsappSpecialistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaFinalSecondaryBtn}
                >
                  <WhatsAppIcon size={20} className={styles.ctaWhatsappIcon} />
                  Falar com um especialista
                </a>
              </div>

              <div className={styles.ctaFinalTrustRow} aria-label="Diferenciais da entrega">
                <div className={styles.ctaFinalTrustItem}>
                  <Headphones size={24} aria-hidden="true" />
                  <span>Atendimento consultivo</span>
                </div>
                <div className={styles.ctaFinalTrustItem}>
                  <ShieldCheck size={24} aria-hidden="true" />
                  <span>Projeto sob medida</span>
                </div>
                <div className={styles.ctaFinalTrustItem}>
                  <Rocket size={24} aria-hidden="true" />
                  <span>Suporte após a entrega</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
