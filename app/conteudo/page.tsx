"use client";

// cspell:ignore datacenter

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, FileCheck, Layers, Mail, Play, Search, TrendingUp } from "lucide-react";
import { type FormEvent, useState } from "react";
import { assetPath } from "@/lib/asset-path";
import { SharedCTA } from "@/components/shared-v2/SharedCTA";
import styles from "@/components/shared-v2/site-pages.module.css";

const contentCards = [
  {
    id: "guia-prospeccao",
    tag: "GUIA",
    icon: Compass,
    title: "Guia completo de prospecção B2B",
    description: "Do planejamento ao contato: passo a passo para construir um processo de prospecção eficiente.",
    linkText: "Baixar guia",
    href: "/amostra",
    image: "/preview-v2/assets/office-meeting-team.png",
  },
  {
    id: "case-industria",
    tag: "CASE",
    icon: TrendingUp,
    title: "Como uma indústria aumentou 40% dos leads com o ProspectaNicho",
    description: "Veja como uma empresa do setor industrial estruturou sua prospecção e conquistou resultados reais em 3 meses.",
    linkText: "Ler case",
    href: "/conteudo",
    image: "/preview-v2/assets/industry-factory.png",
  },
  {
    id: "segmentacao-mercado",
    tag: "BLOG",
    icon: BookOpen,
    title: "Segmentação de mercado: o segredo para vendas mais assertivas",
    description: "Entenda como uma segmentação bem feita pode aumentar suas taxas de conversão e reduzir o ciclo de vendas.",
    linkText: "Ler artigo",
    href: "/conteudo",
    image: "/preview-v2/assets/finance-accounting.png",
  },
  {
    id: "checklist-prospeccao",
    tag: "MATERIAL GRATUITO",
    icon: FileCheck,
    title: "Checklist de prospecção B2B para sua equipe",
    description: "Um checklist prático e pronto para uso, com as principais etapas para uma prospecção mais organizada e eficiente.",
    linkText: "Baixar material",
    href: "/amostra",
    image: "/preview-v2/assets/server-datacenter.png",
  },
];

