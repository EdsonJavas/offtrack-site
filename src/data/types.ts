import type { GarmentKind } from "@/components/Garment/geometry";

/** Categorias confirmadas pelo dono + Calça (pedida pelo usuário como exemplo). */
export const CATEGORIES = [
  "Camiseta",
  "Oversized",
  "Polo",
  "Bermuda",
  "Calça",
  "Conjunto",
] as const;
export type ProductCategory = (typeof CATEGORIES)[number];

/** Silhueta usada no esquema de medidas de cada categoria. */
export const CATEGORY_KIND: Record<ProductCategory, GarmentKind> = {
  Camiseta: "tee",
  Oversized: "oversized",
  Polo: "polo",
  Bermuda: "shorts",
  Calça: "pants",
  // Conjunto (parte de cima + de baixo): esquema da peça de cima; medidas das duas.
  Conjunto: "oversized",
};

export type MeasureKey = "chest" | "length" | "sleeve" | "waist";

export const MEASURE_LABELS: Record<MeasureKey, string> = {
  chest: "Largura do peito",
  length: "Comprimento",
  sleeve: "Manga",
  waist: "Cintura",
};

/** Medidas que fazem sentido para cada silhueta. */
export const MEASURES_BY_KIND: Record<GarmentKind, MeasureKey[]> = {
  tee: ["chest", "length", "sleeve"],
  oversized: ["chest", "length", "sleeve"],
  polo: ["chest", "length", "sleeve"],
  shorts: ["waist", "length"],
  pants: ["waist", "length"],
};

/** Medidas pedidas no painel para uma categoria (o Conjunto soma a cintura). */
export function measuresFor(category: ProductCategory): MeasureKey[] {
  const base = MEASURES_BY_KIND[CATEGORY_KIND[category]];
  return category === "Conjunto" ? [...base, "waist"] : base;
}

/** Tamanhos de uma cor: os próprios dela, se tiver, senão os da peça. */
export function sizesOf(product: Pick<Product, "sizes">, variant: ProductVariant) {
  return variant.sizes && variant.sizes.length > 0 ? variant.sizes : product.sizes;
}

export interface ProductVariant {
  color: string;
  hex: string;
  /** Tamanhos só desta cor (quando diferem dos da peça). */
  sizes?: string[];
  /** URL da foto (Blob em produção, /uploads em dev, ou exemplo). */
  image: string;
  /** `object-position` para enquadrar a peça na foto. */
  position?: string;
  /** Fotos extras da mesma cor (galeria da etiqueta), depois da principal. */
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  /** Em centavos: R$ 89,90 = 8990. */
  priceCents: number;
  variants: ProductVariant[];
  sizes: string[];
  /** Medidas em cm, por tamanho. */
  measurements: Record<string, Partial<Record<MeasureKey, number>>>;
  fit: string;
  fabric: string;
  description: string;
  badge?: "Novo" | "Destaque";
  /** Código interno opcional, definido pelo dono. */
  sku?: string;
  /** Peça aparece no site. */
  available: boolean;
  /** Dado de exemplo: o site mostra o selo "EXEMPLO" e o painel pede substituição. */
  example?: boolean;
  updatedAt: string;
}

export interface Catalog {
  version: 1;
  products: Product[];
}
