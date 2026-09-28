"use client";

// cspell:ignore imobiliaria negó

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Headphones,
  Laptop,
  Layout,
  MessageCircle,
  MessageSquare,
  Rocket,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { assetPath } from "@/lib/asset-path";
import { createWhatsAppLink } from "@/lib/whatsapp";
import {
  CaseCard,
  FeatureCard,
  ProcessStep,
  SectionBadge,
  ServiceIncludedItem,
  WebToB2BBridge,
} from "./ProspectaWebComponents";
import styles from "./prospecta-web.module.css";

const benefitsList = [
  {
    icon: Laptop,
    title: "Design profissional",
    description: "Layouts modernos e alinhados à identidade da sua marca.",
  },
  {
    icon: Smartphone,
    title: "Responsivo",
    description: "Experiência perfeita em computadores, tablets e celulares.",
  },
  {
    icon: BarChart3,
    title: "Foco em conversão",
    description: "Estrutura pensada para atrair, engajar e gerar mais clientes.",
  },
  {
    icon: MessageCircle,
    title: "Integração com WhatsApp",
    description: "Seus clientes em contato direto, de forma rápida e prática.",
  },
];

const includedServices = [
  {
    icon: Layout,
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
    icon: Send,
    title: "Formulário de contato",
    description: "Captação de leads de forma simples.",
  },
  {
    icon: MessageCircle,
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
    id: "odonto",
    title: "Clínica Odontológica",
    image: "/assets/prospecta-web/case-odonto-screen.png",
    tags: ["Site Institucional", "Geração de Leads"],
  },
  {
    id: "industria",
    title: "Indústria & Soluções",
    image: "/assets/prospecta-web/case-industria-screen.png",
    tags: ["Landing Page", "Captação de Contato"],
  },
  {
    id: "imobiliaria",
    title: "Imobiliária",
    image: "/assets/prospecta-web/case-imobiliaria-screen.png",
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
          <div className={styles.heroGlowBackdrop} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroContent}>
              <SectionBadge>SITES &amp; LANDING PAGES</SectionBadge>
              <h1 id="hero-heading" className={styles.heroTitle}>
                Sites &amp; Landing Pages<br />
                que <span className={styles.cyanHighlight}>transformam</span><br />
                presença em negó<span className={styles.cyanHighlight}>cios.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                A ProspectaNicho desenvolve páginas profissionais, responsivas e pensadas para conversão, ajudando sua empresa a atrair mais clientes e gerar mais resultados.
              </p>

              <div className={styles.heroActions}>
                <a
                  href={whatsappProjectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.primaryButton}
                >
                  Solicitar projeto <ArrowRight size={18} aria-hidden="true" />
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
                  <ShieldCheck size={20} aria-hidden="true" />
                  <span>Entrega segura e no prazo</span>
                </div>
                <div className={styles.heroTrustItem}>
                  <TrendingUp size={20} aria-hidden="true" />
                  <span>Foco em resultados reais</span>
                </div>
                <div className={styles.heroTrustItem}>
                  <Headphones size={20} aria-hidden="true" />
                  <span>Suporte especializado</span>
                </div>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroDeviceImageWrapper}>
                <Image
                  src={assetPath("/assets/prospecta-web/hero-devices.png")}
                  alt="Dispositivos notebook e smartphone demonstrando site profissional responsivo"
                  fill
                  priority
                  className={styles.heroDeviceImage}
                  sizes="(max-width: 860px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            DOBRA 02 — PRINCIPAIS BENEFÍCIOS
            ================================================================== */}
        <section className={styles.benefitsSection} aria-label="Principais Benefícios">
          <div className={styles.container}>
            <div className={styles.benefitsGrid}>
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
        </section>

        {/* ==================================================================
            DOBRA 03 — SERVIÇO COMPLETO (O QUE ESTÁ INCLUSO)
            ================================================================== */}
        <section className={styles.servicesSection} aria-labelledby="services-heading">
          <div className={`${styles.container} ${styles.servicesGrid}`}>
            <div className={styles.servicesTextCol}>
              <SectionBadge>SERVIÇO COMPLETO</SectionBadge>
              <h2 id="services-heading" className={styles.servicesTitle}>
                O que está incluso no seu projeto
              </h2>
              <p className={styles.servicesSubtitle}>
                Entregamos muito mais que um site bonito. Criamos páginas estratégicas, otimizadas e prontas para gerar resultados para o seu negócio.
              </p>

              <div className={styles.servicesList}>
                {includedServices.map((service) => (
                  <ServiceIncludedItem
                    key={service.title}
                    icon={service.icon}
                    title={service.title}
                    description={service.description}
                  />
                ))}
              </div>
            </div>

            <div className={styles.servicesVisualCol}>
              <div className={styles.servicesPreviewCard}>
                <Image
                  src={assetPath("/assets/prospecta-web/dobra3-preview.png")}
                  alt="Amostra da estrutura de páginas e layout personalizado"
                  width={520}
                  height={380}
                  priority
                  unoptimized
                />
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
                        &gt;
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
                    <ArrowLeft size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`${styles.casesNavBtn} ${styles.casesNavBtnPrimary}`}
                    onClick={handleNextCase}
                    aria-label="Próximo projeto"
                  >
                    <ArrowRight size={18} aria-hidden="true" />
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
                  isDemonstrative
                />
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            SEÇÃO 15 — INTERLIGAÇÃO ENTRE PRODUTOS (PROSPECTA DADOS)
            ================================================================== */}
        <WebToB2BBridge />

        {/* ==================================================================
            DOBRA 06 — CTA FINAL
            ================================================================== */}
        <section
          id="contato"
          className={styles.ctaFinalSection}
          aria-labelledby="cta-heading"
        >
          <div className={`${styles.container} ${styles.ctaFinalGrid}`}>
            <div className={styles.ctaFinalTextCol}>
              <SectionBadge>VAMOS CONVERSAR JUNTOS?</SectionBadge>
              <h2 id="cta-heading" className={styles.ctaFinalTitle}>
                Sua presença digital<br />
                precisa <span className={styles.cyanHighlight}>vender por você.</span>
              </h2>
              <p className={styles.ctaFinalLead}>
                Solicite seu projeto agora e dê o próximo passo para atrair mais clientes, fortalecer sua marca e gerar mais negócios com um site profissional.
              </p>

              <div className={styles.ctaFinalActions}>
                <a
                  href={whatsappProjectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.primaryButton}
                >
                  Solicitar projeto <ArrowRight size={18} aria-hidden="true" />
                </a>

                <a
                  href={whatsappSpecialistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.secondaryButton}
                >
                  <MessageSquare size={18} aria-hidden="true" />
                  Falar com um especialista
                </a>
              </div>

              <div className={styles.ctaFinalTrustRow} aria-label="Diferenciais da entrega">
                <div className={styles.ctaFinalTrustItem}>
                  <Headphones size={20} aria-hidden="true" />
                  <span>Atendimento consultivo</span>
                </div>
                <div className={styles.ctaFinalTrustItem}>
                  <ShieldCheck size={20} aria-hidden="true" />
                  <span>Projeto sob medida</span>
                </div>
                <div className={styles.ctaFinalTrustItem}>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <span>Suporte após a entrega</span>
                </div>
              </div>
            </div>

            <div className={styles.ctaFinalVisualCol}>
              <div className={styles.ctaLaptopWrapper}>
                <Image
                  src={assetPath("/assets/prospecta-web/cta-laptop.png")}
                  alt="Notebook exibindo a marca oficial ProspectaNicho"
                  fill
                  priority
                  className={styles.ctaLaptopImage}
                  sizes="(max-width: 860px) 100vw, 45vw"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
