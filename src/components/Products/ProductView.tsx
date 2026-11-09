"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import Image from "next/image";
import Link from "next/link";
import { brand } from "@/data/brand";
import {
  CATEGORY_KIND,
  MEASURE_LABELS,
  discountPercent,
  isSoldOut,
  sizesOf,
  variantSoldOut,
  type MeasureKey,
  type Product,
  type ProductVariant,
} from "@/data/types";
import { formatPrice, splitDeposit } from "@/lib/format";
import { buildOrderMessage, sendOrder, type SendResult } from "@/lib/order";
import { flyToCart } from "@/lib/flyToCart";
import { track } from "@/lib/track";
import { useImageTone } from "@/hooks/useImageTone";
import { useCart } from "@/components/Cart/CartProvider";
import { OrderMessage } from "@/components/Cart/OrderMessage";
import { useStore } from "@/components/Store/StoreProvider";
import { Star } from "@/components/ui/Star";
import { PhotoViewer } from "./PhotoViewer";
import styles from "./ProductDetail.module.css";

interface ProductViewProps {
  product: Product;
  initialVariant?: ProductVariant;
  /**
   * "modal": dentro da janela aberta pela Seleção (o X fecha).
   * "page": página própria da peça (/peca/[id]), com link de volta.
   */
  mode: "modal" | "page";
  onClose?: () => void;
  panelRef?: Ref<HTMLDivElement>;
}

