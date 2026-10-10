/**
 * MOCK — dados de exemplo para desenvolvimento.
 * Nomes, preços, cores, tamanhos, medidas e descrições são fictícios e NÃO podem ir ao ar.
 * As peças são desenhadas em SVG (src/components/Garment) até as fotos reais chegarem.
 * As categorias são as que o dono confirmou: camiseta tradicional, oversized,
 * camisa polo e bermuda.
 */
import type { GarmentKind } from "@/components/Garment/geometry";

export type ProductCategory = "Camiseta" | "Oversized" | "Polo" | "Bermuda";

export type MeasureKey = "chest" | "length" | "sleeve" | "waist";

export const MEASURE_LABELS: Record<MeasureKey, string> = {
  chest: "Largura do peito",
  length: "Comprimento",
  sleeve: "Manga",
  waist: "Cintura",
};

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  kind: GarmentKind;
  /** Em reais. Mock: o dono ainda não precificou. */
  price: number;
  colors: ProductColor[];
  sizes: string[];
  /** Medidas em cm, por tamanho. */
  measurements: Record<string, Partial<Record<MeasureKey, number>>>;
  fit: string;
  fabric: string;
  description: string;
  badge?: "Novo" | "Destaque";
}

const BLACK = { name: "Preto", hex: "#141414" };
const WHITE = { name: "Off-white", hex: "#e9e6df" };
const GRAY = { name: "Cinza mescla", hex: "#7a7a7a" };
const GRAPHITE = { name: "Grafite", hex: "#2e2e2e" };
const SAND = { name: "Areia", hex: "#b8ad98" };

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

const shortsSizes = {
  "38": { waist: 40, length: 46 },
  "40": { waist: 42, length: 47 },
  "42": { waist: 44, length: 48 },
  "44": { waist: 46, length: 49 },
  "46": { waist: 48, length: 50 },
};

export const mockProducts: Product[] = [
  {
    id: "mock-01",
    name: "Tee Essential",
    category: "Camiseta",
    kind: "tee",
    price: 89,
    colors: [BLACK, WHITE, GRAY],
    sizes: ["P", "M", "G", "GG"],
    measurements: teeSizes,
    fit: "Regular",
    fabric: "Algodão 100%, 180 g/m²",
    description: "A camiseta base do guarda-roupa. Gola reforçada e caimento reto.",
    badge: "Destaque",
  },
  {
    id: "mock-02",
    name: "Oversized Concrete",
    category: "Oversized",
    kind: "oversized",
    price: 129,
    colors: [BLACK, GRAY, SAND],
    sizes: ["M", "G", "GG"],
    measurements: oversizedSizes,
    fit: "Oversized, ombro caído",
    fabric: "Algodão 100%, 240 g/m²",
    description: "Modelagem ampla e tecido pesado. Feita pra cair solta sem perder a forma.",
    badge: "Novo",
  },
  {
    id: "mock-03",
    name: "Polo Line",
    category: "Polo",
    kind: "polo",
    price: 149,
    colors: [BLACK, WHITE],
    sizes: ["P", "M", "G"],
    measurements: teeSizes,
    fit: "Slim",
    fabric: "Piquê de algodão",
    description: "Polo limpa, sem bordado na frente. Gola firme e botões em tom sobre tom.",
  },
  {
    id: "mock-04",
    name: "Bermuda Track",
    category: "Bermuda",
    kind: "shorts",
    price: 119,
    colors: [BLACK, GRAPHITE],
    sizes: ["38", "40", "42", "44"],
    measurements: shortsSizes,
    fit: "Reta, acima do joelho",
    fabric: "Sarja com elastano",
    description: "Bermuda de sarja com bolsos laterais e cós com cordão interno.",
  },
  {
    id: "mock-05",
    name: "Tee Monogram",
    category: "Camiseta",
    kind: "tee",
    price: 99,
    colors: [WHITE, BLACK],
    sizes: ["P", "M", "G", "GG"],
    measurements: teeSizes,
    fit: "Regular",
    fabric: "Algodão 100%, 180 g/m²",
    description: "Monograma OT. discreto no peito. Mesma base da Essential.",
  },
  {
    id: "mock-06",
    name: "Oversized Static",
    category: "Oversized",
    kind: "oversized",
    price: 139,
    colors: [GRAY, BLACK, WHITE],
    sizes: ["M", "G", "GG"],
    measurements: oversizedSizes,
    fit: "Oversized, ombro caído",
    fabric: "Algodão 100%, 240 g/m²",
    description: "Cinza mescla com acabamento lavado. Barra reta e manga mais larga.",
    badge: "Destaque",
  },
  {
    id: "mock-07",
    name: "Polo Street",
    category: "Polo",
    kind: "polo",
    price: 159,
    colors: [WHITE, GRAPHITE, SAND],
    sizes: ["P", "M", "G", "GG"],
    measurements: teeSizes,
    fit: "Regular",
    fabric: "Piquê de algodão",
    description: "Polo de corte urbano, manga um pouco mais longa e barra reta.",
    badge: "Novo",
  },
  {
    id: "mock-08",
    name: "Bermuda Cargo",
    category: "Bermuda",
    kind: "shorts",
    price: 139,
    colors: [GRAPHITE, BLACK, SAND],
    sizes: ["38", "40", "42", "44", "46"],
    measurements: shortsSizes,
    fit: "Relaxed",
    fabric: "Sarja de algodão",
    description: "Bolsos cargo nas laterais e cós com cordão. Caimento mais solto.",
  },
  {
    id: "mock-09",
    name: "Tee Static",
    category: "Camiseta",
    kind: "tee",
    price: 95,
    colors: [GRAY, SAND],
    sizes: ["P", "M", "G", "GG"],
    measurements: teeSizes,
    fit: "Regular",
    fabric: "Algodão 100%, 180 g/m²",
    description: "Versão mescla da Essential, com estampa pequena nas costas.",
  },
];

export const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
