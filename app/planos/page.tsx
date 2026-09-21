"use client";

import Link from "next/link";
import { ArrowRight, Check, ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { planosData } from "@/lib/site-v2/content";
import { SharedCTA } from "@/components/shared-v2/SharedCTA";
import styles from "@/components/shared-v2/site-pages.module.css";

export default function PlanosPage() {
  const { hero, plans, commonBenefits, faqs } = planosData;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* HERO SECTION */}
        <section className={styles.pageHero} data-testid="planos-hero">
          <span className={styles.heroTag}>{hero.tag}</span>
          <h1 className={styles.heroTitle}>
            Escolha o <span>plano ideal</span> para a sua operação de prospecção
          </h1>
          <p className={styles.heroSubtitle}>{hero.subtitle}</p>
        </section>

        {/* PRICING CARDS */}
        <section className={styles.section} data-testid="planos-grid">
          <div className={styles.sectionInner}>
            <div className={styles.grid4}>
              {plans.map((plan) => (
                <article
                  key={plan.id}
                  className={`${styles.planCard} ${plan.popular ? styles.planCardPopular : ""}`}
                >
                  {plan.badge && <span className={styles.cardBadge}>{plan.badge}</span>}
                  <h3 className={styles.cardTitle}>{plan.title}</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", minHeight: "2.4rem" }}>
                    {plan.subtitle}
                  </p>

                  <div className={styles.planPrice}>{plan.price}</div>
                  <div className={styles.planPeriod}>{plan.period}</div>

                  <p className={styles.cardDesc}>{plan.description}</p>

                  <ul className={styles.featureList}>
                    {plan.features.map((feat) => (
                      <li key={feat}>
                        <Check size={16} aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div style={{ marginTop: "auto" }}>
                    <Link
                      className={plan.popular ? styles.btnPrimary : styles.btnOutline}
                      href={plan.ctaHref}
                      style={{ width: "100%" }}
                    >
                      {plan.ctaText}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* COMMON BENEFITS */}
        <section className={styles.section} style={{ background: "rgba(0, 18, 31, 0.4)" }} data-testid="planos-benefits">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Vantagens Inclusas</span>
              <h2 className={styles.sectionTitle}>Todas as bases acompanham padrão institucional</h2>
              <p className={styles.sectionSubtitle}>
                Segurança jurídica, clareza nos dados e formato padronizado para qualquer ferramenta.
              </p>
            </div>

            <div className={styles.grid4}>
              {commonBenefits.map((b) => (
                <div key={b.title} className={styles.glassCard} style={{ padding: "1.75rem" }}>
                  <ShieldCheck size={26} color="#20edf0" style={{ marginBottom: "1rem" }} />
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
                    {b.title}
                  </h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.5 }}>
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className={styles.section} id="faq" data-testid="planos-faq">
          <div className={styles.sectionInner} style={{ maxWidth: 860 }}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Dúvidas Frequentes</span>
              <h2 className={styles.sectionTitle}>Perguntas Frequentes sobre Nossos Planos</h2>
              <p className={styles.sectionSubtitle}>
                Tudo o que você precisa saber sobre compra, entrega e conformidade dos dados.
              </p>
            </div>

            <div>
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={faq.question} className={styles.faqItem}>
                    <button
                      className={styles.faqButton}
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={20}
                        color="#20edf0"
                        style={{
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.25s ease",
                        }}
                      />
                    </button>
                    {isOpen && <div className={styles.faqAnswer}>{faq.answer}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL SHARED CTA */}
        <SharedCTA />
      </main>
    </div>
  );
}
