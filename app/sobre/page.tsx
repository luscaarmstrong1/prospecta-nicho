import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Conheça a ProspectaNicho e sua forma de transformar critérios comerciais em bases B2B segmentadas.",
};

export default function SobrePage() {
  return (
    <>
      <section className="hero">
        <div className="container-wide">
          <p className="eyebrow">Sobre a ProspectaNicho</p>
          <h1 className="h1">Empresas no momento certo para a venda certa.</h1>
          <p className="lead">
            A ProspectaNicho transforma critérios comerciais em recortes de empresas prontos para prospecção, com foco
            em clareza, disponibilidade real de dados empresariais e uso responsável.
          </p>
        </div>
      </section>
      <section className="section section--light">
        <div className="container-wide feature-grid">
          <article className="card">
            <h2 className="h3">Critério antes da lista</h2>
            <p className="muted">O recorte é definido antes da entrega, evitando listas genéricas e pouco úteis.</p>
          </article>
          <article className="card">
            <h2 className="h3">Dados empresariais</h2>
            <p className="muted">A plataforma prioriza informações comerciais públicas, minimização e revisão quando necessário.</p>
          </article>
          <article className="card">
            <h2 className="h3">Entrega prática</h2>
            <p className="muted">As bases são organizadas para Excel, CSV ou Google Sheets, conforme escopo aprovado.</p>
          </article>
          <article className="card">
            <h2 className="h3">Validação humana</h2>
            <p className="muted">Bases personalizadas passam por análise de filtros, volume e disponibilidade antes da cobrança.</p>
          </article>
        </div>
      </section>
      <section className="section final-cta">
        <div className="container-reading">
          <h2 className="h2">Monte um recorte com mais contexto.</h2>
          <p className="lead">Defina público, região, período, porte e campos desejados para validar a melhor base.</p>
          <div className="btn-row">
            <ButtonLink href="/solicitar-planilha?source=sobre-base" variant="teal">Montar minha base</ButtonLink>
            <ButtonLink href="/solicitar-planilha?source=sobre-amostra" variant="secondary">Receber amostra</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
