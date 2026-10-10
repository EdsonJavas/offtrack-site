/**
 * MOCK — dados de exemplo para desenvolvimento.
 * Nomes, preços, cores, tamanhos e descrições são fictícios e NÃO podem ir ao ar.
 * As fotos são de banco de imagens (Unsplash, licença livre), não das peças da loja:
 * substituir pelas fotos reais quando o dono enviar.
 * As categorias são as que o dono confirmou: camiseta tradicional, oversized,
 * camisa polo e bermuda.
 */
export type ProductCategory = "Camiseta" | "Oversized" | "Polo" | "Bermuda";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  /** Em reais. Mock: o dono ainda não precificou. */
  price: number;
  colors: ProductColor[];
  sizes: string[];
  /** Foto principal e foto alternativa (mostrada no hover). */
  images: [string, string];
  fit: string;
  fabric: string;
  description: string;
  badge?: "Novo" | "Destaque";
}

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;

const BLACK = { name: "Preto", hex: "#101010" };
const WHITE = { name: "Off-white", hex: "#ece9e2" };
const GRAY = { name: "Cinza", hex: "#6f6f6f" };
const GRAPHITE = { name: "Grafite", hex: "#2b2b2b" };

export const mockProducts: Product[] = [
  {
    id: "mock-01",
    name: "Tee Essential",
    category: "Camiseta",
    price: 89,
    colors: [BLACK, WHITE],
    sizes: ["P", "M", "G", "GG"],
    images: [unsplash("photo-1499972823984-af6ee544403f"), unsplash("photo-1744297428826-0a575d7033f6")],
    fit: "Regular",
    fabric: "Algodão 100%, 180 g/m²",
    description: "A camiseta base do guarda-roupa. Gola reforçada e caimento reto.",
    badge: "Destaque",
  },
  {
    id: "mock-02",
    name: "Oversized Concrete",
    category: "Oversized",
    price: 129,
    colors: [BLACK, GRAY],
    sizes: ["M", "G", "GG"],
    images: [unsplash("photo-1652823780977-b22c0ed84c97"), unsplash("photo-1609711866428-8b8a1e9b5fcf")],
    fit: "Oversized, ombro caído",
    fabric: "Algodão 100%, 240 g/m²",
    description: "Modelagem ampla e tecido pesado. Feita pra cair solta sem perder a forma.",
    badge: "Novo",
  },
  {
    id: "mock-03",
    name: "Polo Line",
    category: "Polo",
    price: 149,
    colors: [BLACK, WHITE],
    sizes: ["P", "M", "G"],
    images: [unsplash("photo-1571387670773-987a72a44e1a"), unsplash("photo-1764084052707-f0d560ad67cf")],
    fit: "Slim",
    fabric: "Piquê de algodão",
    description: "Polo limpa, sem bordado na frente. Gola firme e botões em tom sobre tom.",
  },
  {
    id: "mock-04",
    name: "Bermuda Track",
    category: "Bermuda",
    price: 119,
    colors: [BLACK, GRAPHITE],
    sizes: ["38", "40", "42", "44"],
    images: [unsplash("photo-1542850261-73bf6b4c0187"), unsplash("photo-1555295097-704fb87a85dc")],
    fit: "Reta, acima do joelho",
    fabric: "Sarja com elastano",
    description: "Bermuda de sarja com bolsos laterais e cós com cordão interno.",
  },
  {
    id: "mock-05",
    name: "Tee Monogram",
    category: "Camiseta",
    price: 99,
    colors: [WHITE, BLACK],
    sizes: ["P", "M", "G", "GG"],
    images: [unsplash("photo-1744297428826-0a575d7033f6"), unsplash("photo-1499972823984-af6ee544403f")],
    fit: "Regular",
    fabric: "Algodão 100%, 180 g/m²",
    description: "Monograma OT. discreto no peito. Mesma base da Essential.",
  },
  {
    id: "mock-06",
    name: "Oversized Static",
    category: "Oversized",
    price: 139,
    colors: [GRAY, BLACK],
    sizes: ["M", "G", "GG"],
    images: [unsplash("photo-1559436194-ec317a4bafeb"), unsplash("photo-1723678712998-22157b59e929")],
    fit: "Oversized, ombro caído",
    fabric: "Algodão 100%, 240 g/m²",
    description: "Cinza mescla com acabamento lavado. Barra reta e manga mais larga.",
    badge: "Destaque",
  },
  {
    id: "mock-07",
    name: "Hoodie Offline",
    category: "Oversized",
    price: 219,
    colors: [BLACK, WHITE],
    sizes: ["M", "G", "GG"],
    images: [unsplash("photo-1609711866428-8b8a1e9b5fcf"), unsplash("photo-1632682582909-2b3a2581eef7")],
    fit: "Oversized",
    fabric: "Moletom felpado, 360 g/m²",
    description: "Capuz forrado, bolso canguru e punho largo. Peça de inverno.",
    badge: "Novo",
  },
  {
    id: "mock-08",
    name: "Polo Street",
    category: "Polo",
    price: 159,
    colors: [WHITE, GRAPHITE],
    sizes: ["P", "M", "G", "GG"],
    images: [unsplash("photo-1571387670773-987a72a44e1a"), unsplash("photo-1622218478798-ec7906afdb00")],
    fit: "Regular",
    fabric: "Piquê de algodão",
    description: "Polo de corte urbano, manga um pouco mais longa e barra reta.",
  },
  {
    id: "mock-09",
    name: "Bermuda Cargo",
    category: "Bermuda",
    price: 139,
    colors: [GRAPHITE, BLACK],
    sizes: ["38", "40", "42", "44", "46"],
    images: [unsplash("photo-1555295097-704fb87a85dc"), unsplash("photo-1542850261-73bf6b4c0187")],
    fit: "Relaxed",
    fabric: "Sarja de algodão",
    description: "Bolsos cargo nas laterais e cós com cordão. Caimento mais solto.",
  },
];

export const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
