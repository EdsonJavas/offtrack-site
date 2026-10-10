import type { GarmentKind } from "@/components/Garment/geometry";

/** Categorias confirmadas pelo dono + Calça (pedida pelo usuário como exemplo). */
export const CATEGORIES = [
  "Camiseta",
  "Oversized",
  "Polo",
  "Bermuda",
  "Calça",
] as const;
export type ProductCategory = (typeof CATEGORIES)[number];

/** Silhueta usada no esquema de medidas de cada categoria. */
export const CATEGORY_KIND: Record<ProductCategory, GarmentKind> = {
  Camiseta: "tee",
  Oversized: "oversized",
  Polo: "polo",
  Bermuda: "shorts",
  Calça: "pants",
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

export interface ProductVariant {
  color: string;
  hex: string;
  /** URL da foto (Blob em produção, /uploads em dev, ou exemplo). */
  image: string;
  /** `object-position` para enquadrar a peça na foto. */
  position?: string;
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
