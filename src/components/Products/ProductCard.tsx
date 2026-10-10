"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { brand } from "@/data/brand";
import { formatPrice, type Product } from "@/data/mock/products";
import { Star } from "@/components/ui/Star";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  index: number;
}

const TOAST_MS = 2600;

export function ProductCard({ product, index }: ProductCardProps) {
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), TOAST_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  /** Copia o pedido pronto e abre o Instagram: o Direct não aceita texto na URL. */
  const order = async () => {
    const sizeText = size ? `, tamanho ${size}` : "";
    const message = `Fala, ${brand.name}! Quero encomendar a ${product.name}, cor ${color.name}${sizeText}. Como funciona?`;

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      // Sem clipboard (http ou permissão negada): só abre o Instagram.
    }
    window.open(brand.instagram.url, "_blank", "noopener,noreferrer");
  };

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Image
          src={product.images[0]}
          alt={`${product.name}, ${product.category.toLowerCase()}`}
          fill
          sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
          className={`${styles.image} ${styles.imageFront}`}
          priority={index < 3}
        />
        <Image
          src={product.images[1]}
          alt=""
          fill
          sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
          className={`${styles.image} ${styles.imageBack}`}
        />

        <div className={styles.mediaTop}>
          <span className={styles.category}>{product.category}</span>
          {product.badge && <span className={styles.badge}>{product.badge}</span>}
          <Star size={14} className={styles.star} />
        </div>

        <div className={styles.mediaBottom}>
          <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
          <span className={styles.encomenda}>Sob encomenda</span>
        </div>
      </div>

      <div className={styles.body}>
        <header className={styles.header}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.price}>{formatPrice(product.price)}</p>
        </header>

        <div className={styles.row}>
          <span className={styles.label}>Cor</span>
          <div className={styles.swatches} role="radiogroup" aria-label="Cor">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                role="radio"
                aria-checked={c.name === color.name}
                aria-label={c.name}
                title={c.name}
                className={`${styles.swatch} ${c.name === color.name ? styles.swatchActive : ""}`}
                style={{ "--swatch": c.hex } as React.CSSProperties}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <span className={styles.value}>{color.name}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Tam.</span>
          <div className={styles.sizes} role="radiogroup" aria-label="Tamanho">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={s === size}
                className={`${styles.size} ${s === size ? styles.sizeActive : ""}`}
                onClick={() => setSize(s === size ? null : s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.order} onClick={order}>
            Encomendar
            <Star size={10} />
          </button>
          <button
            type="button"
            className={`${styles.details} ${open ? styles.detailsOpen : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            Detalhes
            <span className={styles.plus} aria-hidden="true" />
          </button>
        </div>

        <div className={`${styles.panel} ${open ? styles.panelOpen : ""}`}>
          <div className={styles.panelInner}>
            <p className={styles.description}>{product.description}</p>
            <dl className={styles.specs}>
              <div>
                <dt>Modelagem</dt>
                <dd>{product.fit}</dd>
              </div>
              <div>
                <dt>Tecido</dt>
                <dd>{product.fabric}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <p className={`${styles.toast} ${copied ? styles.toastVisible : ""}`} role="status">
        Pedido copiado. Cole no Direct.
      </p>
    </article>
  );
}