/** A etiqueta da peça: foto, faixa, dados, escolha de cor/tamanho e ações. */
export function ProductView({
  product,
  initialVariant,
  mode,
  onClose,
  panelRef,
}: ProductViewProps) {
  const [variant, setVariantState] = useState(
    initialVariant ?? product.variants[0],
  );
  // Galeria da cor: principal + extras. Trocar de cor volta para a principal.
  const [photo, setPhoto] = useState(0);
  const photos = [variant.image, ...(variant.images ?? [])];
  const [size, setSize] = useState<string | null>(null);
  const [showMeasures, setShowMeasures] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [message, setMessage] = useState("");
  const [shared, setShared] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const cart = useCart();
  const store = useStore();
  // Foto clara → controles escuros, e vice-versa.
  const tones = useImageTone(photos[photo] ?? variant.image);

  useEffect(() => {
    track("view", product.id);
  }, [product.id]);

  const sizes = sizesOf(product, variant);
  const soldOut = variantSoldOut(product, variant);
  const discount = discountPercent(product);

  const setVariant = (v: ProductVariant) => {
    setVariantState(v);
    setPhoto(0);
    // Tamanho que não existe (ou esgotou) nesta cor: volta a pedir.
    setSize((s) =>
      s && (!sizesOf(product, v).includes(s) || isSoldOut(v, s)) ? null : s,
    );
  };

  const requireSize = () => {
    if (size) return true;
    setNudge(true);
    setTimeout(() => setNudge(false), 500);
    return false;
  };

  const addToCart = () => {
    if (soldOut || !requireSize()) return;
    cart.add(product, variant, size!);
    track("cart", product.id);
    // A foto grande voa até o carrinho; a gaveta abre quando ela chega.
    const image = viewerRef.current?.querySelector<HTMLElement>("img");
    onClose?.();
    flyToCart(image).then(() => cart.open());
  };

  /** Esta peça + o que já está no carrinho, numa mensagem só. */
  const direct = () => {
    let text: string;
    if (soldOut) {
      // Esgotada: a conversa é para saber quando volta.
      text = `Fala, ${brand.name}! Vi no site a peça ${product.name} (${variant.color}) esgotada. Quando volta?`;
    } else {
      if (!requireSize()) return;
      text = buildOrderMessage([
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
      ]);
      track("direct", [...cart.items.map((i) => i.productId), product.id]);
    }
    setMessage(text);
    sendOrder(text, store.whatsapp?.url).then(setResult);
  };

  /** Link próprio da peça: menu de compartilhar do aparelho, ou copia. */
  const share = async () => {
    const url = `${window.location.origin}/peca/${product.id}`;
    const data = {
      title: `${product.name} · ${brand.name}`,
      text: `${product.name} por ${formatPrice(product.priceCents)} na ${brand.name}`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // Cancelou o menu de compartilhar: nada a fazer.
    }
  };

  const kind = CATEGORY_KIND[product.category];
  const measureSize = size ?? sizes[0];
  const measures = product.measurements[measureSize];
  const measureKeys = Object.keys(measures ?? {}) as MeasureKey[];
  const { deposit, balance } = splitDeposit(product.priceCents);
  const channel = store.whatsapp ? "WhatsApp" : "Direct";
  const TitleTag = mode === "page" ? "h1" : "h2";

  return (
    <div
      ref={panelRef}
      className={`${styles.panel} ${mode === "page" ? styles.panelPage : ""}`}
      tabIndex={mode === "modal" ? -1 : undefined}
      data-lenis-prevent={mode === "modal" ? "" : undefined}
    >
      <div
        ref={viewerRef}
        className={styles.viewer}
        data-top={tones?.top ?? "dark"}
        data-bottom={tones?.bottom ?? "dark"}
      >
        {mode === "modal" ? (
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Fechar"
          >
            <span />
            <span />
          </button>
        ) : (
          <Link
            href="/#selecao"
            className={styles.close}
            aria-label="Voltar para a Seleção"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M20 12H4M11 5l-7 7 7 7" />
            </svg>
          </Link>
        )}

        <PhotoViewer
          name={product.name}
          kind={kind}
          variant={variant}
          image={photos[photo]}
          size={measureSize}
          measurements={measures}
          showMeasures={showMeasures}
          bottomTone={tones?.bottom ?? "dark"}
        />

        <div className={styles.viewerTop}>
          <div className={styles.viewerTools}>
            <button
              type="button"
              className={`${styles.measuresToggle} ${showMeasures ? styles.measuresOn : ""}`}
              onClick={() => setShowMeasures((v) => !v)}
              aria-pressed={showMeasures}
            >
              <span className={styles.ruler} aria-hidden="true" />
              Medidas
            </button>
            <button
              type="button"
              className={`${styles.measuresToggle} ${styles.share}`}
              onClick={share}
              aria-label="Compartilhar esta peça"
            >
              <ShareIcon />
              <span className={styles.shareLabel}>
                {shared ? "Link copiado" : "Enviar"}
              </span>
            </button>
          </div>
          <span className={styles.counter}>
            {photos.length > 1
              ? `${String(photo + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`
              : `${String(product.variants.indexOf(variant) + 1).padStart(2, "0")} / ${String(product.variants.length).padStart(2, "0")}`}
          </span>
        </div>

        {/* Miniaturas: a galeria da cor quando há mais de uma foto; senão, as cores. */}
        {photos.length > 1 ? (
          <div className={styles.thumbs}>
            {photos.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-pressed={i === photo}
                aria-label={`Foto ${i + 1}`}
                className={`${styles.thumb} ${i === photo ? styles.thumbActive : ""}`}
                onClick={() => setPhoto(i)}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="72px"
                  style={{
                    objectFit: "cover",
                    objectPosition:
                      i === 0 ? (variant.position ?? "50% 50%") : "50% 50%",
                  }}
                />
              </button>
            ))}
          </div>
        ) : (
          product.variants.length > 1 && (
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
          )
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
      <div
        className={styles.tagWrap}
        data-lenis-prevent={mode === "modal" ? "" : undefined}
      >
        <article className={styles.tag}>
          <span className={styles.hole} aria-hidden="true" />
          <div className={styles.tagStripes} aria-hidden="true" />

          <header className={styles.tagHead}>
            <p className={styles.category}>
              {product.category}
              {product.badge && (
                <span className={styles.badge}>{product.badge}</span>
              )}
              {discount > 0 && (
                <span className={styles.badge}>−{discount}%</span>
              )}
            </p>
            <span className={styles.stamp} aria-hidden="true">
              OT.
            </span>
          </header>

          <TitleTag id="product-title" className={styles.name}>
            {product.name}
          </TitleTag>

          <div className={styles.priceBlock}>
            <p className={styles.price}>
              {discount > 0 && (
                <s className={styles.was}>
                  <span className={styles.srOnly}>De </span>
                  {formatPrice(product.compareAtCents!)}
                </s>
              )}
              {discount > 0 && <span className={styles.srOnly}> por </span>}
              {formatPrice(product.priceCents)}
            </p>
            <p className={styles.deposit}>
              Entrada de <strong>{formatPrice(deposit)}</strong> via Pix
              <br />+ {formatPrice(balance)} na entrega
            </p>
          </div>

          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}

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
                    aria-label={
                      variantSoldOut(product, v)
                        ? `${v.color}, esgotada`
                        : v.color
                    }
                    className={`${styles.swatch} ${v === variant ? styles.swatchActive : ""} ${variantSoldOut(product, v) ? styles.swatchOff : ""}`}
                    style={{ "--swatch": v.hex } as React.CSSProperties}
                    onClick={() => setVariant(v)}
                  />
                ))}
              </div>
            </div>

            <div className={`${styles.field} ${nudge ? styles.nudge : ""}`}>
              <p className={styles.fieldLabel}>
                Tamanho{" "}
                <span>{soldOut ? "esgotado" : (size ?? "escolha")}</span>
              </p>
              <div className={styles.sizes}>
                {sizes.map((s) => {
                  const off = isSoldOut(variant, s);
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={s === size}
                      aria-label={off ? `${s}, esgotado` : undefined}
                      disabled={off}
                      className={`${styles.size} ${s === size ? styles.sizeActive : ""} ${off ? styles.sizeOff : ""}`}
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </button>
                  );
                })}
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
            disabled={soldOut}
          >
            {soldOut ? "Esgotado nesta cor" : "Adicionar ao carrinho"}
            {!soldOut && <span aria-hidden="true">+</span>}
          </button>
          <button type="button" className={styles.direct} onClick={direct}>
            {soldOut ? `Quando volta? ${channel}` : `Chamar no ${channel}`}
            <Star size={10} />
          </button>
          <p className={styles.actionsHint}>
            {soldOut
              ? `Esta cor esgotou. Pergunte no ${channel} quando volta, ou veja outra cor.`
              : cart.count > 0
                ? `O ${channel} leva esta peça junto com as ${cart.count} do carrinho.`
                : `Sem pagamento aqui: a gente confirma tudo no ${channel}.`}
          </p>
          <div className={styles.orderMessage}>
            <OrderMessage message={message} result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}
