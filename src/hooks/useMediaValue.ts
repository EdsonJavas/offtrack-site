"use client";

import { useSyncExternalStore } from "react";

interface Breakpoint<T> {
  minWidth: number;
  value: T;
}

/**
 * Devolve o valor do maior breakpoint que a viewport satisfaz.
 * `fallback` vale no servidor e abaixo de todos os breakpoints.
 */
export function useMediaValue<T>(breakpoints: Breakpoint<T>[], fallback: T): T {
  const queries = breakpoints.map((bp) => `(min-width: ${bp.minWidth}px)`);

  const subscribe = (onChange: () => void) => {
    const lists = queries.map((q) => window.matchMedia(q));
    lists.forEach((l) => l.addEventListener("change", onChange));
    return () => lists.forEach((l) => l.removeEventListener("change", onChange));
  };

  const getSnapshot = () => {
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      if (window.matchMedia(queries[i]).matches) return breakpoints[i].value;
    }
    return fallback;
  };

  return useSyncExternalStore(subscribe, getSnapshot, () => fallback);
}
