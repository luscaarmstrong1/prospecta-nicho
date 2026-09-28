"use client";

import React, { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, type LucideIcon } from "lucide-react";
import { assetPath } from "@/lib/asset-path";
import styles from "./prospecta-web.module.css";

/* --------------------------------------------------------------------------
   1. SectionBadge
   -------------------------------------------------------------------------- */
export interface SectionBadgeProps {
  children: ReactNode;
  className?: string;
}

export function SectionBadge({ children, className = "" }: SectionBadgeProps) {
  return (
    <span className={`${styles.sectionBadge} ${className}`}>
      {children}
    </span>
  );
}

/* --------------------------------------------------------------------------
   2. PrimaryButton
   -------------------------------------------------------------------------- */
export interface PrimaryButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  external?: boolean;
}

export function PrimaryButton({
  href,
  children,
  className = "",
  onClick,
  external = false,
}: PrimaryButtonProps) {
  if (external) {
    return (
      <a
        href={href}
        className={`${styles.primaryButton} ${className}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {children} <ArrowRight size={18} aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={`${styles.primaryButton} ${className}`}
      onClick={onClick}
    >
      {children} <ArrowRight size={18} aria-hidden="true" />
    </Link>
  );
}

/* --------------------------------------------------------------------------
   3. SecondaryButton
   -------------------------------------------------------------------------- */
export interface SecondaryButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  withPlayIcon?: boolean;
  external?: boolean;
}

export function SecondaryButton({
  href,
  children,
  className = "",
  onClick,
  withPlayIcon = false,
  external = false,
}: SecondaryButtonProps) {
  const content = (
    <>
      {withPlayIcon && (
        <span className={styles.secondaryButtonPlayIcon} aria-hidden="true">
          <Play size={10} fill="#09e2e8" />
        </span>
      )}
      {children}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        className={`${styles.secondaryButton} ${className}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={`${styles.secondaryButton} ${className}`}
      onClick={onClick}
    >
      {content}
    </Link>
  );
}

/* --------------------------------------------------------------------------
   4. FeatureCard (Dobra 02 - Benefícios)
   -------------------------------------------------------------------------- */
export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article className={styles.benefitCard}>
      <div className={styles.benefitIconCircle}>
        <Icon size={26} aria-hidden="true" />
      </div>
      <h3 className={styles.benefitTitle}>{title}</h3>
      <p className={styles.benefitDescription}>{description}</p>
    </article>
  );
}

/* --------------------------------------------------------------------------
   5. ServiceCard / ServiceItem (Dobra 03 - Incluso)
   -------------------------------------------------------------------------- */
export interface ServiceIncludedItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ServiceIncludedItem({
  icon: Icon,
  title,
  description,
}: ServiceIncludedItemProps) {
  return (
    <div className={styles.serviceItem}>
      <div className={styles.serviceIconWrap}>
        <Icon size={24} aria-hidden="true" />
      </div>
      <div className={styles.serviceInfo}>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   6. ProcessStep (Dobra 04 - Como Funciona)
   -------------------------------------------------------------------------- */
export interface ProcessStepProps {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ProcessStep({
  number,
  icon: Icon,
  title,
  description,
}: ProcessStepProps) {
  return (
    <div className={styles.processStep}>
      <div className={styles.processStepTop}>
        <div className={styles.processStepNumber}>{number}</div>
        <Icon size={24} className={styles.processStepIcon} aria-hidden="true" />
      </div>
      <h3 className={styles.processStepTitle}>{title}</h3>
      <p className={styles.processStepDesc}>{description}</p>
    </div>
  );
}

/* --------------------------------------------------------------------------
   7. CaseCard (Dobra 05 - Portfólio / Projetos)
   -------------------------------------------------------------------------- */
export interface CaseCardProps {
  title: string;
  image: string;
  tags: string[];
  isDemonstrative?: boolean;
}

export function CaseCard({
  title,
  image,
  tags,
  isDemonstrative = true,
}: CaseCardProps) {
  return (
    <article className={styles.caseCard}>
      <div className={styles.caseImageFrame}>
        <Image
          src={assetPath(image)}
          alt={`Demonstração visual do projeto ${title}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
        {isDemonstrative && (
          <div className={styles.caseBadgeRow}>
            <span className={styles.caseExampleTag}>Exemplo de projeto</span>
          </div>
        )}
      </div>
      <h3 className={styles.caseCardTitle}>{title}</h3>
      <div className={styles.caseTagsList}>
        {tags.map((tag) => (
          <span key={tag} className={styles.caseTagPill}>
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

/* --------------------------------------------------------------------------
   8. WebBridge (Interligação B2B)
   -------------------------------------------------------------------------- */
export function WebToB2BBridge() {
  return (
    <section className={styles.bridgeSection} aria-label="Soluções de Prospecção B2B">
      <div className={styles.container}>
        <div className={styles.bridgeCard}>
          <div className={styles.bridgeContent}>
            <span className={styles.bridgeEyebrow}>PROSPECTA DADOS</span>
            <h3 className={styles.bridgeTitle}>
              Precisa encontrar empresas para prospectar?
            </h3>
            <p className={styles.bridgeText}>
              Acesse bases de dados B2B segmentadas com filtros de CNAE, região, porte e decisores para abastecer sua equipe comercial com leads qualificados.
            </p>
          </div>
          <div className={styles.bridgeCta}>
            <Link className={styles.secondaryButton} href="/">
              Conheça nossas Bases B2B <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
