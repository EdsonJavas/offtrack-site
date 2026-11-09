"use client";

import { useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  discountPercent,
  isSoldOut,
  productSoldOut,
  sizesOf,
  variantSoldOut,
  type Product,
  type ProductVariant,
} from "@/data/types";
import { formatPrice } from "@/lib/format";
import { flyToCart } from "@/lib/flyToCart";
import { track } from "@/lib/track";
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

  const soldOut = variantSoldOut(product, variant);
  const allSoldOut = productSoldOut(product);
  const discount = discountPercent(product);

  const add = () => {
    if (soldOut) return;
    if (!size) {
      setNudge(true);
      setTimeout(() => setNudge(false), 500);
      return;
    }
    cart.add(product, variant, size);
    track("cart", product.id);
    // A própria foto voa até o carrinho; o botão confirma por um instante.
    flyToCart(mediaRef.current?.querySelector("img"));
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  /**
   * A foto é um link de verdade para a página da peça (abrir em nova aba,
   * copiar endereço, buscadores). O clique simples abre a etiqueta por cima.
   */
  const open = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onOpen(product, variant);
  };

  const favor = () => {
    if (!favorite) track("fav", product.id);
    toggleFavorite();
  };

  return (
    <article
      className={`${styles.card} ${added ? styles.cardAdded : ""}`}
      style={{ "--i": index % 4 } as React.CSSProperties}
    >
      <div
        ref={mediaRef}
        className={`${styles.media} ${allSoldOut ? styles.mediaOut : ""}`}
      >
        <Link
          href={`/peca/${product.id}`}
          prefetch={false}
          className={styles.open}
          onClick={open}
          aria-label={`Ver ${product.name}`}
          draggable={false}
        >
          {/* Só a cor ativa fica no DOM: menos fotos baixadas. */}
          <Image
            key={variant.image}
            src={variant.image}
            alt={`${product.name}, ${variant.color.toLowerCase()}`}
            fill
            sizes="(min-width: 1500px) 25vw, (min-width: 1100px) 33vw, 50vw"
            priority={index < 2}
            className={styles.photo}
            style={{ objectPosition: variant.position ?? "50% 50%" }}
          />
          <span className={styles.hint}>
            Ver peça <Star size={10} />
          </span>
        </Link>

        <div className={styles.top}>
          <span className={styles.category}>{product.category}</span>
          {allSoldOut ? (
            <span className={styles.badge}>Esgotado</span>
          ) : (
            product.badge && <span className={styles.badge}>{product.badge}</span>
          )}
          {discount > 0 && !allSoldOut && (
            <span className={styles.badge}>−{discount}%</span>
          )}
          <button
            type="button"
            className={`${styles.fav} ${favorite ? styles.favOn : ""}`}
            onClick={favor}
            aria-pressed={favorite}
            aria-label={favorite ? "Remover dos favoritos" : "Favoritar"}
          >
            <Star size={13} />
          </button>
        </div>

        <span className={styles.priceTag}>
          <span className={styles.priceLabel}>
            {discount > 0 ? (
              <>
                <span className={styles.srOnly}>De </span>
                <s>{formatPrice(product.compareAtCents!)}</s>
                <span className={styles.srOnly}> por</span>
              </>
            ) : (
              "Sob encomenda"
            )}
          </span>
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
                aria-label={
                  variantSoldOut(product, v) ? `${v.color}, esgotada` : v.color
                }
                title={v.color}
                className={`${styles.swatch} ${v === variant ? styles.swatchActive : ""}`}
                style={{ "--swatch": v.hex } as React.CSSProperties}
                onClick={() => {
                  setVariant(v);
                  // Tamanho que não existe (ou esgotou) na cor nova volta a pedir escolha.
                  setSize((s) =>
                    s && (!sizesOf(product, v).includes(s) || isSoldOut(v, s))
                      ? null
                      : s,
                  );
                }}
              />
            ))}
          </div>
          <span className={styles.value}>{variant.color}</span>
        </div>

        <div className={`${styles.row} ${nudge ? styles.nudge : ""}`}>
          <span className={styles.label}>Tam.</span>
          <div className={styles.sizes}>
            {sizesOf(product, variant).map((s) => {
              const off = isSoldOut(variant, s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={s === size}
                  aria-label={off ? `${s}, esgotado` : undefined}
                  disabled={off}
                  className={`${styles.size} ${s === size ? styles.sizeActive : ""} ${off ? styles.sizeOff : ""}`}
                  onClick={() => setSize(s === size ? null : s)}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className={`${styles.add} ${added ? styles.addDone : ""}`}
          onClick={add}
          disabled={soldOut}
          aria-live="polite"
        >
          <span>
            {soldOut
              ? "Esgotado"
              : added
                ? "No carrinho"
                : size
                  ? `Adicionar · ${size}`
                  : "Escolha o tamanho"}
          </span>
          {!soldOut && (
            <span className={styles.addIcon} aria-hidden="true">
              {added ? "✓" : "+"}
            </span>
          )}
        </button>
      </div>
    </article>
  );
}
