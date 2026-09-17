import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Send } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { FAQAccordion } from "@/components/FAQAccordion";
import { ProductCard } from "@/components/ProductCard";
import { getProduct, productPrimaryHref, products } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const buyHref = productPrimaryHref(product);
  const related = products.filter((item) => item.slug !== product.slug).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Produto / {product.shortName}</p>
            <h1 className="h1">{product.name}</h1>
            <p className="lead">{product.description}</p>
            <div className="price">{product.price}</div>
            <div className="btn-row" style={{ marginTop: 18 }}>
              <ButtonLink href={buyHref} variant="teal">
                <Send size={18} />
                Solicitar esta base
              </ButtonLink>
              <ButtonLink href={`/solicitar-planilha?source=produto-${product.slug}-amostra`} variant="secondary">
                Solicitar amostra
                <ArrowRight size={18} />
              </ButtonLink>
            </div>
          </div>
          <div className="hero-visual">
            <div className="dashboard">
              <div className="dash-panel"><strong>Escopo</strong><div className="bar"><span style={{ width: "80%" }} /></div></div>
              <div className="dash-panel dash-map"><span className="pin" /><span className="pin" /><span className="pin" /></div>
              <div className="dash-panel"><strong>Campos</strong><div className="bar"><span style={{ width: "65%" }} /></div></div>
              <div className="dash-panel"><strong>Entrega</strong><div className="bar"><span style={{ width: "74%" }} /></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="container card-grid">
          <article className="card">
            <h2 className="h3">Para quem é</h2>
            {product.audience.map((item) => <p className="muted" key={item}>{item}</p>)}
          </article>
          <article className="card">
            <h2 className="h3">O que pode incluir</h2>
            {product.includes.map((item) => <p className="muted" key={item}>{item}</p>)}
          </article>
          <article className="card">
            <h2 className="h3">Entrega e escopo</h2>
            <p className="muted">A base é entregue em planilha organizada. Campos e volume são confirmados antes da entrega, conforme disponibilidade e critérios contratados.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="h2">Perguntas deste produto</h2>
          <FAQAccordion items={product.faq} />
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <h2 className="h2" style={{ marginBottom: 24 }}>Produtos relacionados</h2>
          <div className="card-grid">
            {related.map((item) => <ProductCard key={item.slug} product={item} />)}
          </div>
        </div>
      </section>
    </>
  );
}
