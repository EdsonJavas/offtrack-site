"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { brand } from "@/data/brand";
import { Star } from "@/components/ui/Star";
import styles from "./Manifesto.module.css";

const lines = ["Não é só uma loja.", "É uma outra visão", "de streetwear."];

const marqueeItems = [brand.name, brand.slogan, brand.monogram, "Streetwear"];

/** Frase dos stories, palavra por palavra, acendendo conforme o scroll. */
export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.word}`,
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 55%", scrub: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`} ref={ref}>
        <p className="eyebrow">Manifesto</p>
        <h2 className={styles.statement}>
          {lines.map((line) => (
            <span key={line} className={styles.line}>
              {line.split(" ").map((word, i) => (
                <span key={`${line}-${i}`} className={styles.word}>
                  {word}
                </span>
              ))}
            </span>
          ))}
        </h2>
      </div>

      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.track}>
          {[0, 1].map((copy) =>
            marqueeItems.map((item) => (
              <span key={`${copy}-${item}`} className={styles.item}>
                {item}
                <Star size={12} />
              </span>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
