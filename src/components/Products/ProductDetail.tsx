"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { brand } from "@/data/brand";
import {
  MEASURE_LABELS,
  formatPrice,
  type MeasureKey,
  type Product,
  type ProductVariant,
} from "@/data/mock/products";
import { lenisStore } from "@/lib/lenis";
import { useImageTone } from "@/hooks/useImageTone";
import { buildOrderMessage, sendOrder } from "@/lib/order";
import { useCart } from "@/components/Cart/CartProvider";
import { Star } from "@/components/ui/Star";
import { PhotoViewer } from "./PhotoViewer";
import styles from "./ProductDetail.module.css";

interface ProductDetailProps {
  product: Product;
  initialVariant: ProductVariant;
  onClose: () => void;
}

const DEPOSIT = 0.8;

export function ProductDetail({ product, initialVariant, onClose }: ProductDetailProps) {
  const [variant, setVariant] = useState(initialVariant);
  const [size, setSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [showMeasures, setShowMeasures] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const cart = useCart();
  // Foto clara → controles escuros, e vice-versa.
  const tones = useImageTone(variant.image);

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
    const timer = setTimeout(() => setCopied(false), 2600);
    return () => clearTimeout(timer);
  }, [copied]);

  const direct = async () => {
    const message = buildOrderMessage([
      { name: product.name, color: variant.color, size, qty: 1, price: product.price },
    ]);
    setCopied(await sendOrder(message));
  };

  const measures = product.measurements[size];
  const measureKeys = Object.keys(measures ?? {}) as MeasureKey[];
  const sku = `OT-${product.id.replace("mock-", "")}-${variant.color.slice(0, 3).toUpperCase()}-${size}`;

  // Portal no body: fora da section (que tem z-index próprio), o modal cobre o header fixo.
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="product-title">
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fechar" />

      {/* Nome gigante vazado atrás de tudo, correndo devagar. */}
      <div className={styles.watermark} aria-hidden="true">
        <span>
          {product.name} ✦ {product.name} ✦ {product.name} ✦&nbsp;
        </span>
      </div>

      <div className={styles.panel}>
        <div className={styles.viewer} data-top={tones?.top ?? "dark"} data-bottom={tones?.bottom ?? "dark"}>
          <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            <span />
            <span />
          </button>

          <PhotoViewer
            name={product.name}
            kind={product.kind}
            variant={variant}
            size={size}
            measurements={measures}
            showMeasures={showMeasures}
            bottomTone={tones?.bottom ?? "dark"}
          />

          <div className={styles.viewerTop}>
            <button
              type="button"
              className={`${styles.measuresToggle} ${showMeasures ? styles.measuresOn : ""}`}
              onClick={() => setShowMeasures((v) => !v)}
              aria-pressed={showMeasures}
            >
              <span className={styles.ruler} aria-hidden="true" />
              Medidas
            </button>
            <span className={styles.counter}>
              {String(product.variants.indexOf(variant) + 1).padStart(2, "0")} /{" "}
              {String(product.variants.length).padStart(2, "0")}
            </span>
          </div>

          {product.variants.length > 1 && (
            <div className={styles.thumbs} role="radiogroup" aria-label="Cor">
              {product.variants.map((v) => (
                <button
                  key={v.color}
                  type="button"
                  role="radio"
                  aria-checked={v === variant}
                  aria-label={v.color}
                  className={`${styles.thumb} ${v === variant ? styles.thumbActive : ""}`}
                  onClick={() => setVariant(v)}
                >
                  <Image src={v.image} alt="" fill sizes="72px" style={{ objectFit: "cover", objectPosition: v.position ?? "50% 50%" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Faixa vertical entre a foto e a etiqueta. */}
        <div className={styles.strip} aria-hidden="true">
          <span>
            {brand.name} ✦ Sob encomenda ✦ Pix 80 + 20 ✦ {brand.city}, {brand.state} ✦ {brand.slogan} ✦&nbsp;
          </span>
        </div>

        {/* Etiqueta pendurada: informações da peça como numa tag de roupa. */}
        <div className={styles.tagWrap} data-lenis-prevent>
          <article className={styles.tag}>
            <span className={styles.hole} aria-hidden="true" />
            <div className={styles.tagStripes} aria-hidden="true" />

            <header className={styles.tagHead}>
              <p className={styles.category}>
                {product.category}
                {product.badge && <span className={styles.badge}>{product.badge}</span>}
              </p>
              <span className={styles.stamp} aria-hidden="true">
                OT.
              </span>
            </header>

            <h2 id="product-title" className={styles.name}>
              {product.name}
            </h2>

            <div className={styles.priceBlock}>
              <p className={styles.price}>{formatPrice(product.price)}</p>
              <p className={styles.deposit}>
                Entrada de <strong>{formatPrice(product.price * DEPOSIT)}</strong> via Pix
                <br />+ {formatPrice(product.price * (1 - DEPOSIT))} na entrega
              </p>
            </div>

            <p className={styles.description}>{product.description}</p>

            <div className={styles.fields}>
              <div className={styles.field}>
                <p className={styles.fieldLabel}>
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

              <div className={styles.field}>
                <p className={styles.fieldLabel}>
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
                  <dd>
                    <span key={size} className={styles.measureValue}>
                      {measures?.[key]} cm
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <footer className={styles.tagFoot}>
              <span className={styles.barcode} aria-hidden="true" />
              <p className={styles.sku}>
                {sku} · {brand.city}, {brand.state}
              </p>
            </footer>
          </article>

          <div className={styles.actions}>
            <button type="button" className={styles.addToCart} onClick={() => cart.add(product, variant, size)}>
              Adicionar ao carrinho
              <span aria-hidden="true">+</span>
            </button>
            <button type="button" className={styles.direct} onClick={direct}>
              Chamar no Direct
              <Star size={10} />
            </button>
            <p className={styles.actionsHint}>
              {copied ? "Pedido copiado. Cole no Direct e manda." : "Sem pagamento aqui: a gente confirma tudo no Direct."}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
