import type { ShowcaseFilterId } from "./showcase-data";
import { showcaseFilters } from "./showcase-data";

type ShowcaseFiltersProps = {
  activeFilter: ShowcaseFilterId;
  onFilterChange: (filter: ShowcaseFilterId) => void;
};

export function ShowcaseFilters({ activeFilter, onFilterChange }: ShowcaseFiltersProps) {
  return (
    <div className="showcase-filters" role="list" aria-label="Filtros de bases comerciais">
      {showcaseFilters.map((filter) => (
        <button
          className="showcase-filter"
          data-active={activeFilter === filter.id}
          type="button"
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
