"use client";

import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { ShowcaseFilters } from "./ShowcaseFilters";
import { ShowcaseGrid } from "./ShowcaseGrid";
import { ShowcaseSearch } from "./ShowcaseSearch";
import type { ShowcaseFilterId } from "./showcase-data";
import { itemMatchesSearch, showcaseItems } from "./showcase-data";

export function CuratedShowcaseHero() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ShowcaseFilterId>("todos");

  const filteredItems = useMemo(
    () =>
      showcaseItems.filter((item) => {
        const filterMatches = activeFilter === "todos" || item.filters.includes(activeFilter);
        return filterMatches && itemMatchesSearch(item, query);
      }),
    [activeFilter, query],
  );

  return (
    <section className="curated-hero" data-test-id="curated-showcase-hero">
      <div className="container-wide curated-hero__inner">
        <div className="curated-hero__copy">
          <p className="eyebrow eyebrow--dark">INTELIGÊNCIA COMERCIAL B2B</p>
          <h1 className="curated-hero__title">Escolha um nicho. Receba uma base pronta para prospecção.</h1>
          <p className="curated-hero__lead">
            Explore recortes comerciais por segmento, região e perfil de empresa. Solicite uma amostra ou monte uma
            base personalizada sem passar por um fluxo longo.
          </p>
          <div className="btn-row">
            <ButtonLink href="/solicitar-planilha" variant="teal">
              Solicitar uma base
              <ArrowRight size={18} />
            </ButtonLink>
            <ButtonLink href="/produtos/amostra-gratuita" variant="secondary">
              Receber amostra grátis
            </ButtonLink>
          </div>
        </div>

        <div className="curated-hero__controls" aria-label="Explorar bases comerciais">
          <ShowcaseSearch query={query} onQueryChange={setQuery} />
          <ShowcaseFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        <ShowcaseGrid items={filteredItems} />
      </div>
    </section>
  );
}
