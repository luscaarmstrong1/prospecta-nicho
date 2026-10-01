"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail } from "lucide-react";
import { PnFinalLogo } from "@/components/shared-v2/PnFinalLogo";
import { assetPath } from "@/lib/asset-path";
import { footerGroups } from "@/lib/site-v2/config";
import { Reveal } from "@/components/home-v2/motion/HomeMotion";
import styles from "@/components/home-v2/home-v2.module.css";

export function SiteFooter() {
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
          <a href="mailto:prospectanicho@gmail.com">prospectanicho@gmail.com</a>
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
            src={assetPath("/assets/prospecta-web/footer-globe-clean.png")}
            alt="Globo digital da ProspectaNicho"
            width={140}
            height={140}
            unoptimized
          />
          <strong>
            MAIS<br />NEGÓCIOS<br />PARA UM<br />BRASIL<br />MAIS<br />FORTE.
          </strong>
        </div>
      </Reveal>

      <div className={styles.newsletter}>
        <div>
          <Mail aria-hidden="true" />
          <span>
            Receba insights e conteúdos<br />sobre o mercado B2B no Brasil.
          </span>
        </div>
        <span>Conteúdos em preparação. Fale com a equipe para receber novidades.</span>
        <Link className={styles.newsletterSubmit} href="/contato">
          Entrar em contato <ArrowRight aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.footerBottom}>
        <span>© {new Date().getFullYear()} ProspectaNicho. Todos os direitos reservados.</span>
        <span>Dados. Negócios. Um Brasil com mais oportunidades.</span>
      </div>
    </footer>
  );
}
