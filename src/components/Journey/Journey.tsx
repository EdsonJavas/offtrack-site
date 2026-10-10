"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { journey, journeyNote } from "@/data/content";
import { ScrollStage } from "@/components/ScrollStage/ScrollStage";
import { Star } from "@/components/ui/Star";
import styles from "./Journey.module.css";

const STEPS = journey.length;

/**
 * A encomenda como uma cena fixa: conforme a página rola, a estrela percorre
 * a linha, o contador avança e cada passo entra no lugar do anterior.
 */
export function Journey() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;

    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>(`.${styles.step}`);
      const digits = gsap.utils.toArray<HTMLElement>(`.${styles.digit}`);
      const nodes = gsap.utils.toArray<HTMLElement>(`.${styles.node}`);

      gsap.set(steps.slice(1), { autoAlpha: 0, y: 40 });
      gsap.set(digits.slice(1), { yPercent: 100 });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.5 },
      });

      // Linha preenche e a estrela desce do primeiro ao último nó.
      timeline
        .fromTo(`.${styles.fill}`, { scaleY: 0 }, { scaleY: 1, duration: STEPS - 1 }, 0)
        .to(`.${styles.marker}`, { top: "100%", duration: STEPS - 1 }, 0);

      // Cada passo: o anterior sai, o novo entra, o dígito rola, o nó acende.
      for (let i = 1; i < STEPS; i++) {
        const at = i - 1;
        timeline
          .to(steps[i - 1], { autoAlpha: 0, y: -40, duration: 0.45 }, at + 0.3)
          .to(steps[i], { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.55)
          .to(digits[i - 1], { yPercent: -100, duration: 0.4 }, at + 0.4)
          .to(digits[i], { yPercent: 0, duration: 0.4 }, at + 0.4)
          .to(nodes[i], { scale: 1, duration: 0.2 }, at + 0.8);
      }
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <ScrollStage ref={sectionRef} id="como-funciona" scrollLength={STEPS} className={styles.section}>
      <div className={styles.stage}>
        <header className={styles.head}>
          <p className="eyebrow">Como funciona</p>
          <h2 className={styles.title}>
            Do Direct <span>até a sua mão.</span>
          </h2>
        </header>

        {/* Contador 01 … 06 com dígitos rolando */}
        <div className={styles.counter} aria-hidden="true">
          <span className={styles.counterMask}>
            {journey.map((_, i) => (
              <span key={i} className={styles.digit}>
                {String(i + 1).padStart(2, "0")}
              </span>
            ))}
          </span>
          <span className={styles.counterTotal}>/ {String(STEPS).padStart(2, "0")}</span>
        </div>

        {/* Linha com nós e a estrela viajando */}
        <div className={styles.rail} aria-hidden="true">
          <span className={styles.track} />
          <span className={styles.fill} />
          {journey.map((_, i) => (
            <span key={i} className={styles.node} style={{ top: `${(i / (STEPS - 1)) * 100}%` }} />
          ))}
          <span className={styles.marker}>
            <Star size={22} />
          </span>
        </div>

        {/* Passos sobrepostos; só um visível por vez */}
        <div className={styles.steps}>
          {journey.map((step, i) => (
            <article key={step.title} className={styles.step}>
              <p className={styles.tag}>{step.tag}</p>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
              {i === STEPS - 1 && <p className={styles.note}>{journeyNote}</p>}
            </article>
          ))}
        </div>

        <p className={styles.hint} aria-hidden="true">
          Continue rolando
        </p>
      </div>
    </ScrollStage>
  );
}
