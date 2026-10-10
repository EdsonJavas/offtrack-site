"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { brand } from "@/data/brand";
import {
  CATEGORY_KIND,
  MEASURE_LABELS,
  type MeasureKey,
  type Product,
  type ProductVariant,
} from "@/data/types";
import { formatPrice, splitDeposit } from "@/lib/format";
import { buildOrderMessage, sendOrder, type SendResult } from "@/lib/order";
import { useImageTone } from "@/hooks/useImageTone";
import { useModal } from "@/hooks/useModal";
import { useCart } from "@/components/Cart/CartProvider";
import { OrderMessage } from "@/components/Cart/OrderMessage";
import { Star } from "@/components/ui/Star";
import { PhotoViewer } from "./PhotoViewer";
import styles from "./ProductDetail.module.css";

interface ProductDetailProps {
  product: Product;
  initialVariant: ProductVariant;
  onClose: () => void;
}

export function ProductDetail({
  product,
  initialVariant,
  onClose,
}: ProductDetailProps) {
  const [variant, setVariant] = useState(initialVariant);
  const [size, setSize] = useState<string | null>(null);
  const [showMeasures, setShowMeasures] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [message, setMessage] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const cart = useCart();
  // Foto clara → controles escuros, e vice-versa.
  const tones = useImageTone(variant.image);

  useModal(true, panelRef, onClose);

  const requireSize = () => {
    if (size) return true;
    setNudge(true);
    setTimeout(() => setNudge(false), 500);
    return false;
  };

  const addToCart = () => {
    if (!requireSize()) return;
    cart.add(product, variant, size!);
    onClose();
    cart.open();
  };

  /** Esta peça + o que já está no carrinho, numa mensagem só. */
  const direct = () => {
    if (!requireSize()) return;
    const lines = [
      ...cart.items.map((i) => ({
        name: i.name,
        color: i.color,
        size: i.size,
        qty: i.qty,
        priceCents: i.priceCents,
      })),
      {
        name: product.name,
        color: variant.color,
        size: size!,
        qty: 1,
        priceCents: product.priceCents,
      },
    ];
    const text = buildOrderMessage(lines);
    setMessage(text);
    sendOrder(text).then(setResult);
  };

  const kind = CATEGORY_KIND[product.category];
  const measureSize = size ?? product.sizes[0];
  const measures = product.measurements[measureSize];
  const measureKeys = Object.keys(measures ?? {}) as MeasureKey[];
  const { deposit, balance } = splitDeposit(product.priceCents);

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

      <div
        ref={panelRef}
        className={styles.panel}
        tabIndex={-1}
        data-lenis-prevent
      >
        <div
          className={styles.viewer}
          data-top={tones?.top ?? "dark"}
          data-bottom={tones?.bottom ?? "dark"}
        >
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Fechar"
          >
            <span />
            <span />
          </button>

          <PhotoViewer
            name={product.name}
            kind={kind}
            variant={variant}
            size={measureSize}
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
            <div className={styles.thumbs}>
              {product.variants.map((v) => (
                <button
                  key={v.color}
                  type="button"
                  aria-pressed={v === variant}
                  aria-label={v.color}
                  className={`${styles.thumb} ${v === variant ? styles.thumbActive : ""}`}
                  onClick={() => setVariant(v)}
                >
                  <Image
                    src={v.image}
                    alt=""
                    fill
                    sizes="72px"
                    style={{
                      objectFit: "cover",
                      objectPosition: v.position ?? "50% 50%",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Faixa entre a foto e a etiqueta: vertical no desktop, fita horizontal no celular
            (o segundo span só serve para o loop da fita). */}
        <div className={styles.strip} aria-hidden="true">
          {[0, 1].map((i) => (
            <span key={i}>
              {brand.name} ✦ Sob encomenda ✦ Pix 80 + 20 ✦ {brand.city},{" "}
              {brand.state} ✦ {brand.slogan} ✦&nbsp;
            </span>
          ))}
        </div>

        {/* Etiqueta pendurada: informações da peça como numa tag de roupa. */}
        <div className={styles.tagWrap} data-lenis-prevent>
          <article className={styles.tag}>
            <span className={styles.hole} aria-hidden="true" />
            <div className={styles.tagStripes} aria-hidden="true" />

            <header className={styles.tagHead}>
              <p className={styles.category}>
                {product.category}
                {product.badge && (
                  <span className={styles.badge}>{product.badge}</span>
                )}
                {product.example && (
                  <span className={styles.exampleBadge}>Exemplo</span>
                )}
              </p>
              <span className={styles.stamp} aria-hidden="true">
                OT.
              </span>
            </header>

            <h2 id="product-title" className={styles.name}>
              {product.name}
            </h2>

            <div className={styles.priceBlock}>
              <p className={styles.price}>{formatPrice(product.priceCents)}</p>
              <p className={styles.deposit}>
                Entrada de <strong>{formatPrice(deposit)}</strong> via Pix
                <br />+ {formatPrice(balance)} na entrega
              </p>
            </div>

            <p className={styles.description}>{product.description}</p>

            <div className={styles.fields}>
              <div className={styles.field}>
                <p className={styles.fieldLabel}>
                  Cor <span>{variant.color}</span>
                </p>
                <div className={styles.swatches}>
                  {product.variants.map((v) => (
                    <button
                      key={v.color}
                      type="button"
                      aria-pressed={v === variant}
                      aria-label={v.color}
                      className={`${styles.swatch} ${v === variant ? styles.swatchActive : ""}`}
                      style={{ "--swatch": v.hex } as React.CSSProperties}
                      onClick={() => setVariant(v)}
                    />
                  ))}
                </div>
              </div>

              <div className={`${styles.field} ${nudge ? styles.nudge : ""}`}>
                <p className={styles.fieldLabel}>
                  Tamanho <span>{size ?? "escolha"}</span>
                </p>
                <div className={styles.sizes}>
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={s === size}
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
              {product.fit && (
                <div>
                  <dt>Modelagem</dt>
                  <dd>{product.fit}</dd>
                </div>
              )}
              {product.fabric && (
                <div>
                  <dt>Tecido</dt>
                  <dd>{product.fabric}</dd>
                </div>
              )}
              {measureKeys.map((key) => (
                <div key={key}>
                  <dt>
                    {MEASURE_LABELS[key]} · {measureSize}
                  </dt>
                  <dd>
                    <span key={measureSize} className={styles.measureValue}>
                      {measures?.[key]} cm
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <footer className={styles.tagFoot}>
              <span className={styles.barcode} aria-hidden="true" />
              <p className={styles.sku}>
                {product.sku ? `${product.sku} · ` : ""}
                {brand.city}, {brand.state}
              </p>
            </footer>
          </article>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.addToCart}
              onClick={addToCart}
            >
              Adicionar ao carrinho
              <span aria-hidden="true">+</span>
            </button>
            <button type="button" className={styles.direct} onClick={direct}>
              {brand.whatsapp ? "Chamar no WhatsApp" : "Chamar no Direct"}
              <Star size={10} />
            </button>
            <p className={styles.actionsHint}>
              {cart.count > 0
                ? `O Direct leva esta peça junto com as ${cart.count} do carrinho.`
                : "Sem pagamento aqui: a gente confirma tudo no Direct."}
            </p>
            <div className={styles.orderMessage}>
              <OrderMessage message={message} result={result} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
