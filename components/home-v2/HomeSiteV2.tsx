"use client";

// cspell:ignore construcao integracoes Linkedin saude servico testid Youtube
import { type FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
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
  UserRound,
  Youtube,
  Zap,
} from "lucide-react";
import { assetPath } from "@/lib/asset-path";
import { createWhatsAppLink, defaultWhatsAppMessage } from "@/lib/whatsapp";
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
} from "@/lib/home-v2/mock-data";
import { HomeHeader } from "./HomeHeader";
import { PnFinalLogo } from "@/components/shared-v2/PnFinalLogo";
import {
  ClipReveal,
  InteractiveCard,
  Magnetic,
  HomeMotionProvider,
  Reveal,
  SafeTableRow,
  StaggerGroup,
  StaggerItem,
  useHomeMotion,
} from "./motion/HomeMotion";
import styles from "./home-v2.module.css";

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

function normalizeRouteKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getSegmentHref(segment: { title: string; image: string }) {
  const key = normalizeRouteKey(`${segment.title} ${segment.image}`);
  if (key.includes("industria")) return "/solicitar-planilha?segment=industria&source=home-v2-segmento";
  if (key.includes("comercio")) return "/solicitar-planilha?segment=comercio&source=home-v2-segmento";
  if (key.includes("servico")) return "/solicitar-planilha?segment=servicos&source=home-v2-segmento";
  if (key.includes("tecnologia")) return "/solicitar-planilha?segment=tecnologia&source=home-v2-segmento";
  if (key.includes("agencia")) return "/solucoes/agencias-de-marketing";
  if (key.includes("contabilidade")) return "/solucoes/contabilidades";
  if (key.includes("energia")) return "/solucoes/energia-solar";
  return "/solicitar-planilha?source=home-v2-segmento";
}

function getPlanHref(plan: { title: string; custom?: boolean }, whatsappHref: string) {
  if (plan.custom) return whatsappHref;
  const key = normalizeRouteKey(plan.title);
  if (key.includes("recem")) return "/solicitar-planilha?produto=empresas-recem-abertas&source=home-v2-plano";
  if (key.includes("agencia")) return "/solicitar-planilha?produto=agencias-marketing&source=home-v2-plano";
  if (key.includes("contabilidade")) return "/solicitar-planilha?produto=contabilidades&source=home-v2-plano";
  return "/solicitar-planilha?source=home-v2-plano";
}

function getFooterHref(label: string) {
  const key = normalizeRouteKey(label);
  if (key.includes("bases b2b")) return "/produtos";
  if (key.includes("recorte") || key.includes("base personalizada")) return "/produtos/base-personalizada";
  if (key === "segmentos") return "/segmentos";
  if (key.includes("integracoes")) return "/contato";
  if (key.includes("planos")) return "/produtos";
  if (key.includes("industria")) return "/solicitar-planilha?segment=industria&source=home-v2-footer";
  if (key.includes("comercio")) return "/solicitar-planilha?segment=comercio&source=home-v2-footer";
  if (key.includes("servicos")) return "/solicitar-planilha?segment=servicos&source=home-v2-footer";
  if (key.includes("saude")) return "/solicitar-planilha?segment=saude&source=home-v2-footer";
  if (key.includes("construcao")) return "/solicitar-planilha?segment=construcao&source=home-v2-footer";
  if (key.includes("tecnologia")) return "/solicitar-planilha?segment=tecnologia&source=home-v2-footer";
  if (key.includes("ver todos")) return "/produtos";
  if (key.includes("blog")) return "/blog";
  if (key.includes("materiais")) return "/produtos/amostra-gratuita";
  if (key.includes("cases")) return "/conteudos";
  if (key.includes("perguntas")) return "/faq";
  if (key.includes("sobre")) return "/sobre";
  if (key.includes("contato")) return "/contato";
  if (key.includes("privacidade")) return "/politica-de-privacidade";
  if (key.includes("termos")) return "/termos-de-uso";
  return "/contato";
}

export function HomeSiteV2({ includeHeaderFooter = true }: { includeHeaderFooter?: boolean } = {}) {
  return (
    <HomeMotionProvider>
      <HomeSiteV2Content includeHeaderFooter={includeHeaderFooter} />
    </HomeMotionProvider>
  );
}

