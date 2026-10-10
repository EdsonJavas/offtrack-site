import { Header } from "@/components/Header/Header";
import { Hero } from "@/components/Hero/Hero";
import { Manifesto } from "@/components/Manifesto/Manifesto";
import { Story } from "@/components/Story/Story";
import { Products } from "@/components/Products/Products";
import { HowItWorks } from "@/components/HowItWorks/HowItWorks";
import { PaymentDelivery } from "@/components/PaymentDelivery/PaymentDelivery";
import { Faq } from "@/components/Faq/Faq";
import { Contact } from "@/components/Contact/Contact";
import { Footer } from "@/components/Footer/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Manifesto />
        <Story />
        <Products />
        <HowItWorks />
        <PaymentDelivery />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
