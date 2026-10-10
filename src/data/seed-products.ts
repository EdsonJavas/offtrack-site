/**
 * CATÁLOGO DE EXEMPLO. Usado só enquanto o dono não cadastra nenhuma peça no painel.
 * Nomes, preços, medidas e descrições são fictícios; as fotos são de banco de imagens
 * (Unsplash) e não são as peças da loja. Cada item carrega `example: true`, e o site
 * mostra o selo "EXEMPLO" por cima. Nada daqui deve ser vendido.
 */
import type { Product } from "./types";

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`;

const PHOTOS = {
  teeWhiteConcrete: unsplash("photo-1581655353564-df123a1eb820"),
  teeWhiteHanger: unsplash("photo-1778671394516-8270eac13c42"),
  teeOffwhiteWall: unsplash("photo-1722310752951-4d459d28c678"),
  teesBlackHanging: unsplash("photo-1610502778270-c5c6f4c7d575"),
  teeBlackBackPrint: unsplash("photo-1618354691438-25bc04584c23"),
  teeBlackClose: unsplash("photo-1499972823984-af6ee544403f"),
  hoodieBlack: unsplash("photo-1680292783974-a9a336c10366"),
  poloBlack: unsplash("photo-1625910513413-c23b8bb81cba"),
  poloWhiteFolded: unsplash("photo-1622622016645-7b7065e7c129"),
  poloWhiteRack: unsplash("photo-1671438118097-479e63198629"),
  cargoOlive: unsplash("photo-1552902875-9ac1f9fe0c07"),
  chinoSandFlatlay: unsplash("photo-1601679249486-3e2a903f23ee"),
  joggerGray: unsplash("photo-1789110520164-2389992e5d0f"),
};

const BLACK = { color: "Preto", hex: "#141414" };
const WHITE = { color: "Branco", hex: "#e9e6df" };
const OFFWHITE = { color: "Off-white", hex: "#ddd8cc" };
const GRAY = { color: "Cinza mescla", hex: "#8a8a8a" };
const OLIVE = { color: "Verde-oliva", hex: "#3b4232" };
const SAND = { color: "Areia", hex: "#b8ad98" };

const teeSizes = {
  P: { chest: 50, length: 70, sleeve: 20 },
  M: { chest: 53, length: 72, sleeve: 21 },
  G: { chest: 56, length: 74, sleeve: 22 },
  GG: { chest: 59, length: 76, sleeve: 23 },
};

const oversizedSizes = {
  M: { chest: 60, length: 76, sleeve: 25 },
  G: { chest: 63, length: 78, sleeve: 26 },
  GG: { chest: 66, length: 80, sleeve: 27 },
};

const pantsSizes = {
  "38": { waist: 40, length: 104 },
  "40": { waist: 42, length: 105 },
  "42": { waist: 44, length: 106 },
  "44": { waist: 46, length: 107 },
  "46": { waist: 48, length: 108 },
};

const base = {
  available: true,
  example: true,
  updatedAt: "2026-10-10T00:00:00.000Z",
} as const;

export const seedProducts: Product[] = [
  {
    ...base,
    id: "exemplo-01",
    name: "Tee Essential",
    category: "Camiseta",
    priceCents: 8990,
    variants: [
      { ...WHITE, image: PHOTOS.teeWhiteConcrete, position: "50% 60%" },
      { ...BLACK, image: PHOTOS.teesBlackHanging, position: "50% 50%" },
    ],
    sizes: ["P", "M", "G", "GG"],
    measurements: teeSizes,
    fit: "Regular",
    fabric: "Algodão 100%, 180 g/m²",
    description:
      "A camiseta base do guarda-roupa. Gola reforçada e caimento reto.",
    badge: "Destaque",
  },
  {
    ...base,
    id: "exemplo-02",
    name: "Oversized Concrete",
    category: "Oversized",
    priceCents: 12990,
    variants: [
      { ...OFFWHITE, image: PHOTOS.teeOffwhiteWall, position: "50% 45%" },
      { ...BLACK, image: PHOTOS.teeBlackBackPrint, position: "50% 45%" },
    ],
    sizes: ["M", "G", "GG"],
    measurements: oversizedSizes,
    fit: "Oversized, ombro caído",
    fabric: "Algodão 100%, 240 g/m²",
    description:
      "Modelagem ampla e tecido pesado. Feita pra cair solta sem perder a forma.",
    badge: "Novo",
  },
  {
    ...base,
    id: "exemplo-03",
    name: "Cargo Track",
    category: "Calça",
    priceCents: 21900,
    variants: [{ ...OLIVE, image: PHOTOS.cargoOlive, position: "50% 88%" }],
    sizes: ["38", "40", "42", "44"],
    measurements: pantsSizes,
    fit: "Relaxed, barra com elástico",
    fabric: "Sarja de algodão",
    description:
      "Calça cargo de pernas largas, bolsos laterais e barra ajustada.",
    badge: "Destaque",
  },
  {
    ...base,
    id: "exemplo-04",
    name: "Polo Line",
    category: "Polo",
    priceCents: 14990,
    variants: [
      { ...BLACK, image: PHOTOS.poloBlack, position: "50% 40%" },
      { ...WHITE, image: PHOTOS.poloWhiteFolded, position: "50% 60%" },
    ],
    sizes: ["P", "M", "G"],
    measurements: teeSizes,
    fit: "Slim",
    fabric: "Piquê de algodão",
    description:
      "Polo limpa, com o mínimo de bordado. Gola firme e botões em tom sobre tom.",
  },
  {
    ...base,
    id: "exemplo-05",
    name: "Tee Essential II",
    category: "Camiseta",
    priceCents: 9590,
    variants: [{ ...WHITE, image: PHOTOS.teeWhiteHanger, position: "50% 50%" }],
    sizes: ["P", "M", "G", "GG"],
    measurements: teeSizes,
    fit: "Regular",
    fabric: "Algodão 100%, 200 g/m²",
    description:
      "Versão mais encorpada da Essential, com gola canelada mais alta.",
  },
  {
    ...base,
    id: "exemplo-06",
    name: "Wide Sand",
    category: "Calça",
    priceCents: 19900,
    variants: [
      { ...SAND, image: PHOTOS.chinoSandFlatlay, position: "12% 50%" },
    ],
    sizes: ["38", "40", "42", "44", "46"],
    measurements: pantsSizes,
    fit: "Wide leg",
    fabric: "Sarja leve de algodão",
    description:
      "Calça de perna larga em tom areia. Cós com passantes e bolsos faca.",
    badge: "Novo",
  },
  {
    ...base,
    id: "exemplo-07",
    name: "Hoodie Offline",
    category: "Oversized",
    priceCents: 24900,
    variants: [{ ...BLACK, image: PHOTOS.hoodieBlack, position: "50% 45%" }],
    sizes: ["M", "G", "GG"],
    measurements: oversizedSizes,
    fit: "Oversized",
    fabric: "Moletom felpado, 360 g/m²",
    description: "Capuz forrado, bolso canguru e punho largo. Peça de inverno.",
  },
  {
    ...base,
    id: "exemplo-08",
    name: "Jogger Static",
    category: "Calça",
    priceCents: 16900,
    variants: [{ ...GRAY, image: PHOTOS.joggerGray, position: "50% 65%" }],
    sizes: ["38", "40", "42", "44"],
    measurements: pantsSizes,
    fit: "Jogger, barra com elástico",
    fabric: "Moletom 320 g/m²",
    description:
      "Jogger de moletom cinza mescla, cós com elástico e bolsos laterais.",
  },
  {
    ...base,
    id: "exemplo-09",
    name: "Tee Static",
    category: "Camiseta",
    priceCents: 10900,
    variants: [{ ...BLACK, image: PHOTOS.teeBlackClose, position: "50% 50%" }],
    sizes: ["P", "M", "G", "GG"],
    measurements: teeSizes,
    fit: "Regular",
    fabric: "Algodão 100%, 180 g/m²",
    description:
      "Preto no preto: estampa em tom sobre tom nas costas, acabamento emborrachado.",
  },
  {
    ...base,
    id: "exemplo-10",
    name: "Polo Street",
    category: "Polo",
    priceCents: 15900,
    variants: [{ ...WHITE, image: PHOTOS.poloWhiteRack, position: "50% 40%" }],
    sizes: ["P", "M", "G", "GG"],
    measurements: teeSizes,
    fit: "Regular",
    fabric: "Piquê de algodão",
    description:
      "Polo de corte urbano, manga um pouco mais longa e barra reta.",
  },
];
