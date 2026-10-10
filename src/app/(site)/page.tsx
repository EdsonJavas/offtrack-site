import { Hero } from "@/components/Hero/Hero";
import { Products } from "@/components/Products/Products";
import { Journey } from "@/components/Journey/Journey";
import { Manifesto } from "@/components/Manifesto/Manifesto";
import { Faq } from "@/components/Faq/Faq";
import { Outro } from "@/components/Outro/Outro";
import { getProducts } from "@/lib/catalog";

export default async function Home() {
  const products = await getProducts();

  return (
    <main id="top">
      <Hero />
      <Products products={products} />
      <Journey />
      <Manifesto />
      <Faq />
      <Outro />
    </main>
  );
}
