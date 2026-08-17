import Link from "next/link";
import { ShowcaseCard } from "./ShowcaseCard";
import type { ShowcaseItem } from "./showcase-data";

type ShowcaseGridProps = {
  items: ShowcaseItem[];
};

export function ShowcaseGrid({ items }: ShowcaseGridProps) {
  if (items.length === 0) {
    return (
      <div className="showcase-empty" role="status">
        <p>Nenhuma base encontrada para esse termo. Você ainda pode solicitar uma base personalizada.</p>
        <Link className="button button--primary" href="/montar-minha-base">
          Montar base personalizada
        </Link>
      </div>
    );
  }

  return (
    <div className="showcase-grid" data-card-count={items.length}>
      {items.map((item) => (
        <ShowcaseCard key={item.slug} item={item} />
      ))}
    </div>
  );
}
