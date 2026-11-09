/**
 * Dados reais da marca, vindos do questionário respondido pelo dono em 10/10/2026.
 * Contato (WhatsApp, e-mail) e identificação legal não ficam aqui: o dono os
 * preenche no painel (/admin/loja) e o site lê de `getStore()` / `useStore()`.
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
} as const;

/** URL pública do site (defina NEXT_PUBLIC_SITE_URL na Vercel). */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://offtrack-site.vercel.app";
