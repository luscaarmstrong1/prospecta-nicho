import { ArrowRight, DatabaseZap, Gift, Send } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { ProductVisual } from "@/components/ProductVisual";
import type { Product } from "@/lib/site";
import { productHref, productPrimaryHref } from "@/lib/site";

export function ProductCard({ product }: { product: Product }) {
  const buyHref = productPrimaryHref(product);
  const VisualIcon = product.slug === "amostra-gratuita" ? Gift : DatabaseZap;

  return (
    <article className="card product-card">
      <ProductVisual icon={VisualIcon} variant="custom" />
      <div>
        {product.badge ? <span className="badge">{product.badge}</span> : null}
        <h3 className="h3" style={{ marginTop: 14 }}>{product.name}</h3>
        <p className="muted">{product.description}</p>
      </div>
      <div>
        <div className="price">{product.price}</div>
        <div className="btn-row" style={{ marginTop: 16 }}>
          <ButtonLink href={buyHref} variant="teal">
            <Send size={18} />
            Solicitar esta base
          </ButtonLink>
          <ButtonLink href={productHref(product)} variant="secondary">
            Ver o que vem na base
            <ArrowRight size={18} />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
