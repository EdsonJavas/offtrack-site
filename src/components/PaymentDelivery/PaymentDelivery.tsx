import { brand } from "@/data/brand";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./PaymentDelivery.module.css";

const panels = [
  {
    label: "Pagamento",
    headline: "Pix. 80 + 20.",
    text: "80% de entrada na confirmação do pedido. Os 20% restantes quando a peça chega, antes da entrega. Outras formas de pagamento podem entrar no futuro.",
  },
  {
    label: "Entrega",
    headline: `${brand.city}, ${brand.state}.`,
    text: "Entregas locais no começo, inclusive entrega própria. O prazo é informado antes de você confirmar o pedido. Envio para outras cidades está sendo definido.",
  },
  {
    label: "Troca e devolução",
    headline: "Pelo CDC.",
    text: "Troca, devolução, cancelamento e reembolso seguem o Código de Defesa do Consumidor, incluindo o direito de arrependimento em compras online, quando aplicável.",
  },
];

export function PaymentDelivery() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        {panels.map((panel, i) => (
          <Reveal key={panel.label} delay={0.08 * i} className={styles.panel}>
            <p className="eyebrow">{panel.label}</p>
            <h2 className={styles.headline}>{panel.headline}</h2>
            <p className={styles.text}>{panel.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
