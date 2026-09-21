"use client";

// cspell:ignore testid
import Image from "next/image";
import { ArrowRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { assetPath } from "@/lib/asset-path";
import { previewNavigation } from "@/lib/home-v2/mock-data";
import { Magnetic, useHomeMotion } from "./motion/HomeMotion";
import styles from "./home-v2.module.css";

type HomeHeaderProps = {
  menuOpen: boolean;
  onMenuToggle: () => void;
};

export function HomeHeader({ menuOpen, onMenuToggle }: HomeHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState("#inicio");
  const scrollFrame = useRef(0);
  const { reducedMotion } = useHomeMotion();

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
    <motion.header
      className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}
      data-testid="preview-header"
      initial={reducedMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42 }}
    >
      <div className={styles.headerInner}>
        <a className={styles.logoLink} href="#inicio" aria-label="ProspectaNicho, início da página">
          <Image
            src={assetPath("/preview-v2/assets/logo-official-transparent.png")}
            alt="ProspectaNicho"
            width={344}
            height={72}
            priority
            unoptimized
          />
        </a>

        <nav className={styles.desktopNav} aria-label="Navegação principal">
          {previewNavigation.map((item) => (
            <a className={activeHref === item.href ? styles.navActive : ""} key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className={styles.headerActions} data-testid="preview-header-actions">
          <a className={styles.loginButton} href="/admin/login">Entrar</a>
          <Magnetic className={styles.magneticWrap}>
            <a className={styles.primaryButton} href="/solicitar-planilha?source=home-v2-header">
              Solicitar planilha <ArrowRight size={18} aria-hidden="true" />
            </a>
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
            <a key={item.href} href={item.href} onClick={onMenuToggle}>{item.label}</a>
          ))}
          <a href="/admin/login" onClick={onMenuToggle}>Entrar</a>
          <a href="/solicitar-planilha?source=home-v2-header-mobile" onClick={onMenuToggle}>Solicitar planilha</a>
        </motion.div>
      ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
