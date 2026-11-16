export const siteMeta = {
  brand: "HL & Bezerra",
  legalName: "HL & Bezerra Advocacia",
  description:
    "Escritório de advocacia dedicado a defender direitos, proteger interesses e oferecer orientação jurídica com compromisso, clareza e excelência.",
  phone: "(00) 00000-0000",
  whatsapp: "https://wa.me/5500000000000",
  email: "contato@hlbezerra.com.br",
  cta: "Falar com o escritório",
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
    eyebrow: "Atendimento jurídico",
    title: "Orientação clara para decidir com segurança",
    description:
      "Acompanhamos casos com escuta, análise cuidadosa e comunicação transparente, para que você entenda seus direitos, riscos e próximos passos sem improvisos.",
  },
];

export type LeadMagnet = {
  title: string;
  description: string;
  cta: string;
};

export const leadMagnet: LeadMagnet = {
  title: "Primeira conversa com o escritório",
  description:
    "Relate seu caso de forma reservada e receba orientação jurídica objetiva sobre o caminho a seguir, com clareza e compromisso.",
  cta: "Solicitar atendimento",
};

export type Service = {
  title: string;
  description: string;
  bullets: string[];
};

export const services: Service[] = [
  {
    title: "Direito Civil",
    description: "Atuação preventiva e contenciosa nas relações jurídicas, contratos, obrigações, responsabilidade civil e patrimônios.",
    bullets: ["Contratos", "Responsabilidade civil", "Cobranças e indenizações"],
  },
  {
    title: "Direito de Família",
    description: "Orientação cuidadosa em divórcios, guarda, pensão, inventários e planejamento sucessório, com respeito e discrição.",
    bullets: ["Guarda e visitação", "Alimentos", "Inventário"],
  },
  {
    title: "Direito do Trabalho",
    description: "Defesa de direitos trabalhistas, acordos, verbas, rescisões e relações entre empregados e empregadores.",
    bullets: ["Reclamações", "Acordos", "Assessoria a empregadores"],
  },
  {
    title: "Direito Penal",
    description: "Acompanhamento jurídico em investigações, inquéritos, processos penais e medidas protetivas, com sigilo e firmeza.",
    bullets: ["Defesa criminal", "Medidas protetivas", "Reparação"],
  },
  {
    title: "Direito do Consumidor",
    description: "Proteção contra práticas abusivas, produtos e serviços, cobranças indevidas e violações de direitos do consumidor.",
    bullets: ["Cobranças indevidas", "Indenizações", "Negociações"],
  },
  {
    title: "Direito Empresarial",
    description: "Orientação jurídica para empresas em contratos, constituição societária, responsabilidade, conformidade e relações comerciais.",
    bullets: ["Contratos", "Sociedades", "Conformidade"],
  },
  {
    title: "Direito Previdenciário",
    description: "Planejamento, revisões, benefícios e estratégias de proteção previdenciária para pessoas e empresas.",
    bullets: ["Benefícios", "Planejamento", "Revisões"],
  },
];

export type Step = {
  title: string;
  description: string;
};

export const method: Step[] = [
  {
    title: "Escuta",
    description:
      "Reunimos os fatos, documentos e preocupações do caso para entender o contexto real do cliente, com sigilo e atenção.",
  },
  {
    title: "Análise",
    description:
      "Interpretamos as questões jurídicas, identificamos riscos, direitos possíveis e caminhos mais adequados à situação.",
  },
  {
    title: "Estratégia",
    description:
      "Definimos a melhor orientação para o momento, com metas, prazos e comunicação clara sobre o que esperar a cada etapa.",
  },
  {
    title: "Defesa",
    description:
      "Conduzimos a atuação com compromisso, responsabilidade profissional e proximidade contínua com o cliente.",
  },
];

export type Benefit = {
  title: string;
  description: string;
};

export const benefits: Benefit[] = [
  {
    title: "Proteção dos direitos",
    description:
      "Cada decisão é analisada sob o ponto de vista jurídico, para que seus interesses e direitos sejam defendidos com segurança.",
  },
  {
    title: "Relação de confiança",
    description:
      "Trabalhamos com proximidade, transparência e linguagem acessível, mantendo o cliente informado em todas as etapas.",
  },
  {
    title: "Excelência profissional",
    description:
      "Compromisso técnico, rigoroso e humano, com atuação cuidadosa que respeita a importância de cada caso.",
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export const testimonials: Testimonial[] = [];

export type FaqItem = {
  question: string;
  answer: string;
};

export const faqs: FaqItem[] = [
  {
    question: "Como funciona a primeira conversa com o escritório?",
    answer:
      "Você relata sua situação de forma reservada. Nossa equipe orienta quais informações são relevantes e qual é o próximo passo mais adequado, com clareza e sem compromisso de contratação.",
  },
  {
    question: "Quais áreas de atuação o escritório possui?",
    answer:
      "Atuamos em Direito Civil, Direito de Família, Direito do Trabalho, Direito Penal, Direito do Consumidor, Direito Empresarial e Direito Previdenciário.",
  },
  {
    question: "Meu caso é urgente. Como consigo atendimento rápido?",
    answer:
      "Priorizamos prazos jurídicos e a gravidade de cada demanda. Entre em contato pelo WhatsApp ou telefone para que possamos avaliar a urgência e indicar a orientação mais segura.",
  },
];
