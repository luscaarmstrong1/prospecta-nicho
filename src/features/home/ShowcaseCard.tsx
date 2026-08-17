/* eslint-disable @next/next/no-img-element */
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { assetPath } from "@/lib/asset-path";
import type { ShowcaseItem } from "./showcase-data";

type ShowcaseCardProps = {
  item: ShowcaseItem;
};

export function ShowcaseCard({ item }: ShowcaseCardProps) {
  return (
    <Link className="showcase-card" data-segment={item.slug} href={item.href}>
      <picture className="showcase-card__media">
        <source media="(max-width: 680px)" srcSet={assetPath(item.mobileImage)} />
        <img src={assetPath(item.image)} alt={`Imagem ilustrativa da ${item.title.toLowerCase()}`} />
      </picture>
      <span className="showcase-card__veil" aria-hidden="true" />
      <span className="showcase-card__mark" aria-hidden="true">
        <img src={assetPath("/assets/brand/logo-symbol.png")} alt="" />
      </span>
      <span className="showcase-card__style">{item.style}</span>
      <span className="showcase-card__content">
        <strong>{item.title}</strong>
        <span>{item.description}</span>
        <span className="showcase-card__tags">
          {item.tags.map((tag) => (
            <em key={tag}>{tag}</em>
          ))}
        </span>
      </span>
      <span className="showcase-card__cta">
        Solicitar base
        <ArrowRight size={17} />
      </span>
    </Link>
  );
}
