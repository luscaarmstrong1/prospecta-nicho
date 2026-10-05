import Link from "next/link";
import { ArrowRight, MessageCircle, Shield, TrendingUp, Zap } from "lucide-react";
import { assetPath } from "@/lib/asset-path";
import { createWhatsAppLink } from "@/lib/whatsapp";
import styles from "./contact.module.css";

interface ContactHeroProps {
  onScrollToForm?: () => void;
}

export function ContactHero({ onScrollToForm }: ContactHeroProps) {
  const specialistWhatsAppUrl = createWhatsAppLink(
    "Olá! Gostaria de falar com um especialista da ProspectaNicho sobre soluções para minha empresa."
  );

  const heroBg = assetPath("/assets/contato/hero-contato-consultant.webp");

  return (
    <section className={styles.heroSection} data-testid="contact-hero">
      <div
        className={styles.heroBgImage}
        style={{ backgroundImage: `url(${heroBg})` }}
        aria-hidden="true"
      />
      <div className={styles.heroOverlay} aria-hidden="true" />

      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrowTag}>CONTATO</span>
          <h1 className={styles.heroTitle}>
            Fale com nosso time e descubra{" "}
            <span className={styles.cyanHighlight}>novas oportunidades.</span>
          </h1>
          <p className={styles.heroLead}>
            Estamos prontos para entender o seu negócio e indicar a melhor solução para gerar mais clientes, fortalecer sua presença digital e criar resultados com dados de mercado.
          </p>

          <div className={styles.heroBtnGroup}>
            <a
              className={styles.btnPrimarySolid}
              href={specialistWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar com um especialista <ArrowRight size={16} aria-hidden="true" />
            </a>
            <Link
              className={styles.btnGhostOutline}
              href="/solucoes"
            >
              Ver nossas soluções
            </Link>
          </div>
        </div>

        {/* 4 HORIZONTAL BENEFITS BELOW HERO */}
        <div className={styles.heroBenefitsRow}>
          <div className={styles.heroBenefitItem}>
            <MessageCircle className={styles.heroBenefitIcon} size={20} />
            <span>Atendimento especializado</span>
          </div>
          <div className={styles.heroBenefitItem}>
            <Zap className={styles.heroBenefitIcon} size={20} />
            <span>Resposta rápida</span>
          </div>
          <div className={styles.heroBenefitItem}>
            <Shield className={styles.heroBenefitIcon} size={20} />
            <span>Seus dados em segurança</span>
          </div>
          <div className={styles.heroBenefitItem}>
            <TrendingUp className={styles.heroBenefitIcon} size={20} />
            <span>Foco em resultados</span>
          </div>
        </div>
      </div>
    </section>
  );
}
