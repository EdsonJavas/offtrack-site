"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { brand } from "@/data/brand";
import { formatPrice } from "@/data/mock/products";
import { lenisStore } from "@/lib/lenis";
import { buildOrderMessage, sendOrder } from "@/lib/order";
import { Star } from "@/components/ui/Star";
import { useCart } from "./CartProvider";
import styles from "./CartDrawer.module.css";

const DEPOSIT = 0.8;
const noopSubscribe = () => () => {};

/** Gaveta lateral com as peças escolhidas e o botão que leva tudo pro Direct. */
export function CartDrawer() {
  const cart = useCart();
  const { isOpen, close } = cart;
  const [copied, setCopied] = useState(false);
  // false no servidor, true no cliente: o portal só existe depois da hidratação.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    if (!isOpen) return;
    const lenis = lenisStore.get();
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2600);
    return () => clearTimeout(timer);
  }, [copied]);

  const checkout = async () => {
    const message = buildOrderMessage(cart.items);
    setCopied(await sendOrder(message));
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <div className={`${styles.toast} ${cart.toast ? styles.toastVisible : ""}`} role="status">
        <Star size={10} />
        {cart.toast}
      </div>

      <div className={`${styles.root} ${cart.isOpen ? styles.rootOpen : ""}`} aria-hidden={!cart.isOpen}>
        <button type="button" className={styles.backdrop} onClick={cart.close} aria-label="Fechar carrinho" />

        <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label="Carrinho">
          <header className={styles.head}>
            <p className={styles.title}>
              Carrinho <span>{String(cart.count).padStart(2, "0")}</span>
            </p>
            <button type="button" className={styles.close} onClick={cart.close} aria-label="Fechar">
              <span />
              <span />
            </button>
          </header>

          <div className={styles.tape} aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i}>Sob encomenda ✦ Pix 80 + 20 ✦ {brand.city}, {brand.state} ✦&nbsp;</span>
            ))}
          </div>

          {cart.items.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Nada aqui ainda.</p>
              <p className={styles.emptyText}>Escolhe uma peça, cor e tamanho. Depois é só chamar a gente.</p>
            </div>
          ) : (
            <ul className={styles.list} data-lenis-prevent>
              {cart.items.map((item, i) => (
                <li key={item.key} className={styles.item} style={{ "--i": i } as React.CSSProperties}>
                  <div className={styles.thumb}>
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="96px"
                      style={{ objectFit: "cover", objectPosition: item.position ?? "50% 50%" }}
                    />
                  </div>
                  <div className={styles.itemBody}>
                    <p className={styles.itemCategory}>{item.category}</p>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemMeta}>
                      <span className={styles.dot} style={{ background: item.hex }} />
                      {item.color} · Tam. {item.size}
                    </p>
                    <div className={styles.itemRow}>
                      <div className={styles.qty}>
                        <button type="button" onClick={() => cart.setQty(item.key, item.qty - 1)} aria-label="Menos um">
                          −
                        </button>
                        <span>{item.qty}</span>
                        <button type="button" onClick={() => cart.setQty(item.key, item.qty + 1)} aria-label="Mais um">
                          +
                        </button>
                      </div>
                      <p className={styles.itemPrice}>{formatPrice(item.price * item.qty)}</p>
                    </div>
                  </div>
                  <button type="button" className={styles.remove} onClick={() => cart.remove(item.key)} aria-label="Remover">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <footer className={styles.foot}>
            <div className={styles.totals}>
              <p>
                <span>Total</span>
                <strong>{formatPrice(cart.subtotal)}</strong>
              </p>
              <p className={styles.deposit}>
                <span>Entrada (80% via Pix)</span>
                <strong>{formatPrice(cart.subtotal * DEPOSIT)}</strong>
              </p>
            </div>

            <button type="button" className={styles.checkout} onClick={checkout} disabled={cart.items.length === 0}>
              Chamar no Direct com {cart.count === 1 ? "esta peça" : "estas peças"}
              <Star size={11} />
            </button>
            <p className={styles.hint}>
              {copied
                ? "Pedido copiado. Cole no Direct e manda."
                : "A gente confirma disponibilidade, prazo e valor antes de você pagar."}
            </p>
            {cart.items.length > 0 && (
              <button type="button" className={styles.clear} onClick={cart.clear}>
                Esvaziar carrinho
              </button>
            )}
          </footer>
        </aside>
      </div>
    </>,
    document.body,
  );
}
