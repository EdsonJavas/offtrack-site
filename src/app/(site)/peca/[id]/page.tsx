import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand, siteUrl } from "@/data/brand";
import { productSoldOut, type Product } from "@/data/types";
import { getProduct, getProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { ProductView } from "@/components/Products/ProductView";
import { PieceLinks } from "@/components/Products/PieceLinks";
import styles from "@/components/Products/ProductDetail.module.css";

type Params = Promise<{ id: string }>;

const OTHER_PIECES = 4;

function describe(product: Product): string {
  return (
    product.description ||
    `${product.name}: ${product.category.toLowerCase()} sob encomenda na ${brand.name}, em ${brand.city}, ${brand.state}.`
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Peça não encontrada" };

  const description = describe(product);
  const priced = `${product.name} · ${formatPrice(product.priceCents)}`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/peca/${product.id}` },
    // A imagem vem de opengraph-image.tsx, nesta mesma pasta.
    openGraph: {
      title: priced,
      description,
      url: `/peca/${product.id}`,
      type: "website",
      siteName: brand.name,
      locale: "pt_BR",
    },
    twitter: { card: "summary_large_image", title: priced, description },
  };
}

/**
 * Página própria de uma peça: o link que vai no story, no Direct e no
 * WhatsApp. O conteúdo é a mesma etiqueta da janela da Seleção.
 */
export default async function PiecePage({ params }: { params: Params }) {
  const { id } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const others = products
    .filter((p) => p.id !== product.id)
    // Mesma categoria primeiro; o resto mantém a ordem da vitrine.
    .sort(
      (a, b) =>
        Number(b.category === product.category) -
        Number(a.category === product.category),
    )
    .slice(0, OTHER_PIECES);

  const url = `${siteUrl}/peca/${product.id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: describe(product),
    category: product.category,
    image: product.variants.flatMap((v) => [v.image, ...(v.images ?? [])]),
    brand: { "@type": "Brand", name: brand.name },
    ...(product.sku ? { sku: product.sku } : {}),
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "BRL",
      price: (product.priceCents / 100).toFixed(2),
      // Loja sob encomenda: o que não está esgotado é feito por pedido.
      availability: productSoldOut(product)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/PreOrder",
    },
  };

  return (
    <main id="top">
      <div className={styles.pageShell}>
        {/* Nome gigante vazado ao fundo, como na janela da Seleção. */}
        <div className={styles.watermark} aria-hidden="true">
          <span>
            {product.name} ✦ {product.name} ✦ {product.name} ✦&nbsp;
          </span>
        </div>
        <ProductView key={product.id} product={product} mode="page" />
      </div>

      <PieceLinks products={others} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
