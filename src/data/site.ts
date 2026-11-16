export const siteMeta = {
  brand: "HL Bezerra",
  legalName: "HL & Bezerra Consultoria e Assessoria",
  description:
    "Consultoria e assessoria com estratégia, governança e visão de resultado para empresas que querem crescer com segurança.",
  phone: "(00) 00000-0000",
  whatsapp: "https://wa.me/5500000000000",
  email: "contato@hlbezerra.com.br",
  cta: "Fale com um especialista",
};

export type LeadSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
};

export const leadSections: LeadSection[] = [
  {
    id: "leads",
    eyebrow: "Retenção de leads",
    title: "Leads qualificados, nutrição contínua e retorno previsível",
    description:
      "Trazemos uma camada prática de captação e relacionamento para transformar visitas em oportunidades reais: conteúdo, follow-up, prova social e chamadas de ação em todos os pontos decisivos.",
  },
];

export type LeadMagnet = {
  title: string;
  description: string;
  cta: string;
};

export const leadMagnet: LeadMagnet = {
  title: "Diagnóstico gratuito do seu negócio",
  description:
    "Receba uma leitura rápida de organização, indicadores e prioridades para sair do improviso com segurança.",
  cta: "Agendar diagnóstico",
};

export type Service = {
  title: string;
  description: string;
  bullets: string[];
};

export const services: Service[] = [
  {
    title: "Assessoria Estratégica",
    description:
      "Diagnóstico do negócio, planejamento e acompanhamento contínuo para decisões mais rápidas e alinhadas.",
    bullets: ["Plano de ação", "Gestão de indicadores", "Comitê mensal"],
  },
  {
    title: "Governança e Risco",
    description:
      "Estruturas claras de responsabilidade, processos e controles que reduzem incerteza e fortalecem confiança.",
    bullets: ["Políticas internas", "Matriz de riscos", "Painel de controles"],
  },
  {
    title: "Financeiro e Fluxo de Caixa",
    description:
      "Organização de previsões, metas e relatórios para o dono enxergar o negócio com clareza e agir com segurança.",
    bullets: ["Projeção de caixa", "Margens e metas", "Decisões financeiras"],
  },
  {
    title: "Assessoria Jurídica Empresarial",
    description:
      "Suporte consultivo e preventivo para contratos, sociedade, compliance e relações comerciais, com foco em segurança jurídica.",
    bullets: ["Contratos e sociedade", "Prevenção de passivos", "Compliance e riscos"],
  },
];

export type Step = {
  title: string;
  description: string;
};

export const method: Step[] = [
  {
    title: "Diagnóstico",
    description:
      "Entendemos o momento real da empresa, dores, oportunidades e gargalos que mais impactam resultado.",
  },
  {
    title: "Plano",
    description:
      "Montamos um plano objetivo, com prioridades, responsáveis e prazos, para tirar o time da inércia.",
  },
  {
    title: "Execução",
    description:
      "Acompanhamos a implementação com ritos de gestão, métricas e ajustes contínuos.",
  },
  {
    title: "Escala",
    description:
      "Consolidamos boas práticas e preparamos a empresa para crescer mantendo controle e previsibilidade.",
  },
];

export type Benefit = {
  title: string;
  description: string;
};

export const benefits: Benefit[] = [
  {
    title: "Visão do negócio",
    description:
      "O dono volta a enxergar números, prioridades e decisões com clareza, sem depender de improviso.",
  },
  {
    title: "Gestão com método",
    description:
      "Processos e ritos de trabalho que reduzem retrabalho, ruído e dependência de pessoas-chave.",
  },
  {
    title: "Resultado mais previsível",
    description:
      "A empresa passa a operar com indicadores, metas e correção de rota em ciclos curtos.",
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Depois de alguns meses com a assessoria, a empresa ficou muito mais organizada e as decisões passaram a ser mais rápidas.",
    name: "Cliente satisfeito",
    role: "Empresário",
  },
  {
    quote:
      "O time ganhou método. Hoje temos mais clareza de caixa, metas e prioridade, o que reduziu bastante o improviso.",
    name: "Cliente satisfeito",
    role: "Diretor",
  },
];

export type FaqItem = {
  question: string;
  answer: string;
};

export const faqs: FaqItem[] = [
  {
    question: "Para que tipo de empresa a HL Bezerra atende?",
    answer:
      "Atendemos pequenas e médias empresas que precisam de mais organização, previsibilidade e apoio estruturado na gestão.",
  },
  {
    question: "Como funciona o primeiro contato?",
    answer:
      "Começamos por uma conversa de diagnóstico para entender momento, dores e objetivos da empresa. A partir disso, apresentamos um caminho de atuação.",
  },
  {
    question: "O quanto de tempo o empresário precisa dedicar?",
    answer:
      "Depende da etapa do projeto, mas o foco é criar ritos enxutos para que o gestor participe com consistência, sem sobrecarregar a operação.",
  },
];
