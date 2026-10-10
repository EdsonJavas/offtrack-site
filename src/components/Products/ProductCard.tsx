"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Product, ProductVariant } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { flyToCart } from "@/lib/flyToCart";
import { useCart } from "@/components/Cart/CartProvider";
import { useFavorite } from "@/hooks/useFavorite";
import { Star } from "@/components/ui/Star";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  index: number;
  onOpen: (product: Product, variant: ProductVariant) => void;
}

/** Card completo: foto com preço, favorito, cor, tamanho e adicionar ao carrinho. */
export function ProductCard({ product, index, onOpen }: ProductCardProps) {
  const [variant, setVariant] = useState(product.variants[0]);
  const [size, setSize] = useState<string | null>(null);
  const [nudge, setNudge] = useState(false);
  const [favorite, toggleFavorite] = useFavorite(product.id);
  const [added, setAdded] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);
  const cart = useCart();

  const add = () => {
    if (!size) {
      setNudge(true);
      setTimeout(() => setNudge(false), 500);
      return;
    }
    cart.add(product, variant, size);
    // A própria foto voa até o carrinho; o botão confirma por um instante.
    flyToCart(mediaRef.current?.querySelector("img"));
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article
      className={`${styles.card} ${added ? styles.cardAdded : ""}`}
      style={{ "--i": index % 4 } as React.CSSProperties}
    >
      <div ref={mediaRef} className={styles.media}>
        <button
          type="button"
          className={styles.open}
          onClick={() => onOpen(product, variant)}
          aria-label={`Ver ${product.name}`}
        >
          {/* Só a cor ativa fica no DOM: menos fotos baixadas. */}
          <Image
            key={variant.image}
            src={variant.image}
            alt={`${product.name}, ${variant.color.toLowerCase()}`}
            fill
            sizes="(min-width: 1500px) 25vw, (min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
            priority={index < 2}
            className={styles.photo}
            style={{ objectPosition: variant.position ?? "50% 50%" }}
          />
          <span className={styles.hint}>
            Ver peça <Star size={10} />
          </span>
        </button>

        <div className={styles.top}>
          <span className={styles.category}>{product.category}</span>
          {product.badge && (
            <span className={styles.badge}>{product.badge}</span>
          )}
          {product.example && <span className={styles.example}>Exemplo</span>}
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

        <span className={styles.priceTag}>
          <span className={styles.priceLabel}>Sob encomenda</span>
          <span className={styles.price}>
            {formatPrice(product.priceCents)}
          </span>
        </span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>

        <div className={styles.row}>
          <span className={styles.label}>Cor</span>
          <div className={styles.swatches}>
            {product.variants.map((v) => (
              <button
                key={v.color}
                type="button"
                aria-pressed={v === variant}
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

        <div className={`${styles.row} ${nudge ? styles.nudge : ""}`}>
          <span className={styles.label}>Tam.</span>
          <div className={styles.sizes}>
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={s === size}
                className={`${styles.size} ${s === size ? styles.sizeActive : ""}`}
                onClick={() => setSize(s === size ? null : s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={`${styles.add} ${added ? styles.addDone : ""}`}
          onClick={add}
          aria-live="polite"
        >
          <span>
            {added
              ? "No carrinho"
              : size
                ? `Adicionar · ${size}`
                : "Escolha o tamanho"}
          </span>
          <span className={styles.addIcon} aria-hidden="true">
            {added ? "✓" : "+"}
          </span>
        </button>
      </div>
    </article>
  );
}
