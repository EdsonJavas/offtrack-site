import { ImageResponse } from "next/og";
import { brand } from "@/data/brand";
import { discountPercent } from "@/data/types";
import { getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export const alt = `Peça da ${brand.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Largura da foto: mesma proporção do card (4 : 4,6) na altura da imagem. */
const PHOTO_WIDTH = Math.round((630 * 4) / 4.6);

/**
 * Prévia do link de uma peça (WhatsApp, Instagram, X): a foto à esquerda e, à
 * direita, categoria, nome e preço. Satori: todo elemento com mais de um filho
 * precisa de `display: flex`, e textos vão como uma string só.
 */
export default async function PieceOpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  const base = { display: "flex" } as const;
  const discount = product ? discountPercent(product) : 0;

  return new ImageResponse(
    <div
      style={{
        ...base,
        width: "100%",
        height: "100%",
        background: "#0a0a0a",
        color: "#f4f4f2",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {product && (
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- Satori só aceita <img>
        <img
          src={product.variants[0].image}
          width={PHOTO_WIDTH}
          height={630}
          style={{ objectFit: "cover" }}
        />
      )}

      <div
        style={{
          ...base,
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
        }}
      >
        <div
          style={{
            ...base,
            justifyContent: "space-between",
            fontSize: 26,
            letterSpacing: 6,
          }}
        >
          <span style={{ fontWeight: 900 }}>{brand.monogram}</span>
          <span style={{ color: "#8a8a8a" }}>SOB ENCOMENDA</span>
        </div>

        <div style={{ ...base, flexDirection: "column", gap: 20 }}>
          <div
            style={{
              ...base,
              fontSize: 24,
              letterSpacing: 8,
              color: "#c4c4c4",
            }}
          >
            {(product?.category ?? "Streetwear").toUpperCase()}
          </div>
          <div
            style={{
              ...base,
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: -2,
            }}
          >
            {(product?.name ?? brand.name).toUpperCase()}
          </div>
        </div>

        <div style={{ ...base, flexDirection: "column", gap: 18 }}>
          {product && (
            <div style={{ ...base, alignItems: "center", gap: 20 }}>
              <div
                style={{
                  ...base,
                  padding: "14px 26px",
                  background: "#f4f4f2",
                  color: "#0a0a0a",
                  fontSize: 58,
                  fontWeight: 900,
                  letterSpacing: -2,
                }}
              >
                {formatPrice(product.priceCents)}
              </div>
              {discount > 0 && (
                <div
                  style={{
                    ...base,
                    fontSize: 30,
                    color: "#8a8a8a",
                    textDecoration: "line-through",
                  }}
                >
                  {formatPrice(product.compareAtCents ?? 0)}
                </div>
              )}
            </div>
          )}
          <div
            style={{ ...base, fontSize: 22, letterSpacing: 5, color: "#8a8a8a" }}
          >
            {`${brand.name} · ${brand.instagram.handle}`}
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
