"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice, type Product, type ProductVariant } from "@/data/mock/products";
import { useCart } from "@/components/Cart/CartProvider";
import { Star } from "@/components/ui/Star";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  index: number;
  onOpen: (product: Product, variant: ProductVariant) => void;
}

export function ProductCard({ product, index, onOpen }: ProductCardProps) {
  const [variant, setVariant] = useState(product.variants[0]);
  const [size, setSize] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const cart = useCart();

  const add = () => {
    if (!size) {
      // Sem tamanho: chama atenção para a linha de tamanhos.
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    cart.add(product, variant, size);
  };

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.media}
        onClick={() => onOpen(product, variant)}
        aria-label={`Ver ${product.name}`}
      >
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
          <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
        </span>

        {/* Preço em destaque, colado na foto. */}
        <span className={styles.priceTag}>
          <span className={styles.priceLabel}>Sob encomenda</span>
          <span className={styles.price}>{formatPrice(product.price)}</span>
        </span>

        <span className={styles.hint}>
          Ver peça <Star size={10} />
        </span>
      </button>

      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>

        <div className={styles.row}>
          <span className={styles.label}>Cor</span>
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
          <span className={styles.value}>{variant.color}</span>
        </div>

        <div className={`${styles.row} ${shake ? styles.shake : ""}`}>
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

        <button type="button" className={styles.add} onClick={add}>
          <span>{size ? "Adicionar ao carrinho" : "Escolha o tamanho"}</span>
          <span className={styles.addIcon} aria-hidden="true">
            +
          </span>
        </button>
      </div>
    </article>
  );
}
