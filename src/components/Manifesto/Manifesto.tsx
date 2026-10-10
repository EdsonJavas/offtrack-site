"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { brand } from "@/data/brand";
import { pillars, story } from "@/data/content";
import { ScrollStage } from "@/components/ScrollStage/ScrollStage";
import { Star } from "@/components/ui/Star";
import styles from "./Manifesto.module.css";

/**
 * A marca como uma faixa horizontal: a página rola para baixo e a cena
 * anda para o lado, painel a painel, da frase dos stories até a origem.
 */
export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || reducedMotion) return;

    const mm = gsap.matchMedia();

    // Desktop: a página rola para baixo e a faixa anda para o lado.
    mm.add("(min-width: 900px)", () => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      });

      // Carimbos batem na tela conforme o painel deles aparece.
      gsap.utils
        .toArray<HTMLElement>(`.${styles.stamp}`, section)
        .forEach((stamp, i) => {
          gsap.from(stamp, {
            scale: 1.6,
            rotate: -12 + i * 8,
            autoAlpha: 0,
            ease: "power3.out",
            duration: 0.6,
            scrollTrigger: {
              trigger: section,
              start: `${52 + i * 6}% bottom`,
              toggleActions: "play none none reverse",
            },
          });
        });
    });

    // Celular: pilha de cartões. Quando o próximo painel sobe por cima, o de
    // baixo recua um pouco e escurece (transform + opacity, nada de layout).
    mm.add("(max-width: 899px)", () => {
      const panels = gsap.utils.toArray<HTMLElement>(`.${styles.panel}`, section);
      panels.forEach((panel, i) => {
        const next = panels[i + 1];
        if (!next) return;
        gsap.to(panel, {
          scale: 0.94,
          "--veil": 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: next,
            start: "top bottom",
            end: "top top",
            scrub: 0.3,
          },
        });
      });

      gsap.utils
        .toArray<HTMLElement>(`.${styles.stamp}`, section)
        .forEach((stamp, i) => {
          gsap.from(stamp, {
            scale: 1.3,
            rotate: -8 + i * 6,
            autoAlpha: 0,
            ease: "power3.out",
            duration: 0.5,
            scrollTrigger: {
              trigger: stamp,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
        });
    });

    return () => mm.revert();
  }, [reducedMotion]);

  return (
    <ScrollStage
      ref={sectionRef}
      id="marca"
      scrollLength={4}
      className={styles.section}
      stageClassName={styles.stage}
    >
      <div ref={trackRef} className={styles.track}>
        <article className={`${styles.panel} ${styles.panelOne}`}>
          <p className="eyebrow">Manifesto</p>
          <h2 className={styles.big}>
            Não é só <br />
            uma loja.
          </h2>
          <Star size={28} className={styles.cornerStar} />
        </article>

        <article className={`${styles.panel} ${styles.panelTwo}`}>
          <h2 className={styles.big}>
            É uma outra visão <span>de streetwear.</span>
          </h2>
          <p className={styles.lead}>
            Roupa é extensão da personalidade de quem veste. Seleção alinhada ao
            estilo urbano, identidade visual marcante e atendimento próximo.
          </p>
        </article>

        <article className={`${styles.panel} ${styles.panelThree}`}>
          <p className="eyebrow">Os três pilares</p>
          <div className={styles.stamps}>
            {pillars.map((pillar, i) => (
              <div key={pillar.title} className={styles.stamp}>
                <span className={styles.stampIndex}>0{i + 1}</span>
                <h3 className={styles.stampTitle}>{pillar.title}</h3>
                <p className={styles.stampText}>{pillar.text}</p>
              </div>
            ))}
          </div>
        </article>

        <article className={`${styles.panel} ${styles.panelFour}`}>
          <p className={styles.year}>{brand.foundedYear}</p>
          <div className={styles.origin}>
            <p className="eyebrow">
              {brand.city}, {brand.state}
            </p>
            <h2 className={styles.originTitle}>
              A coragem de tirar <span>um sonho do papel.</span>
            </h2>
            <p className={styles.originText}>{story}</p>
          </div>
        </article>
      </div>
    </ScrollStage>
  );
}
