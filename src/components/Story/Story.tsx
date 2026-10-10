import { brand } from "@/data/brand";
import { Reveal } from "@/components/ui/Reveal";
import { Star } from "@/components/ui/Star";
import styles from "./Story.module.css";

const pillars = [
  {
    index: "01",
    title: "Fora da pista",
    text: "Não depender de padrões para definir quem você é. Personalidade, atitude e confiança para seguir o próprio estilo.",
  },
  {
    index: "02",
    title: "Roupa é extensão",
    text: "A peça é uma extensão da personalidade de quem veste. Seleção alinhada ao estilo urbano, com identidade visual marcante.",
  },
  {
    index: "03",
    title: "Perto de você",
    text: "Atendimento próximo, do primeiro contato até a entrega. Uma marca reconhecida pela experiência, não só pelas roupas.",
  },
];

/** História e conceito, só com o que o dono contou. */
export function Story() {
  return (
    <section id="marca" className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.aside}>
          <p className="eyebrow">A marca</p>
          <p className={styles.year}>{brand.foundedYear}</p>
          <p className={styles.place}>
            <Star size={10} />
            {brand.city}, {brand.state}
          </p>
        </Reveal>

        <div className={styles.body}>
          <Reveal>
            <h2 className={styles.title}>
              A coragem de tirar <span>um sonho do papel.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.text}>
              A OFFTRACK nasceu em {brand.foundedYear}, do sonho de construir algo próprio e
              transformar a paixão por moda em um negócio. Começou do zero, no digital, com
              determinação, vontade de crescer e visão de longo prazo. O próximo passo é
              conquistar espaço na moda masculina e, no futuro, abrir uma loja física.
            </p>
          </Reveal>

          <ul className={styles.pillars}>
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.index} delay={0.08 * i}>
                <li className={styles.pillar}>
                  <span className={styles.index}>{pillar.index}</span>
                  <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                  <p className={styles.pillarText}>{pillar.text}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
