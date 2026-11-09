"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { discountPercent, productSoldOut, type Product } from "@/data/types";
import { formatPrice } from "@/lib/format";
import {
  deleteProductAction,
  reorderProductsAction,
  toggleAvailableAction,
} from "./actions";
import styles from "./admin.module.css";

interface ProductListProps {
  products: Product[];
  readOnly: boolean;
}

interface Drag {
  from: number;
  to: number;
  dy: number;
  row: number;
}

/**
 * Lista do painel na ordem da vitrine. Arrastar pelo puxador (ou usar as
 * setas) muda a ordem e salva na hora; excluir pede confirmação no próprio item.
 */
export function ProductList({ products, readOnly }: ProductListProps) {
  const [items, setItems] = useState(products);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [savedAt, setSavedAt] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const start = useRef<{ y: number; from: number; row: number } | null>(null);

  // Lista nova do servidor (salvou, excluiu, ocultou): substitui a local.
  const serverKey = products.map((p) => `${p.id}:${p.updatedAt}:${p.available}`).join("|");
  const [seenKey, setSeenKey] = useState(serverKey);
  if (serverKey !== seenKey) {
    setSeenKey(serverKey);
    setItems(products);
  }

  useEffect(() => {
    if (!savedAt) return;
    const timer = window.setTimeout(() => setSavedAt(0), 1800);
    return () => window.clearTimeout(timer);
  }, [savedAt]);

  const commit = (next: Product[]) => {
    setItems(next);
    startSaving(async () => {
      await reorderProductsAction(next.map((p) => p.id));
      setSavedAt(Date.now());
    });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    commit(next);
  };

  // ---- Arrasto pelo puxador (mouse e toque) ----

  const rowHeight = (index: number) => {
    const li = listRef.current?.children[index] as HTMLElement | undefined;
    if (!li) return 0;
    const gap = parseFloat(getComputedStyle(listRef.current!).rowGap) || 0;
    return li.offsetHeight + gap;
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>, from: number) => {
    if (readOnly || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const row = rowHeight(from);
    start.current = { y: e.clientY, from, row };
    setDrag({ from, to: from, dy: 0, row });
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    if (!s) return;
    const dy = e.clientY - s.y;
    const shift = s.row ? Math.round(dy / s.row) : 0;
    const to = Math.max(0, Math.min(items.length - 1, s.from + shift));
    setDrag({ from: s.from, to, dy, row: s.row });
  };

  const onPointerUp = () => {
    const s = start.current;
    start.current = null;
    if (!s || !drag) return;
    const { from, to } = drag;
    setDrag(null);
    if (from !== to) move(from, to);
  };

  /** Deslocamento de cada item enquanto um está sendo arrastado. */
  const offsetFor = (index: number): string | undefined => {
    if (!drag) return undefined;
    if (index === drag.from) return `translateY(${drag.dy}px)`;
    if (drag.to > drag.from && index > drag.from && index <= drag.to)
      return `translateY(${-drag.row}px)`;
    if (drag.to < drag.from && index >= drag.to && index < drag.from)
      return `translateY(${drag.row}px)`;
    return undefined;
  };

  return (
    <>
      <p className={styles.orderStatus} aria-live="polite">
        {readOnly
          ? "Ordem da vitrine, da primeira à última peça."
          : saving
            ? "Salvando a ordem…"
            : savedAt
              ? "Ordem salva. O site já está atualizado."
              : "A ordem aqui é a ordem da vitrine: arraste pelo puxador ou use as setas."}
      </p>

      <ol ref={listRef} className={styles.list}>
        {items.map((p, index) => {
          const soldOut = productSoldOut(p);
          const discount = discountPercent(p);
          const dragging = drag?.from === index;
          return (
            <li
              key={p.id}
              className={`${styles.item} ${p.available ? "" : styles.itemOff} ${dragging ? styles.itemDragging : ""}`}
              style={{ transform: offsetFor(index) }}
            >
              {!readOnly && (
                <div className={styles.reorder}>
                  <button
                    type="button"
                    className={styles.handle}
                    aria-label={`Arrastar ${p.name} para reordenar`}
                    onPointerDown={(e) => onPointerDown(e, index)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                  >
                    <span />
                    <span />
                    <span />
                  </button>
                  <button
                    type="button"
                    className={styles.arrowBtn}
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0 || saving}
                    aria-label="Subir"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.arrowBtn}
                    onClick={() => move(index, index + 1)}
                    disabled={index === items.length - 1 || saving}
                    aria-label="Descer"
                  >
                    ↓
                  </button>
                </div>
              )}

              <div className={styles.thumb}>
                <Image
                  src={p.variants[0].image}
                  alt=""
                  fill
                  sizes="80px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div className={styles.itemBody}>
                <p className={styles.itemMeta}>
                  <span className={styles.itemIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {p.category} · {p.variants.map((v) => v.color).join(", ")} ·{" "}
                  {p.sizes.join(" ")}
                  {!p.available && <span className={styles.tag}>oculta</span>}
                  {soldOut && <span className={styles.tag}>esgotada</span>}
                  {discount > 0 && <span className={styles.tag}>−{discount}%</span>}
                </p>
                <p className={styles.itemName}>{p.name}</p>
                <p className={styles.itemPrice}>
                  {formatPrice(p.priceCents)}
                  {discount > 0 && (
                    <s className={styles.itemWas}>{formatPrice(p.compareAtCents!)}</s>
                  )}
                </p>
              </div>

              {!readOnly && (
                <div className={styles.itemActions}>
                  {confirming === p.id ? (
                    <>
                      <span className={styles.confirmText}>Excluir esta peça?</span>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className={styles.dangerSolid}>
                          Sim, excluir
                        </button>
                      </form>
                      <button
                        type="button"
                        className={styles.ghost}
                        onClick={() => setConfirming(null)}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href={`/admin/produto/${p.id}`} className={styles.ghost}>
                        Editar
                      </Link>
                      <Link
                        href={`/peca/${p.id}`}
                        target="_blank"
                        className={styles.ghost}
                      >
                        Ver
                      </Link>
                      <form action={toggleAvailableAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className={styles.ghost}>
                          {p.available ? "Ocultar" : "Mostrar"}
                        </button>
                      </form>
                      <button
                        type="button"
                        className={styles.danger}
                        onClick={() => setConfirming(p.id)}
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
