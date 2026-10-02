"use client";

import { useState } from "react";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { ContactFormCard } from "@/components/contact/ContactFormCard";
import { ContactCoverage } from "@/components/contact/ContactCoverage";
import { ContactReasons } from "@/components/contact/ContactReasons";
import styles from "@/components/contact/contact.module.css";

interface ContactViewProps {
  email: string;
}

export function ContactView({ email }: ContactViewProps) {
  const [selectedSubject, setSelectedSubject] = useState("");

  const scrollToForm = () => {
    const formEl = document.getElementById("formulario-contato");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth", block: "center" });
      const firstInput = formEl.querySelector("input, select") as HTMLElement | null;
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 350);
      }
    }
  };

  const handleSelectReason = (subject: string) => {
    setSelectedSubject(subject);
    scrollToForm();
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* 1. HERO COM BACKGROUND DE ESCRITÓRIO NOTURNO + 4 BENEFÍCIOS */}
        <ContactHero onScrollToForm={scrollToForm} />

        {/* 2. SEÇÃO PRINCIPAL DE CONTATO: INFORMAÇÕES À ESQUERDA + FORMULÁRIO À DIREITA */}
        <section className={styles.contactMainSection} data-testid="contact-main">
          <div className={styles.containerWrap}>
            <div className={styles.contactSplitGrid}>
              <ContactChannels email={email} />
              <ContactFormCard
                selectedSubject={selectedSubject}
                onSubjectChange={setSelectedSubject}
              />
            </div>
          </div>
        </section>

        {/* 3. ATENDIMENTO NACIONAL COM MAPA DO BRASIL CONECTADO */}
        <ContactCoverage />

        {/* 4. PRINCIPAIS MOTIVOS DE CONTATO (4 CARDS INTERATIVOS) */}
        <ContactReasons onSelectReason={handleSelectReason} />
      </main>
    </div>
  );
}
