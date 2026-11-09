import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/SmoothScroll/SmoothScroll";
import { CartProvider } from "@/components/Cart/CartProvider";
import { CartDrawer } from "@/components/Cart/CartDrawer";
import { Header } from "@/components/Header/Header";
import { StoreProvider } from "@/components/Store/StoreProvider";
import { brand, siteUrl } from "@/data/brand";
import { getProducts, getStore } from "@/lib/catalog";

/** Loja pública: scroll suave, carrinho e header. O painel (/admin) fica fora disso. */
export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [products, store] = await Promise.all([getProducts(), getStore()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: brand.name,
    description: brand.description,
    url: siteUrl,
    sameAs: [brand.instagram.url],
    address: {
      "@type": "PostalAddress",
      ...(store.legalAddress ? { streetAddress: store.legalAddress } : {}),
      addressLocality: brand.city,
      addressRegion: brand.state,
      addressCountry: "BR",
    },
    ...(store.email ? { email: store.email } : {}),
    ...(store.whatsapp ? { telephone: `+${store.whatsapp}` } : {}),
  };

  return (
    <StoreProvider settings={store}>
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
    </StoreProvider>
  );
}
