import type { Metadata } from "next";
import { LegalPageLayout, type LegalSectionItem } from "@/components/legal/LegalPageLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/lib/site";
import styles from "@/components/legal/legal-page.module.css";

export const metadata: Metadata = {
  title: "Termos de Uso | Prospecta Nicho",
  description:
    "Consulte os Termos de Uso da Prospecta Nicho e conheça as condições aplicáveis à utilização de nossos serviços e plataformas.",
  alternates: {
    canonical: "https://prospectanicho.app/termos-de-uso/",
  },
  openGraph: {
    title: "Termos de Uso | Prospecta Nicho",
    description:
      "Regras e condições para utilização dos serviços e plataformas da Prospecta Nicho.",
    url: "https://prospectanicho.app/termos-de-uso/",
    type: "website",
  },
};

const termsSections: LegalSectionItem[] = [
  {
    id: "aceitacao-dos-termos",
    number: "1",
    title: "Aceitação dos termos",
    content: (
      <>
        <p className={styles.legalParagraph}>
          Ao acessar, navegar ou utilizar o site, as ferramentas e as soluções oferecidas pela <strong>Prospecta Nicho</strong> (https://prospectanicho.app), você concorda integralmente com estes <strong>Termos de Uso</strong> e com a nossa <strong>Política de Privacidade</strong>. Caso não concorde com qualquer disposição aqui estabelecida, solicitamos que interrompa imediatamente o uso de nossos serviços e plataformas.
        </p>
        <p className={styles.legalParagraph}>
          Estes Termos regulam a relação entre você (doravante denominado “Usuário” ou “Cliente”) e a Prospecta Nicho no âmbito da prestação de serviços digitais e soluções comerciais no Brasil.
        </p>
      </>
    ),
  },
  {
    id: "sobre-a-plataforma",
    number: "2",
    title: "Sobre a plataforma",
    content: (
      <>
        <p className={styles.legalParagraph}>
          A Prospecta Nicho é uma plataforma especializada no desenvolvimento de soluções de inteligência de mercado, presença digital e aceleração comercial B2B, com foco em nichos específicos. Nossas principais frentes de atuação incluem:
        </p>
        <ul className={styles.legalList}>
          <li className={styles.legalListItem}>
            <strong>Sites &amp; Landing Pages:</strong> concepção, design e desenvolvimento de páginas web profissionais responsivas focadas em posicionamento de marca e conversão comercial.
          </li>
          <li className={styles.legalListItem}>
            <strong>Leads B2B &amp; Inteligência Comercial:</strong> estruturação de recortes qualificados de empresas ativas a partir de parâmetros públicos (segmentos, CNAE, cidades, porte e data de abertura) para subsidiar estratégias de prospecção ativa.
          </li>
          <li className={styles.legalListItem}>
            <strong>Automação Comercial:</strong> integração de processos, fluxos de atendimento e ferramentas de produtividade para equipes de vendas.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "cadastro-e-conta",
    number: "3",
    title: "Cadastro e conta",
    content: (
      <>
        <p className={styles.legalParagraph}>
          Para solicitar orçamentos, projetos ou bases personalizadas, o Usuário compromete-se a fornecer informações verídicas, exatas, atuais e completas, responsabilizando-se civil e criminalmente pela veracidade dos dados informados.
        </p>
        <p className={styles.legalParagraph}>
          Caso venha a utilizar acessos com credenciais restritas, o Usuário é o único responsável pela guarda, sigilo e uso adequado de suas chaves e senhas, devendo notificar imediatamente a Prospecta Nicho em caso de suspeita de violação ou acesso não autorizado.
        </p>
      </>
    ),
  },
  {
    id: "uso-adequado",
    number: "4",
    title: "Uso adequado",
    content: (
      <>
        <p className={styles.legalParagraph}>
          Você concorda em utilizar a plataforma de forma ética, legítima, proporcional e em estrita conformidade com estes Termos e com a legislação brasileira vigente, comprometendo-se a <strong>não</strong>:
        </p>
        <ul className={styles.legalList}>
          <li className={styles.legalListItem}>
            Utilizar os serviços para envio de comunicações abusivas, enganosas, assédio comercial desenfreado ou práticas vedadas pelo Marco Civil da Internet (Lei nº 12.965/2014);
          </li>
          <li className={styles.legalListItem}>
            Violar direitos de propriedade intelectual da Prospecta Nicho ou de terceiros;
          </li>
          <li className={styles.legalListItem}>
            Tentar contornar mecanismos de autenticação, explorar falhas ou acessar áreas restritas do servidor e bancos de dados;
          </li>
          <li className={styles.legalListItem}>
            Interferir no tráfego, integridade ou infraestrutura da plataforma através de vírus, scripts maliciosos ou ataques de sobrecarga.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "planos-e-pagamentos",
    number: "5",
    title: "Planos e pagamentos",
    content: (
      <>
        <p className={styles.legalParagraph}>
          O acesso a determinados serviços, projetos de desenvolvimento e bases sob medida está condicionado à contratação formal de planos ou propostas comerciais personalizadas.
        </p>
        <p className={styles.legalParagraph}>
          Valores, condições de pagamento, cronogramas de entrega e entregáveis específicos são expressamente acordados na proposta comercial, checkout ou instrumento contratual correspondente. O atraso ou inadimplemento financeiro poderá acarretar a suspensão temporária dos serviços ou cancelamento do fornecimento contratado.
        </p>
      </>
    ),
  },
  {
    id: "propriedade-intelectual",
    number: "6",
    title: "Propriedade intelectual",
    content: (
      <>
        <p className={styles.legalParagraph}>
          Todo o conteúdo exibido na plataforma — incluindo a marca Prospecta Nicho, logotipos, código-fonte, arquitetura de software, layouts originais, textos institucionais, ícones e design gráfico — é de propriedade exclusiva da Prospecta Nicho ou de seus licenciantes, estando protegido pela legislação de direitos autorais e propriedade industrial (Lei nº 9.610/1998 e Lei nº 9.279/1996).
        </p>
        <p className={styles.legalParagraph}>
          É expressamente vedada a reprodução, cópia, distribuição, engenharia reversa ou comercialização não autorizada de qualquer elemento exclusivo da plataforma sem prévia anuência por escrito da Prospecta Nicho. Nos projetos de desenvolvimento de sites, a titularidade dos conteúdos, logos e materiais fornecidos pelo cliente permanece com o próprio cliente.
        </p>
      </>
    ),
  },
  {
    id: "limitacao-de-responsabilidade",
    number: "7",
    title: "Limitação de responsabilidade",
    content: (
      <>
        <p className={styles.legalParagraph}>
          A Prospecta Nicho adota práticas sólidas de qualidade técnica e diligência operacional. Não obstante, o Usuário reconhece que:
        </p>
        <ul className={styles.legalList}>
          <li className={styles.legalListItem}>
            <strong>Dados empresariais B2B:</strong> as informações públicas de empresas ativas no Brasil são originadas de fontes cadastrais públicas e podem sofrer alterações supervenientes por parte das próprias empresas ou órgãos emissores, não havendo garantia de imutabilidade ou de resultados de conversão de vendas;
          </li>
          <li className={styles.legalListItem}>
            <strong>Serviços de terceiros:</strong> integrações com plataformas externas (APIs de WhatsApp, servidores de e-mail, domínios e provedores de hospedagem terceirizados) dependem da disponibilidade e termos próprios desses fornecedores;
          </li>
          <li className={styles.legalListItem}>
            <strong>Abordagem de vendas:</strong> o Usuário é o único e exclusivo responsável pela estratégia, tom, frequência e legalidade da abordagem comercial que realiza junto a terceiros ao utilizar os recortes e sites contratados.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "alteracoes-nos-termos",
    number: "8",
    title: "Alterações nos termos",
    content: (
      <>
        <p className={styles.legalParagraph}>
          A Prospecta Nicho reserva-se o direito de atualizar ou modificar estes Termos de Uso a qualquer momento, visando refletir melhorias no modelo operacional, aprimoramentos técnicos ou exigências regulatórias.
        </p>
        <p className={styles.legalParagraph}>
          As alterações entrarão em vigor a partir da data de publicação nesta página. A continuidade no uso dos serviços após a divulgação de eventuais alterações consubstancia a aceitação tácita e irrestrita dos novos termos vigentes.
        </p>
      </>
    ),
  },
  {
    id: "rescisao",
    number: "9",
    title: "Rescisão",
    content: (
      <>
        <p className={styles.legalParagraph}>
          A Prospecta Nicho poderá, a seu exclusivo critério, suspender temporariamente ou encerrar o acesso do Usuário aos seus serviços e plataformas, sem prejuízo das medidas jurídicas cabíveis, caso seja constatado o descumprimento de qualquer cláusula destes Termos de Uso, violação da legislação aplicável ou prática de atos prejudiciais à reputação da plataforma ou a terceiros.
        </p>
      </>
    ),
  },
  {
    id: "contato",
    number: "10",
    title: "Contato",
    content: (
      <>
        <p className={styles.legalParagraph}>
          Para esclarecimento de dúvidas, solicitações contratuais, suporte ou notificações relativas a estes Termos de Uso, entre em contato através de nossos canais oficiais:
        </p>
        <div className={styles.legalCallout}>
          <strong>E-mail de atendimento:</strong>{" "}
          <a href={`mailto:${site.email}`} style={{ color: "#0165cd", textDecoration: "underline", fontWeight: 700 }}>
            {site.email}
          </a>
          <br />
          <strong>Plataforma oficial:</strong> https://prospectanicho.app
        </div>
      </>
    ),
  },
];

export default function TermosDeUsoPage() {
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Termos de Uso | Prospecta Nicho",
    description:
      "Consulte os Termos de Uso da Prospecta Nicho e conheça as condições aplicáveis à utilização de nossos serviços e plataformas.",
    url: "https://prospectanicho.app/termos-de-uso/",
    publisher: {
      "@type": "Organization",
      name: "Prospecta Nicho",
      url: "https://prospectanicho.app",
      logo: "https://prospectanicho.app/assets/brand/logo-pn-final-dark.png",
    },
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <LegalPageLayout
        eyebrow="TERMOS"
        titlePrefix="Termos de"
        titleHighlight="uso"
        subtitle="Regras e condições para utilização dos serviços e plataformas da Prospecta Nicho."
        artworkSrc="/assets/brand/legal-terms-doc.png"
        artworkAlt="Documento digital de termos e condições da Prospecta Nicho com selo de verificação"
        breadcrumbLabel="Termos de uso"
        sections={termsSections}
        updatedAt="05 de outubro de 2026"
        crossLinkText="Consulte também nossas diretrizes de privacidade e proteção de dados:"
        crossLinkHref="/politica-de-privacidade/"
        crossLinkLabel="Ver Política de Privacidade →"
      />
    </>
  );
}
