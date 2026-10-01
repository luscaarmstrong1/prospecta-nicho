import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";
import styles from "./ServiceLandingPage.module.css";

type Section = { title: string; description: string };

export function ServiceLandingPage({
  eyebrow,
  title,
  description,
  path,
  serviceType,
  sections,
  ctaLabel,
  ctaHref,
}: {
  eyebrow: string;
  title: string;
  description: string;
  path: string;
  serviceType: string;
  sections: Section[];
  ctaLabel: string;
  ctaHref: string;
}) {
  const name = title.replace(/\.$/, "");
  return (
    <div className={styles.page}>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [serviceJsonLd({ name, description, path, serviceType }), breadcrumbJsonLd([{ name: "Início", path: "/" }, { name, path }])] }} />
      <main>
        <section className={styles.hero}>
          <nav className={styles.breadcrumb} aria-label="Navegação estrutural">
            <Link href="/">Início</Link><span aria-hidden="true">/</span><span>{name}</span>
          </nav>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </section>
        <section className={styles.content} aria-label={`Como funciona: ${name}`}>
          {sections.map((section) => <article key={section.title}><h2>{section.title}</h2><p>{section.description}</p></article>)}
        </section>
        <section className={styles.cta} aria-label="Próximo passo">
          <h2>Conecte dados, presença digital e processos para crescer com mais contexto.</h2>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </section>
      </main>
    </div>
  );
}
