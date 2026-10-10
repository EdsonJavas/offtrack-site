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

  // A altura da página muda depois da hidratação (paginação, fontes, imagens):
  // recalcula os gatilhos do ScrollTrigger sempre que o body mudar de tamanho.
  useEffect(() => {
    let timer = 0;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    });
    observer.observe(document.body);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}
