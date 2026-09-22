"use client";

// cspell:ignore datacenter

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calculator, ChevronDown, Cpu, Factory, Heart, Megaphone, Search, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { assetPath } from "@/lib/asset-path";
import styles from "./site-pages.module.css";

const segmentCards = [
  {
    id: "agencias",
    icon: Megaphone,
    title: "Agências",
    description: "Marketing, publicidade e comunicação digital.",
    image: "/preview-v2/assets/segment-agencias.webp",
    href: "/solicitar-planilha?segmento=agencias",
  },
  {
    id: "contabilidades",
    icon: Calculator,
    title: "Contabilidades",
    description: "Escritórios contábeis e serviços financeiros.",
    image: "/preview-v2/assets/finance-accounting.png",
    href: "/solicitar-planilha?segmento=contabilidades",
  },
  {
    id: "energia-solar",
    icon: Sun,
    title: "Energia Solar",
    description: "Empresas de energia solar e soluções sustentáveis.",
    image: "/preview-v2/assets/solar-energy.png",
    href: "/solicitar-planilha?segmento=energia-solar",
  },
  {
    id: "industria",
    icon: Factory,
    title: "Indústria",
    description: "Indústrias, equipamentos e setor manufatureiro.",
    image: "/preview-v2/assets/industry-factory.png",
    href: "/solicitar-planilha?segmento=industria",
  },
  {
    id: "tecnologia",
    icon: Cpu,
    title: "Tecnologia",
    description: "Software, TI e soluções tecnológicas.",
    image: "/preview-v2/assets/server-datacenter.png",
    href: "/solicitar-planilha?segmento=tecnologia",
  },
  {
    id: "saude",
    icon: Heart,
    title: "Saúde",
    description: "Clínicas, hospitais e serviços de saúde.",
    image: "/preview-v2/assets/healthcare-hospital.png",
    href: "/solicitar-planilha?segmento=saude",
  },
];

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function SegmentosExplorer() {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearch(query);
  const visibleCards = useMemo(
    () => segmentCards.filter((card) => normalizeSearch(`${card.title} ${card.description}`).includes(normalizedQuery)),
    [normalizedQuery],
  );

  return (
    <>
      <div className={styles.segmentSearchFilterCluster}>
        <label className={styles.searchBoxWide}>
          <Search size={18} color="#20edf0" aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar segmento (ex.: contabilidade, saúde, indústria...)"
            aria-label="Buscar segmento"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className={styles.filterSelectBtn}>
          <span>Todas as regiões</span>
          <ChevronDown size={16} aria-hidden="true" />
        </div>

        <div className={styles.filterSelectBtn}>
          <span>Ordenar por relevância</span>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.segmentPhotosGrid} aria-live="polite">
        {visibleCards.map((card) => {
          const IconComp = card.icon;
          return (
            <article key={card.id} className={styles.segmentPhotoCard}>
              <div className={styles.segmentPhotoThumb}>
                <Image
                  src={assetPath(card.image)}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              </div>
              <div className={styles.segmentPhotoContent}>
                <div className={styles.segmentCardIconRow}>
                  <IconComp size={18} aria-hidden="true" />
                  <h3 className={styles.segmentCardHeading}>{card.title}</h3>
                </div>
                <p className={styles.segmentCardParagraph}>{card.description}</p>
                <Link className={styles.linkCardDetails} href={card.href}>
                  Ver empresas <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {visibleCards.length === 0 && (
        <p role="status" className={styles.segmentEmptyState}>
          Nenhum segmento encontrado. Tente outro termo.
        </p>
      )}
    </>
  );
}
