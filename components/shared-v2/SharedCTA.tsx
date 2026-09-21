"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { assetPath } from "@/lib/asset-path";
import { Magnetic, Reveal, useHomeMotion } from "@/components/home-v2/motion/HomeMotion";
import styles from "@/components/home-v2/home-v2.module.css";

interface SharedCTAProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export function SharedCTA({
  title,
  subtitle,
  primaryCtaLabel = "Montar meu recorte",
  primaryCtaHref = "/solicitar-planilha?source=site-v2-cta",
  secondaryCtaLabel = "Falar com um especialista",
  secondaryCtaHref = "https://wa.me/5511999999999?text=Ol%C3%A1,%20gostaria%20de%20falar%20com%20um%20especialista%20da%20ProspectaNicho",
}: SharedCTAProps) {
  const ctaRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useHomeMotion();
  const { scrollYProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section
      ref={ctaRef}
      className={styles.finalCta}
      aria-labelledby="cta-banner-title"
      data-testid="shared-v2-cta"
    >
      <motion.div
        className={styles.finalCtaMedia}
        style={{ y: reducedMotion ? 0 : imageY }}
      >
        <Image
          src={assetPath("/preview-v2/assets/earth-network.webp")}
          alt="Brasil visto do espaço com malha de conexões"
          fill
          sizes="100vw"
          unoptimized
        />
      </motion.div>

      <motion.div
        className={styles.finalBloom}
        initial={reducedMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 1.1 }}
      />
      <div className={styles.finalCtaShade} />

      <Reveal className={styles.finalCtaContent}>
        <h2 id="cta-banner-title">
          {title || (
            <>
              O Brasil é cheio de<br />
              <span>oportunidades.</span>
              <br />
              O próximo cliente<br />
              pode estar aqui.
            </>
          )}
        </h2>

        <div className={styles.finalCtaAside}>
          <p>
            {subtitle || (
              <>
                Comece agora a explorar todo<br />
                o potencial do mercado brasileiro.
              </>
            )}
          </p>

          <div className={styles.buttonRow}>
            <Magnetic className={styles.magneticWrap}>
              <Link className={styles.primaryButtonLarge} href={primaryCtaHref}>
                {primaryCtaLabel} <ArrowRight aria-hidden="true" />
              </Link>
            </Magnetic>
            <a
              className={styles.secondaryButtonLarge}
              href={secondaryCtaHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {secondaryCtaLabel}
            </a>
          </div>

          <div className={styles.trustRow} data-testid="shared-v2-trust">
            <span>
              <CheckCircle2 size={20} color="#20edf0" aria-hidden="true" />
              Dados LGPD Auditados
            </span>
            <span>
              <ShieldCheck size={20} color="#20edf0" aria-hidden="true" />
              Garantia de Atualização
            </span>
            <span>
              <Zap size={20} color="#20edf0" aria-hidden="true" />
              Entrega Ágil
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
