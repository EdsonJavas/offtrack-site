/**
 * Conteúdo institucional. Tudo aqui vem das respostas do dono (10/10/2026).
 * Textos passam por aprovação do fundador antes da publicação.
 */
import { brand } from "./brand";

/** A jornada da encomenda, com pagamento e entrega dentro dos passos. */
export const journey = [
  {
    title: "Escolha a peça",
    text: "Você escolhe a peça, a cor e o tamanho aqui no site e chama a gente no Direct.",
    tag: "Direct",
  },
  {
    title: "A gente confirma",
    text: "Modelo, tamanho, cor, valor e disponibilidade são confirmados com o fornecedor antes de qualquer pagamento.",
    tag: "Sem surpresa",
  },
  {
    title: "Entrada de 80%",
    text: "Com tudo certo, você paga 80% do valor via Pix. Por enquanto, o Pix é a única forma de pagamento.",
    tag: "Pix",
  },
  {
    title: "Pedido no fornecedor",
    text: "A OFFTRACK faz o pedido e te informa o prazo, que depende do fornecedor e do transporte.",
    tag: "Prazo combinado",
  },
  {
    title: "Peça chegou",
    text: "Quando a peça chega, você paga os 20% restantes, antes da entrega.",
    tag: "20% na chegada",
  },
  {
    title: "Entrega",
    text: `Entrega local em ${brand.city}, ${brand.state}, inclusive em mãos. Envio para outras cidades está sendo definido.`,
    tag: `${brand.city}, ${brand.state}`,
  },
] as const;

export const journeyNote =
  "Troca, devolução, cancelamento e reembolso seguem o Código de Defesa do Consumidor, incluindo o direito de arrependimento em compras online, quando aplicável.";

/** Os três pilares da marca, nas palavras do dono. */
export const pillars = [
  {
    title: "Fora da pista",
    text: "Não depender de padrões para definir quem você é. Personalidade, atitude e confiança para seguir o próprio estilo.",
  },
  {
    title: "Roupa é extensão",
    text: "A peça é uma extensão da personalidade de quem veste. Seleção alinhada ao estilo urbano, com identidade visual marcante.",
  },
  {
    title: "Perto de você",
    text: "Atendimento próximo, do primeiro contato até a entrega. Uma marca reconhecida pela experiência, não só pelas roupas.",
  },
] as const;

export const story = `Nasceu em ${brand.foundedYear}, do sonho de construir algo próprio e transformar a paixão por moda em um negócio. Começou do zero, no digital, com determinação e visão de longo prazo. O próximo passo é conquistar espaço na moda masculina e, no futuro, abrir uma loja física.`;

export const faq = [
  {
    q: "Como eu compro?",
    a: "Pelo Direct do Instagram. Você escolhe a peça, a gente confirma os detalhes e combina tudo por lá.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Por Pix: 80% de entrada na confirmação do pedido e os 20% restantes quando a peça chega, antes da entrega. Outras formas de pagamento podem entrar no futuro.",
  },
  {
    q: "Qual é o prazo?",
    a: "Depende do fornecedor e do transporte. O prazo é informado antes de você confirmar o pedido.",
  },
  {
    q: "Vocês entregam fora de Marília?",
    a: "No começo, as entregas são locais, em Marília, SP. O envio para outras cidades está sendo definido.",
  },
  {
    q: "Posso trocar ou devolver?",
    a: "Sim. A política de troca, devolução, cancelamento e reembolso segue o Código de Defesa do Consumidor, incluindo o direito de arrependimento em compras online, quando aplicável.",
  },
  {
    q: "As peças são de fabricação própria?",
    a: "Não. A OFFTRACK seleciona peças de fornecedores. O nosso trabalho está na curadoria, na apresentação e no atendimento.",
  },
  {
    q: "Quais tamanhos vocês têm?",
    a: "A grade depende de cada modelo. Os tamanhos e as medidas são confirmados no atendimento.",
  },
] as const;
