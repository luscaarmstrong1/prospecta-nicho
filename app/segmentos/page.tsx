"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Filter, Search, TrendingUp } from "lucide-react";
import { useState } from "react";
import { assetPath } from "@/lib/asset-path";
import { segmentosData } from "@/lib/site-v2/content";
import { SharedCTA } from "@/components/shared-v2/SharedCTA";
import styles from "@/components/shared-v2/site-pages.module.css";

export default function SegmentosPage() {
  const { hero, segments, growthMarkets } = segmentosData;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSegments = segments.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* HERO SECTION */}
        <section className={styles.pageHero} data-testid="segmentos-hero">
          <span className={styles.heroTag}>{hero.tag}</span>
          <h1 className={styles.heroTitle}>
            Encontre oportunidades nos setores que <span>mais movem o Brasil</span>
          </h1>
          <p className={styles.heroSubtitle}>{hero.subtitle}</p>

          {/* SEARCH & FILTER BAR */}
          <div className={styles.filterBar}>
            <Search size={20} color="#20edf0" aria-hidden="true" />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por segmento, nicho ou atividade (ex: Indústria, Solar, Saúde)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar segmento"
            />
          </div>
        </section>

        {/* SEGMENTS GRID */}
        <section className={styles.section} data-testid="segmentos-grid">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Nichos em Destaque</span>
              <h2 className={styles.sectionTitle}>Principais Verticais de Negócios</h2>
              <p className={styles.sectionSubtitle}>
                Bases de dados com filtros rigorosos por faturamento, localização e decisores.
              </p>
            </div>

            <div className={styles.grid3}>
              {filteredSegments.map((seg) => (
                <article key={seg.id} className={styles.segmentCard}>
                  <div className={styles.segmentImageWrapper}>
                    <Image
                      src={assetPath(seg.image)}
                      alt={seg.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  </div>
                  <div className={styles.segmentBody}>
                    <div className={styles.segmentBadgeRow}>
                      <span className={styles.segmentTag}>{seg.category}</span>
                      <span className={styles.segmentVolume}>{seg.volume}</span>
                    </div>

                    <h3 className={styles.cardTitle}>{seg.title}</h3>
                    <p className={styles.cardDesc}>{seg.description}</p>

                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.82rem", color: "#20edf0", fontWeight: 600 }}>{seg.badge}</span>
                      <Link className={styles.btnOutline} href={seg.href}>
                        Explorar base <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* GROWTH MARKETS */}
        <section className={styles.section} style={{ background: "rgba(0, 18, 31, 0.4)" }} data-testid="segmentos-growth">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Tendências de Mercado</span>
              <h2 className={styles.sectionTitle}>Mercados com Maior Tração e Crescimento</h2>
              <p className={styles.sectionSubtitle}>
                Setores que registraram o maior número de abertura de novas empresas e captação de investimento.
              </p>
            </div>

            <div className={styles.grid3}>
              {growthMarkets.map((market) => (
                <div key={market.title} className={styles.glassCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span className={styles.cardBadge}>{market.badge}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#20edf0", fontSize: "0.85rem", fontWeight: 700 }}>
                      <TrendingUp size={16} /> {market.trend}
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{market.title}</h3>
                  <p className={styles.cardDesc}>{market.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL SHARED CTA */}
        <SharedCTA />
      </main>
    </div>
  );
}
