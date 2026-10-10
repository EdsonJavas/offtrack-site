import { brand } from "@/data/brand";
import { Star } from "./Star";
import styles from "./Wordmark.module.css";

interface WordmarkProps {
  className?: string;
  /** Só o contorno (fantasma do rodapé). */
  hollow?: boolean;
}

/**
 * Logotipo em texto, no desenho do logo oficial: OFFTRACK em traço pesado,
 * estrela de quatro pontas no canto superior direito e ® rente ao pé do K.
 * Herda cor e tamanho de fonte de quem o usa.
 */
export function Wordmark({ className, hollow = false }: WordmarkProps) {
  return (
    <span
      className={`${styles.mark} ${hollow ? styles.hollow : ""} ${className ?? ""}`}
    >
      <span className={styles.text}>{brand.name}</span>
      <Star className={styles.star} />
      <span className={styles.reg} aria-hidden="true">
        ®
      </span>
    </span>
  );
}
