"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { brand } from "@/data/brand";
import { formatPrice, splitDeposit } from "@/lib/format";
import { buildOrderMessage, sendOrder, type SendResult } from "@/lib/order";
import { useModal } from "@/hooks/useModal";
import { Star } from "@/components/ui/Star";
import { useCart } from "./CartProvider";
import { OrderMessage } from "./OrderMessage";
import styles from "./CartDrawer.module.css";

const noopSubscribe = () => () => {};

/** Gaveta lateral com as peças escolhidas e o botão que leva tudo pro Direct. */
export function CartDrawer() {
  const cart = useCart();
  const { isOpen, close } = cart;
  const [result, setResult] = useState<SendResult | null>(null);
  const [message, setMessage] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  // false no servidor, true no cliente: o portal só existe depois da hidratação.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useModal(isOpen, drawerRef, close);

  const checkout = () => {
    const text = buildOrderMessage(cart.items);
    setMessage(text);
    sendOrder(text).then(setResult);
  };

  const { deposit } = splitDeposit(cart.subtotal);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className={`${styles.toast} ${cart.toast ? styles.toastVisible : ""}`}
        role="status"
      >
        <Star size={10} />
        {cart.toast}
      </div>

      <div
        className={`${styles.root} ${isOpen ? styles.rootOpen : ""}`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          className={styles.backdrop}
          onClick={close}
          aria-label="Fechar carrinho"
          tabIndex={-1}
        />

        <aside
          ref={drawerRef}
          className={styles.drawer}
          role="dialog"
          aria-modal="true"
          aria-label="Carrinho"
          tabIndex={-1}
        >
          <header className={styles.head}>
            <p className={styles.title}>
              Carrinho <span>{String(cart.count).padStart(2, "0")}</span>
            </p>
            <button
              type="button"
              className={styles.close}
              onClick={close}
              aria-label="Fechar"
            >
              <span />
              <span />
            </button>
          </header>

          <div className={styles.tape} aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i}>
                Sob encomenda ✦ Pix 80 + 20 ✦ {brand.city}, {brand.state}{" "}
                ✦&nbsp;
              </span>
            ))}
          </div>

          {cart.items.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Nada aqui ainda.</p>
              <p className={styles.emptyText}>
                Escolhe uma peça, cor e tamanho. Depois é só chamar a gente.
              </p>
            </div>
          ) : (
            <ul className={styles.list} data-lenis-prevent>
              {cart.items.map((item, i) => (
                <li
                  key={item.key}
                  className={styles.item}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <div className={styles.thumb}>
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="96px"
                      style={{
                        objectFit: "cover",
                        objectPosition: item.position ?? "50% 50%",
                      }}
                    />
                  </div>
                  <div className={styles.itemBody}>
                    <p className={styles.itemCategory}>{item.category}</p>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemMeta}>
                      <span
                        className={styles.dot}
                        style={{ background: item.hex }}
                      />
                      {item.color} · Tam. {item.size}
                    </p>
                    <div className={styles.itemRow}>
                      <div className={styles.qty}>
                        <button
                          type="button"
                          onClick={() => cart.setQty(item.key, item.qty - 1)}
                          aria-label="Menos um"
                        >
                          −
                        </button>
                        <span aria-live="polite">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => cart.setQty(item.key, item.qty + 1)}
                          aria-label="Mais um"
                        >
                          +
                        </button>
                      </div>
                      <p className={styles.itemPrice}>
                        {formatPrice(item.priceCents * item.qty)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => cart.remove(item.key)}
                    aria-label={`Remover ${item.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <footer className={styles.foot}>
            <div className={styles.totals}>
              <p>
                <span>Total no site</span>
                <strong>{formatPrice(cart.subtotal)}</strong>
              </p>
              <p className={styles.deposit}>
                <span>Entrada (80% via Pix)</span>
                <strong>{formatPrice(deposit)}</strong>
              </p>
            </div>

            <button
              type="button"
              className={styles.checkout}
              onClick={checkout}
              disabled={cart.items.length === 0}
            >
              {brand.whatsapp ? "Chamar no WhatsApp" : "Chamar no Direct"} com{" "}
              {cart.count === 1 ? "esta peça" : "estas peças"}
              <Star size={11} />
            </button>
            <p className={styles.hint}>
              Entrega em {brand.city}, {brand.state}. Valores a confirmar com o
              fornecedor; nada é pago aqui no site.
            </p>

            <OrderMessage message={message} result={result} />

            {cart.items.length > 0 &&
              (confirmClear ? (
                <div className={styles.confirm}>
                  <span>Esvaziar o carrinho?</span>
                  <button
                    type="button"
                    className={styles.clear}
                    onClick={() => {
                      cart.clear();
                      setConfirmClear(false);
                    }}
                  >
                    Sim, esvaziar
                  </button>
                  <button
                    type="button"
                    className={styles.clear}
                    onClick={() => setConfirmClear(false)}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.clear}
                  onClick={() => setConfirmClear(true)}
                >
                  Esvaziar carrinho
                </button>
              ))}
          </footer>
        </aside>
      </div>
    </>,
    document.body,
  );
}
