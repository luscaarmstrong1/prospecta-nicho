// Centralized content configuration for ProspectaNicho V2 Marketing Pages
// Follows approved Drive mockups with 100% fidelity.

import { getCatalogProduct } from "@/lib/products";
import { createWhatsAppLink } from "@/lib/whatsapp";

export interface SolutionItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  points: string[];
  ctaText: string;
  ctaHref: string;
  icon: "database" | "filter" | "crm" | "webhook";
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface SegmentItem {
  id: string;
  title: string;
  category: string;
  region: string;
  description: string;
  image: string;
  badge: string;
  volume: string;
  href: string;
}

export interface GrowthMarketItem {
  title: string;
  description: string;
  badge: string;
  trend: string;
}

export interface PlanItem {
  id: string;
  badge?: string;
  title: string;
  subtitle: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  ctaHref: string;
  custom?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContentArticle {
  id: string;
  title: string;
  excerpt: string;
  category: "Artigo" | "Guia" | "Case" | "Material Gratuito";
  readTime: string;
  date: string;
  featured?: boolean;
  href: string;
}

export interface MetricItem {
  value: string;
  label: string;
}

export interface ValueItem {
  id: string;
  tag: string;
  title: string;
  description: string;
}

// 1. SOLUÇÕES DATA
export const solucoesData = {
  hero: {
    tag: "Nossas Soluções",
    title: "Encontre, segmente e ative oportunidades B2B com mais resultado",
    subtitle:
      "A inteligência e os dados que a sua empresa precisa para prospectar de forma previsível, qualificada e contínua no mercado brasileiro.",
    ctaPrimary: {
      label: "Montar meu recorte",
      href: "/solicitar-planilha?source=solucoes-hero",
    },
    ctaSecondary: {
      label: "Falar com especialista",
      href: createWhatsAppLink(
        "Olá, gostaria de saber mais sobre as soluções da ProspectaNicho.",
      ),
    },
  },
  solutions: [
    {
      id: "bases-b2b",
      badge: "Base Completa",
      title: "Bases B2B Prontas para Prospecção",
      description:
        "Listas de empresas segmentadas por CNAE, estado, cidade, porte e faturamento estimado com dados cadastrais e telefones validados.",
      points: [
        "Filtros avançados por CNAE principal e secundário",
        "Cobertura em todos os 5.570 municípios do Brasil",
        "Exportação facilitada em Excel, CSV ou Sheets",
      ],
      ctaText: "Ver bases prontas",
      ctaHref: "/solicitar-planilha?source=solucoes-bases",
      icon: "database",
    },
    {
      id: "recorte-personalizado",
      badge: "Sob Medida",
      title: "Recorte Personalizado sob Demanda",
      description:
        "Precisa de um perfil muito específico de cliente ideal (ICP)? Criamos recortes sob medida cruzando dados geográficos, econômicos e societários.",
      points: [
        "Definição cirúrgica de parâmetros de busca",
        "Validação prévia de volumetria sem compromisso",
        "Amostra demonstrativa antes do fechamento",
      ],
      ctaText: "Solicitar recorte sob medida",
      ctaHref: "/solicitar-planilha?source=solucoes-recorte",
      icon: "filter",
    },
    {
      id: "exportacao-crm",
      badge: "Produtividade",
      title: "Formato Pronto para CRM e Prospecção",
      description:
        "Nossos dados são formatados para importação direta em ferramentas de vendas como HubSpot, RD Station, Pipedrive, Ploomes e discadores.",
      points: [
        "Colunas padronizadas para mapeamento automático",
        "Telefones com DDD limpos e prontos para discagem",
        "Campos de decisores e sócios quando disponíveis",
      ],
      ctaText: "Baixar amostra de exemplo",
      ctaHref: "/amostra",
      icon: "crm",
    },
    {
      id: "integracoes",
      badge: "Escalabilidade",
      title: "Ativação & Consultoria Comercial",
      description:
        "Além da lista de dados, orientamos sua equipe com boas práticas de abordagem fria (cold call, cold mail e WhatsApp) para maximizar conversão.",
      points: [
        "Recomendações de cadência e abordagem",
        "Templates testados de primeiro contato comercial",
        "Suporte consultivo via WhatsApp para dúvidas",
      ],
      ctaText: "Conversar com consultor",
      ctaHref: "/contato",
      icon: "webhook",
    },
  ] as SolutionItem[],
  howItWorks: {
    tag: "Processo Transparente",
    title: "Como funciona na prática",
    subtitle: "Do alinhamento do seu perfil de cliente à entrega final da sua base em 3 passos simples.",
    steps: [
      {
        number: "01",
        title: "Defina o Perfil de Cliente Ideal (ICP)",
        description:
          "Informe o nicho de atuação, regiões de interesse, porte das empresas e os canais de contato prioritários da sua operação comercial.",
      },
      {
        number: "02",
        title: "Mapeamos e Filtramos os Dados",
        description:
          "Nossa inteligência cruza bases oficiais e fontes públicas confiáveis, eliminando empresas inativas e duplicidades cadastrais.",
      },
      {
        number: "03",
        title: "Receba a Base Pronta para Vender",
        description:
          "Entregamos a planilha estruturada no formato ideal para seu time comercial iniciar as abordagens e gerar reuniões imediatamente.",
      },
    ] as StepItem[],
  },
};

// 2. SEGMENTOS DATA
export const segmentosData = {
  hero: {
    tag: "Segmentos Mapeados",
    title: "Encontre oportunidades nos setores que mais movem o Brasil",
    subtitle:
      "Mais de 600 nichos catalogados com critérios precisos. Selecione o segmento ideal para alavancar suas vendas corporativas.",
  },
  segments: [
    {
      id: "agencias",
      title: "Agências & Marketing",
      category: "Serviços Digitais",
      region: "Brasil",
      description: "Agências de publicidade, marketing digital, estúdios de design, produtoras audiovisuais e assessoria.",
      image: "/preview-v2/assets/segment-agencias.webp",
      badge: "+18.000 empresas",
      volume: "Alta demanda",
      href: "/solicitar-planilha?segmento=agencias",
    },
    {
      id: "contabilidades",
      title: "Contabilidades & Finanças",
      category: "Serviços Corporativos",
      region: "Brasil",
      description: "Escritórios de contabilidade, perícias contábeis, auditorias independentes e consultorias tributárias.",
      image: "/preview-v2/assets/segment-contabilidades.webp",
      badge: "+54.000 empresas",
      volume: "Mercado estável",
      href: "/solicitar-planilha?segmento=contabilidades",
    },
    {
      id: "energia-solar",
      title: "Energia Solar & Renovável",
      category: "Infraestrutura",
      region: "Brasil",
      description: "Instaladoras de painéis fotovoltaicos, integradores, engenharia elétrica e fornecedores de energia limpa.",
      image: "/preview-v2/assets/segment-energia-solar.webp",
      badge: "+22.000 empresas",
      volume: "Crescimento acelerado",
      href: "/solicitar-planilha?segmento=energia-solar",
    },
    {
      id: "industria",
      title: "Indústria & Transformação",
      category: "Manufatura",
      region: "Brasil",
      description: "Metalúrgicas, plásticos, maquinários industriais, químicas, embalagens e componentes de precisão.",
      image: "/preview-v2/assets/segment-industria.png",
      badge: "+110.000 empresas",
      volume: "Ticket alto",
      href: "/solicitar-planilha?segmento=industria",
    },
    {
      id: "tecnologia",
      title: "Tecnologia & Software",
      category: "TI & Telecom",
      region: "Brasil",
      description: "Desenvolvedoras SaaS, integradores de sistemas, consultorias de TI, suporte técnico e cloud computing.",
      image: "/preview-v2/assets/segment-tecnologia.png",
      badge: "+38.000 empresas",
      volume: "Alta escala",
      href: "/solicitar-planilha?segmento=tecnologia",
    },
    {
      id: "saude",
      title: "Saúde & Clínicas",
      category: "Saúde Privada",
      region: "Brasil",
      description: "Clínicas médicas, odontológicas, laboratórios de análises, distribuidores hospitalares e estética.",
      image: "/preview-v2/assets/segment-saude.png",
      badge: "+75.000 empresas",
      volume: "Recorrente",
      href: "/solicitar-planilha?segmento=saude",
    },
  ] as SegmentItem[],
  growthMarkets: [
    {
      title: "B2B Tech & Automação",
      description: "Empresas investindo fortemente em digitalização de processos, gestão em nuvem e cibersegurança.",
      badge: "Expansão contínua",
      trend: "+24% ao ano",
    },
    {
      title: "Agronegócio & Cadeia Produtiva",
      description: "Revendas de insumos, maquinários, cooperativas e transportadoras ligadas ao agro brasileiro.",
      badge: "Pilar econômico",
      trend: "+19% de novas empresas",
    },
    {
      title: "Construção Civil & Reformas",
      description: "Construtoras, escritórios de arquitetura, empreiteiras e distribuidoras de materiais pesados.",
      badge: "Alto volume de negócios",
      trend: "+15% de investimento",
    },
  ] as GrowthMarketItem[],
};

// 3. PLANOS DATA
export const planosData = {
  hero: {
    tag: "Valores Claros e Transparentes",
    title: "Escolha o plano ideal para a sua operação de prospecção",
    subtitle:
      "Sem assinaturas ocultas ou mensalidades forçadas. Pague apenas pela base que você precisa e potencialize seu pipeline comercial.",
  },
  plans: [
    {
      id: "recem-abertas",
      badge: "Ideal para começar",
      title: "Empresas Recém-Abertas",
      subtitle: "Para quem quer chegar primeiro em novos negócios.",
      price: getCatalogProduct("empresas-recem-abertas")?.price ?? "R$ 147,00",
      period: "por lista avulsa",
      description: "Receba empresas abertas nos últimos 30 a 90 dias no seu nicho e região para oferecer serviços essenciais.",
      features: [
        "Filtro por estado (UF) ou município",
        "Seleção por CNAE ou ramo de atividade",
        "Telefone e endereço completo",
        "Formato pronto em Excel / CSV",
        "Atualização semanal disponível",
      ],
      ctaText: "Comprar base agora",
      ctaHref: "/solicitar-planilha?plano=recem-abertas",
    },
    {
      id: "agencias",
      badge: "Mais Procurado",
      popular: true,
      title: "Base para Agências",
      subtitle: "Segmentação especializada para agências e consultores.",
      price: getCatalogProduct("agencias-marketing")?.price ?? "R$ 197,00",
      period: "por lista avulsa",
      description: "Encontre empresas que necessitam de presença digital, tráfego pago, branding e desenvolvimento de sites.",
      features: [
        "Até 1.000 contatos qualificados",
        "Filtros por faturamento estimado e porte",
        "Telefone, WhatsApp verificado e site",
        "Classificação por segmento comercial",
        "Garantia de reposição de contatos inativos",
      ],
      ctaText: "Solicitar esta base",
      ctaHref: "/solicitar-planilha?plano=agencias",
    },
    {
      id: "contabilidades",
      title: "Base para Contabilidades",
      subtitle: "Empresas ativas para captação de clientes recorrentes.",
      price: getCatalogProduct("contabilidades")?.price ?? "R$ 197,00",
      period: "por lista avulsa",
      description: "Empresas em expansão, comércios e prestadores de serviços precisando de assessoria fiscal e contábil.",
      features: [
        "Até 1.000 empresas ativas mapeadas",
        "Filtro por regime tributário estimado",
        "Dados dos sócios e administradores",
        "Telefones comerciais limpos",
        "Pronto para importação no CRM",
      ],
      ctaText: "Solicitar esta base",
      ctaHref: "/solicitar-planilha?plano=contabilidades",
    },
    {
      id: "personalizada",
      badge: "Corporativo",
      title: "Base Personalizada",
      subtitle: "Volume e filtros customizados para grandes equipes.",
      price: getCatalogProduct("base-personalizada")?.price ?? "A partir de R$ 497,00",
      period: "projetos sob medida",
      description: "Filtros avançados para operações enterprise, cruzamento de dados exclusivos e enriquecimento de carteira.",
      features: [
        "Volume flexível (de 2.000 a +100.000 leads)",
        "Filtros exclusivos geográficos e econômicos",
        "Atendimento dedicado com analista sênior",
        "Amostra preliminar gratuita para teste",
        "SLA de entrega prioritária em até 24h",
      ],
      ctaText: "Falar com consultor",
      ctaHref: "/solicitar-planilha?plano=personalizada",
      custom: true,
    },
  ] as PlanItem[],
  commonBenefits: [
    { title: "Dados Auditados", desc: "Fontes oficiais atualizadas e dados checados para prospecção segura." },
    { title: "Sem Contrato de Fidelidade", desc: "Adquira apenas o que for utilizar. Liberdade total para o seu caixa." },
    { title: "Garantia de Qualidade", desc: "Reposição de registros inválidos conforme nossa política de entrega." },
    { title: "Suporte Especializado", desc: "Time brasileiro pronto para ajudar você a selecionar os melhores filtros." },
  ],
  faqs: [
    {
      question: "Qual é o formato de entrega das planilhas?",
      answer:
        "As planilhas são entregues nos formatos .XLSX (Microsoft Excel) e .CSV (compatível com Google Sheets, CRM, e-mail marketing e sistemas de vendas). As colunas são padronizadas e limpas para facilitar a importação imediata.",
    },
    {
      question: "Os dados cumprem as diretrizes da LGPD?",
      answer:
        "Sim. Todas as informações comercializadas pela ProspectaNicho são dados de pessoas jurídicas (PJ) de caráter manifestamente público, de acordo com o Art. 7º e seguintes da Lei Geral de Proteção de Dados (LGPD). Atuamos com transparência e responsabilidade ética.",
    },
    {
      question: "Como funciona a garantia e reposição de dados inválidos?",
      answer:
        "Embora nossa base passe por processos constantes de enriquecimento, empresas podem encerrar atividades ou trocar de telefone. Oferecemos política clara de reposição para registros comprovadamente inativos acima da margem técnica acordada.",
    },
    {
      question: "Posso solicitar um recorte para uma cidade ou bairro específico?",
      answer:
        "Com certeza. Nosso sistema de busca permite filtrar empresas por qualquer um dos 5.570 municípios do Brasil, regiões metropolitanas, estados ou faixas de CEP específicas.",
    },
  ] as FaqItem[],
};

// 4. CONTEÚDO DATA
export const conteudoData = {
  hero: {
    tag: "Biblioteca de Inteligência Comercial",
    title: "Artigos, guias e insights para você ir mais longe nas vendas B2B",
    subtitle:
      "Aprenda estratégias comprovadas de outbound, prospecção ativa, qualificação de leads e gestão de pipeline com nossos especialistas.",
  },
  featuredArticle: {
    id: "guia-prospeccao-b2b-2026",
    title: "Guia Definitivo de Prospecção Ativa B2B no Brasil em 2026",
    excerpt:
      "Como estruturar um processo de outbound comercial moderno, combinando inteligência de dados, cadência multicanal (ligações, e-mails e WhatsApp) e abordagem consultiva de alto impacto.",
    category: "Guia" as const,
    readTime: "8 min de leitura",
    date: "Setembro de 2026",
    href: "/conteudo/guia-prospeccao-b2b-2026",
  },
  articles: [
    {
      id: "cold-calling-que-funciona",
      title: "Como estruturar uma ligação fria que desperta interesse nos primeiros 15 segundos",
      excerpt: "Esqueça scripts robóticos. Descubra a metodologia de perguntas abertas que gera reuniões qualificadas com diretores e decisores.",
      category: "Artigo" as const,
      readTime: "5 min de leitura",
      date: "Agosto de 2026",
      href: "/conteudo/cold-calling-que-funciona",
    },
    {
      id: "case-sucesso-energia-solar",
      title: "Case de Sucesso: Como uma integradora solar gerou R$ 420 mil em contratos em 60 dias",
      excerpt: "Estudo de caso detalhando a estratégia de segmentação geográfica por indústrias de médio porte e abordagem orientada a ROI.",
      category: "Case" as const,
      readTime: "6 min de leitura",
      date: "Julho de 2026",
      href: "/conteudo/case-sucesso-energia-solar",
    },
    {
      id: "planilha-calculo-icp",
      title: "Planilha Gratuita de Mapeamento de Perfil de Cliente Ideal (ICP)",
      excerpt: "Ferramenta em Excel pronta para download para você documentar segmentos, portes, dores e objeções antes de contratar dados.",
      category: "Material Gratuito" as const,
      readTime: "Download imediato",
      date: "Junho de 2026",
      href: "/amostra",
    },
    {
      id: "erros-comuns-segmentacao-cnae",
      title: "Os 5 erros mais comuns ao filtrar empresas por CNAE e como evitá-los",
      excerpt: "Entenda a diferença entre atividade principal e secundária para não desperdiçar o tempo da sua equipe de pré-vendas (SDRs).",
      category: "Artigo" as const,
      readTime: "4 min de leitura",
      date: "Maio de 2026",
      href: "/conteudo/erros-comuns-segmentacao-cnae",
    },
  ] as ContentArticle[],
  newsletter: {
    title: "Fique por dentro das novidades do mercado B2B",
    description: "Receba quinzenalmente nossos melhores relatórios, tendências setoriais e dicas práticas de prospecção direto no seu e-mail.",
  },
};

// 5. SOBRE DATA
export const sobreData = {
  hero: {
    tag: "Quem Somos",
    title: "Dados que geram oportunidades reais para o seu negócio crescer",
    subtitle:
      "A ProspectaNicho nasceu para simplificar o acesso a dados empresariais qualificados no Brasil, conectando quem vende a quem precisa comprar com inteligência, ética e precisão técnica.",
  },
  metrics: [
    { value: "5,8M", label: "empresas cadastradas" },
    { value: "+600", label: "segmentos mapeados" },
    { value: "5.570", label: "cidades brasileiras cobertas" },
  ],
  values: [
    {
      id: "missao",
      tag: "Nossa Missão",
      title: "Desbloquear o potencial comercial do Brasil",
      description:
        "Prover tecnologia e inteligência cadastral acessível para que empresas de todos os portes possam prospectar com segurança, velocidade e alta produtividade de vendas.",
    },
    {
      id: "visao",
      tag: "Nossa Visão",
      title: "Ser a plataforma referência em inteligência B2B no país",
      description:
        "Construir o ecossistema de dados mais confiável e simples de usar do mercado corporativo nacional, reconhecido pela transparência e pelo respeito às diretrizes legais.",
    },
    {
      id: "posicionamento",
      tag: "Nosso Posicionamento",
      title: "Critério e assertividade antes da lista",
      description:
        "Não entregamos números vazios. Acreditamos que uma base de 200 empresas bem segmentadas gera muito mais faturamento do que 10.000 contatos desqualificados.",
    },
  ] as ValueItem[],
  teamSection: {
    tag: "Estrutura & Liderança",
    title: "Especialistas focados em dados comerciais de alta precisão",
    subtitle:
      "Uma equipe multidisciplinar de engenheiros de dados, cientistas de informação e consultores de vendas B2B dedicados a entregar a melhor experiência de prospecção do Brasil.",
    image: "/preview-v2/assets/team-about.png",
    caption: "Equipe de operações e inteligência cadastral da ProspectaNicho.",
  },
};
