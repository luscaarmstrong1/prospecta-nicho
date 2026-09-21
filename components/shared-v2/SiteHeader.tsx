"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { assetPath } from "@/lib/asset-path";
import { mainNavigation } from "@/lib/site-v2/config";
import { Magnetic, useHomeMotion } from "@/components/home-v2/motion/HomeMotion";
import styles from "@/components/home-v2/home-v2.module.css";

interface SiteHeaderProps {
  currentPath?: string;
}

export function SiteHeader({ currentPath }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollFrame = useRef(0);
  const { reducedMotion } = useHomeMotion();

  useEffect(() => {
    const updateScrollState = () => {
      window.cancelAnimationFrame(scrollFrame.current);
      scrollFrame.current = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 18);
      });
    };
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.cancelAnimationFrame(scrollFrame.current);
    };
  }, []);

  return (
    <motion.header
      className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}
      data-testid="site-v2-header"
      initial={reducedMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42 }}
    >
      <div className={styles.headerInner}>
        <Link className={styles.logoLink} href="/" aria-label="ProspectaNicho, início">
          <Image
            src={assetPath("/preview-v2/assets/logo-official-transparent.png")}
            alt="ProspectaNicho"
            width={344}
            height={72}
            priority
            unoptimized
          />
        </Link>

        <nav className={styles.desktopNav} aria-label="Navegação principal">
          {mainNavigation.map((item) => {
            const isActive = currentPath === item.href || (item.href !== "/" && currentPath?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? styles.navActive : ""}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.headerActions} data-testid="site-v2-header-actions">
          <Link className={styles.loginButton} href="/admin/login">
            Entrar
          </Link>
          <Magnetic className={styles.magneticWrap}>
            <Link
              className={styles.primaryButton}
              href="/solicitar-planilha?source=header-v2"
            >
              Criar minha conta <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Magnetic>
        </div>

        <button
          className={styles.menuButton}
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={styles.mobileNav}
            initial={reducedMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
          >
            {mainNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/admin/login" onClick={() => setMenuOpen(false)}>
              Entrar
            </Link>
            <Link
              href="/solicitar-planilha?source=header-mobile-v2"
              onClick={() => setMenuOpen(false)}
            >
              Criar minha conta
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
