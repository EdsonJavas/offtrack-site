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

      {/* Estrela esguia: a ponta vertical é mais longa que a horizontal, como no logo. */}
      <svg
        className={styles.star}
        viewBox="0 0 14 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M7 0c.35 8.2 1.9 10.9 7 12-5.1 1.1-6.65 3.8-7 12-.35-8.2-1.9-10.9-7-12 5.1-1.1 6.65-3.8 7-12z" />
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
