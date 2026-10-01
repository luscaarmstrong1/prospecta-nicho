"use client";

// cspell:ignore Linkedin Youtube testid Ltda
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  Calculator,
  CheckCircle2,
  CreditCard,
  Database,
  Download,
  Globe2,
  Instagram,
  Layers3,
  Linkedin,
  Mail,
  MapPin,
  Megaphone,
  Play,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Youtube,
  Zap,
} from "lucide-react";
import { assetPath } from "@/lib/asset-path";
import {
  featuredSegments,
  finalTrustPoints,
  footerGroups,
  heroBenefits,
  plans,
  regionalReach,
  sampleColumns,
  sampleRows,
  scaleMetrics,
  testimonials,
  type PreviewIcon,
} from "@/lib/preview-v2-gemini/mock-data";
import { GeminiHeader } from "./GeminiHeader";
import { GeminiModal } from "./GeminiModal";
import {
  ClipReveal,
  CountUp,
  GeminiMotionProvider,
  InteractiveCard,
  Magnetic,
  Reveal,
  useGeminiMotion,
} from "./GeminiMotion";
import styles from "./preview-gemini.module.css";

const iconMap = {
  building: Building2,
  calculator: Calculator,
  database: Database,
  globe: Globe2,
  layers: Layers3,
  map: MapPin,
  megaphone: Megaphone,
  search: Search,
  settings: Settings,
  shield: ShieldCheck,
  sparkles: Sparkles,
  zap: Zap,
} satisfies Record<PreviewIcon, typeof Search>;

function PreviewIconView({ name, size = 20 }: { name: PreviewIcon; size?: number }) {
  const Icon = iconMap[name];
  return <Icon size={size} aria-hidden="true" />;
}

export function GeminiPreviewSite() {
  return (
    <GeminiMotionProvider>
      <GeminiPreviewSiteContent />
    </GeminiMotionProvider>
  );
}

function GeminiPreviewSiteContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const [newsletterState, setNewsletterState] = useState<"idle" | "sending" | "success">("idle");
  const [showToast, setShowToast] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const newsletterSubmitTimer = useRef<number>(0);
  const newsletterToastTimer = useRef<number>(0);
  const { motionOff, reducedMotion } = useGeminiMotion();
  const { scrollYProgress } = useScroll();

  const openMockAction = useCallback((title: string) => {
    setMenuOpen(false);
    setModalTitle(title);
  }, []);

  function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newsletterState !== "idle") return;
    setNewsletterState("sending");
    window.clearTimeout(newsletterSubmitTimer.current);
    window.clearTimeout(newsletterToastTimer.current);
    newsletterSubmitTimer.current = window.setTimeout(() => {
      setNewsletterState("success");
      setShowToast(true);
      newsletterToastTimer.current = window.setTimeout(() => setShowToast(false), 2600);
    }, reducedMotion ? 20 : 620);
  }

  useEffect(() => () => {
    window.clearTimeout(newsletterSubmitTimer.current);
    window.clearTimeout(newsletterToastTimer.current);
  }, []);

  useEffect(() => {
    if (newsletterState !== "success") return;
    const timer = window.setTimeout(() => setNewsletterState("idle"), 3400);
    return () => window.clearTimeout(timer);
  }, [newsletterState]);

  const visibleTestimonials = testimonials.map((_, offset) =>
    testimonials[(testimonialIndex + offset) % testimonials.length],
  );

  const changeTestimonial = (direction: number) => {
    setTestimonialIndex((current) => (current + direction + testimonials.length) % testimonials.length);
  };

  return (
    <div
      className={styles.previewRoot}
      data-motion={motionOff ? "off" : "on"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <motion.div
        className={styles.scrollProgress}
        style={{ scaleX: scrollYProgress }}
        data-testid="motion-scroll-progress"
        aria-hidden="true"
      />
      <a className={styles.skipLink} href="#conteudo-principal">
        Pular para o conteúdo
      </a>
      <p className="sr-only">Versão visual de teste Gemini. Sem integração com backend. Nenhum dado é enviado.</p>

      <GeminiHeader
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((open) => !open)}
        onMockAction={openMockAction}
      />

      <main id="conteudo-principal">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION                                                           */}
        {/* ========================================================================= */}
        <section
          className={styles.hero}
          id="inicio"
          aria-labelledby="preview-gemini-hero-title"
          data-testid="preview-gemini-hero"
        >
          <div className={styles.heroBackgroundLayer}>
            <Image
              className={styles.heroBackground}
              src={assetPath("/preview-v2-gemini/hero-national.webp")}
              alt="Mapa digital e conexões sobre relevo do Brasil"
              fill
              sizes="100vw"
              priority
              unoptimized
            />
          </div>
          <div className={styles.heroOverlay} />

          <div className={styles.heroMain}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}>
                <span>OPORTUNIDADES EM TODO O BRASIL</span>
              </div>
              <h1 id="preview-gemini-hero-title">
                Explore o<br />
                <span className={styles.cyanHighlight}>mercado B2B</span><br />
                em escala nacional.
              </h1>
              <p className={styles.heroLead}>
                Dados atualizados, segmentação precisa e empresas prontas para prospectar. Descubra o potencial de cada região e encontre as melhores oportunidades para o seu negócio.
              </p>
              <div className={styles.heroActions} data-testid="preview-gemini-hero-actions">
                <Magnetic>
                  <button
                    className={styles.primaryButtonLarge}
                    type="button"
                    onClick={() => openMockAction("Montar minha base")}
                  >
                    Montar minha base <ArrowRight size={20} aria-hidden="true" />
                  </button>
                </Magnetic>
                <a className={styles.secondaryButtonLarge} href="#amostra">
                  <Play size={18} fill="currentColor" aria-hidden="true" /> Ver como funciona
                </a>
              </div>
            </div>

            {/* MAP OVERLAY REGIONS */}
            <div
              className={styles.heroMapArea}
              aria-label="Cobertura comercial por região do Brasil"
              data-testid="preview-gemini-map"
            >
              <div className={styles.regionCardContainer}>
                {regionalReach.map((item) => (
                  <div
                    key={item.region}
                    className={`${styles.regionTag} ${styles[`tag${item.region.replace("-", "")}`]}`}
                    style={{ left: item.left, top: item.top }}
                  >
                    <span className={styles.regionName}>{item.region}</span>
                    <strong className={styles.regionNumber}>{item.total}</strong>
                    <small className={styles.regionLabel}>empresas</small>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE RAIL */}
            <aside className={styles.heroRail} aria-hidden="true">
              <span className={styles.railTop}>BRASIL EM OPORTUNIDADES</span>
              <span className={styles.railMiddle}>DADOS QUE IMPULSIONAM NEGÓCIOS</span>
              <em className={styles.railCursive}>Mais oportunidades para um Brasil mais forte.</em>
            </aside>
          </div>

          {/* HERO 4 BENEFITS ROW */}
          <div className={styles.heroBenefitsRow} aria-label="Benefícios da solução">
            {heroBenefits.map((benefit, idx) => (
              <div key={benefit.label} className={styles.benefitItem}>
                <span className={styles.benefitIconCircle}>
                  <PreviewIconView name={benefit.icon} size={22} />
                </span>
                <span className={styles.benefitLabel}>{benefit.label}</span>
                {idx < heroBenefits.length - 1 && <span className={styles.benefitDivider} aria-hidden="true" />}
              </div>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* 2. NUMBERS STRIP                                                          */}
          {/* ========================================================================= */}
          <div className={styles.numbersCard} data-testid="preview-gemini-numbers">
            <div className={styles.numbersLeft}>
              <div className={styles.numbersHeader}>
                <span className={styles.numbersTitle}>NÚMEROS QUE IMPULSIONAM NEGÓCIOS</span>
                <span className={styles.numbersDividerLine} aria-hidden="true" />
              </div>
              <div className={styles.metricsGroup}>
                {scaleMetrics.map((metric) => (
                  <div key={metric.label} className={styles.metricCol}>
                    <strong className={styles.metricVal}>
                      <CountUp value={metric.value} />
                    </strong>
                    <span className={styles.metricSub}>{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.numbersCenterGraphic}>
              <span className={styles.graphicCaption}>
                EMPRESAS<br />IMPULSIONAM<br />GRANDES<br />NEGÓCIOS
              </span>
              <div className={styles.barGraphic}>
                <BarChart3 size={38} aria-hidden="true" />
              </div>
            </div>

            <ClipReveal className={styles.numbersRightImage} data-testid="preview-gemini-numbers-image">
              <Image
                src={assetPath("/preview-v2-gemini/office-intelligence.webp")}
                alt="Profissionais em escritório corporativo noturno"
                fill
                sizes="(max-width: 900px) 100vw, 42vw"
                unoptimized
              />
              <span className={styles.corporateBadge}>
                DO DADO AO CRESCIMENTO REAL
              </span>
            </ClipReveal>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. AMOSTRA SECTION                                                        */}
        {/* ========================================================================= */}
        <section
          className={styles.sampleSection}
          id="amostra"
          aria-labelledby="sample-title"
          data-testid="preview-gemini-sample"
        >
          <div className={styles.sampleGlow} />
          <div className={styles.sampleInner}>
            <div className={styles.sampleCopy}>
              <div className={styles.eyebrow}>
                <span>AMOSTRA REAL</span>
              </div>
              <h2 id="sample-title">
                Veja a qualidade<br />
                <span className={styles.cyanHighlight}>antes de decidir.</span>
              </h2>
              <p className={styles.sampleLead}>
                Receba uma amostra gratuita e confira o padrão dos dados. Empresas reais, com CNPJ, segmento, cidade, porte e muito mais.
              </p>
              <div className={styles.sampleActions}>
                <Magnetic>
                  <button
                    className={styles.primaryButtonLarge}
                    type="button"
                    onClick={() => openMockAction("Receber amostra grátis")}
                  >
                    Receber amostra grátis <ArrowRight size={20} aria-hidden="true" />
                  </button>
                </Magnetic>
                <div className={styles.sampleTrust}>
                  <span><ShieldCheck size={18} aria-hidden="true" /> Sem compromisso.</span>
                  <span><CreditCard size={18} aria-hidden="true" /> Sem cartão de crédito.</span>
                </div>
              </div>
            </div>

            <div className={styles.excelWrapper} aria-label="Demonstração de planilha comercial">
              <div className={styles.excelOuterCard}>
                <div className={styles.excelWindow}>
                  <div className={styles.excelHeader}>
                    <div className={styles.excelBadge}>
                      <span className={styles.excelLetter}>X</span>
                    </div>
                    <strong className={styles.excelSheetTitle}>Amostra de base - indústrias em SP</strong>
                    <span className={styles.dataTag}>
                      <CheckCircle2 size={16} aria-hidden="true" /> Dados reais e atualizados
                    </span>
                  </div>
                  <div className={styles.tableScroller}>
                    <table>
                      <thead>
                        <tr>
                          {sampleColumns.map((col) => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sampleRows.map((row) => (
                          <tr key={row[0]}>
                            {row.map((cell, idx) => (
                              <td key={`${row[0]}-${sampleColumns[idx]}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={styles.excelFooter}>
                    <button
                      type="button"
                      className={styles.excelDownloadBtn}
                      onClick={() => openMockAction("Baixar amostra em Excel")}
                    >
                      <Download size={20} aria-hidden="true" /> Baixar amostra em Excel
                    </button>
                    <div className={styles.handwrittenNote}>
                      <span className={styles.arrowCurved}>⤷</span>
                      <em>Mesma estrutura da base completa.</em>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. SEGMENTOS SECTION (LIGHT BACKGROUND)                                   */}
        {/* ========================================================================= */}
        <section
          className={styles.segmentSection}
          id="segmentos"
          aria-labelledby="segments-title"
          data-testid="preview-gemini-segments"
        >
          <div className={styles.segmentInner}>
            <div className={styles.sectionHeadingLight}>
              <div>
                <div className={styles.eyebrowLight}>
                  <span>SEGMENTOS EM DESTAQUE</span>
                </div>
                <h2 id="segments-title">Segmentos em destaque</h2>
                <p>Escolha um segmento e receba uma base pronta para prospecção.</p>
              </div>
              <button
                className={styles.linkButtonDark}
                type="button"
                onClick={() => openMockAction("Ver todos os segmentos")}
              >
                Ver todos os segmentos <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>

            <div className={styles.segmentGrid}>
              {featuredSegments.map((segment) => (
                <InteractiveCard
                  className={styles.segmentCard}
                  key={segment.title}
                  tilt
                  data-testid="motion-segment-card"
                >
                  <Image
                    src={assetPath(segment.image)}
                    alt=""
                    fill
                    sizes="(max-width: 800px) 100vw, 33vw"
                    unoptimized
                  />
                  <div className={styles.segmentGradientOverlay} />
                  <div className={styles.segmentContent}>
                    <div className={styles.segmentHeaderRow}>
                      <span className={styles.segmentIcon}>
                        <PreviewIconView name={segment.icon} size={36} />
                      </span>
                      <h3>{segment.title}</h3>
                    </div>
                    <p>{segment.description}</p>
                    <button
                      type="button"
                      className={styles.segmentActionBtn}
                      onClick={() => openMockAction(`Acessar ${segment.title}`)}
                    >
                      Acessar segmento <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </InteractiveCard>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. PLANOS SECTION                                                         */}
        {/* ========================================================================= */}
        <section
          className={styles.plansSection}
          id="planos"
          aria-labelledby="plans-title"
          data-testid="preview-gemini-plans"
        >
          <div className={styles.plansInner}>
            <div className={styles.plansHeading}>
              <div>
                <span className={styles.shortCyanLine} />
                <h2 id="plans-title">Nossas bases e planos</h2>
                <p>Dados segmentados para diferentes objetivos. Escolha o plano ideal para o seu negócio.</p>
              </div>
              <div className={styles.plansPill}>
                <Database size={18} aria-hidden="true" /> Todos os planos incluem dados atualizados e suporte
              </div>
            </div>

            <div className={styles.planGrid}>
              {plans.map((plan) => (
                <InteractiveCard
                  className={`${styles.planCard} ${plan.custom ? styles.customPlanCard : ""}`}
                  key={plan.title}
                >
                  <div className={styles.planIcon}>
                    <PreviewIconView name={plan.icon} size={36} />
                  </div>
                  <h3>{plan.title}</h3>
                  <p className={styles.planDesc}>{plan.description}</p>
                  <div className={styles.planPriceBlock}>
                    {!plan.custom && <small className={styles.priceLead}>A partir de</small>}
                    <strong className={styles.priceValue}>{plan.price}</strong>
                    <span className={styles.priceSuffix}>{plan.suffix}</span>
                  </div>
                  <button
                    type="button"
                    className={plan.custom ? styles.customPlanBtn : styles.planCardBtn}
                    onClick={() =>
                      openMockAction(
                        plan.custom ? "Falar com um especialista" : `Ver detalhes de ${plan.title}`,
                      )
                    }
                  >
                    {plan.custom ? "Falar com um especialista" : "Ver detalhes"}{" "}
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                </InteractiveCard>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. DEPOIMENTOS SECTION                                                    */}
        {/* ========================================================================= */}
        <section
          className={styles.testimonialSection}
          id="solucoes"
          aria-labelledby="testimonials-title"
          data-testid="preview-gemini-testimonials"
        >
          <div className={styles.testimonialMapBg}>
            <Image
              src={assetPath("/preview-v2-gemini/brazil-network.webp")}
              alt=""
              fill
              sizes="60vw"
              unoptimized
            />
          </div>
          <div className={styles.testimonialInner}>
            <div className={styles.testimonialHeading}>
              <div>
                <div className={styles.eyebrow}>
                  <span>HISTÓRIAS REAIS</span>
                </div>
                <h2 id="testimonials-title">
                  Quem usa, <span className={styles.cyanHighlight}>recomenda.</span>
                </h2>
                <p>Empresas reais. Resultados reais. Veja o que nossos clientes falam sobre a experiência com a ProspectaNicho.</p>
                <small className={styles.ethicalNotice}>* Depoimentos ilustrativos para validação desta prévia visual.</small>
              </div>
              <div className={styles.testimonialArrows} aria-label="Navegar depoimentos">
                <button
                  type="button"
                  aria-label="Depoimento anterior"
                  onClick={() => changeTestimonial(-1)}
                  className={styles.arrowRound}
                >
                  <ArrowLeft size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Próximo depoimento"
                  onClick={() => changeTestimonial(1)}
                  className={styles.arrowRound}
                >
                  <ArrowRight size={20} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div
              className={styles.testimonialGrid}
              data-testid="motion-testimonial-carousel"
            >
              {visibleTestimonials.map((item) => (
                <figure key={item.name} className={styles.testimonialCard}>
                  <blockquote>
                    <span className={styles.quoteMark}>“</span>
                    {item.quote}”
                  </blockquote>
                  <figcaption className={styles.testimonialAuthor}>
                    <div className={styles.avatarWrap}>
                      <Image
                        src={assetPath(item.avatar)}
                        alt={item.name}
                        width={60}
                        height={60}
                        unoptimized
                      />
                    </div>
                    <div className={styles.authorInfo}>
                      <strong>{item.name}</strong>
                      <span>{item.role}</span>
                      <small>{item.company}</small>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. FINAL CTA (EARTH / BRAZIL)                                             */}
        {/* ========================================================================= */}
        <section
          className={styles.finalCta}
          aria-labelledby="final-cta-title"
          data-testid="preview-gemini-final-cta"
        >
          <div className={styles.finalCtaMedia}>
            <Image
              src={assetPath("/preview-v2-gemini/earth-network.webp")}
              alt="Brasil iluminado visto do espaço com conexões globais"
              fill
              sizes="100vw"
              priority
              unoptimized
            />
          </div>
          <div className={styles.finalCtaShade} />

          <div className={styles.finalCtaContent}>
            <div className={styles.finalCtaLeft}>
              <h2 id="final-cta-title">
                O Brasil é cheio de<br />
                <span className={styles.cyanHighlight}>oportunidades.</span><br />
                O próximo cliente<br />
                pode estar aqui.
              </h2>
            </div>

            <div className={styles.finalCtaAside}>
              <p className={styles.ctaPrompt}>
                Comece agora a explorar todo<br />
                o potencial do mercado brasileiro.
              </p>
              <div className={styles.ctaButtonRow}>
                <Magnetic>
                  <button
                    className={styles.primaryButtonLarge}
                    type="button"
                    onClick={() => openMockAction("Montar meu recorte")}
                  >
                    Montar meu recorte <ArrowRight size={20} aria-hidden="true" />
                  </button>
                </Magnetic>
                <button
                  className={styles.secondaryButtonLarge}
                  type="button"
                  onClick={() => openMockAction("Falar com um especialista")}
                >
                  Falar com um especialista
                </button>
              </div>
              <div className={styles.trustRow} data-testid="preview-gemini-final-trust">
                {finalTrustPoints.map((point) => (
                  <span key={point.label} className={styles.trustItem}>
                    <PreviewIconView name={point.icon} size={19} />
                    {point.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 8. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className={styles.footer} id="sobre" data-testid="preview-gemini-footer">
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogoWrap}>
                <Image
                  src={assetPath("/preview-v2-gemini/logo-official-transparent.png")}
                  alt="ProspectaNicho"
                  width={240}
                  height={50}
                  unoptimized
                />
              </div>
              <span className={styles.brandTagline}>Dados que criam negócios.</span>
              <p className={styles.brandBio}>
                Dados, tecnologia e inteligência de mercado para impulsionar o crescimento da sua empresa.
              </p>
              <div className={styles.socials} aria-label="Redes sociais demonstrativas">
                <button type="button" aria-label="LinkedIn" onClick={() => openMockAction("LinkedIn")}>
                  <Linkedin size={18} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Instagram" onClick={() => openMockAction("Instagram")}>
                  <Instagram size={18} aria-hidden="true" />
                </button>
                <button type="button" aria-label="YouTube" onClick={() => openMockAction("YouTube")}>
                  <Youtube size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            {footerGroups.map((group) => (
              <div className={styles.footerLinksGroup} key={group.title}>
                <h4>{group.title}</h4>
                <ul>
                  {group.links.map((link) => (
                    <li key={link}>
                      <button type="button" onClick={() => openMockAction(link)}>
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className={styles.footerMapCol}>
              <div className={styles.footerMapImgWrap}>
                <Image
                  src={assetPath("/preview-v2-gemini/footer-brazil-map.webp")}
                  alt="Mapa neon do Brasil com conexões de dados"
                  width={140}
                  height={160}
                  unoptimized
                />
              </div>
              <strong className={styles.footerMapText}>
                MAIS NEGÓCIOS<br />
                PARA UM<br />
                <span className={styles.cyanHighlight}>BRASIL MAIS</span><br />
                FORTE.
              </strong>
            </div>
          </div>

          <form className={styles.newsletterCard} onSubmit={submitNewsletter}>
            <div className={styles.newsletterLead}>
              <span className={styles.mailIconWrap}>
                <Mail size={26} aria-hidden="true" />
              </span>
              <span>
                Receba insights e conteúdos<br />
                sobre o mercado B2B no Brasil.
              </span>
            </div>
            <div className={styles.newsletterInputGroup}>
              <label className="sr-only" htmlFor="preview-gemini-newsletter">
                Seu melhor e-mail
              </label>
              <input
                id="preview-gemini-newsletter"
                type="email"
                required
                placeholder="Seu melhor e-mail"
              />
              <button type="submit" disabled={newsletterState !== "idle"}>
                {newsletterState === "sending"
                  ? "Enviando..."
                  : newsletterState === "success"
                  ? "Inscrição simulada ✓"
                  : "Quero receber"}
                {newsletterState === "idle" && <ArrowRight size={18} aria-hidden="true" />}
              </button>
            </div>
            <div className={styles.newsletterNote}>
              <span>Conteúdo relevante.</span>
              <span>Sem spam.</span>
              <span>Apenas oportunidades.</span>
            </div>
          </form>

          <AnimatePresence>
            {showToast && (
              <motion.span
                className={styles.newsletterSuccess}
                role="status"
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: 8 }}
              >
                <CheckCircle2 size={16} aria-hidden="true" /> Demonstração — nenhum dado foi enviado.
              </motion.span>
            )}
          </AnimatePresence>

          <div className={styles.footerBottomBar}>
            <span>© 2026 ProspectaNicho. Todos os direitos reservados.</span>
            <span>Dados. Negócios. Um Brasil com mais oportunidades.</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {modalTitle && <GeminiModal title={modalTitle} onClose={() => setModalTitle(null)} />}
      </AnimatePresence>
    </div>
  );
}
