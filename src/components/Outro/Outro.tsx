"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { brand } from "@/data/brand";
import { useCart } from "@/components/Cart/CartProvider";
import { ScrollStage } from "@/components/ScrollStage/ScrollStage";
import { Star } from "@/components/ui/Star";
import styles from "./Outro.module.css";

/**
 * Contato e rodapé numa cena só: o nome gigante, vazado, vai se preenchendo
 * de branco conforme o scroll chega ao fim.
 */
export function Outro() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const cart = useCart();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.wordFill}`,
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.4 },
        },
      );
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <ScrollStage ref={sectionRef} id="contato" scrollLength={2} className={styles.section}>
      <div className={styles.stage}>
        <div className={styles.top}>
          <div>
            <p className="eyebrow">Contato</p>
            <h2 className={styles.title}>
              Fala com <span>a gente.</span>
            </h2>
          </div>

          <div className={styles.actions}>
            <a href={brand.instagram.direct} target="_blank" rel="noopener noreferrer" className={styles.primary}>
              <Star size={11} />
              Direct no Instagram
            </a>
            <button type="button" className={styles.secondary} onClick={cart.open}>
              Carrinho <span>{String(cart.count).padStart(2, "0")}</span>
            </button>
            <p className={styles.handle}>{brand.instagram.handle}</p>
          </div>
        </div>

        <div className={styles.word} aria-hidden="true">
          <span className={styles.wordOutline}>{brand.name}</span>
          <span className={styles.wordFill}>{brand.name}</span>
        </div>

        <footer className={styles.foot}>
          <p className={styles.slogan}>
            <Star size={10} />
            {brand.slogan}
          </p>
          <p className={styles.meta}>
            {brand.city}, {brand.state} · © {brand.foundedYear} {brand.name}
          </p>
          <a href={brand.instagram.url} target="_blank" rel="noopener noreferrer" className={styles.meta}>
            {brand.instagram.handle}
          </a>
        </footer>
      </div>
    </ScrollStage>
  );
}
