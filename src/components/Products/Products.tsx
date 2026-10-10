"use client";

import {
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
} from "react";
import { brand } from "@/data/brand";
import type { Product, ProductCategory, ProductVariant } from "@/data/types";
import { useMediaValue } from "@/hooks/useMediaValue";
import { favoritesStore } from "@/lib/favorites";
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

const SWIPE_THRESHOLD = 48;
const BREAKPOINTS = [
  { minWidth: 700, value: 2 },
  { minWidth: 1100, value: 3 },
  { minWidth: 1500, value: 4 },
];

/** Catálogo paginado com filtro por categoria e favoritos. Recebe as peças do servidor. */
export function Products({ products }: { products: Product[] }) {
  const perPage = useMediaValue(BREAKPOINTS, 1);
  const [filter, setFilter] = useState<Filter>("Todas");
  const [requestedPage, setPage] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const dragStart = useRef<number | null>(null);
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
  const example = products.some((p) => p.example);

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

      {example && (
        <p className={styles.exampleNotice}>
          Catálogo de exemplo: fotos e preços ilustrativos. As peças reais
          entram quando forem cadastradas.
        </p>
      )}

      <div className={styles.bar}>
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

      {items.length === 0 ? (
        <p className={styles.emptyFilter}>
          {filter === "Favoritos"
            ? "Nenhuma peça favoritada ainda. Toque na estrela de um card."
            : "Nenhuma peça nesta categoria."}
        </p>
      ) : (
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
                // inert: páginas fora da tela não recebem foco nem leitura.
                inert={i !== page}
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
      )}

      {pageCount > 1 && (
        <div className={styles.pagination}>
          {pages.map((_, i) => (
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
