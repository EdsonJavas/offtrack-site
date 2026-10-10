"use client";

import { useMemo, useSyncExternalStore } from "react";

interface Breakpoint<T> {
  minWidth: number;
  value: T;
}

/**
 * Devolve o valor do maior breakpoint que a viewport satisfaz.
 * `fallback` vale no servidor e abaixo de todos os breakpoints.
 * Passe `breakpoints` como constante de módulo: a assinatura é refeita se ele mudar.
 */
export function useMediaValue<T>(breakpoints: Breakpoint<T>[], fallback: T): T {
  const store = useMemo(() => {
    const queries = breakpoints.map((bp) => `(min-width: ${bp.minWidth}px)`);
    return {
      subscribe(onChange: () => void) {
        const lists = queries.map((q) => window.matchMedia(q));
        lists.forEach((l) => l.addEventListener("change", onChange));
        return () =>
          lists.forEach((l) => l.removeEventListener("change", onChange));
      },
      getSnapshot() {
        for (let i = breakpoints.length - 1; i >= 0; i--) {
          if (window.matchMedia(queries[i]).matches)
            return breakpoints[i].value;
        }
        return fallback;
      },
    };
  }, [breakpoints, fallback]);

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => fallback,
  );
}
