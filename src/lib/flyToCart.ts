/**
 * Feedback de "adicionado": uma cópia da foto da peça sai do lugar onde ela
 * está, encolhe e voa até o botão do carrinho no header, que dá um pulo.
 * Só transform e opacity (compositor), com a Web Animations API.
 */
export const CART_BUMP_EVENT = "offtrack:cart-bump";

export function flyToCart(source: HTMLElement | null | undefined): Promise<void> {
  const target = document.querySelector<HTMLElement>("[data-cart-button]");
  if (!source || !target || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.dispatchEvent(new CustomEvent(CART_BUMP_EVENT));
    return Promise.resolve();
  }

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (from.width === 0 || to.width === 0) {
    window.dispatchEvent(new CustomEvent(CART_BUMP_EVENT));
    return Promise.resolve();
  }

  const src =
    source instanceof HTMLImageElement
      ? source.currentSrc || source.src
      : source.querySelector("img")?.currentSrc ?? "";

  const ghost = document.createElement("div");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    zIndex: "1000",
    pointerEvents: "none",
    backgroundImage: src ? `url("${src}")` : "none",
    backgroundColor: "#242424",
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "1px solid rgba(244,244,242,0.6)",
    transformOrigin: "top left",
    willChange: "transform, opacity",
  } as CSSStyleDeclaration);
  document.body.appendChild(ghost);

  const size = 28;
  const dx = to.left + to.width / 2 - size / 2 - from.left;
  const dy = to.top + to.height / 2 - size / 2 - from.top;
  const scale = size / Math.max(from.width, from.height);

  const animation = ghost.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1, offset: 0 },
      { transform: "translate(0, 0) scale(0.92)", opacity: 1, offset: 0.12 },
      {
        transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
        opacity: 0.9,
        offset: 0.9,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0, offset: 1 },
    ],
    { duration: 720, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" },
  );

  return new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      ghost.remove();
      window.dispatchEvent(new CustomEvent(CART_BUMP_EVENT));
      resolve();
    };
    animation.onfinish = done;
    animation.oncancel = done;
    // Aba em segundo plano pode congelar a animação: não deixa a gaveta presa.
    window.setTimeout(done, 1200);
  });
}
