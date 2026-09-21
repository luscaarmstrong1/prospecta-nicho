"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Mail, Search, Sparkles } from "lucide-react";
import { type FormEvent, useState } from "react";
import { conteudoData } from "@/lib/site-v2/content";
import { SharedCTA } from "@/components/shared-v2/SharedCTA";
import styles from "@/components/shared-v2/site-pages.module.css";

export default function ConteudoPage() {
  const { hero, featuredArticle, articles, newsletter } = conteudoData;
  const [searchTerm, setSearchTerm] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const filteredArticles = articles.filter(
    (art) =>
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewsletter = (e: FormEvent) => {
    e.preventDefault();
    setNewsletterSubscribed(true);
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* HERO SECTION */}
        <section className={styles.pageHero} data-testid="conteudo-hero">
          <span className={styles.heroTag}>{hero.tag}</span>
          <h1 className={styles.heroTitle}>
            Artigos, guias e insights para você <span>ir mais longe</span>
          </h1>
          <p className={styles.heroSubtitle}>{hero.subtitle}</p>

          {/* SEARCH BAR */}
          <div className={styles.filterBar}>
            <Search size={20} color="#20edf0" aria-hidden="true" />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Pesquisar por assunto, outbound, cold call ou materiais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Pesquisar conteúdo"
            />
          </div>
        </section>

        {/* ARTICLES CONTENT */}
        <section className={styles.section} data-testid="conteudo-articles">
          <div className={styles.sectionInner}>
            {/* FEATURED ARTICLE */}
            {!searchTerm && (
              <article className={styles.featuredArticle}>
                <div>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
                    <span className={styles.cardBadge}>{featuredArticle.category}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#94a3b8", fontSize: "0.82rem" }}>
                      <Clock size={14} /> {featuredArticle.readTime}
                    </span>
                    <span style={{ color: "#64748b", fontSize: "0.82rem" }}>• {featuredArticle.date}</span>
                  </div>

                  <h2 style={{ fontFamily: "var(--font-sora, 'Sora', sans-serif)", fontSize: "1.8rem", color: "#fff", fontWeight: 700, marginBottom: "1rem", lineHeight: 1.25 }}>
                    {featuredArticle.title}
                  </h2>
                  <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.6, marginBottom: "1.75rem" }}>
                    {featuredArticle.excerpt}
                  </p>

                  <Link className={styles.btnPrimary} href={featuredArticle.href}>
                    Ler guia completo <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>

                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(32, 237, 240, 0.15) 0%, rgba(0, 18, 31, 0.8) 100%)",
                    border: "1px solid rgba(32, 237, 240, 0.25)",
                    borderRadius: "1rem",
                    padding: "2.5rem 2rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    minHeight: 240,
                  }}
                >
                  <BookOpen size={48} color="#20edf0" style={{ marginBottom: "1rem" }} />
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                    Inteligência Aplicada
                  </span>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", maxWidth: 280 }}>
                    Metodologias práticas validadas em centenas de operações B2B.
                  </p>
                </div>
              </article>
            )}

            {/* ARTICLES GRID */}
            <div className={styles.grid2}>
              {filteredArticles.map((art) => (
                <article key={art.id} className={styles.glassCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span className={styles.cardBadge}>{art.category}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#94a3b8", fontSize: "0.82rem" }}>
                      <Clock size={14} /> {art.readTime}
                    </span>
                  </div>

                  <h3 className={styles.cardTitle}>{art.title}</h3>
                  <p className={styles.cardDesc}>{art.excerpt}</p>

                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#64748b", fontSize: "0.82rem" }}>{art.date}</span>
                    <Link className={styles.btnOutline} href={art.href}>
                      Acessar <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* NEWSLETTER BOX */}
        <section className={styles.section} id="materiais" style={{ background: "rgba(0, 18, 31, 0.4)" }} data-testid="conteudo-newsletter">
          <div className={styles.sectionInner} style={{ maxWidth: 760, textAlign: "center" }}>
            <div
              style={{
                background: "rgba(8, 26, 44, 0.85)",
                border: "1px solid rgba(32, 237, 240, 0.22)",
                borderRadius: "1.5rem",
                padding: "3rem 2rem",
              }}
            >
              <Mail size={36} color="#20edf0" style={{ marginBottom: "1rem" }} />
              <h2 className={styles.sectionTitle} style={{ fontSize: "1.8rem" }}>
                {newsletter.title}
              </h2>
              <p className={styles.sectionSubtitle} style={{ marginBottom: "2rem" }}>
                {newsletter.description}
              </p>

              {newsletterSubscribed ? (
                <div style={{ color: "#20edf0", fontWeight: 700, padding: "1rem", background: "rgba(32, 237, 240, 0.1)", borderRadius: "0.75rem" }}>
                  Obrigado! Seu e-mail foi cadastrado com sucesso.
                </div>
              ) : (
                <form onSubmit={handleNewsletter} style={{ display: "flex", gap: "0.75rem", maxWidth: 480, margin: "0 auto", flexWrap: "wrap" }}>
                  <input
                    type="email"
                    required
                    placeholder="Seu e-mail corporativo"
                    className={styles.searchInput}
                    style={{
                      flex: 1,
                      minWidth: 240,
                      background: "rgba(0, 18, 31, 0.7)",
                      border: "1px solid rgba(32, 237, 240, 0.25)",
                      borderRadius: "0.75rem",
                      padding: "0.8rem 1rem",
                    }}
                  />
                  <button type="submit" className={styles.btnPrimary} style={{ cursor: "pointer", border: "none" }}>
                    Inscrever-se
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* FINAL SHARED CTA */}
        <SharedCTA />
      </main>
    </div>
  );
}
