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

/** Um tamanho desta cor está marcado como esgotado? */
export function isSoldOut(variant: ProductVariant, size: string): boolean {
  return variant.soldOut?.includes(size) ?? false;
}

/** Todos os tamanhos da cor esgotados. */
export function variantSoldOut(
  product: Pick<Product, "sizes">,
  variant: ProductVariant,
): boolean {
  const sizes = sizesOf(product, variant);
  return sizes.length > 0 && sizes.every((s) => isSoldOut(variant, s));
}

/** Nenhuma cor com tamanho disponível: a peça inteira está esgotada. */
export function productSoldOut(product: Pick<Product, "sizes" | "variants">): boolean {
  return product.variants.every((v) => variantSoldOut(product, v));
}

/** Desconto em % quando há preço antigo ("de") maior que o atual; senão 0. */
export function discountPercent(
  product: Pick<Product, "priceCents" | "compareAtCents">,
): number {
  const was = product.compareAtCents ?? 0;
  if (was <= product.priceCents || product.priceCents <= 0) return 0;
  return Math.round((1 - product.priceCents / was) * 100);
}

export interface ProductVariant {
  color: string;
  hex: string;
  /** Tamanhos só desta cor (quando diferem dos da peça). */
  sizes?: string[];
  /** Tamanhos desta cor que estão esgotados (continuam à mostra, riscados). */
  soldOut?: string[];
  /** URL da foto (Vercel Blob). */
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
  /** Preço antigo ("de"), em centavos. Só aparece se for maior que o atual. */
  compareAtCents?: number;
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
  updatedAt: string;
}

/**
 * Dados da loja que só o dono sabe, preenchidos no painel (/admin/loja).
 * Tudo opcional: o que estiver vazio simplesmente não aparece no site.
 */
export interface StoreSettings {
  /** WhatsApp só com dígitos, com DDI e DDD (ex.: 5514999990000). */
  whatsapp?: string;
  email?: string;
  /** Razão social ou nome do responsável. */
  legalEntity?: string;
  /** CNPJ ou CPF. */
  legalDocument?: string;
  legalAddress?: string;
  /** Textos de política, escritos pelo dono, que entram em Termos e trocas. */
  shippingPolicy?: string;
  returnShippingPolicy?: string;
  cancellationPolicy?: string;
  exchangePolicy?: string;
}

export const STORE_FIELDS = [
  "whatsapp",
  "email",
  "legalEntity",
  "legalDocument",
  "legalAddress",
  "shippingPolicy",
  "returnShippingPolicy",
  "cancellationPolicy",
  "exchangePolicy",
] as const satisfies readonly (keyof StoreSettings)[];

/** Link de conversa do WhatsApp a partir do número salvo. */
export function whatsappUrl(number: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}`;
}

export interface Catalog {
  version: 1;
  products: Product[];
  store?: StoreSettings;
}
