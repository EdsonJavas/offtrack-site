"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { brand } from "@/data/brand";
import {
  MEASURE_LABELS,
  formatPrice,
  type MeasureKey,
  type Product,
  type ProductVariant,
} from "@/data/mock/products";
import { lenisStore } from "@/lib/lenis";
import { Star } from "@/components/ui/Star";
import { PhotoViewer } from "./PhotoViewer";
import styles from "./ProductDetail.module.css";

interface ProductDetailProps {
  product: Product;
  initialVariant: ProductVariant;
  onClose: () => void;
}

const TOAST_MS = 2600;

export function ProductDetail({ product, initialVariant, onClose }: ProductDetailProps) {
  const [variant, setVariant] = useState(initialVariant);
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
    const message = `Fala, ${brand.name}! Quero encomendar a ${product.name}, cor ${variant.color}, tamanho ${size}. Como funciona?`;
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

  // Portal no body: fora da section (que tem z-index próprio), o modal cobre o header fixo.
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="product-title">
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fechar" />

      <div className={styles.panel}>
        <div className={styles.viewer}>
          <PhotoViewer
            name={product.name}
            kind={product.kind}
            variant={variant}
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
              Cor <span>{variant.color}</span>
            </p>
            <div className={styles.swatches} role="radiogroup" aria-label="Cor">
              {product.variants.map((v) => (
                <button
                  key={v.color}
                  type="button"
                  role="radio"
                  aria-checked={v === variant}
                  aria-label={v.color}
                  className={`${styles.swatch} ${v === variant ? styles.swatchActive : ""}`}
                  style={{ "--swatch": v.hex } as React.CSSProperties}
                  onClick={() => setVariant(v)}
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
    </div>,
    document.body,
  );
}
