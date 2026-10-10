import { faq } from "@/data/content";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Faq.module.css";

export function Faq() {
  return (
    <section id="faq" className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.aside}>
          <p className="eyebrow">Perguntas frequentes</p>
          <h2 className={styles.title}>Sem letra miúda.</h2>
        </Reveal>

        <div className={styles.list}>
          {faq.map((item, i) => (
            <Reveal key={item.q} delay={0.04 * i}>
              <details className={styles.item}>
                <summary className={styles.question}>
                  <span>{item.q}</span>
                  <span className={styles.icon} aria-hidden="true" />
                </summary>
                <p className={styles.answer}>{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
