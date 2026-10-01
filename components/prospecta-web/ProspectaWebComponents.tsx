"use client";

import React, { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Play, type LucideIcon } from "lucide-react";
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
   3.5. WhatsAppIcon (SVG Oficial Estilizado)
   -------------------------------------------------------------------------- */
export function WhatsAppIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="M9 10a1.5 1.5 0 0 0 2 2l1.5-1.5a1.5 1.5 0 0 1 2 0l1 1a1 1 0 0 1 0 1.5l-.5.5c-1 1-3 1-5-1s-2-4-1-5l.5-.5a1 1 0 0 1 1.5 0l1 1z" />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   3.6. ResponsiveDevicesIcon (Telas Sobrepostas)
   -------------------------------------------------------------------------- */
export function ResponsiveDevicesIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="3" width="12" height="15" rx="2" />
      <rect x="9" y="6" width="12.5" height="15" rx="2" />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   3.7. ConversionChartIcon (Barras Sólidas)
   -------------------------------------------------------------------------- */
export function ConversionChartIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="13" width="3.5" height="8" rx="1" />
      <rect x="10.25" y="8" width="3.5" height="13" rx="1" />
      <rect x="17" y="3" width="3.5" height="18" rx="1" />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   4. FeatureCard (Dobra 02 - Benefícios)
   -------------------------------------------------------------------------- */
export type IconComponent = LucideIcon | React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;

export interface FeatureCardProps {
  icon: IconComponent;
  title: string;
  description: React.ReactNode;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article className={styles.benefitCard}>
      <div className={styles.benefitIconCircle}>
        <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h3 className={styles.benefitTitle}>{title}</h3>
      <p className={styles.benefitDescription}>{description}</p>
    </article>
  );
}

/* --------------------------------------------------------------------------
   5. ServiceCard / ServiceItem (Dobra 02 - Incluso)
   -------------------------------------------------------------------------- */
export interface ServiceIncludedItemProps {
  icon: IconComponent;
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
        <Icon size={24} strokeWidth={1.9} aria-hidden="true" />
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
  href?: string;
  external?: boolean;
  alt?: string;
}

export function CaseCard({
  title,
  image,
  tags,
  href,
  external,
  alt,
}: CaseCardProps) {
  const cardBody = (
    <>
      <div className={styles.caseImageFrame}>
        <Image
          src={assetPath(image)}
          alt={alt || `Demonstração visual do projeto ${title}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
      </div>
      <div className={styles.caseCardBody}>
        <div className={styles.caseCardTitleWrap}>
          <h3 className={styles.caseCardTitle}>{title}</h3>
          {href && external && (
            <ArrowUpRight
              size={17}
              className={styles.caseExternalIcon}
              aria-hidden="true"
            />
          )}
        </div>
        <div className={styles.caseTagsList}>
          {tags.map((tag) => (
            <span key={tag} className={styles.caseTagPill}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          className={`${styles.caseCard} ${styles.caseCardClickable}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visitar o site da ${title}`}
          title={`Abrir projeto ${title}`}
        >
          {cardBody}
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={`${styles.caseCard} ${styles.caseCardClickable}`}
        aria-label={`Ver projeto ${title}`}
      >
        {cardBody}
      </Link>
    );
  }

  return (
    <article className={styles.caseCard}>
      {cardBody}
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
            <div className={styles.bridgeBadge}>PROSPECTA DADOS</div>
            <h3 className={styles.bridgeTitle}>
              Precisa encontrar empresas para prospectar?
            </h3>
            <p className={styles.bridgeDesc}>
              Acesse bases de dados B2B segmentadas com filtros de CNAE, região, porte e decisores para abastecer sua equipe comercial com leads qualificados.
            </p>
          </div>
          <Link className={styles.bridgeButton} href="/">
            Conheça nossas Bases B2B <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
