"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Instagram, Linkedin, Mail, Youtube } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { type FormEvent, useState } from "react";
import { PnFinalLogo } from "@/components/shared-v2/PnFinalLogo";
import { assetPath } from "@/lib/asset-path";
import { footerGroups } from "@/lib/site-v2/config";
import { Reveal, useHomeMotion } from "@/components/home-v2/motion/HomeMotion";
import styles from "@/components/home-v2/home-v2.module.css";

export function SiteFooter() {
  const [newsletterState, setNewsletterState] = useState<"idle" | "sending" | "success">("idle");
  const [showToast, setShowToast] = useState(false);
  const { reducedMotion } = useHomeMotion();

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newsletterState !== "idle") return;
    setNewsletterState("sending");

    window.setTimeout(() => {
      setNewsletterState("success");
      setShowToast(true);
      window.setTimeout(() => {
        setShowToast(false);
        setNewsletterState("idle");
      }, 4200);
    }, 450);
  };

  return (
    <footer className={styles.footer} id="site-footer" data-testid="site-v2-footer">
      <Reveal className={styles.footerTop}>
        <div className={styles.footerBrand}>
          <PnFinalLogo />
          <span>Dados que geram negócios.</span>
          <p>
            Dados, tecnologia e inteligência de mercado para impulsionar o
            crescimento da sua empresa.
          </p>
          <div className={styles.socials} aria-label="Canais de contato">
            <Link href="/contato" aria-label="LinkedIn">
              <Linkedin aria-hidden="true" />
            </Link>
            <Link href="/contato" aria-label="Instagram">
              <Instagram aria-hidden="true" />
            </Link>
            <Link href="/contato" aria-label="YouTube">
              <Youtube aria-hidden="true" />
            </Link>
          </div>
        </div>

        {footerGroups.map((group) => (
          <div className={styles.footerLinks} key={group.title}>
            <h3>{group.title}</h3>
            {group.links.map((link) => (
              <Link href={link.href} key={link.label}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}

        <div className={styles.footerMap}>
          <Image
            src={assetPath("/assets/prospecta-web/footer-globe-hd.png")}
            alt="Globo digital da ProspectaNicho"
            width={135}
            height={135}
            unoptimized
          />
          <strong>
            Mais negócios<br />para um Brasil<br />mais digital.
          </strong>
        </div>
      </Reveal>

      <form className={styles.newsletter} onSubmit={submitNewsletter}>
        <div>
          <Mail aria-hidden="true" />
          <span>
            Receba insights e conteúdos<br />sobre o mercado B2B no Brasil.
          </span>
        </div>
        <label className="sr-only" htmlFor="site-newsletter">
          Seu melhor e-mail
        </label>
        <input
          id="site-newsletter"
          type="email"
          required
          placeholder="Seu melhor e-mail"
        />
        <button type="submit" disabled={newsletterState !== "idle"}>
          {newsletterState === "sending"
            ? "Enviando..."
            : newsletterState === "success"
            ? "Inscrição registrada ✓"
            : "Quero receber"}
          {newsletterState === "idle" ? <ArrowRight aria-hidden="true" /> : null}
        </button>
        <small>
          Conteúdo relevante.<br />Sem spam.<br />Apenas oportunidades.
        </small>
      </form>

      <AnimatePresence>
        {showToast ? (
          <motion.span
            className={styles.newsletterSuccess}
            role="status"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 8 }}
          >
            <CheckCircle2 size={16} aria-hidden="true" /> Inscrição realizada com sucesso.
          </motion.span>
        ) : null}
      </AnimatePresence>

      <div className={styles.footerBottom}>
        <span>© {new Date().getFullYear()} ProspectaNicho. Todos os direitos reservados.</span>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/termos-de-uso">Termos de Uso</Link>
          <span aria-hidden="true">|</span>
          <Link href="/politica-de-privacidade">Política de Privacidade</Link>
        </div>
      </div>
      <div className={styles.footerNetworkStrip} aria-hidden="true" />
    </footer>
  );
}