export default function ConteudoPage() {
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* HERO (1:1 COM MOCKUP 04) */}
        <section className={styles.heroSplitSection} data-testid="conteudo-hero">
          <div className={styles.heroSplitInner}>
            <div className={styles.heroTextCol}>
              <span className={styles.eyebrowTag}>CONHECIMENTO QUE GERA OPORTUNIDADES</span>
              <h1 className={styles.heroMainTitle}>
                Artigos, guias e <span className={styles.cyanHighlight}>insights</span> para você ir mais longe.
              </h1>
              <p className={styles.heroLeadText}>
                Conteúdos práticos e baseados em dados para ajudar você a prospectar melhor, entender mercados e acelerar os resultados do seu negócio.
              </p>

              {/* SEARCH INPUT */}
              <div className={styles.searchBoxWide} style={{ width: "100%", maxWidth: 500, marginBottom: "0.5rem" }}>
                <Search size={18} color="#20edf0" />
                <input
                  type="text"
                  placeholder="Busque por temas, segmentos ou palavras-chave..."
                  aria-label="Buscar conteúdo"
                />
                <button
                  type="button"
                  style={{ background: "#20edf0", border: "none", borderRadius: "6px", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <ArrowRight size={16} color="#00121f" />
                </button>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Exemplos: indústria, segmentação, prospecção, CRM, vendas B2B
              </span>
            </div>

            {/* LAPTOP DESK MOCKUP (1:1 COM O MOCKUP) */}
            <div className={styles.heroVisualCol}>
              <div style={{ position: "relative", width: "100%", maxWidth: 460, height: 300, borderRadius: "1.25rem", overflow: "hidden", border: "1px solid rgba(32, 237, 240, 0.25)" }}>
                <Image
                  src={assetPath("/preview-v2/assets/office-intelligence.webp")}
                  alt="Laptop com dados de crescimento e xícara de café"
                  fill
                  sizes="460px"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0, 12, 23, 0.85) 0%, rgba(0, 12, 23, 0.2) 60%, transparent 100%)" }} />
                <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {["MERCADOS", "ESTRATÉGIA", "VENDAS B2B", "CRESCIMENTO"].map((tag) => (
                    <span key={tag} style={{ background: "rgba(6, 22, 38, 0.8)", border: "1px solid rgba(32, 237, 240, 0.3)", borderRadius: "4px", padding: "0.2rem 0.6rem", fontSize: "0.68rem", fontWeight: 700, color: "#fff" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.floatingScriptNote} style={{ top: "-10px", right: "10px" }}>
                Mais conhecimento para grandes conquistas.
              </div>
            </div>
          </div>
        </section>

        {/* ARTIGO EM DESTAQUE (1:1 COM O MOCKUP) */}
        <section className={styles.sectionBlock} data-testid="conteudo-featured">
          <div className={styles.containerWrap}>
            <div style={{ marginBottom: "2rem" }}>
              <span className={styles.eyebrowTag}>ARTIGO EM DESTAQUE</span>
            </div>

            <article className={styles.featuredArticleEditorial}>
              <div>
                <span className={styles.articleBadgeTag}>
                  <BookOpen size={13} /> BLOG
                </span>
                <h2 className={styles.editorialHeadline}>
                  Tendências do mercado B2B para 2026: o que sua empresa precisa saber agora
                </h2>
                <p className={styles.editorialExcerpt}>
                  Um panorama completo sobre as principais tendências que estão moldando o mercado B2B no Brasil e como aproveitá-las na sua estratégia de prospecção.
                </p>
                <Link className={styles.btnPrimarySolid} href="/conteudo">
                  Ler artigo completo <ArrowRight size={16} />
                </Link>
              </div>

              <div style={{ position: "relative", width: "100%", height: 260, borderRadius: "1.2rem", overflow: "hidden", border: "1px solid rgba(32, 237, 240, 0.25)" }}>
                <Image
                  src={assetPath("/preview-v2/assets/city-sp-night.png")}
                  alt="Executivo observando tendências da cidade"
                  fill
                  sizes="400px"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
                <div style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(6, 22, 38, 0.85)", border: "1px solid rgba(32, 237, 240, 0.3)", borderRadius: "8px", padding: "0.6rem 0.8rem", fontSize: "0.72rem", color: "#fff", lineHeight: 1.4 }}>
                  <strong>TENDÊNCIAS</strong><br />INOVAÇÃO<br />MERCADOS<br />RESULTADOS
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* MAIS CONTEÚDOS PARA VOCÊ (1:1 COM O MOCKUP - 4 CARDS) */}
        <section className={styles.sectionBlockAlt} data-testid="conteudo-articles">
          <div className={styles.containerWrap}>
            <div className={styles.sectionHeaderRow}>
              <div>
                <span className={styles.eyebrowTag}>MAIS CONTEÚDOS PARA VOCÊ</span>
              </div>
              <Link className={styles.linkViewAll} href="/conteudo">
                Ver todos os conteúdos <ArrowRight size={14} />
              </Link>
            </div>

            <div className={styles.contentCardsGrid4}>
              {contentCards.map((card) => {
                return (
                  <article key={card.id} className={styles.contentCardSmall}>
                    <div className={styles.contentCardThumb}>
                      <Image
                        src={assetPath(card.image)}
                        alt={card.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                      <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem" }}>
                        <span className={styles.articleBadgeTag}>{card.tag}</span>
                      </div>
                    </div>
                    <div className={styles.contentCardBody}>
                      <h3 className={styles.contentCardTitle}>{card.title}</h3>
                      <p className={styles.contentCardSnippet}>{card.description}</p>
                      <Link className={styles.linkCardDetails} href={card.href}>
                        {card.linkText} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* NEWSLETTER (1:1 COM O MOCKUP) */}
        <section className={styles.sectionBlock} data-testid="conteudo-newsletter">
          <div className={styles.containerWrap}>
            <div className={styles.newsletterBarContainer}>
              <div>
                <span className={styles.eyebrowTag}>RECEBA NOSSOS CONTEÚDOS</span>
                <h2 className={styles.sectionHeadingH2} style={{ fontSize: "1.8rem" }}>
                  Fique por dentro das novidades do <span className={styles.cyanHighlight}>ProspectaNicho.</span>
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  Assine nossa newsletter e receba artigos, guias, cases e insights diretamente no seu e-mail.
                </p>
              </div>

              <div>
                {subscribed ? (
                  <div style={{ color: "#20edf0", fontWeight: 700, padding: "1rem", background: "rgba(32, 237, 240, 0.1)", borderRadius: "0.75rem" }}>
                    Inscrição registrada com sucesso! ✓
                  </div>
                ) : (
                  <form onSubmit={handleNewsletter}>
                    <div className={styles.newsletterInputCluster}>
                      <input
                        type="email"
                        required
                        placeholder="Seu melhor e-mail"
                        aria-label="Seu melhor e-mail"
                      />
                      <button type="submit" className={styles.btnPrimarySolid} style={{ cursor: "pointer", border: "none" }}>
                        Quero receber <ArrowRight size={16} />
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.85rem", fontSize: "0.78rem", color: "#94a3b8" }}>
                      <span>✓ Conteúdo exclusivo</span>
                      <span>✓ Sem spam</span>
                      <span>✓ Cancele quando quiser</span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FINAL SHARED CTA BANNER (1:1 COM O MOCKUP) */}
        <SharedCTA />
      </main>
    </div>
  );
}
