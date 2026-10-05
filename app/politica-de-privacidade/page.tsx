import type { Metadata } from "next";
import { LegalPageLayout, type LegalSectionItem } from "@/components/legal/LegalPageLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/lib/site";
import styles from "@/components/legal/legal-page.module.css";

export const metadata: Metadata = {
  title: "Política de Privacidade | Prospecta Nicho",
  description:
    "Saiba como a Prospecta Nicho coleta, utiliza, armazena e protege dados pessoais e conheça seus direitos conforme a LGPD.",
  alternates: {
    canonical: "https://prospectanicho.app/politica-de-privacidade/",
  },
  openGraph: {
    title: "Política de Privacidade | Prospecta Nicho",
    description:
      "Transparência sobre como coletamos, utilizamos, protegemos e tratamos os seus dados na Prospecta Nicho em conformidade com a LGPD.",
    url: "https://prospectanicho.app/politica-de-privacidade/",
    type: "website",
  },
};

const privacySections: LegalSectionItem[] = [
  {
    id: "introducao",
    number: "1",
    title: "Introdução",
    content: (
      <>
        <p className={styles.legalParagraph}>
          A <strong>Prospecta Nicho</strong> respeita a sua privacidade e está comprometida em proteger os seus dados pessoais. Esta Política de Privacidade explica, de forma clara, transparente e acessível, como tratamos, coletamos, utilizamos, armazenamos e salvaguardamos as informações dos usuários e clientes em nossas plataformas digitais e serviços comerciais, em estrita conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD – Lei nº 13.709/2018)</strong> e demais legislações aplicáveis no território brasileiro.
        </p>
        <p className={styles.legalParagraph}>
          Ao acessar nosso site, interagir com nossas soluções, solicitar orçamentos, amostras ou contratar serviços de inteligência comercial B2B, sites profissionais ou automações, você declara ter ciência das diretrizes descritas neste documento.
        </p>
      </>
    ),
  },
  {
    id: "dados-que-coletamos",
    number: "2",
    title: "Dados que coletamos",
    content: (
      <>
        <p className={styles.legalParagraph}>
          Coletamos exclusivamente os dados necessários para o fornecimento, personalização e aprimoramento de nossos serviços, divididos nas seguintes categorias:
        </p>
        <ul className={styles.legalList}>
          <li className={styles.legalListItem}>
            <strong>Dados de identificação e contato fornecidos voluntariamente:</strong> nome completo, e-mail corporativo ou pessoal, telefone/WhatsApp, cargo ocupado e nome da empresa representada quando enviados em formulários de contato, solicitação de amostras, pedidos de propostas ou suporte via WhatsApp.
          </li>
          <li className={styles.legalListItem}>
            <strong>Critérios de solicitação e briefing comercial:</strong> segmento de atuação, região geográfica de interesse, nicho de prospecção desejado e especificações de projetos digitais informadas pelo usuário.
          </li>
          <li className={styles.legalListItem}>
            <strong>Dados de navegação e telemetria técnica:</strong> endereço IP, tipo de navegador, identificadores de dispositivo, páginas visualizadas, data e hora de acesso, origem do tráfego e dados analíticos agregados para segurança e melhoria de desempenho.
          </li>
        </ul>
        <div className={styles.legalCallout}>
          <strong>Nota de Minimização:</strong> A Prospecta Nicho <strong>não</strong> coleta nem armazena dados pessoais sensíveis (origem racial ou étnica, convicção religiosa, dados biométricos ou de saúde) nem dados de menores de idade em sua operação padrão.
        </div>
      </>
    ),
  },
  {
    id: "como-usamos-os-dados",
    number: "3",
    title: "Como usamos os dados",
    content: (
      <>
        <p className={styles.legalParagraph}>
          Os dados coletados são tratados para finalidades legítimas e previamente informadas, incluindo:
        </p>
        <ul className={styles.legalList}>
          <li className={styles.legalListItem}>
            Processar solicitações de contato, dúvidas técnicas e atendimento consultivo por especialistas;
          </li>
          <li className={styles.legalListItem}>
            Entregar demonstrações de formatos de planilhas comerciais e orçamentos customizados;
          </li>
          <li className={styles.legalListItem}>
            Estruturar, desenvolver e publicar sites institucionais, landing pages e fluxos de automação contratados;
          </li>
          <li className={styles.legalListItem}>
            Garantir a segurança cibernética da plataforma, prevenindo fraudes, abusos e ataques de negação de serviço;
          </li>
          <li className={styles.legalListItem}>
            Cumprir obrigações legais, fiscais, regulatórias ou ordens de autoridades competentes.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "compartilhamento-de-informacoes",
    number: "4",
    title: "Compartilhamento de informações",
    content: (
      <>
        <p className={styles.legalParagraph}>
          A Prospecta Nicho <strong>não vende, não comercializa e não aluga dados pessoais fornecidos por usuários de nosso site</strong>. O compartilhamento ocorre apenas quando estritamente necessário com prestadores de infraestrutura essenciais à operação:
        </p>
        <ul className={styles.legalList}>
          <li className={styles.legalListItem}>
            Provedores de hospedagem em nuvem, computação de borda e rede de distribuição de conteúdo (CDN);
          </li>
          <li className={styles.legalListItem}>
            Serviços de mensageria eletrônica, e-mail transacional e atendimento corporativo;
          </li>
          <li className={styles.legalListItem}>
            Processadores de pagamento e emissão fiscal quando uma transação comercial for formalizada;
          </li>
          <li className={styles.legalListItem}>
            Autoridades judiciais, policiais ou regulatórias brasileiras mediante determinação legal ou ordem judicial válida.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "seguranca",
    number: "5",
    title: "Segurança",
    content: (
      <>
        <p className={styles.legalParagraph}>
          Adotamos medidas técnicas e administrativas aptas a proteger os dados pessoais contra acessos não autorizados e situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou difusão.
        </p>
        <p className={styles.legalParagraph}>
          Essas práticas incluem comunicação criptografada via protocolo HTTPS/TLS, controle restrito de acesso por credenciais autenticadas, isolamento de variáveis de ambiente no servidor e rotinas regulares de monitoramento. Embora nenhum sistema seja 100% imune a vulnerabilidades, empregamos padrões de diligência recomendados pelo mercado para mitigar riscos de maneira contínua e responsável.
        </p>
      </>
    ),
  },
  {
    id: "seus-direitos",
    number: "6",
    title: "Seus direitos",
    content: (
      <>
        <p className={styles.legalParagraph}>
          Em conformidade com o artigo 18 da LGPD, você, enquanto titular de dados pessoais, tem o direito de solicitar a qualquer momento e mediante requisição expressa:
        </p>
        <ul className={styles.legalList}>
          <li className={styles.legalListItem}>
            Confirmação da existência de tratamento de seus dados;
          </li>
          <li className={styles.legalListItem}>
            Acesso aos dados pessoais mantidos por nós;
          </li>
          <li className={styles.legalListItem}>
            Correção de dados incompletos, inexatos ou desatualizados;
          </li>
          <li className={styles.legalListItem}>
            Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei;
          </li>
          <li className={styles.legalListItem}>
            Informação sobre as entidades públicas e privadas com as quais compartilhamos dados;
          </li>
          <li className={styles.legalListItem}>
            Revogação do consentimento concedido anteriormente e oposição ao tratamento em hipóteses cabíveis.
          </li>
        </ul>
        <p className={styles.legalParagraph}>
          Para exercer quaisquer desses direitos, basta entrar em contato com nosso canal de privacidade pelo e-mail <strong>{site.email}</strong>.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    number: "7",
    title: "Cookies",
    content: (
      <>
        <p className={styles.legalParagraph}>
          Utilizamos cookies e tecnologias similares para garantir o funcionamento adequado da aplicação, registrar preferências essenciais de navegação (como o consentimento do banner de cookies) e analisar de forma agregada a audiência do site.
        </p>
        <ul className={styles.legalList}>
          <li className={styles.legalListItem}>
            <strong>Cookies essenciais:</strong> indispensáveis para segurança, navegação e integridade das sessões na plataforma.
          </li>
          <li className={styles.legalListItem}>
            <strong>Cookies analíticos:</strong> métricas estatísticas de desempenho que auxiliam no entendimento de como as páginas são utilizadas para melhorias contínuas.
          </li>
        </ul>
        <p className={styles.legalParagraph}>
          Você pode desabilitar ou gerenciar o uso de cookies a qualquer momento por meio das configurações de privacidade do seu navegador web.
        </p>
      </>
    ),
  },
  {
    id: "retencao-de-dados",
    number: "8",
    title: "Retenção de dados",
    content: (
      <>
        <p className={styles.legalParagraph}>
          Mantemos seus dados pessoais apenas pelo período estritamente necessário para atender às finalidades para as quais foram coletados, inclusive para fins de cumprimento de obrigações legais, contratuais, fiscais, de prestação de contas ou requisição de autoridades públicas competentes.
        </p>
        <p className={styles.legalParagraph}>
          Encerrada a finalidade ou mediante solicitação válida de revogação/eliminação (quando não houver dever legal de custódia), os dados serão descartados ou anonimizados de maneira segura.
        </p>
      </>
    ),
  },
  {
    id: "alteracoes-desta-politica",
    number: "9",
    title: "Alterações desta política",
    content: (
      <>
        <p className={styles.legalParagraph}>
          Esta Política de Privacidade poderá ser atualizada periodicamente para refletir melhorias em nossos serviços, adoção de novas tecnologias ou mudanças na legislação aplicável. Qualquer modificação substancial será informada nesta página, com a atualização da respectiva data de revisão no topo do documento. Recomendamos a consulta periódica desta seção.
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
          Se você tiver quaisquer dúvidas, esclarecimentos, sugestões ou solicitações relacionadas a esta Política de Privacidade ou ao tratamento de seus dados pessoais, nosso canal oficial de comunicação é:
        </p>
        <div className={styles.legalCallout}>
          <strong>E-mail institucional:</strong>{" "}
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

export default function PoliticaDePrivacidadePage() {
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Política de Privacidade | Prospecta Nicho",
    description:
      "Saiba como a Prospecta Nicho coleta, utiliza, armazena e protege dados pessoais e conheça seus direitos conforme a LGPD.",
    url: "https://prospectanicho.app/politica-de-privacidade/",
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
        eyebrow="POLÍTICA"
        titlePrefix="Política de"
        titleHighlight="privacidade"
        subtitle="Transparência sobre como coletamos, utilizamos, protegemos e tratamos os seus dados na Prospecta Nicho."
        artworkSrc="/assets/brand/legal-privacy-shield.png"
        artworkAlt="Escudo de proteção digital e segurança de dados da Prospecta Nicho"
        breadcrumbLabel="Política de privacidade"
        sections={privacySections}
        updatedAt="05 de outubro de 2026"
        crossLinkText="Consulte também as regras e termos de uso dos nossos serviços:"
        crossLinkHref="/termos-de-uso/"
        crossLinkLabel="Ver Termos de Uso →"
      />
    </>
  );
}
