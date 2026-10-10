import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/SmoothScroll/SmoothScroll";
import { CartProvider } from "@/components/Cart/CartProvider";
import { CartDrawer } from "@/components/Cart/CartDrawer";
import { Header } from "@/components/Header/Header";
import { brand, siteUrl } from "@/data/brand";
import { getProducts } from "@/lib/catalog";

/** Loja pública: scroll suave, carrinho e header. O painel (/admin) fica fora disso. */
export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const products = await getProducts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: brand.name,
    description: brand.description,
    url: siteUrl,
    sameAs: [brand.instagram.url],
    address: {
      "@type": "PostalAddress",
      addressLocality: brand.city,
      addressRegion: brand.state,
      addressCountry: "BR",
    },
    ...(brand.email ? { email: brand.email } : {}),
    ...(brand.whatsapp ? { telephone: brand.whatsapp.number } : {}),
  };

  return (
    <CartProvider catalog={products}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SmoothScroll>
        <Header />
        {children}
      </SmoothScroll>
      <CartDrawer />
    </CartProvider>
  );
}
