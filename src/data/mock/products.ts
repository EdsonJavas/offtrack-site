/**
 * MOCK — dados de exemplo para desenvolvimento.
 * Nomes, preços, cores e tamanhos aqui são fictícios e NÃO podem ir ao ar.
 * As categorias são as que o dono confirmou: camiseta tradicional, oversized,
 * camisa polo e bermuda. Substituir pela lista definitiva quando ela chegar.
 */
export type ProductCategory = "Camiseta" | "Oversized" | "Polo" | "Bermuda";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  /** Em reais. Mock: o dono ainda não precificou. */
  price: number;
  colors: string[];
  sizes: string[];
}

export const mockProducts: Product[] = [
  {
    id: "mock-01",
    name: "Tee Essential",
    category: "Camiseta",
    price: 89,
    colors: ["Preto", "Branco"],
    sizes: ["P", "M", "G", "GG"],
  },
  {
    id: "mock-02",
    name: "Oversized Concrete",
    category: "Oversized",
    price: 129,
    colors: ["Preto", "Cinza"],
    sizes: ["M", "G", "GG"],
  },
  {
    id: "mock-03",
    name: "Polo Line",
    category: "Polo",
    price: 149,
    colors: ["Preto", "Off-white"],
    sizes: ["P", "M", "G"],
  },
  {
    id: "mock-04",
    name: "Bermuda Track",
    category: "Bermuda",
    price: 119,
    colors: ["Preto"],
    sizes: ["38", "40", "42", "44"],
  },
  {
    id: "mock-05",
    name: "Tee Monogram",
    category: "Camiseta",
    price: 99,
    colors: ["Branco"],
    sizes: ["P", "M", "G", "GG"],
  },
  {
    id: "mock-06",
    name: "Oversized Static",
    category: "Oversized",
    price: 139,
    colors: ["Cinza", "Preto"],
    sizes: ["M", "G", "GG"],
  },
];

export const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
