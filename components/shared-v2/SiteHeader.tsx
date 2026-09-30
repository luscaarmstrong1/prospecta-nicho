"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PnFinalLogo } from "@/components/shared-v2/PnFinalLogo";
import { assetPath } from "@/lib/asset-path";
import { mainNavigation, solutionsDropdown } from "@/lib/site-v2/config";
import { Magnetic, useHomeMotion } from "@/components/home-v2/motion/HomeMotion";
import { createWhatsAppLink } from "@/lib/whatsapp";
import styles from "@/components/home-v2/home-v2.module.css";

interface SiteHeaderProps {
  currentPath?: string;
  variant?: "default" | "prospectaWeb";
}

const prospectaWebNavigation = [
  { label: "Início", href: "/" },
  { label: "Serviços", href: "/solucoes", hasDropdown: true },
  { label: "Cases", href: "#projetos" },
  { label: "Blog", href: "/conteudo" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export function SiteHeader({ currentPath, variant }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSolucoesOpen, setMobileSolucoesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollFrame = useRef(0);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const { reducedMotion } = useHomeMotion();

  const isProspectaWeb =
    variant === "prospectaWeb" ||
    currentPath === "/solucoes/sites-landing-pages" ||
    currentPath === "/prospecta-web";
  const navItems = isProspectaWeb ? prospectaWebNavigation : mainNavigation;

  const specialistWhatsAppUrl = createWhatsAppLink(
    "Olá! Gostaria de falar com um especialista da ProspectaNicho sobre soluções para minha empresa."
  );

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

  const handleMouseEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 180);
  };

  return (
    <motion.header
      className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}
      data-testid="site-v2-header"
      initial={reducedMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42 }}
    >
      <div
        className={`${styles.headerInner} ${
          isProspectaWeb ? styles.headerInnerProspectaWeb : ""
        }`}
      >
        <Link
          className={`${styles.logoLink} ${
            isProspectaWeb ? styles.logoLinkProspectaWeb : ""
          }`}
          href="/"
          aria-label="ProspectaNicho, início"
        >
          {isProspectaWeb ? (
            <Image
              src={assetPath("/assets/prospecta-web/logo-header-prospecta-web.png")}
              alt="ProspectaNicho"
              width={522}
              height={82}
              priority
              className={styles.logoImgProspectaWeb}
              unoptimized
            />
          ) : (
            <PnFinalLogo priority />
          )}
        </Link>

        <nav className={styles.desktopNav} aria-label="Navegação principal">
          {navItems.map((item) => {
            if (item.hasDropdown) {
              const isSolucoesActive =
                currentPath === "/solucoes" ||
                currentPath?.startsWith("/solucoes") ||
                currentPath === "/prospecta-web";

              return (
                <div
                  key={item.href}
                  className={styles.navDropdownWrap}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    className={`${styles.navDropdownButton} ${
                      isSolucoesActive ? styles.navActive : ""
                    }`}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                  >
                    <span>{item.label}</span>
                    <ChevronDown size={14} aria-hidden="true" />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        className={styles.navDropdownPanel}
                        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reducedMotion ? undefined : { opacity: 0, y: 4 }}
                        transition={{ duration: 0.18 }}
                        role="menu"
                      >
                        {solutionsDropdown.map((subItem) => {
                          const isSubActive =
                            (subItem.href === "/" && currentPath === "/") ||
                            (subItem.href !== "/" && currentPath === subItem.href);

                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              role="menuitem"
                              className={`${styles.navDropdownItem} ${
                                isSubActive ? styles.navDropdownItemActive : ""
                              }`}
                              onClick={() => setDropdownOpen(false)}
                            >
                              <strong className={styles.navDropdownItemTitle}>
                                {subItem.title}
                              </strong>
                              <span className={styles.navDropdownItemSubtitle}>
                                {subItem.subtitle}
                              </span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            const isActive =
              item.href === "/"
                ? currentPath === "/"
                : currentPath === item.href || (item.href !== "/" && currentPath?.startsWith(item.href));

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
          <Magnetic className={styles.magneticWrap}>
            <a
              className={styles.headerSpecialistBtn}
              href={specialistWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar com um especialista <ArrowRight size={16} aria-hidden="true" />
            </a>
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
            {navItems.map((item) => {
              if (item.hasDropdown) {
                return (
                  <div key={item.href} style={{ width: "100%" }}>
                    <button
                      type="button"
                      onClick={() => setMobileSolucoesOpen((prev) => !prev)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        background: "transparent",
                        border: 0,
                        color: "#ffffff",
                        padding: "10px 0",
                        fontSize: "1rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={16}
                        style={{
                          transform: mobileSolucoesOpen ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </button>
                    {mobileSolucoesOpen && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          paddingLeft: "12px",
                          marginBottom: "12px",
                          borderLeft: "2px solid rgba(9, 226, 232, 0.3)",
                        }}
                      >
                        {solutionsDropdown.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setMenuOpen(false)}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              padding: "6px 0",
                            }}
                          >
                            <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff" }}>
                              {sub.title}
                            </span>
                            <span style={{ fontSize: "0.78rem", color: "#a8d2e1" }}>
                              {sub.subtitle}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}

            <a
              className={styles.headerSpecialistBtn}
              href={specialistWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }}
            >
              Falar com um especialista <ArrowRight size={16} aria-hidden="true" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
