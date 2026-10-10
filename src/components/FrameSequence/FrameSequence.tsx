"use client";

import { useEffect, useRef, type ReactNode, type Ref } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import type { FrameSource, LoadProgress } from "./types";
import styles from "./FrameSequence.module.css";

interface FrameSequenceProps {
  source: FrameSource;
  /** Altura da seção em viewports: define quanto scroll a sequência ocupa. */
  scrollLength?: number;
  /**
   * Viewports no fim da seção que a próxima seção cobre (ela sobe por cima do palco).
   * A sequência termina antes dessa faixa, para não animar escondida.
   */
  overlapNext?: number;
  onLoadProgress?: LoadProgress;
  onReady?: () => void;
  /** Conteúdo sobreposto ao canvas, dentro do palco fixo. */
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
}

const MAX_DPR = 2;

/**
 * Seção alta com um palco fixo (sticky). Conforme a página rola por ela,
 * o progresso (0 a 1) escolhe qual frame vai para o canvas.
 */
export function FrameSequence({
  source,
  scrollLength = 3,
  overlapNext = 0,
  onLoadProgress,
  onReady,
  children,
  className,
  ref,
}: FrameSequenceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacks = useRef({ onLoadProgress, onReady });

  useEffect(() => {
    callbacks.current = { onLoadProgress, onReady };
  });

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderer = source();
    let progress = 0;
    let width = 0;
    let height = 0;
    let frameRequest = 0;

    const render = () => {
      frameRequest = 0;
      ctx.clearRect(0, 0, width, height);
      renderer.draw(ctx, progress, width, height);
    };

    const scheduleRender = () => {
      if (!frameRequest) frameRequest = requestAnimationFrame(render);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scheduleRender();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `bottom-=${overlapNext * window.innerHeight} bottom`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progress = self.progress;
        scheduleRender();
      },
    });

    renderer
      .load((loaded, total) => {
        callbacks.current.onLoadProgress?.(loaded, total);
        scheduleRender();
      })
      .then(() => {
        scheduleRender();
        callbacks.current.onReady?.();
      });

    return () => {
      cancelAnimationFrame(frameRequest);
      observer.disconnect();
      trigger.kill();
      renderer.dispose();
    };
  }, [source, overlapNext]);

  const setRefs = (node: HTMLElement | null) => {
    sectionRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <section
      ref={setRefs}
      className={`${styles.section} ${className ?? ""}`}
      style={{ height: `${scrollLength * 100}svh` }}
    >
      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        {children}
      </div>
    </section>
  );
}
