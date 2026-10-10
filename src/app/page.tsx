import { Header } from "@/components/Header/Header";
import { Hero } from "@/components/Hero/Hero";
import { Products } from "@/components/Products/Products";
import { Journey } from "@/components/Journey/Journey";
import { Manifesto } from "@/components/Manifesto/Manifesto";
import { Faq } from "@/components/Faq/Faq";
import { Outro } from "@/components/Outro/Outro";

export default function Home() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Products />
        <Journey />
        <Manifesto />
        <Faq />
        <Outro />
      </main>
    </>
  );
}
