"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import type { Product, ProductVariant } from "@/data/types";
import { useModal } from "@/hooks/useModal";
import { ProductView } from "./ProductView";
import styles from "./ProductDetail.module.css";

interface ProductDetailProps {
  product: Product;
  initialVariant: ProductVariant;
  onClose: () => void;
}

/**
 * A etiqueta da peça como janela por cima da Seleção. O conteúdo é o mesmo da
 * página própria da peça (ProductView); aqui só entram o fundo, o nome vazado
 * e o comportamento de modal.
 */
export function ProductDetail({
  product,
  initialVariant,
  onClose,
}: ProductDetailProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useModal(true, panelRef, onClose);

  // Portal no body: fora da section (que tem z-index próprio), o modal cobre o header fixo.
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-title"
    >
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label="Fechar"
        tabIndex={-1}
      />

      {/* Nome gigante vazado atrás de tudo, correndo devagar. */}
      <div className={styles.watermark} aria-hidden="true">
        <span>
          {product.name} ✦ {product.name} ✦ {product.name} ✦&nbsp;
        </span>
      </div>

      <ProductView
        product={product}
        initialVariant={initialVariant}
        mode="modal"
        onClose={onClose}
        panelRef={panelRef}
      />
    </div>,
    document.body,
  );
}
