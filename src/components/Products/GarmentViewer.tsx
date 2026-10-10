"use client";

import { useRef, useState, type PointerEvent } from "react";
import { Garment } from "@/components/Garment/Garment";
import { GEOMETRY, type GarmentKind } from "@/components/Garment/geometry";
import { MEASURE_LABELS, type MeasureKey } from "@/data/mock/products";
import styles from "./GarmentViewer.module.css";

interface GarmentViewerProps {
  kind: GarmentKind;
  color: string;
  measurements?: Partial<Record<MeasureKey, number>>;
  showMeasures: boolean;
}

const DRAG_SENSITIVITY = 1 / 340;

/**
 * Peça pendurada no concreto. Arrastar gira; a luz segue o ponteiro;
 * duplo toque dá zoom; "medidas" desenha as linhas por cima.
 */
export function GarmentViewer({ kind, color, measurements, showMeasures }: GarmentViewerProps) {
  const [angle, setAngle] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [light, setLight] = useState({ x: 50, y: 30 });
  const drag = useRef<{ x: number; angle: number; moved: boolean } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, angle, moved: false };
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
    const delta = (e.clientX - drag.current.x) * DRAG_SENSITIVITY;
    if (Math.abs(delta) > 0.01) drag.current.moved = true;
    setAngle(wrap(drag.current.angle + delta));
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const geometry = GEOMETRY[kind];
  const face = Math.abs(angle) < 0.5 ? "Frente" : "Costas";

  return (
    <div
      ref={stageRef}
      className={`${styles.stage} ${zoom ? styles.zoomed : ""}`}
      style={{ "--lx": `${light.x}%`, "--ly": `${light.y}%` } as React.CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={() => setZoom((z) => !z)}
    >
      <div className={styles.wall} aria-hidden="true" />
      <div className={styles.light} aria-hidden="true" />

      <div className={styles.hanger} aria-hidden="true">
        <span className={styles.hook} />
        <span className={styles.bar} />
      </div>

      <div className={styles.piece}>
        <Garment kind={kind} color={color} angle={angle} className={styles.garment} />

        {showMeasures && measurements && (
          <svg viewBox="0 0 400 480" className={styles.measures} aria-hidden="true">
            {geometry.measures.map((m) => {
              const value = measurements[m.key];
              if (value === undefined) return null;
              const mx = (m.from[0] + m.to[0]) / 2 + m.label[0];
              const my = (m.from[1] + m.to[1]) / 2 + m.label[1];
              const vertical = m.from[0] === m.to[0];
              return (
                <g key={m.key}>
                  <line x1={m.from[0]} y1={m.from[1]} x2={m.to[0]} y2={m.to[1]} />
                  <line
                    x1={m.from[0] - (vertical ? 6 : 0)}
                    y1={m.from[1] - (vertical ? 0 : 6)}
                    x2={m.from[0] + (vertical ? 6 : 0)}
                    y2={m.from[1] + (vertical ? 0 : 6)}
                  />
                  <line
                    x1={m.to[0] - (vertical ? 6 : 0)}
                    y1={m.to[1] - (vertical ? 0 : 6)}
                    x2={m.to[0] + (vertical ? 6 : 0)}
                    y2={m.to[1] + (vertical ? 0 : 6)}
                  />
                  <text x={mx} y={my} textAnchor={vertical ? "start" : "middle"}>
                    {MEASURE_LABELS[m.key]} · {value} cm
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <div className={styles.hud} aria-hidden="true">
        <span>{face}</span>
        <span className={styles.hudHint}>Arraste para girar · toque duplo para zoom</span>
      </div>
    </div>
  );
}

/** Mantém o ângulo entre -1 e 1, dando a volta completa. */
function wrap(value: number) {
  const v = ((((value + 1) % 2) + 2) % 2) - 1;
  return v;
}
