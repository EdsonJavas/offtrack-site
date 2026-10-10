/**
 * Dados reais da marca, vindos do questionário respondido pelo dono em 10/10/2026.
 * Campos `undefined` ainda não foram confirmados pelo dono: o site não os exibe.
 */
export const brand = {
  name: "OFFTRACK",
  monogram: "OT.",
  slogan: "Todo estilo, fora do padrão.",
  description:
    "Streetwear masculino em Marília, SP. Peças selecionadas, sob encomenda. Não é só uma loja, é uma outra visão de streetwear.",
  foundedYear: 2026,
  city: "Marília",
  state: "SP",
  instagram: {
    handle: "@_offtrack.wear",
    url: "https://instagram.com/_offtrack.wear",
  },
  /** A confirmar pelo dono. Enquanto undefined, o botão de WhatsApp não aparece. */
  whatsapp: undefined as { number: string; url: string } | undefined,
  whatsappMessage:
    "Fala, OFFTRACK! Tudo bem? Vim pelo site e gostaria de saber mais sobre as peças disponíveis e como funciona a encomenda.",
  /** A confirmar pelo dono. */
  email: undefined as string | undefined,
} as const;
