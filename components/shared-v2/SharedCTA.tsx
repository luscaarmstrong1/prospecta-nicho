"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { assetPath } from "@/lib/asset-path";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { Magnetic, Reveal, useHomeMotion } from "@/components/home-v2/motion/HomeMotion";
import styles from "@/components/shared-v2/site-pages.module.css";

interface SharedCTAProps {
  titlePrimary?: React.ReactNode;
  titleSecondary?: React.ReactNode;
  titleTertiary?: React.ReactNode;
  asideHeadline?: React.ReactNode;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  badgeText1?: string;
  badgeText2?: string;
  badgeText3?: string;
}

export function SharedCTA({
  titlePrimary = "Mais empresas.",
  titleSecondary = "Mais oportunidades.",
  titleTertiary = "Mais resultados.",
  asideHeadline = "Pronto para acelerar sua prospecção?",
  primaryCtaLabel = "Falar com um especialista",
  primaryCtaHref = createWhatsAppLink(
    "Olá, gostaria de falar com um especialista da ProspectaNicho.",
  ),
  secondaryCtaLabel = "Começar agora",
  secondaryCtaHref = "/solicitar-planilha?source=site-v2-cta",
  badgeText1 = "Sem cartão de crédito",
  badgeText2 = "Amostra gratuita",
  badgeText3 = "Ativação rápida",
}: SharedCTAProps) {
  const ctaRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useHomeMotion();
  const { scrollYProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  return (
    <section
      ref={ctaRef}
      className={styles.ctaSection}
      aria-labelledby="cta-banner-title"
      data-testid="shared-v2-cta"
    >
      <motion.div
        className={styles.ctaMedia}
        style={{ y: reducedMotion ? 0 : imageY }}
      >
        <Image
          src={assetPath("/preview-v2/assets/earth-brazil-space.png")}
          alt="Brasil iluminado visto do espaço com conexões"
          fill
          sizes="100vw"
          priority={false}
          unoptimized
        />
      </motion.div>

      <div className={styles.ctaShade} />
      <div className={styles.ctaBloom} />

      <div className={styles.ctaContent}>
        <div className={styles.ctaLeft}>
          <h2 id="cta-banner-title" className={styles.ctaBigHeading}>
            {titlePrimary && <span>{titlePrimary}</span>}
            {titleSecondary && <span>{titleSecondary}</span>}
            {titleTertiary && <span className={styles.ctaCyanText}>{titleTertiary}</span>}
          </h2>
        </div>

        <div className={styles.ctaRight}>
          <p className={styles.ctaAsideHeadline}>{asideHeadline}</p>

          <div className={styles.ctaButtonGroup}>
            <Magnetic className={styles.magneticWrap}>
              <a
                className={styles.ctaBtnSpecialist}
                href={primaryCtaHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {primaryCtaLabel} <ArrowRight size={18} aria-hidden="true" />
              </a>
            </Magnetic>
            <Link className={styles.ctaBtnStart} href={secondaryCtaHref}>
              {secondaryCtaLabel} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.ctaBadgeRow} data-testid="shared-v2-trust">
            <span>
              <CheckCircle2 size={16} color="#20edf0" aria-hidden="true" />
              {badgeText1}
            </span>
            <span>
              <ShieldCheck size={16} color="#20edf0" aria-hidden="true" />
              {badgeText2}
            </span>
            <span>
              <Zap size={16} color="#20edf0" aria-hidden="true" />
              {badgeText3}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
