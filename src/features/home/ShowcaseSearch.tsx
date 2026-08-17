import { Search } from "lucide-react";

type ShowcaseSearchProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export function ShowcaseSearch({ query, onQueryChange }: ShowcaseSearchProps) {
  return (
    <label className="showcase-search">
      <Search aria-hidden="true" size={20} />
      <span className="sr-only">Buscar bases comerciais</span>
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Buscar por segmento, cidade ou objetivo comercial..."
      />
    </label>
  );
}
