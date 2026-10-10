"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice, type Product, type ProductVariant } from "@/data/mock/products";
import { Star } from "@/components/ui/Star";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  index: number;
  onOpen: (product: Product, variant: ProductVariant) => void;
}

export function ProductCard({ product, index, onOpen }: ProductCardProps) {
  const [variant, setVariant] = useState(product.variants[0]);

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.media}
        onClick={() => onOpen(product, variant)}
        aria-label={`Ver ${product.name}`}
      >
        {/* Todas as cores ficam montadas; a ativa aparece, as outras somem (crossfade). */}
        {product.variants.map((v) => (
          <Image
            key={v.color}
            src={v.image}
            alt={v === variant ? `${product.name}, ${v.color.toLowerCase()}` : ""}
            fill
            sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
            priority={index < 3 && v === product.variants[0]}
            className={`${styles.photo} ${v === variant ? styles.photoActive : ""}`}
            style={{ objectPosition: v.position ?? "50% 50%" }}
          />
        ))}

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
            {product.variants.map((v) => (
              <button
                key={v.color}
                type="button"
                role="radio"
                aria-checked={v === variant}
                aria-label={v.color}
                title={v.color}
                className={`${styles.swatch} ${v === variant ? styles.swatchActive : ""}`}
                style={{ "--swatch": v.hex } as React.CSSProperties}
                onClick={() => setVariant(v)}
              />
            ))}
          </div>
          <span className={styles.colorName}>{variant.color}</span>
        </div>
      </div>
    </article>
  );
}
