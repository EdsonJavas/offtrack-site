import type { ReactNode, Ref } from "react";
import styles from "./ScrollStage.module.css";

interface ScrollStageProps {
  /** Altura da seção em viewports: quanto scroll a cena ocupa. */
  scrollLength: number;
  id?: string;
  className?: string;
  stageClassName?: string;
  children: ReactNode;
  ref?: Ref<HTMLElement>;
}

/**
 * Seção alta com um palco fixo (sticky). A seção que a usa cria sua própria
 * timeline GSAP com `scrub`, tendo a seção como trigger ("top top" → "bottom bottom").
 */
export function ScrollStage({
  scrollLength,
  id,
  className,
  stageClassName,
  children,
  ref,
}: ScrollStageProps) {
  return (
    <section
      ref={ref}
      id={id}
      className={`${styles.section} ${className ?? ""}`}
      style={{ height: `${scrollLength * 100}svh` }}
    >
      <div className={`${styles.stage} ${stageClassName ?? ""}`}>
        {children}
      </div>
    </section>
  );
}
