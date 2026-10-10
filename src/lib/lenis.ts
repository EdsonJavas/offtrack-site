import type Lenis from "lenis";

/** Acesso à instância do Lenis fora do provider (ex.: travar o scroll num modal). */
let instance: Lenis | null = null;

export const lenisStore = {
  set(lenis: Lenis | null) {
    instance = lenis;
  },
  get() {
    return instance;
  },
};
