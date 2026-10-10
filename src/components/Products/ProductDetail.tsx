"use client";

import { useEffect, useRef, useState } from "react";
import { brand } from "@/data/brand";
import {
  MEASURE_LABELS,
  formatPrice,
  type MeasureKey,
  type Product,
  type ProductColor,
} from "@/data/mock/products";
import { lenisStore } from "@/lib/lenis";
import { Star } from "@/components/ui/Star";
import { GarmentViewer } from "./GarmentViewer";
import styles from "./ProductDetail.module.css";

interface ProductDetailProps {
  product: Product;
  initialColor: ProductColor;
  onClose: () => void;
}

const TOAST_MS = 2600;

export function ProductDetail({ product, initialColor, onClose }: ProductDetailProps) {
  const [color, setColor] = useState(initialColor);
  const [size, setSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [showMeasures, setShowMeasures] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Trava o scroll da página e fecha com Esc.
  useEffect(() => {
    const lenis = lenisStore.get();
    lenis?.stop();
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [onClose]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), TOAST_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  /** Copia o pedido pronto e abre o Instagram: o Direct não aceita texto na URL. */
  const order = async () => {
    const message = `Fala, ${brand.name}! Quero encomendar a ${product.name}, cor ${color.name}, tamanho ${size}. Como funciona?`;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      // Sem clipboard: só abre o Instagram.
    }
    window.open(brand.instagram.url, "_blank", "noopener,noreferrer");
  };

  const measures = product.measurements[size];
  const measureKeys = Object.keys(measures ?? {}) as MeasureKey[];

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="product-title">
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fechar" />

      <div className={styles.panel}>
        <div className={styles.viewer}>
          <GarmentViewer
            kind={product.kind}
            color={color.hex}
            measurements={measures}
            showMeasures={showMeasures}
          />
          <button
            type="button"
            className={`${styles.measuresToggle} ${showMeasures ? styles.measuresOn : ""}`}
            onClick={() => setShowMeasures((v) => !v)}
            aria-pressed={showMeasures}
          >
            Medidas
          </button>
        </div>

        <div className={styles.info} data-lenis-prevent>
          <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            <span />
            <span />
          </button>

          <p className={styles.category}>
            {product.category}
            {product.badge && <span className={styles.badge}>{product.badge}</span>}
          </p>
          <h2 id="product-title" className={styles.name}>
            {product.name}
          </h2>
          <p className={styles.price}>{formatPrice(product.price)}</p>
          <p className={styles.description}>{product.description}</p>

          <div className={styles.block}>
            <p className={styles.label}>
              Cor <span>{color.name}</span>
            </p>
            <div className={styles.swatches} role="radiogroup" aria-label="Cor">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  role="radio"
                  aria-checked={c.name === color.name}
                  aria-label={c.name}
                  className={`${styles.swatch} ${c.name === color.name ? styles.swatchActive : ""}`}
                  style={{ "--swatch": c.hex } as React.CSSProperties}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className={styles.block}>
            <p className={styles.label}>
              Tamanho <span>{size}</span>
            </p>
            <div className={styles.sizes} role="radiogroup" aria-label="Tamanho">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={s === size}
                  className={`${styles.size} ${s === size ? styles.sizeActive : ""}`}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <dl className={styles.specs}>
            <div>
              <dt>Modelagem</dt>
              <dd>{product.fit}</dd>
            </div>
            <div>
              <dt>Tecido</dt>
              <dd>{product.fabric}</dd>
            </div>
            {measureKeys.map((key) => (
              <div key={key}>
                <dt>{MEASURE_LABELS[key]}</dt>
                <dd>{measures?.[key]} cm</dd>
              </div>
            ))}
          </dl>

          <button type="button" className={styles.order} onClick={order}>
            Encomendar pelo Direct
            <Star size={11} />
          </button>
          <p className={styles.note}>
            Peça sob encomenda. 80% via Pix na confirmação e 20% quando a peça chegar, antes da
            entrega.
          </p>

          <p className={`${styles.toast} ${copied ? styles.toastVisible : ""}`} role="status">
            Pedido copiado. Cole no Direct.
          </p>
        </div>
      </div>
    </div>
  );
}
