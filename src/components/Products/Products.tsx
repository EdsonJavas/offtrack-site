"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { brand } from "@/data/brand";
import type { Product, ProductCategory, ProductVariant } from "@/data/types";
import { useMediaValue } from "@/hooks/useMediaValue";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { favoritesStore } from "@/lib/favorites";
import { lenisStore } from "@/lib/lenis";
import { Reveal } from "@/components/ui/Reveal";
import { Star } from "@/components/ui/Star";
import { ProductCard } from "./ProductCard";
import { ProductDetail } from "./ProductDetail";
import styles from "./Products.module.css";

interface Selection {
  product: Product;
  variant: ProductVariant;
}

type Filter = ProductCategory | "Todas" | "Favoritos";

/** Cards visíveis por vez no carrossel. */
const COLUMNS = [
  { minWidth: 700, value: 2 },
  { minWidth: 1100, value: 3 },
  { minWidth: 1500, value: 4 },
];
/** A partir de 700px: carrossel lateral. Abaixo: grade de 2 colunas paginada. */
const CAROUSEL = [{ minWidth: 700, value: true }];
/** Celular: 2 fileiras de 2 por página (cabe quase numa tela; a paginação vem logo abaixo). */
const GRID_PER_PAGE = 4;
/** Arrasto com o mouse só começa depois deste deslocamento (senão é clique). */
const DRAG_THRESHOLD = 6;
/** Altura do header fixo + folga, para a lista não parar escondida atrás dele. */
const HEADER_OFFSET = 76;

/**
 * Catálogo com filtro por categoria e favoritos. Recebe as peças do servidor.
 * - Telas largas: carrossel com rolagem lateral nativa (trackpad, toque, shift+roda,
 *   arrastar com o mouse, teclado) e as setas como atalho de página.
 * - Celular: grade de 2 colunas com paginação numerada.
 */
