import { ImageResponse } from "next/og";
import { brand } from "@/data/brand";

export const alt = `${brand.name} — ${brand.slogan}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Imagem de compartilhamento (WhatsApp, Instagram, X), gerada no build.
 * Satori: todo elemento com mais de um filho precisa de `display: flex`,
 * e textos vão como uma string só.
 */
export default function OpenGraphImage() {
  const base = { display: "flex" } as const;

  return new ImageResponse(
    <div
      style={{
        ...base,
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
        color: "#f4f4f2",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          ...base,
          justifyContent: "space-between",
          fontSize: 28,
          letterSpacing: 6,
        }}
      >
        <span>{brand.monogram}</span>
        <span>{`${brand.city.toUpperCase()}, ${brand.state} · ${brand.foundedYear}`}</span>
      </div>
      <div style={{ ...base, flexDirection: "column", gap: 24 }}>
        <div
          style={{
            ...base,
            fontSize: 150,
            fontWeight: 900,
            letterSpacing: -6,
            lineHeight: 1,
          }}
        >
          {brand.name}
        </div>
        <div
          style={{ ...base, fontSize: 44, letterSpacing: 2, color: "#d6d6d6" }}
        >
          {brand.slogan.toUpperCase()}
        </div>
      </div>
      <div
        style={{ ...base, fontSize: 26, letterSpacing: 6, color: "#8a8a8a" }}
      >
        {`STREETWEAR · SOB ENCOMENDA · ${brand.instagram.handle}`}
      </div>
    </div>,
    size,
  );
}
