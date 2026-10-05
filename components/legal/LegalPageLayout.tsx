"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { assetPath } from "@/lib/asset-path";
import styles from "./legal-page.module.css";

export interface LegalSectionItem {
  id: string;
  number: string;
  title: string;
  content: React.ReactNode;
}

export interface LegalPageLayoutProps {
  eyebrow: string;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  artworkSrc: string;
  artworkAlt: string;
  breadcrumbLabel: string;
  sections: LegalSectionItem[];
  updatedAt: string;
  crossLinkText: string;
  crossLinkHref: string;
  crossLinkLabel: string;
}

export function LegalPageLayout({
  eyebrow,
  titlePrefix,
  titleHighlight,
  subtitle,
  artworkSrc,
  artworkAlt,
  breadcrumbLabel,
  sections,
  updatedAt,
  crossLinkText,
  crossLinkHref,
  crossLinkLabel,
}: LegalPageLayoutProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || "");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "-120px 0px -65% 0px",
      threshold: 0,
    });

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
      setMobileTocOpen(false);
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <div className={styles.legalPageWrapper}>
      {/* 1. HERO */}
      <section className={styles.legalHero} aria-labelledby="legal-hero-title">
        <div className={styles.legalHeroContainer}>
          <div className={styles.legalHeroLeft}>
            <span className={styles.legalEyebrow}>{eyebrow}</span>
            <h1 id="legal-hero-title" className={styles.legalHeroTitle}>
              {titlePrefix}{" "}
              <span className={styles.cyanHighlight}>{titleHighlight}</span>
            </h1>
            <p className={styles.legalHeroSubtitle}>{subtitle}</p>
          </div>
          <div className={styles.legalHeroRight}>
            <div className={styles.legalHeroArtworkWrap}>
              <Image
                src={assetPath(artworkSrc)}
                alt={artworkAlt}
                width={660}
                height={304}
                priority
                className={styles.legalHeroArtwork}
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. BREADCRUMB */}
      <nav className={styles.breadcrumbBar} aria-label="Navegação estrutural">
        <div className={styles.breadcrumbContainer}>
          <Link href="/" className={styles.breadcrumbLink}>
            Início
          </Link>
          <ChevronRight size={14} className={styles.breadcrumbSeparator} aria-hidden="true" />
          <span className={styles.breadcrumbCurrent} aria-current="page">
            {breadcrumbLabel}
          </span>
        </div>
      </nav>

      {/* 3. MAIN CONTENT CONTAINER */}
      <section className={styles.legalMainSection}>
        <div className={styles.legalContentContainer}>
          {/* SIDEBAR DESKTOP */}
          <aside className={styles.legalSidebar} aria-label="Índice da página">
            <div className={styles.sidebarTitle}>Índice desta página</div>
            <ul className={styles.sidebarNavList}>
              {sections.map((sec) => {
                const isActive = activeId === sec.id;
                return (
                  <li key={sec.id} className={styles.sidebarNavItem}>
                    <a
                      href={`#${sec.id}`}
                      onClick={(e) => scrollToSection(e, sec.id)}
                      className={`${styles.sidebarNavLink} ${
                        isActive ? styles.sidebarNavLinkActive : ""
                      }`}
                    >
                      <span className={styles.sidebarItemNumber}>{sec.number}.</span>
                      <span>{sec.title}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* MAIN ARTICLE */}
          <main className={styles.legalArticle}>
            {/* MOBILE ACCORDION TOC */}
            <div className={styles.mobileTocWrap}>
              <button
                type="button"
                className={styles.mobileTocToggle}
                onClick={() => setMobileTocOpen((prev) => !prev)}
                aria-expanded={mobileTocOpen}
              >
                <span>Índice desta página</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: mobileTocOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s ease",
                  }}
                  aria-hidden="true"
                />
              </button>
              {mobileTocOpen && (
                <div className={styles.mobileTocContent}>
                  {sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={(e) => scrollToSection(e, sec.id)}
                      className={`${styles.sidebarNavLink} ${
                        activeId === sec.id ? styles.sidebarNavLinkActive : ""
                      }`}
                    >
                      <span className={styles.sidebarItemNumber}>{sec.number}.</span>
                      <span>{sec.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.legalMetaRow}>
              <span>Documento oficial de conformidade jurídica da Prospecta Nicho</span>
              <span>
                <strong>Última atualização:</strong> {updatedAt}
              </span>
            </div>

            {sections.map((sec) => (
              <article key={sec.id} id={sec.id} className={styles.legalSection}>
                <h2 className={styles.legalSectionTitle}>
                  <span className={styles.legalSectionNumber}>{sec.number}.</span>
                  <span>{sec.title}</span>
                </h2>
                {sec.content}
              </article>
            ))}

            <div className={styles.legalCrossLinkBox}>
              <span>{crossLinkText}</span>
              <Link href={crossLinkHref} className={styles.crossLink}>
                {crossLinkLabel}
              </Link>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
