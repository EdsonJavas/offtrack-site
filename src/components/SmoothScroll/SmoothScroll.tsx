"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { lenisStore } from "@/lib/lenis";

/** Rolagem suave (Lenis) sincronizada com o ScrollTrigger do GSAP. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true });
    const update = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    lenisStore.set(lenis);

    return () => {
      lenisStore.set(null);
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, [reducedMotion]);

  // O layout muda depois da hidratação (paginação, fontes, imagens): os gatilhos do
  // ScrollTrigger ficam com posições velhas. Recalcula quando o body muda de tamanho,
  // quando as fontes carregam, no `load` e num atraso de segurança.
  useEffect(() => {
    let timer = 0;
    const refresh = () => ScrollTrigger.refresh();
    const debounced = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(refresh, 150);
    };

    const observer = new ResizeObserver(debounced);
    observer.observe(document.body);
    document.fonts?.ready.then(debounced);
    window.addEventListener("load", debounced);
    const safety = window.setTimeout(refresh, 1200);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(safety);
      window.removeEventListener("load", debounced);
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}
