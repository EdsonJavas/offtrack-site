"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";
import {
  mockProducts,
  type Product,
  type ProductCategory,
  type ProductVariant,
} from "@/data/mock/products";
import { useMediaValue } from "@/hooks/useMediaValue";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "./ProductCard";
import { ProductDetail } from "./ProductDetail";
import styles from "./Products.module.css";

interface Selection {
  product: Product;
  variant: ProductVariant;
}

type Filter = ProductCategory | "Todas";

const SWIPE_THRESHOLD = 48;

const filters: Filter[] = [
  "Todas",
  ...new Set(mockProducts.map((p) => p.category)),
];

/**
 * Catálogo paginado com filtro por categoria. Hoje lê `mockProducts` (dados de exemplo).
 * Antes de publicar: trocar pela lista confirmada pelo dono e pelas fotos reais.
 */
export function Products() {
  const perPage = useMediaValue(
    [
      { minWidth: 640, value: 2 },
      { minWidth: 1000, value: 3 },
      { minWidth: 1300, value: 4 },
    ],
    1,
  );
  const [filter, setFilter] = useState<Filter>("Todas");
  const [requestedPage, setPage] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const dragStart = useRef<number | null>(null);

  const items =
    filter === "Todas"
      ? mockProducts
      : mockProducts.filter((p) => p.category === filter);
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  // Se o filtro ou o breakpoint reduzirem as páginas, fica na última válida.
  const page = Math.min(requestedPage, pageCount - 1);

  const goTo = (next: number) =>
    setPage(Math.max(0, Math.min(pageCount - 1, next)));
  const open = useCallback(
    (product: Product, variant: ProductVariant) =>
      setSelection({ product, variant }),
    [],
  );
  const close = useCallback(() => setSelection(null), []);

  const choose = (next: Filter) => {
    setFilter(next);
    setPage(0);
  };

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
    items.slice(i * perPage, i * perPage + perPage),
  );

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

      <div className={styles.bar}>
        <div className={styles.filters} role="tablist" aria-label="Categorias">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={f === filter}
              className={`${styles.filter} ${f === filter ? styles.filterActive : ""}`}
              onClick={() => choose(f)}
            >
              {f}
              <span className={styles.filterCount}>
                {f === "Todas"
                  ? mockProducts.length
                  : mockProducts.filter((p) => p.category === f).length}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.controls}>
          <p className={styles.counter}>
            <span>{String(page + 1).padStart(2, "0")}</span>
            <span className={styles.counterSep} />
            <span>{String(pageCount).padStart(2, "0")}</span>
          </p>
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
          {pages.map((pageItems, i) => (
            <ul
              key={`${filter}-${i}`}
              className={styles.page}
              style={{ "--per-page": perPage } as React.CSSProperties}
              aria-hidden={i !== page}
            >
              {pageItems.map((product, j) => (
                <li key={product.id}>
                  <ProductCard
                    product={product}
                    index={i * perPage + j}
                    onOpen={open}
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div
        className={styles.pagination}
        role="tablist"
        aria-label="Páginas da seleção"
      >
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
          initialVariant={selection.variant}
          onClose={close}
        />
      )}
    </section>
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
