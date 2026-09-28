"use client";

import Image from "next/image";
import { ArrowRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { assetPath } from "@/lib/asset-path";
import { previewNavigation } from "@/lib/preview-v2-gemini/mock-data";
import { Magnetic, useGeminiMotion } from "./GeminiMotion";
import styles from "./preview-gemini.module.css";

type GeminiHeaderProps = {
  menuOpen: boolean;
  onMenuToggle: () => void;
  onMockAction: (title: string) => void;
};

export function GeminiHeader({ menuOpen, onMenuToggle, onMockAction }: GeminiHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState("#inicio");
  const scrollFrame = useRef(0);
  const { reducedMotion } = useGeminiMotion();

  useEffect(() => {
    const updateScrollState = () => {
      window.cancelAnimationFrame(scrollFrame.current);
      scrollFrame.current = window.requestAnimationFrame(() => {
        setScrolled((current) => {
          const next = window.scrollY > 18;
          return current === next ? current : next;
        });
      });
    };
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: [0.05, 0.25, 0.5] },
    );
    previewNavigation.forEach(({ href }) => {
      const section = document.querySelector(href);
      if (section) observer.observe(section);
    });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.cancelAnimationFrame(scrollFrame.current);
      observer.disconnect();
    };
  }, []);

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}
      data-testid="preview-gemini-header"
    >
      <div className={styles.headerInner}>
        <a className={styles.logoLink} href="#inicio" aria-label="ProspectaNicho, início da prévia">
          <Image
            src={assetPath("/preview-v2-gemini/logo-official-transparent.png")}
            alt="ProspectaNicho"
            width={260}
            height={55}
            priority
            unoptimized
          />
        </a>

        <nav className={styles.desktopNav} aria-label="Navegação da prévia">
          {previewNavigation.map((item) => (
            <a
              className={activeHref === item.href ? styles.navActive : ""}
              key={item.href}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.headerActions} data-testid="preview-gemini-header-actions">
          <button
            className={styles.loginButton}
            type="button"
            onClick={() => onMockAction("Entrar")}
          >
            Entrar
          </button>
          <Magnetic>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => onMockAction("Criar minha conta")}
            >
              Criar minha conta <ArrowRight size={17} aria-hidden="true" />
            </button>
          </Magnetic>
        </div>

        <button
          className={styles.menuButton}
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={onMenuToggle}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className={styles.mobileNav}
            initial={reducedMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
          >
            {previewNavigation.map((item) => (
              <a key={item.href} href={item.href} onClick={onMenuToggle}>
                {item.label}
              </a>
            ))}
            <div className={styles.mobileNavButtons}>
              <button type="button" className={styles.loginButton} onClick={() => onMockAction("Entrar")}>
                Entrar
              </button>
              <button type="button" className={styles.primaryButton} onClick={() => onMockAction("Criar minha conta")}>
                Criar minha conta
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
