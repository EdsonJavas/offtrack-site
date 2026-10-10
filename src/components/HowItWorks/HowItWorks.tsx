"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { orderSteps } from "@/data/content";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./HowItWorks.module.css";

/** As seis etapas da encomenda, com uma linha que preenche conforme o scroll. */
export function HowItWorks() {
  const listRef = useRef<HTMLOListElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const list = listRef.current;
    const line = lineRef.current;
    if (!list || !line || reducedMotion) return;

    const tween = gsap.fromTo(
      line,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: list, start: "top 70%", end: "bottom 70%", scrub: true },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reducedMotion]);

  return (
    <section id="como-funciona" className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.aside}>
          <p className="eyebrow">Como funciona</p>
          <h2 className={styles.title}>
            Do Direct <span>até a sua mão.</span>
          </h2>
          <p className={styles.lead}>
            Toda peça é encomendada. Você só paga depois de confirmar modelo, tamanho, cor,
            valor e disponibilidade.
          </p>
        </Reveal>

        <ol ref={listRef} className={styles.steps}>
          <span className={styles.rail} aria-hidden="true">
            <span ref={lineRef} className={styles.line} />
          </span>

          {orderSteps.map((step, i) => (
            <Reveal key={step.title} delay={0.05}>
              <li className={styles.step}>
                <span className={styles.number}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
