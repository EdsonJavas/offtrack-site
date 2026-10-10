import { lenisStore } from "@/lib/lenis";

/**
 * Pilha de modais abertos. Enquanto houver um, a página de fundo fica `inert`
 * e o scroll travado; só o modal do topo responde ao Esc.
 */
const stack: symbol[] = [];

function applyBackground(locked: boolean) {
  document.body.style.overflow = locked ? "hidden" : "";
  const lenis = lenisStore.get();
  if (locked) lenis?.stop();
  else lenis?.start();
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