function HomeSiteV2Content({ includeHeaderFooter = true }: { includeHeaderFooter?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsletterState, setNewsletterState] = useState<"idle" | "sending" | "success">("idle");
  const [showToast, setShowToast] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const newsletterSubmitTimer = useRef<number>(0);
  const newsletterToastTimer = useRef<number>(0);
  const { motionOff, reducedMotion } = useHomeMotion();
  const whatsappHref = createWhatsAppLink(defaultWhatsAppMessage);

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
      <a className={styles.skipLink} href="#conteudo-principal">Pular para o conteúdo</a>
      {includeHeaderFooter && (
        <HomeHeader
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((open) => !open)}
        />
      )}

      <main id="conteudo-principal">
        <section className={styles.hero} id="inicio" aria-labelledby="preview-hero-title" data-testid="preview-hero">
          <div className={styles.heroBackgroundLayer}>
            <Image
              className={styles.heroBackground}
              src={assetPath("/preview-v2/assets/hero-national.webp")}
              alt=""
              fill
              sizes="100vw"
              priority
              unoptimized
            />
          </div>
          <div className={styles.heroOverlay} />

          <div className={styles.heroMain}>
            <motion.div
              className={styles.heroCopy}
              initial={reducedMotion ? false : "hidden"}
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              <motion.p className={styles.heroEyebrow} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>Bases B2B segmentadas</motion.p>
              <motion.h1 id="preview-hero-title" data-testid="preview-hero-title">
                <motion.span className={styles.heroLine} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}>Encontre novas</motion.span>
                <motion.span className={`${styles.heroLine} ${styles.heroHighlightLine}`} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}>oportunidades B2B</motion.span>
                <motion.span className={styles.heroLine} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}>em todo o Brasil.</motion.span>
              </motion.h1>
              <p className={styles.heroLead}>
                Acesse bases de empresas segmentadas, atualizadas e prontas para prospecção. Dados confiáveis para você atrair mais clientes e acelerar o crescimento do seu negócio.
              </p>
              <div className={styles.buttonRow} data-testid="preview-hero-actions">
                <Magnetic className={styles.magneticWrap}>
                  <a className={styles.primaryButtonLarge} href="/solicitar-planilha?source=home-v2-hero">
                    Ver planos e bases <ArrowRight size={22} aria-hidden="true" />
                  </a>
                </Magnetic>
                <a className={styles.secondaryButtonLarge} href="#amostra">
                  <Play size={19} fill="currentColor" aria-hidden="true" /> Ver como funciona
                </a>
              </div>
            </motion.div>

            <div
              className={styles.heroMap}
              aria-label="Cobertura comercial por região do Brasil"
              data-testid="preview-map"
            >
              <div className={styles.heroMapDepth}>
              {regionalReach.map((item) => {
                const regionSlug = item.region.toLowerCase().replace(/[^a-z0-9]/g, "");
                return (
                  <div
                    className={`${styles.regionTag} ${styles[`tag_${regionSlug}`] || ""}`}
                    key={item.region}
                    style={{ left: item.left, top: item.top }}
                  >
                    <span className={styles.regionAnchorDot} aria-hidden="true" />
                    <span>{item.region}</span>
                    <strong>{item.total}</strong>
                    <small>empresas</small>
                  </div>
                );
              })}
              </div>
            </div>

            <aside className={styles.heroRail} aria-hidden="true">
              <strong>Brasil em oportunidades</strong>
              <span>Dados que impulsionam o seu negócio.</span>
            </aside>
          </div>

          <StaggerGroup className={styles.heroBenefits} aria-label="Benefícios da solução">
            {heroBenefits.map((benefit) => (
              <StaggerItem key={benefit.label}>
                <span className={styles.benefitIcon}><PreviewIconView name={benefit.icon} size={27} /></span>
                <strong>{benefit.label}</strong>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <div className={styles.numbersCard} data-testid="preview-numbers">
            <div className={styles.numbersContent}>
              <p className={styles.eyebrow}>Números que impulsionam negócios</p>
              <div className={styles.metricRow}>
                {scaleMetrics.slice(0, 3).map((metric) => (
                  <div key={metric.label}>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.numbersGraphic}>
              <BarChart3 aria-hidden="true" />
              <span>Dados atualizados<br />mensalmente</span>
            </div>
            <ClipReveal className={styles.numbersImage} data-testid="preview-numbers-image">
              <Image
                src={assetPath("/preview-v2/assets/office-intelligence.webp")}
                alt="Profissionais em um escritório corporativo noturno"
                fill
                sizes="(max-width: 900px) 100vw, 46vw"
                unoptimized
              />
              <span>
                <strong>Empresas reais.<br />Oportunidades reais.</strong>
                <small>Bases segmentadas<br />para o seu mercado.</small>
              </span>
            </ClipReveal>
          </div>
        </section>

        <section className={styles.sampleSection} id="amostra" aria-labelledby="sample-title" data-testid="preview-sample">
          <div className={styles.sampleGlow} />
          <Reveal className={styles.sampleCopy}>
            <p className={styles.eyebrow}>Amostra real</p>
            <h2 id="sample-title">Veja a qualidade<br /><span>dos nossos dados</span><br />antes de decidir.</h2>
            <p className={styles.sampleLead}>
              Receba uma amostra gratuita e confira o padrão dos dados. Empresas reais, com CNPJ, segmento, cidade, porte e muito mais.
            </p>
            <div className={styles.sampleActions}>
              <Magnetic className={styles.magneticWrap}>
                <a className={styles.primaryButtonLarge} href="/solicitar-planilha?source=home-v2-amostra">
                  Receber amostra grátis <ArrowRight size={22} aria-hidden="true" />
                </a>
              </Magnetic>
              <div className={styles.sampleTrust}>
                <span><ShieldCheck aria-hidden="true" /> Sem compromisso.</span>
                <span><CreditCard aria-hidden="true" /> Sem cartão de crédito.</span>
              </div>
            </div>
          </Reveal>

          <Reveal className={styles.excelFrame} aria-label="Demonstração de planilha comercial" delay={0.08}>
            <div className={styles.excelWindow}>
              <div className={styles.excelHeader}>
                <span className={styles.excelIcon}>X</span>
                <strong>Amostra de base - indústrias em SP</strong>
                <motion.span className={styles.dataBadge} initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}><CheckCircle2 aria-hidden="true" /> Dados reais e atualizados</motion.span>
              </div>
              <div className={styles.tableScroller}>
                <table>
                  <thead><tr>{sampleColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
                  <tbody>
                    {sampleRows.map((row) => (
                      <SafeTableRow
                        key={row[0]}
                        delay={0.08 * sampleRows.indexOf(row)}
                      >
                        {row.map((cell, index) => <td key={`${row[0]}-${sampleColumns[index]}`}>{cell}</td>)}
                      </SafeTableRow>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.excelFooter}>
                <span><Download aria-hidden="true" /> Baixar amostra em Excel</span>
                <em>Mesma estrutura<br />da base completa.</em>
              </div>
            </div>
          </Reveal>
        </section>

        <section className={styles.segmentSection} id="segmentos" aria-labelledby="segments-title" data-testid="preview-segments">
          <Reveal className={styles.sectionHeadingLight}>
            <div>
              <p className={styles.eyebrow}>Segmentos em destaque</p>
              <h2 id="segments-title">Segmentos que geram oportunidades.</h2>
              <p>Escolha um segmento e receba uma base pronta para prospecção.</p>
            </div>
            <Link className={styles.linkButtonDark} href="/segmentos">
              Ver todos os segmentos <ArrowRight aria-hidden="true" />
            </Link>
          </Reveal>
          <div className={styles.segmentGrid}>
            {featuredSegments.map((segment) => (
              <InteractiveCard className={styles.segmentCard} key={segment.title} data-testid="motion-segment-card">
                <Image src={assetPath(segment.image)} alt="" fill sizes="(max-width: 800px) 100vw, 33vw" unoptimized />
                <div className={styles.segmentShade} />
                <div className={styles.segmentContent}>
                  <div className={styles.segmentTitle}>
                    <PreviewIconView name={segment.icon} size={45} />
                    <h3>{segment.title}</h3>
                  </div>
                  <p>{segment.description}</p>
                  <a href={getSegmentHref(segment)}>
                    Acessar segmento <ArrowRight aria-hidden="true" />
                  </a>
                </div>
              </InteractiveCard>
            ))}
          </div>
        </section>

        <section className={styles.plansSection} id="planos" aria-labelledby="plans-title" data-testid="preview-plans">
          <Reveal className={styles.plansHeading}>
            <div>
              <p className={styles.plansLabel}>Planos e bases</p>
              <h2 id="plans-title">Nossas bases e planos</h2>
              <p>Dados segmentados para diferentes objetivos. Escolha o plano ideal para o seu negócio.</p>
            </div>
            <div className={styles.plansPill}><Database aria-hidden="true" /> Todos os planos incluem dados atualizados e suporte</div>
          </Reveal>
          <div className={styles.planGrid}>
            {plans.map((plan) => (
              <InteractiveCard className={styles.planCard} key={plan.title} data-custom={plan.custom ? "true" : "false"}>
                <span className={styles.planIcon}><PreviewIconView name={plan.icon} size={42} /></span>
                <h3>{plan.title}</h3>
                <p>{plan.description}</p>
                <div className={`${styles.planPrice} ${plan.custom ? styles.customPrice : ""}`}>
                  <small>A partir de</small>
                  <strong>{plan.price}</strong>
                  <span>{plan.suffix}</span>
                </div>
                <a href={getPlanHref(plan, whatsappHref)}>
                  {plan.custom ? "Falar com um especialista" : "Ver detalhes"} <ArrowRight aria-hidden="true" />
                </a>
              </InteractiveCard>
            ))}
          </div>
        </section>

        {/* Bridge contextual: Prospecta Web */}
        <section className={styles.webBridgeSection} aria-label="Soluções de Presença Digital">
          <div className={styles.webBridgeInner}>
            <div className={styles.webBridgeContent}>
              <span className={styles.webBridgeBadge}>PROSPECTA WEB</span>
              <h3>Precisa também fortalecer sua presença digital?</h3>
              <p>Desenvolvemos sites e landing pages profissionais, responsivos e pensados para conversão, ajudando sua empresa a atrair mais clientes e gerar mais resultados.</p>
            </div>
            <Link className={styles.webBridgeBtn} href="/solucoes/sites-landing-pages">
              Conheça o Prospecta Web <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className={styles.testimonialSection} id="solucoes" aria-labelledby="testimonials-title" data-testid="preview-testimonials">
          <Image
            className={styles.testimonialBackground}
            src={assetPath("/preview-v2/assets/hero-national.webp")}
            alt=""
            fill
            sizes="100vw"
            unoptimized
          />
          <div className={styles.testimonialOverlay} />
          <Reveal className={styles.testimonialHeading}>
            <div>
              <p className={styles.eyebrow}>Depoimentos</p>
              <h2 id="testimonials-title">Quem usa, <span>recomenda.</span></h2>
               <p>Empresas de diferentes segmentos já aceleraram seus resultados com nossas bases.</p>
            </div>
            <div className={styles.testimonialArrows} aria-label="Navegar pelos depoimentos">
              <button type="button" aria-label="Depoimento anterior" onClick={() => changeTestimonial(-1)} disabled={testimonials.length === 0}><ArrowLeft aria-hidden="true" /></button>
              <button type="button" aria-label="Próximo depoimento" onClick={() => changeTestimonial(1)} disabled={testimonials.length === 0}><ArrowRight aria-hidden="true" /></button>
            </div>
          </Reveal>
          {testimonials.length > 0 ? <AnimatePresence mode="wait" initial={false}>
            <motion.div
              className={styles.testimonialGrid}
              key={testimonialIndex}
              initial={reducedMotion ? false : { opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, x: -22 }}
              transition={{ duration: 0.34 }}
              drag={reducedMotion ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 55) changeTestimonial(info.offset.x < 0 ? 1 : -1);
              }}
              data-testid="motion-testimonial-carousel"
            >
              {visibleTestimonials.map((testimonial) => (
                <figure key={testimonial.name}>
                  <blockquote><span>“</span>{testimonial.quote}”</blockquote>
                  <figcaption>
                    <Image src={assetPath(testimonial.avatar)} alt="" width={86} height={86} unoptimized />
                    <span><strong>{testimonial.name}</strong><small>{testimonial.role}</small><small>{testimonial.company}</small></span>
                  </figcaption>
                </figure>
              ))}
            </motion.div>
          </AnimatePresence> : (
            <div className={styles.testimonialGrid} data-testid="testimonial-demo-grid">
              {[1, 2, 3].map((item) => (
                <article className={styles.testimonialDemoCard} key={item}>
                  <span className={styles.testimonialQuote} aria-hidden="true">“</span>
                  <p>Conteúdo reservado até a autorização e conferência de um cliente real.</p>
                  <div className={styles.testimonialIdentity}>
                    <span className={styles.testimonialAvatar}><UserRound aria-hidden="true" /></span>
                    <span><strong>Depoimento em validação</strong><small>Cliente verificado</small></span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.finalCta} aria-labelledby="final-cta-title" data-testid="preview-final-cta">
          <div className={styles.finalCtaMedia}>
            <Image
              src={assetPath("/preview-v2/assets/earth-network.webp")}
              alt="Brasil visto do espaço com cidades conectadas"
              fill
              sizes="100vw"
              unoptimized
            />
          </div>
          <div className={styles.finalCtaShade} />
          <Reveal className={styles.finalCtaContent}>
            <h2 id="final-cta-title">O Brasil é cheio de<br /><span>oportunidades.</span><br />O próximo cliente<br />pode estar aqui.</h2>
            <div className={styles.finalCtaAside}>
              <p>Comece agora a explorar todo<br />o potencial do mercado brasileiro.</p>
              <div className={styles.buttonRow}>
                <Magnetic className={styles.magneticWrap}>
                  <a className={styles.primaryButtonLarge} href="/solicitar-planilha?source=home-v2-final">
                    Ver planos e bases <ArrowRight aria-hidden="true" />
                  </a>
                </Magnetic>
                <a className={styles.secondaryButtonLarge} href={whatsappHref}>
                  Falar com um especialista
                </a>
              </div>
              <div className={styles.trustRow} data-testid="preview-final-trust">
                {finalTrustPoints.map((point) => (
                  <span key={point.label}><PreviewIconView name={point.icon} size={22} />{point.label}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {includeHeaderFooter && (
        <footer className={styles.footer} id="sobre" data-testid="preview-footer">
          <Reveal className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <PnFinalLogo />
              <span>Dados que geram negócios.</span>
              <p>Dados, tecnologia e inteligência de mercado para impulsionar o crescimento da sua empresa.</p>
              <div className={styles.socials} aria-label="Canais de contato">
                <a href="/contato" aria-label="LinkedIn"><Linkedin aria-hidden="true" /></a>
                <a href="/contato" aria-label="Instagram"><Instagram aria-hidden="true" /></a>
                <a href="/contato" aria-label="YouTube"><Youtube aria-hidden="true" /></a>
              </div>
            </div>
            {footerGroups.map((group) => (
              <div className={styles.footerLinks} key={group.title}>
                <h3>{group.title}</h3>
                {group.links.map((link) => <a href={getFooterHref(link)} key={link}>{link}</a>)}
              </div>
            ))}
            <div className={styles.footerMap}>
              <Image src={assetPath("/preview-v2/assets/hero-national.webp")} alt="Mapa digital do Brasil" width={190} height={170} unoptimized />
              <strong>Mais negócios<br />para um Brasil<br />mais forte.</strong>
            </div>
          </Reveal>

          <form className={styles.newsletter} onSubmit={submitNewsletter}>
            <div><Mail aria-hidden="true" /><span>Receba insights e conteúdos<br />sobre o mercado B2B no Brasil.</span></div>
            <label className="sr-only" htmlFor="preview-newsletter">Seu melhor e-mail</label>
            <input id="preview-newsletter" type="email" required placeholder="Seu melhor e-mail" />
            <button type="submit" disabled={newsletterState !== "idle"}>
              {newsletterState === "sending" ? "Enviando..." : newsletterState === "success" ? "Inscrição simulada ✓" : "Quero receber"}
              {newsletterState === "idle" ? <ArrowRight aria-hidden="true" /> : null}
            </button>
            <small>Conteúdo relevante.<br />Sem spam.<br />Apenas oportunidades.</small>
          </form>
          <AnimatePresence>
            {showToast ? (
              <motion.span
                className={styles.newsletterSuccess}
                role="status"
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: 8 }}
              >
                <CheckCircle2 size={16} aria-hidden="true" /> Inscrição registrada apenas nesta tela.
              </motion.span>
            ) : null}
          </AnimatePresence>

          <div className={styles.footerBottom}>
            <span>© 2026 ProspectaNicho. Todos os direitos reservados.</span>
            <span>Dados. Negócios. Um Brasil com mais oportunidades.</span>
          </div>
        </footer>
      )}
    </div>
  );
}
