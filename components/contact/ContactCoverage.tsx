"use client";

import Image from "next/image";
import { Headphones, Target, Users } from "lucide-react";
import { assetPath } from "@/lib/asset-path";
import styles from "./contact.module.css";

export function ContactCoverage() {
  const brazilMapImg = assetPath("/images/contact/contact-brazil.webp");

  return (
    <section className={styles.coverageSection} data-testid="contact-coverage">
      <div className={styles.containerWrap}>
        <div className={styles.coverageGrid3}>
          {/* Coluna 1: Texto */}
          <div className={styles.coverageTextCol}>
            <span className={styles.eyebrowTag}>ATENDIMENTO NACIONAL</span>
            <h2 className={styles.sectionHeadingH2}>
              Atendemos empresas em{" "}
              <span className={styles.cyanHighlight}>todo o Brasil.</span>
            </h2>
            <p className={styles.sectionDesc}>
              Nosso time atua de forma remota, com atendimento para empresas de diferentes regiões e segmentos.
            </p>
          </div>

          {/* Coluna 2: Imagem do Mapa do Brasil com Conexões */}
          <div className={styles.coverageVisualCol}>
            <div className={styles.coverageVisualImage}>
              <Image
                src={brazilMapImg}
                alt="Mapa do Brasil com conexões de rede digital e presença em todo o território nacional"
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                style={{ objectFit: "cover" }}
                loading="lazy"
                unoptimized
              />
              <div className={styles.coverageVisualOverlay} aria-hidden="true" />
            </div>
          </div>

          {/* Coluna 3: 3 Benefícios Reais da Cobertura */}
          <div className={styles.coverageBenefitsCol}>
            <div className={styles.coverageBenefitItem}>
              <div className={styles.coverageBenefitIcon}>
                <Users size={22} />
              </div>
              <div>
                <h3 className={styles.coverageBenefitTitle}>Empresas de todo o país</h3>
                <p className={styles.coverageBenefitDesc}>
                  Atendemos negócios de diferentes regiões do Brasil.
                </p>
              </div>
            </div>

            <div className={styles.coverageBenefitItem}>
              <div className={styles.coverageBenefitIcon}>
                <Headphones size={22} />
              </div>
              <div>
                <h3 className={styles.coverageBenefitTitle}>Atendimento consultivo</h3>
                <p className={styles.coverageBenefitDesc}>
                  Nossa equipe entende seu cenário e indica a melhor solução.
                </p>
              </div>
            </div>

            <div className={styles.coverageBenefitItem}>
              <div className={styles.coverageBenefitIcon}>
                <Target size={22} />
              </div>
              <div>
                <h3 className={styles.coverageBenefitTitle}>Foco em resultados</h3>
                <p className={styles.coverageBenefitDesc}>
                  Mais clareza, mais oportunidades e estrutura para crescer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
