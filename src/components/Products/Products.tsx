"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";
import { mockProducts, type Product, type ProductColor } from "@/data/mock/products";
import { useMediaValue } from "@/hooks/useMediaValue";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "./ProductCard";
import { ProductDetail } from "./ProductDetail";
import styles from "./Products.module.css";

interface Selection {
  product: Product;
  color: ProductColor;
}

const SWIPE_THRESHOLD = 48;

/**
 * Seleção de peças, paginada. Hoje lê `mockProducts` (dados de exemplo).
 * Antes de publicar: trocar pela lista confirmada pelo dono e pelas fotos reais.
 */
export function Products() {
  const perPage = useMediaValue([{ minWidth: 700, value: 2 }, { minWidth: 1100, value: 3 }], 1);
  const pageCount = Math.ceil(mockProducts.length / perPage);
  const [requestedPage, setPage] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const dragStart = useRef<number | null>(null);

  const open = useCallback((product: Product, color: ProductColor) => setSelection({ product, color }), []);
  const close = useCallback(() => setSelection(null), []);

  // Se o breakpoint mudar e houver menos páginas, fica na última válida.
  const page = Math.min(requestedPage, pageCount - 1);

  const goTo = (next: number) => setPage(Math.max(0, Math.min(pageCount - 1, next)));

  const onPointerDown = (e: PointerEvent) => {
    dragStart.current = e.clientX;
  };

  const onPointerUp = (e: PointerEvent) => {
    if (dragStart.current === null) return;
    const delta = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(delta) > SWIPE_THRESHOLD) goTo(page + (delta < 0 ? 1 : -1));
  };

  const pages = Array.from({ length: pageCount }, (_, i) =>
    mockProducts.slice(i * perPage, i * perPage + perPage),
  );

  return (
    <section id="selecao" className={styles.section}>
      <Reveal className={styles.head}>
        <div>
          <p className="eyebrow">Seleção</p>
          <h2 className={styles.title}>Peças sob encomenda.</h2>
        </div>

        <div className={styles.controls}>
          <p className={styles.counter}>
            <span>{String(page + 1).padStart(2, "0")}</span>
            <span className={styles.counterSep} />
            <span>{String(pageCount).padStart(2, "0")}</span>
          </p>
          <div className={styles.arrows}>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => goTo(page - 1)}
              disabled={page === 0}
              aria-label="Página anterior"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => goTo(page + 1)}
              disabled={page === pageCount - 1}
              aria-label="Próxima página"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>
      </Reveal>

      <div
        className={styles.viewport}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (dragStart.current = null)}
      >
        <div
          className={styles.track}
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {pages.map((items, i) => (
            <ul
              key={i}
              className={styles.page}
              style={{ "--per-page": perPage } as React.CSSProperties}
              aria-hidden={i !== page}
            >
              {items.map((product, j) => (
                <li key={product.id}>
                  <ProductCard product={product} index={i * perPage + j} onOpen={open} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className={styles.pagination} role="tablist" aria-label="Páginas da seleção">
        {pages.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === page}
            aria-label={`Página ${i + 1}`}
            className={`${styles.dot} ${i === page ? styles.dotActive : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {selection && (
        <ProductDetail
          key={selection.product.id}
          product={selection.product}
          initialColor={selection.color}
          onClose={close}
        />
      )}
    </section>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
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
