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
    /** Abre a conversa no Direct (ig.me não aceita texto pronto: a mensagem vai copiada). */
    direct: "https://ig.me/m/_offtrack.wear",
  },
  /** A confirmar pelo dono. Enquanto undefined, o site usa só o Direct. */
  whatsapp: undefined as { number: string; url: string } | undefined,
  /** A confirmar pelo dono. */
  email: undefined as string | undefined,
  /**
   * Identificação legal (CDC / Decreto 7.962): obrigatória para vender pela internet.
   * A confirmar pelo dono: razão social ou nome do responsável, CNPJ ou CPF, endereço.
   */
  legal: {
    entity: undefined as string | undefined,
    document: undefined as string | undefined,
    address: undefined as string | undefined,
  },
} as const;

/** URL pública do site (defina NEXT_PUBLIC_SITE_URL na Vercel). */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://offtrack-site.vercel.app";
