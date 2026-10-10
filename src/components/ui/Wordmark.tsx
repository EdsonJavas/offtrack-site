import { brand } from "@/data/brand";
import styles from "./Wordmark.module.css";

interface WordmarkProps {
  className?: string;
  /** Só o contorno (fantasma do rodapé). */
  hollow?: boolean;
}

/**
 * Logotipo em texto, no desenho do logo oficial: OFFTRACK em traço pesado,
 * estrela alta de quatro pontas saindo do canto do K e ® rente à base.
 * Herda cor e tamanho de fonte de quem o usa.
 */
export function Wordmark({ className, hollow = false }: WordmarkProps) {
  return (
    <span
      className={`${styles.mark} ${hollow ? styles.hollow : ""} ${className ?? ""}`}
    >
      <span className={styles.text}>{brand.name}</span>

      {/* A estrela do hero (heroPlaceholder): 4 pontas retas, miolo em 16% do raio. */}
      <svg
        className={styles.star}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 0 13.36 10.64 24 12 13.36 13.36 12 24 10.64 13.36 0 12 10.64 10.64z" />
      </svg>

      <svg className={styles.reg} viewBox="0 0 24 24" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="10.25"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        {/* R desenhado à mão: haste, bojo e perna. */}
        <path
          d="M8.6 17.5V6.5h4.1c2.3 0 3.7 1.3 3.7 3.2 0 1.5-.9 2.6-2.3 3l2.6 4.8h-2.6l-2.3-4.4h-.9v4.4zm2.3-6.3h1.6c1 0 1.6-.6 1.6-1.5s-.6-1.4-1.6-1.4h-1.6z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}
