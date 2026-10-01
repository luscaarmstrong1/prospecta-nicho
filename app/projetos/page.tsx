import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { assetPath } from "@/lib/asset-path";
import { breadcrumbJsonLd, createMetadata } from "@/lib/seo";
import styles from "@/components/seo/ServiceLandingPage.module.css";

const description = "Conheça projetos digitais publicados pela Prospecta Nicho, com escopo e links verificáveis.";
export const metadata = createMetadata({ title: "Projetos digitais", description, path: "/projetos" });

export default function ProjetosPage() {
  return <div className={styles.page}><JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Projetos", path: "/projetos" }])} /><main><section className={styles.hero}><nav className={styles.breadcrumb} aria-label="Navegação estrutural"><Link href="/">Início</Link><span>/</span><span>Projetos</span></nav><span className={styles.eyebrow}>Projetos verificáveis</span><h1>Trabalho publicado, apresentado com transparência.</h1><p>{description}</p></section><section className={styles.content}><article><Image src={assetPath("/assets/prospecta-web/case-omega-imports.png")} alt="Página pública do catálogo Omega Imports" width={640} height={360} unoptimized style={{ width: "100%", height: "auto", borderRadius: 6, marginBottom: 20 }} /><h2>Omega Imports</h2><p>Catálogo digital público com experiência responsiva e apresentação organizada de produtos.</p><p style={{ marginTop: 18 }}><a href="https://omegaimports.vercel.app/" target="_blank" rel="noopener noreferrer">Visitar projeto publicado</a></p></article></section></main></div>;
}
