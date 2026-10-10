"use client";

import { useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import type { GarmentKind } from "@/components/Garment/geometry";
import type { MeasureKey, ProductVariant } from "@/data/types";
import { MeasureSchema } from "./MeasureSchema";
import styles from "./PhotoViewer.module.css";

interface PhotoViewerProps {
  name: string;
  kind: GarmentKind;
  variant: ProductVariant;
  /** Foto a mostrar (galeria); sem isso, a principal da cor. */
  image?: string;
  size: string;
  measurements?: Partial<Record<MeasureKey, number>>;
  showMeasures: boolean;
  /** Luminosidade da base da foto: define a cor do texto sobreposto. */
  bottomTone?: "light" | "dark";
}

const ZOOM = 2.2;

/**
 * Foto da peça em tela grande. A luz segue o ponteiro; toque duplo dá zoom
 * e, com zoom, arrastar move a foto. "Medidas" abre o esquema da silhueta.
 */
export function PhotoViewer({
  name,
  kind,
  variant,
  image,
  size,
  measurements,
  showMeasures,
  bottomTone = "dark",
}: PhotoViewerProps) {
  const src = image ?? variant.image;
  const isMain = src === variant.image;
  const [zoom, setZoom] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [light, setLight] = useState({ x: 50, y: 35 });
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    pan: { x: number; y: number };
  } | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!zoom) return;
    drag.current = { x: e.clientX, y: e.clientY, pan };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (stage) {
      const rect = stage.getBoundingClientRect();
      setLight({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }
    if (!drag.current) return;
    setPan(
      clampPan(
        drag.current.pan.x + e.clientX - drag.current.x,
        drag.current.pan.y + e.clientY - drag.current.y,
        stage,
      ),
    );
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  /** Zoom no ponto clicado (toque duplo) ou no centro (botão de lupa). */
  const toggleZoom = (point?: { clientX: number; clientY: number }) => {
    const stage = stageRef.current;
    if (!zoom && stage && point) {
      const rect = stage.getBoundingClientRect();
      const dx = rect.width / 2 - (point.clientX - rect.left);
      const dy = rect.height / 2 - (point.clientY - rect.top);
      setPan(clampPan(dx * (ZOOM - 1), dy * (ZOOM - 1), stage));
    } else {
      setPan({ x: 0, y: 0 });
    }
    setZoom((z) => !z);
  };

  return (
    <div
      ref={stageRef}
      className={`${styles.stage} ${zoom ? styles.zoomed : ""}`}
      data-bottom={bottomTone}
      style={
        { "--lx": `${light.x}%`, "--ly": `${light.y}%` } as React.CSSProperties
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={(e) => toggleZoom(e)}
    >
      <div
        className={styles.photoWrap}
        style={{
          transform: zoom
            ? `translate(${pan.x}px, ${pan.y}px) scale(${ZOOM})`
            : undefined,
        }}
      >
        <Image
          key={src}
          src={src}
          alt={`${name}, ${variant.color.toLowerCase()}`}
          fill
          sizes="(min-width: 900px) 60vw, 100vw"
          priority
          className={styles.photo}
          // Só a principal tem enquadramento definido; as extras já vêm recortadas.
          style={{ objectPosition: isMain ? (variant.position ?? "50% 50%") : "50% 50%" }}
        />
      </div>

      <div className={styles.light} aria-hidden="true" />

      <MeasureSchema
        kind={kind}
        size={size}
        measurements={measurements}
        open={showMeasures}
      />

      <div className={styles.hud}>
        <span aria-hidden="true">{variant.color}</span>
        <button
          type="button"
          className={styles.zoomButton}
          onClick={() => toggleZoom()}
          aria-pressed={zoom}
          aria-label={zoom ? "Sair do zoom" : "Aproximar a foto"}
        >
          <span className={styles.zoomIcon} aria-hidden="true">
            {zoom ? "−" : "+"}
          </span>
          {zoom ? "Sair do zoom" : "Zoom"}
        </button>
      </div>
    </div>
  );
}

/** Não deixa a foto ampliada sair da área visível. */
function clampPan(x: number, y: number, stage: HTMLDivElement | null) {
  if (!stage) return { x, y };
  const maxX = (stage.clientWidth * (ZOOM - 1)) / 2;
  const maxY = (stage.clientHeight * (ZOOM - 1)) / 2;
  return {
    x: Math.max(-maxX, Math.min(maxX, x)),
    y: Math.max(-maxY, Math.min(maxY, y)),
  };
}
