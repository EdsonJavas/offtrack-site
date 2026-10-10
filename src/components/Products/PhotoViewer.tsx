"use client";

import { useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import type { GarmentKind } from "@/components/Garment/geometry";
import type { MeasureKey, ProductVariant } from "@/data/mock/products";
import { MeasureSchema } from "./MeasureSchema";
import styles from "./PhotoViewer.module.css";

interface PhotoViewerProps {
  name: string;
  kind: GarmentKind;
  variant: ProductVariant;
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
  size,
  measurements,
  showMeasures,
  bottomTone = "dark",
}: PhotoViewerProps) {
  const [zoom, setZoom] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [light, setLight] = useState({ x: 50, y: 35 });
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; pan: { x: number; y: number } } | null>(null);

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

  const toggleZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!zoom && stage) {
      // Centraliza o zoom no ponto clicado.
      const rect = stage.getBoundingClientRect();
      const dx = rect.width / 2 - (e.clientX - rect.left);
      const dy = rect.height / 2 - (e.clientY - rect.top);
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
      style={{ "--lx": `${light.x}%`, "--ly": `${light.y}%` } as React.CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={toggleZoom}
    >
      <div
        className={styles.photoWrap}
        style={{ transform: zoom ? `translate(${pan.x}px, ${pan.y}px) scale(${ZOOM})` : undefined }}
      >
        <Image
          key={variant.image}
          src={variant.image}
          alt={`${name}, ${variant.color.toLowerCase()}`}
          fill
          sizes="(min-width: 900px) 60vw, 100vw"
          priority
          className={styles.photo}
          style={{ objectPosition: variant.position ?? "50% 50%" }}
        />
      </div>

      <div className={styles.light} aria-hidden="true" />

      <MeasureSchema kind={kind} size={size} measurements={measurements} open={showMeasures} />

      <div className={styles.hud} aria-hidden="true">
        <span>{variant.color}</span>
        <span className={styles.hudHint}>
          {zoom ? "Arraste para mover · toque duplo para sair" : "Toque duplo para zoom"}
        </span>
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
