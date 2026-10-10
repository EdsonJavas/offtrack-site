"use client";

import { useState } from "react";
import Image from "next/image";
import {
  formatPrice,
  type Product,
  type ProductVariant,
} from "@/data/mock/products";
import { useCart } from "@/components/Cart/CartProvider";
import { useFavorite } from "@/hooks/useFavorite";
import { Star } from "@/components/ui/Star";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  index: number;
  onOpen: (product: Product, variant: ProductVariant) => void;
}

/**
 * Card compacto: foto com compra rápida no hover (tamanho + adicionar),
 * favoritar, troca de cor e preço. Clique na foto abre a peça.
 */
export function ProductCard({ product, index, onOpen }: ProductCardProps) {
  const [variant, setVariant] = useState(product.variants[0]);
  const [size, setSize] = useState<string | null>(null);
  const [nudge, setNudge] = useState(false);
  const [favorite, toggleFavorite] = useFavorite(product.id);
  const cart = useCart();

  const add = () => {
    if (!size) {
      setNudge(true);
      setTimeout(() => setNudge(false), 500);
      return;
    }
    cart.add(product, variant, size);
  };

  return (
    <article
      className={styles.card}
      style={{ "--i": index % 4 } as React.CSSProperties}
    >
      <div className={styles.media}>
        <button
          type="button"
          className={styles.open}
          onClick={() => onOpen(product, variant)}
          aria-label={`Ver ${product.name}`}
        >
          {product.variants.map((v) => (
            <Image
              key={v.color}
              src={v.image}
              alt={
                v === variant ? `${product.name}, ${v.color.toLowerCase()}` : ""
              }
              fill
              sizes="(min-width: 1300px) 25vw, (min-width: 1000px) 33vw, (min-width: 640px) 50vw, 100vw"
              priority={index < 4 && v === product.variants[0]}
              className={`${styles.photo} ${v === variant ? styles.photoActive : ""}`}
              style={{ objectPosition: v.position ?? "50% 50%" }}
            />
          ))}
        </button>

        <div className={styles.top}>
          <span className={styles.category}>{product.category}</span>
          {product.badge && (
            <span className={styles.badge}>{product.badge}</span>
          )}
          <button
            type="button"
            className={`${styles.fav} ${favorite ? styles.favOn : ""}`}
            onClick={toggleFavorite}
            aria-pressed={favorite}
            aria-label={favorite ? "Remover dos favoritos" : "Favoritar"}
          >
            <Star size={13} />
          </button>
        </div>

        {/* Compra rápida: aparece no hover (desktop) e fica fixa no toque. */}
        <div className={`${styles.quick} ${nudge ? styles.nudge : ""}`}>
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
          <button type="button" className={styles.add} onClick={add}>
            {size ? `Adicionar · ${size}` : "Escolha o tamanho"}
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.row}>
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
          <span className={styles.meta}>
            {variant.color} · {product.sizes[0]}–
            {product.sizes[product.sizes.length - 1]}
          </span>
        </div>
      </div>
    </article>
  );
}
