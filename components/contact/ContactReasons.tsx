"use client";

import { ArrowUpRight, BarChart3, Handshake, Monitor, Settings } from "lucide-react";
import styles from "./contact.module.css";

interface ContactReasonsProps {
  onSelectReason?: (subject: string) => void;
}

const contactReasons = [
  {
    id: "suporte",
    title: "Suporte",
    desc: "Dúvidas sobre a plataforma, acesso ou funcionalidades.",
    subject: "Suporte",
    icon: Settings,
  },
  {
    id: "parcerias",
    title: "Parcerias",
    desc: "Seja um parceiro da Prospecta Nicho.",
    subject: "Parcerias",
    icon: Handshake,
  },
  {
    id: "sites",
    title: "Sites e Landing Pages",
    desc: "Solicite um orçamento para o seu projeto.",
    subject: "Sites e Landing Pages",
    icon: Monitor,
  },
  {
    id: "dados",
    title: "Dados e Leads",
    desc: "Tire dúvidas sobre nossos planos e bases de dados.",
    subject: "Leads B2B",
    icon: BarChart3,
  },
];

export function ContactReasons({ onSelectReason }: ContactReasonsProps) {
  const handleClick = (subject: string) => {
    if (onSelectReason) {
      onSelectReason(subject);
    }
  };

  return (
    <section className={styles.reasonsSection} data-testid="contact-reasons">
      <div className={styles.containerWrap}>
        <div className={styles.reasonsHeader}>
          <span className={styles.eyebrowTag}>PRINCIPAIS MOTIVOS DE CONTATO</span>
          <h2 className={styles.sectionHeadingH2}>
            Como podemos <span className={styles.cyanHighlight}>ajudar?</span>
          </h2>
        </div>

        <div className={styles.reasonsGrid4}>
          {contactReasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <button
                type="button"
                key={reason.id}
                className={styles.reasonCard}
                onClick={() => handleClick(reason.subject)}
                aria-label={`Selecionar motivo ${reason.title}`}
              >
                <div className={styles.reasonCardTop}>
                  <div className={styles.reasonIconWrap}>
                    <Icon size={24} />
                  </div>
                  <ArrowUpRight className={styles.reasonArrow} size={20} />
                </div>
                <h3 className={styles.reasonTitle}>{reason.title}</h3>
                <p className={styles.reasonDesc}>{reason.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