export function Products({ products }: { products: Product[] }) {
  const columns = useMediaValue(COLUMNS, 2);
  const carousel = useMediaValue(CAROUSEL, false);
  const reducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("Todas");
  const [requestedPage, setPage] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listTopRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const drag = useRef<{ x: number; left: number; active: boolean } | null>(null);
  const suppressClick = useRef(false);
  /** Carrossel encostado no começo / no fim (desabilita a seta correspondente). */
  const [edges, setEdges] = useState({ start: true, end: false });
  const favoritesVersion = useSyncExternalStore(
    favoritesStore.subscribe,
    favoritesStore.version,
    () => 0,
  );

  const categories = [...new Set(products.map((p) => p.category))];
  const filters: Filter[] = ["Todas", ...categories, "Favoritos"];
  const count = (f: Filter) =>
    f === "Todas"
      ? products.length
      : f === "Favoritos"
        ? products.filter((p) => favoritesStore.has(p.id)).length
        : products.filter((p) => p.category === f).length;

  // favoritesVersion só força o recálculo quando a lista de favoritos muda.
  void favoritesVersion;
  const items =
    filter === "Todas"
      ? products
      : filter === "Favoritos"
        ? products.filter((p) => favoritesStore.has(p.id))
        : products.filter((p) => p.category === filter);

  const perPage = carousel ? columns : GRID_PER_PAGE;
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  // Se o filtro ou o breakpoint reduzirem as páginas, fica na última válida.
  const page = Math.min(requestedPage, pageCount - 1);
  const hasItems = items.length > 0;

  const scrollBehavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";

  /** Carrossel: rola até uma posição, sem passar do fim. */
  const scrollCarouselTo = (left: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    scroller.scrollTo({
      left: Math.max(0, Math.min(max, left)),
      behavior: scrollBehavior,
    });
  };

  /** Marcadores e paginação do celular: vai para uma página específica. */
  const goTo = (next: number) => {
    const target = Math.max(0, Math.min(pageCount - 1, next));

    if (carousel) {
      // A página acompanha o scroll (syncFromScroll); aqui só mandamos rolar.
      scrollCarouselTo(target * columns * cardStepOf(scrollerRef.current));
      return;
    }

    setPage(target);
    // Trocou de página lá embaixo: volta para o começo da lista.
    const top = listTopRef.current;
    if (top && top.getBoundingClientRect().top < 0) {
      const lenis = lenisStore.get();
      if (lenis) lenis.scrollTo(top, { offset: -HEADER_OFFSET });
      else top.scrollIntoView({ block: "start" });
    }
  };

  /**
   * Setas. No carrossel andam uma "tela" de cards a partir de onde o scroll
   * está (que pode ser no meio de uma página); no celular trocam de página.
   */
  const step = (direction: 1 | -1) => {
    if (!carousel) return goTo(page + direction);
    const scroller = scrollerRef.current;
    const unit = cardStepOf(scroller);
    if (!scroller || !unit) return;
    const current = Math.round(scroller.scrollLeft / unit);
    scrollCarouselTo((current + direction * columns) * unit);
  };

  /** Posição do scroll lateral → contador, marcadores e setas habilitadas. */
  const syncFromScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    const pageWidth = cardStepOf(scroller) * columns;
    if (!scroller || !pageWidth) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    const start = scroller.scrollLeft <= 2;
    const end = scroller.scrollLeft >= max - 2;
    setEdges((e) => (e.start === start && e.end === end ? e : { start, end }));
    setPage(
      end
        ? pageCount - 1
        : Math.min(pageCount - 1, Math.round(scroller.scrollLeft / pageWidth)),
    );
  }, [columns, pageCount]);

  const onScroll = () => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      syncFromScroll();
    });
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // Largura mudou, filtro mudou ou o carrossel acabou de montar: mede de novo.
  // (O ResizeObserver dispara uma vez ao começar a observar.)
  const itemCount = items.length;
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const observer = new ResizeObserver(() => syncFromScroll());
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [carousel, itemCount, syncFromScroll]);

  // Gesto horizontal do trackpad (ou shift+roda): não deixa chegar no scroll suave
  // da página (Lenis), que cancelaria o evento. O navegador rola o carrossel sozinho.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation();
    };
    scroller.addEventListener("wheel", onWheel, { passive: true });
    return () => scroller.removeEventListener("wheel", onWheel);
  }, [carousel, hasItems]);

  // ---- Arrastar com o mouse (toque e trackpad já rolam nativamente) ----

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    suppressClick.current = false;
    drag.current = {
      x: e.clientX,
      left: e.currentTarget.scrollLeft,
      active: false,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.active) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      d.active = true;
      suppressClick.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      // Sem snap durante o arrasto, senão o card "gruda" e o mouse escorrega.
      e.currentTarget.classList.add(styles.dragging);
    }
    e.currentTarget.scrollLeft = d.left - dx;
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d?.active) return;
    const scroller = e.currentTarget;
    const unit = cardStepOf(scroller);
    // Assenta no card mais próximo e só então religa o snap.
    if (unit) scrollCarouselTo(Math.round(scroller.scrollLeft / unit) * unit);
    window.setTimeout(() => scroller.classList.remove(styles.dragging), 450);
  };

  /** Soltar depois de arrastar não pode abrir a peça nem adicionar ao carrinho. */
  const onClickCapture = (e: MouseEvent) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const open = useCallback(
    (product: Product, variant: ProductVariant) =>
      setSelection({ product, variant }),
    [],
  );
  const close = useCallback(() => setSelection(null), []);

  const choose = (next: Filter) => {
    setFilter(next);
    setPage(0);
    if (scrollerRef.current) scrollerRef.current.scrollLeft = 0;
  };

  const pageItems = items.slice(page * perPage, page * perPage + perPage);
  const firstShown = page * perPage + 1;
  const lastShown = Math.min(items.length, (page + 1) * perPage);

  return (
    <section id="selecao" className={styles.section}>
      <Reveal className={styles.head}>
        <h2 className={styles.title}>
          Peças sob <span>encomenda.</span>
        </h2>
        <p className={styles.lead}>
          Você escolhe cor e tamanho, a gente confirma com o fornecedor e
          combina tudo pelo Direct.
        </p>
      </Reveal>

      {/* Condições à vista, antes de qualquer card. */}
      <ul className={styles.trust}>
        <li>
          <Star size={9} /> Nada é pago no site
        </li>
        <li>
          <Star size={9} /> 80% via Pix só depois da confirmação
        </li>
        <li>
          <Star size={9} /> Entrega em {brand.city}, {brand.state}
        </li>
      </ul>

      <div ref={listTopRef} className={styles.bar}>
        <div className={styles.filters}>
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={f === filter}
              className={`${styles.filter} ${f === filter ? styles.filterActive : ""}`}
              onClick={() => choose(f)}
            >
              {f}
              <span className={styles.filterCount}>{count(f)}</span>
            </button>
          ))}
        </div>

        <div className={styles.controls}>
          <p className={styles.counter} aria-live="polite">
            <span className={styles.counterLabel}>Página</span>
            <span>{String(page + 1).padStart(2, "0")}</span>
            <span className={styles.counterSep} />
            <span>{String(pageCount).padStart(2, "0")}</span>
          </p>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => step(-1)}
            disabled={carousel ? edges.start : page === 0}
            aria-label="Página anterior"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => step(1)}
            disabled={carousel ? edges.end : page === pageCount - 1}
            aria-label="Próxima página"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>

      {!hasItems ? (
        <p className={styles.emptyFilter}>
          {filter === "Favoritos"
            ? "Nenhuma peça favoritada ainda. Toque na estrela de um card."
            : products.length === 0
              ? "Novas peças em breve. Chama no Direct para saber o que já dá para encomendar."
              : "Nenhuma peça nesta categoria."}
        </p>
      ) : carousel ? (
        <>
          {/* Carrossel: scroll lateral nativo com snap por card. */}
          <div
            ref={scrollerRef}
            className={styles.scroller}
            role="region"
            aria-label="Peças. Role para o lado para ver mais."
            tabIndex={0}
            onScroll={onScroll}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={onClickCapture}
            onDragStart={(e) => e.preventDefault()}
          >
            <ul
              className={styles.rail}
              style={{ "--cols": columns } as React.CSSProperties}
            >
              {items.map((product, i) => (
                <li key={product.id} className={styles.slide}>
                  <ProductCard product={product} index={i} onOpen={open} />
                </li>
              ))}
            </ul>
          </div>

          {pageCount > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={i === page}
                  aria-label={`Página ${i + 1}`}
                  className={`${styles.dot} ${i === page ? styles.dotActive : ""}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Celular: grade de 2 colunas, uma página por vez. */}
          <ul className={styles.grid}>
            {pageItems.map((product, i) => (
              <li key={product.id}>
                <ProductCard product={product} index={i} onOpen={open} />
              </li>
            ))}
          </ul>

          {pageCount > 1 && (
            <nav className={styles.pager} aria-label="Páginas de peças">
              <p className={styles.pagerInfo}>
                <span>
                  Página <strong>{page + 1}</strong> de{" "}
                  <strong>{pageCount}</strong>
                </span>
                <span className={styles.pagerRange}>
                  {firstShown}–{lastShown} de {items.length} peças
                </span>
              </p>

              <ol className={styles.pagerNumbers}>
                {pageWindow(page, pageCount).map((entry, i) =>
                  entry === "gap" ? (
                    <li key={`gap-${i}`} className={styles.pagerGap} aria-hidden="true">
                      …
                    </li>
                  ) : (
                    <li key={entry}>
                      <button
                        type="button"
                        aria-current={entry === page ? "page" : undefined}
                        aria-label={`Página ${entry + 1}`}
                        className={`${styles.pagerNumber} ${entry === page ? styles.pagerNumberOn : ""}`}
                        onClick={() => goTo(entry)}
                      >
                        {entry + 1}
                      </button>
                    </li>
                  ),
                )}
              </ol>

              <div className={styles.pagerButtons}>
                <button
                  type="button"
                  className={styles.pagerButton}
                  onClick={() => goTo(page - 1)}
                  disabled={page === 0}
                >
                  <ArrowIcon direction="left" /> Anterior
                </button>
                <button
                  type="button"
                  className={`${styles.pagerButton} ${styles.pagerNext}`}
                  onClick={() => goTo(page + 1)}
                  disabled={page === pageCount - 1}
                >
                  Próxima <ArrowIcon direction="right" />
                </button>
              </div>
            </nav>
          )}
        </>
      )}

      {selection && (
        <ProductDetail
          key={selection.product.id}
          product={selection.product}
          initialVariant={selection.variant}
          onClose={close}
        />
      )}
    </section>
  );
}

/** Largura de um card + vão do carrossel, medida no DOM (0 se não está montado). */
function cardStepOf(scroller: HTMLElement | null): number {
  const slide = scroller?.querySelector<HTMLElement>("li");
  if (!slide?.parentElement) return 0;
  const gap = parseFloat(getComputedStyle(slide.parentElement).columnGap) || 0;
  return slide.offsetWidth + gap;
}

/** Números a mostrar: primeira, última, atual e vizinhas; "gap" vira reticências. */
function pageWindow(page: number, count: number): (number | "gap")[] {
  if (count <= 5) return Array.from({ length: count }, (_, i) => i);
  const shown = [
    ...new Set([0, page - 1, page, page + 1, count - 1]),
  ]
    .filter((n) => n >= 0 && n < count)
    .sort((a, b) => a - b);
  return shown.flatMap((n, i) =>
    i > 0 && n - shown[i - 1] > 1 ? (["gap", n] as const) : [n],
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      style={{ transform: direction === "left" ? "scaleX(-1)" : undefined }}
    >
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  );
}
