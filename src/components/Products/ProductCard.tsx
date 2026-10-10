"use client";

import { useState } from "react";
import { formatPrice, type Product, type ProductColor } from "@/data/mock/products";
import { Garment } from "@/components/Garment/Garment";
import { Star } from "@/components/ui/Star";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  index: number;
  onOpen: (product: Product, color: ProductColor) => void;
}

export function ProductCard({ product, index, onOpen }: ProductCardProps) {
  const [color, setColor] = useState(product.colors[0]);

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.media}
        onClick={() => onOpen(product, color)}
        aria-label={`Ver ${product.name}`}
      >
        <Garment kind={product.kind} color={color.hex} view="front" className={`${styles.garment} ${styles.front}`} />
        <Garment kind={product.kind} color={color.hex} view="back" className={`${styles.garment} ${styles.back}`} />

        <span className={styles.mediaTop}>
          <span className={styles.category}>{product.category}</span>
          {product.badge && <span className={styles.badge}>{product.badge}</span>}
          <Star size={14} className={styles.star} />
        </span>

        <span className={styles.mediaBottom}>
          <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
          <span className={styles.hint}>Ver peça</span>
        </span>
      </button>

      <div className={styles.body}>
        <div className={styles.header}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.price}>{formatPrice(product.price)}</p>
        </div>

        <div className={styles.row}>
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
          <span className={styles.colorName}>{color.name}</span>
        </div>
      </div>
    </article>
  );
}
