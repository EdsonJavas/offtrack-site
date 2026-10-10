"use client";

import { useEffect, useState } from "react";

export type Tone = "light" | "dark";

export interface ImageTones {
  top: Tone;
  bottom: Tone;
}

const SAMPLE_SIZE = 64;
const LIGHT_THRESHOLD = 0.55;

/**
 * Mede a luminosidade média das faixas de cima e de baixo de uma imagem,
 * para os controles sobrepostos escolherem a cor que contrasta.
 * Lê uma miniatura pelo otimizador do Next (mesma origem: o canvas não fica "sujo").
 */
export function useImageTone(src: string): ImageTones | null {
  const [tones, setTones] = useState<ImageTones | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    // q=75: o otimizador só aceita as qualidades configuradas (padrão: 75).
    img.src = `/_next/image?url=${encodeURIComponent(src)}&w=${SAMPLE_SIZE}&q=75`;

    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = SAMPLE_SIZE;
      canvas.height = SAMPLE_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

      const band = (fromRow: number, toRow: number): Tone => {
        const { data } = ctx.getImageData(
          0,
          fromRow,
          SAMPLE_SIZE,
          toRow - fromRow,
        );
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          sum +=
            (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) /
            255;
        }
        return sum / (data.length / 4) > LIGHT_THRESHOLD ? "light" : "dark";
      };

      const result = {
        top: band(0, Math.round(SAMPLE_SIZE * 0.3)),
        bottom: band(Math.round(SAMPLE_SIZE * 0.72), SAMPLE_SIZE),
      };
      setTones(result);
    };

    return () => {
      cancelled = true;
    };
  }, [src]);

  return tones;
}
