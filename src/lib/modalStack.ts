import { lenisStore } from "@/lib/lenis";

/**
 * Pilha de modais abertos. Enquanto houver um, a página de fundo fica `inert`
 * e o scroll travado; só o modal do topo responde ao Esc.
 */
const stack: symbol[] = [];

/** Áreas que podem rolar dentro de um modal. */
const SCROLLABLE = "[data-lenis-prevent]";

/**
 * No iOS, `overflow: hidden` no body não segura o dedo: o fundo continua
 * rolando por baixo do modal. Bloqueia o gesto fora das áreas roláveis do modal.
 */
function blockTouch(e: TouchEvent) {
  const target = e.target as Element | null;
  const area = target?.closest<HTMLElement>(SCROLLABLE);
  if (!area) {
    e.preventDefault();
    return;
  }
  // Área sem o que rolar: também bloqueia, senão o gesto cai no body.
  if (area.scrollHeight <= area.clientHeight) e.preventDefault();
}

function applyBackground(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  document.body.style.overflow = locked ? "hidden" : "";
  const lenis = lenisStore.get();
  if (locked) lenis?.stop();
  else lenis?.start();
  if (locked) {
    document.addEventListener("touchmove", blockTouch, { passive: false });
  } else {
    document.removeEventListener("touchmove", blockTouch);
  }
  // Tudo que não é modal (os modais ficam em portais no fim do body).
  document
    .querySelectorAll<HTMLElement>("body > header, body > main, body > footer")
    .forEach((el) => {
      el.inert = locked;
    });
}

export const modalStack = {
  push(token: symbol) {
    stack.push(token);
    if (stack.length === 1) applyBackground(true);
  },
  pop(token: symbol) {
    const i = stack.indexOf(token);
    if (i !== -1) stack.splice(i, 1);
    if (stack.length === 0) applyBackground(false);
  },
  isTop(token: symbol) {
    return stack[stack.length - 1] === token;
  },
};
