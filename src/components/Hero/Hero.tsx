"use client";

import { useEffect, useRef, useState } from "react";
import { FrameSequence } from "@/components/FrameSequence/FrameSequence";
import { createProceduralSequence } from "@/components/FrameSequence/proceduralSequence";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { brand } from "@/data/brand";
import { Wordmark } from "@/components/ui/Wordmark";
import { drawHeroPlaceholder } from "./heroPlaceholder";
import styles from "./Hero.module.css";

// Trocar por createImageSequence({ count, url }) quando os frames reais existirem.
const heroSource = createProceduralSequence(drawHeroPlaceholder);

const [sloganLineOne, sloganLineTwo] = brand.slogan.split(", ");

/**
 * Viewports do fim do hero em que a animação já terminou (ver Products.module.css).
 * O palco fica preso até faltar 1 viewport; a Seleção (margem -100svh) começa a
 * cobrir faltando 2, no instante em que a animação termina. Animação: 2.2 viewports
 * (o ritmo original); cobertura: 1, durante a qual a cena recua e escurece.
 */
const OVERLAP_NEXT = 2;

/** Primeira tela: a sequência de frames comandada pelo scroll. */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loadRatio, setLoadRatio] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const overlay = overlayRef.current;
    if (!section || !overlay || reducedMotion) return;

    const ctx = gsap.context(() => {
      // Estado inicial explícito: dentro de timeline com scrub, o `from` não é confiável.
      gsap.set([`.${styles.lineOne}`, `.${styles.lineTwo}`], { yPercent: 150 });
      gsap.set(`.${styles.tag}`, { opacity: 0, y: 16 });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // A Seleção cobre o último viewport do hero: a animação termina antes.
          end: () => `bottom-=${OVERLAP_NEXT * window.innerHeight} bottom`,
          invalidateOnRefresh: true,
          scrub: 0.5,
        },
      });

      timeline
        .to(`.${styles.hint}`, { opacity: 0, duration: 0.15 }, 0)
        .to(
          `.${styles.wordmark}`,
          { yPercent: -40, opacity: 0, duration: 0.4 },
          0.15,
        )
        .to(`.${styles.sub}`, { opacity: 0, duration: 0.25 }, 0.15)
        // 150%, não 100%: o til do "Ã" sobe além da caixa da linha e vazaria pela máscara.
        .to(`.${styles.lineOne}`, { yPercent: 0, duration: 0.45 }, 0.55)
        .to(`.${styles.lineTwo}`, { yPercent: 0, duration: 0.45 }, 0.8)
        .to(`.${styles.tag}`, { opacity: 1, y: 0, duration: 0.3 }, 1.15);

      // Enquanto a Seleção sobe por cima, a cena recua e uma camada escurece por cima:
      // resposta imediata ao scroll. (Não mexe na opacity do overlay, que o loader controla.)
      const coverTrigger = {
        trigger: section,
        start: () => `bottom-=${OVERLAP_NEXT * window.innerHeight} bottom`,
        end: () => `bottom-=${window.innerHeight} bottom`,
        invalidateOnRefresh: true,
        scrub: 0.3,
      };
      gsap.to([overlay, section.querySelector("canvas")], {
        yPercent: -6,
        scale: 0.96,
        ease: "none",
        scrollTrigger: coverTrigger,
      });
      gsap.to(`.${styles.dim}`, {
        opacity: 0.75,
        ease: "none",
        scrollTrigger: coverTrigger,
      });
    }, section);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <FrameSequence
      ref={sectionRef}
      source={heroSource}
      scrollLength={4.2}
      overlapNext={OVERLAP_NEXT}
      onLoadProgress={(loaded, total) => setLoadRatio(loaded / total)}
      onReady={() => setReady(true)}
      className={styles.hero}
    >
      <div
        ref={overlayRef}
        className={[
          styles.overlay,
          ready ? styles.overlayReady : "",
          reducedMotion ? styles.static : "",
        ].join(" ")}
      >
        <div className={styles.intro}>
          <h1 className={styles.wordmark}>
            <Wordmark />
            {/* O slogan faz parte do título para leitores de tela e buscadores. */}
            <span className={styles.srOnly}>. {brand.slogan}</span>
          </h1>
          <p className={styles.sub}>
            Streetwear masculino · {brand.city}, {brand.state}
          </p>
        </div>

        <div className={styles.slogan} aria-hidden="true">
          <span className={styles.mask}>
            <span className={styles.lineOne}>{sloganLineOne},</span>
          </span>
          <span className={styles.mask}>
            <span className={styles.lineTwo}>{sloganLineTwo}</span>
          </span>
          <p className={styles.tag}>
            {brand.city}, {brand.state} · {brand.foundedYear}
          </p>
        </div>

        <p className={styles.hint}>
          <span className={styles.hintLine} />
          Role para entrar
        </p>
      </div>

      <div className={styles.dim} aria-hidden="true" />

      <div
        className={`${styles.loader} ${ready ? styles.loaderDone : ""}`}
        aria-hidden={ready}
      >
        <span className={styles.loaderText}>Aguardem.</span>
        <span className={styles.loaderBar}>
          <span
            className={styles.loaderFill}
            style={{ transform: `scaleX(${loadRatio})` }}
          />
        </span>
      </div>
    </FrameSequence>
  );
}
