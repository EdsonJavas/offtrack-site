"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { useModal } from "@/hooks/useModal";
import styles from "./ImageEditor.module.css";

/** Proporção do card da loja (ver ProductCard.module.css). */
export const FRAME_RATIO = 4 / 4.6;
const OUT_WIDTH = 1200;
const OUT_HEIGHT = Math.round(OUT_WIDTH / FRAME_RATIO);
const MIN_ZOOM = 1;
const MAX_ZOOM = 3.5;

interface Light {
  brightness: number;
  contrast: number;
  saturation: number;
}

const LIGHT_DEFAULT: Light = { brightness: 100, contrast: 100, saturation: 100 };

interface ImageEditorProps {
  /** Arquivo escolhido agora ou URL de uma foto já salva. */
  source: File | string;
  /** Nome base do arquivo gerado. */
  fileName: string;
  /** Quantas fotos ainda vêm depois desta (fila de várias de uma vez). */
  remaining?: number;
  onCancel: () => void;
  onSave: (file: File, previewUrl: string) => void;
}

type Tab = "quadro" | "luz";

/**
 * Editor de foto no estilo "Editar" do celular, mas com a cara da marca:
 * a foto fica dentro do quadro na proporção do card; arrasta para enquadrar,
 * pinça/roda/slider para o zoom, gira e espelha, ajusta a luz. Ao concluir,
 * sai um JPG já recortado no tamanho certo.
 */
export function ImageEditor({
  source,
  fileName,
  remaining = 0,
  onCancel,
  onSave,
}: ImageEditorProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("quadro");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState(false);
  const [light, setLight] = useState<Light>(LIGHT_DEFAULT);
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [saving, setSaving] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    offset: { x: number; y: number };
    zoom: number;
    center: { x: number; y: number };
    distance: number;
  } | null>(null);

  useModal(true, panelRef, onCancel);

  // Carrega a imagem (arquivo local ou URL). URLs externas precisam de CORS
  // para o canvas conseguir exportar.
  useEffect(() => {
    const img = new Image();
    let objectUrl: string | null = null;
    if (typeof source === "string") {
      img.crossOrigin = "anonymous";
      img.src = source;
    } else {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    }
    img.onload = () => setImage(img);
    img.onerror = () =>
      setError("Não deu para abrir esta foto. Tente enviar o arquivo de novo.");
    return () => {
      // Sem isso, um carregamento cancelado (ex.: StrictMode) dispara o erro à toa.
      img.onload = null;
      img.onerror = null;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source]);

  // O quadro ocupa o máximo do palco mantendo a proporção do card.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const { width, height } = stage.getBoundingClientRect();
      const pad = 24;
      const maxW = width - pad * 2;
      const maxH = height - pad * 2;
      const w = Math.min(maxW, maxH * FRAME_RATIO);
      setFrame({ w, h: w / FRAME_RATIO });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // Dimensões da foto depois de girar (90°/270° trocam largura e altura).
  const rotated = useMemo(() => {
    if (!image) return { w: 1, h: 1 };
    const swap = rotation % 180 !== 0;
    return {
      w: swap ? image.naturalHeight : image.naturalWidth,
      h: swap ? image.naturalWidth : image.naturalHeight,
    };
  }, [image, rotation]);

  /** Escala que faz a foto cobrir o quadro inteiro (como object-fit: cover). */
  const coverScale = frame.w
    ? Math.max(frame.w / rotated.w, frame.h / rotated.h)
    : 1;
  const scale = coverScale * zoom;

  const clamp = useCallback(
    (o: { x: number; y: number }, z: number) => {
      const s = coverScale * z;
      const maxX = Math.max(0, (rotated.w * s - frame.w) / 2);
      const maxY = Math.max(0, (rotated.h * s - frame.h) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, o.x)),
        y: Math.max(-maxY, Math.min(maxY, o.y)),
      };
    },
    [coverScale, rotated, frame],
  );

  const setZoomClamped = (z: number, around?: { x: number; y: number }) => {
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
    setOffset((o) => {
      // Zoom em torno de um ponto do quadro: mantém esse ponto parado.
      if (!around) return clamp(o, next);
      const k = next / zoom;
      return clamp(
        { x: around.x + (o.x - around.x) * k, y: around.y + (o.y - around.y) * k },
        next,
      );
    });
    setZoom(next);
  };

  // ---- Gestos: um dedo arrasta, dois dedos dão zoom ----

  const framePoint = (e: { clientX: number; clientY: number }) => {
    const r = frameRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 };
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const center =
      pts.length === 2
        ? { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
        : pts[0];
    gesture.current = {
      offset,
      zoom,
      center,
      distance: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
    };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const g = gesture.current;
    if (pts.length >= 2) {
      const center = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const distance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, (g.zoom * distance) / (g.distance || distance)));
      setZoom(z);
      setOffset(
        clamp(
          { x: g.offset.x + center.x - g.center.x, y: g.offset.y + center.y - g.center.y },
          z,
        ),
      );
    } else {
      setOffset(
        clamp(
          { x: g.offset.x + pts[0].x - g.center.x, y: g.offset.y + pts[0].y - g.center.y },
          zoom,
        ),
      );
    }
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) gesture.current = null;
    else {
      // Sobrou um dedo: recomeça o gesto a partir dele.
      const [p] = pointers.current.values();
      gesture.current = { offset, zoom, center: p, distance: 0 };
    }
  };

  // Roda do mouse: listener nativo, porque o React registra `wheel` como passivo
  // e o preventDefault (que evita rolar a página) não funcionaria.
  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  useEffect(() => {
    wheelRef.current = (e: WheelEvent) => {
      e.preventDefault();
      if (!frameRef.current) return;
      setZoomClamped(zoom * (e.deltaY < 0 ? 1.08 : 0.92), framePoint(e));
    };
  });
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const handler = (e: WheelEvent) => wheelRef.current(e);
    stage.addEventListener("wheel", handler, { passive: false });
    return () => stage.removeEventListener("wheel", handler);
  }, []);

  const rotate = () => {
    setRotation((r) => (r + 90) % 360);
    setOffset({ x: 0, y: 0 });
  };

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
    setFlip(false);
    setLight(LIGHT_DEFAULT);
  };

  const filter = `brightness(${light.brightness}%) contrast(${light.contrast}%) saturate(${light.saturation}%)`;

  /** Reproduz no canvas exatamente o que está no quadro e exporta em JPG. */
  const save = async () => {
    if (!image) return;
    setSaving(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUT_WIDTH;
      canvas.height = OUT_HEIGHT;
      const ctx = canvas.getContext("2d")!;
      const k = OUT_WIDTH / frame.w;
      if ("filter" in ctx) ctx.filter = filter;
      ctx.translate(OUT_WIDTH / 2 + offset.x * k, OUT_HEIGHT / 2 + offset.y * k);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flip ? -scale * k : scale * k, scale * k);
      ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9),
      );
      if (!blob) throw new Error("export");
      const base = fileName.replace(/\.[a-z0-9]+$/i, "") || "foto";
      const file = new File([blob], `${base}.jpg`, { type: "image/jpeg" });
      onSave(file, URL.createObjectURL(blob));
    } catch {
      setError(
        "Não deu para exportar esta foto (bloqueio de origem). Envie o arquivo de novo e edite antes de salvar.",
      );
      setSaving(false);
    }
  };

  const transform = `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${flip ? -scale : scale}, ${scale})`;

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Editar foto">
      <div ref={panelRef} className={styles.panel} tabIndex={-1}>
        <header className={styles.head}>
          <button type="button" className={styles.headButton} onClick={onCancel}>
            Cancelar
          </button>
          <p className={styles.headTitle}>
            Editar foto <span>{Math.round(zoom * 100)}%</span>
            {remaining > 0 && (
              <em className={styles.headQueue}>
                +{remaining} na fila
              </em>
            )}
          </p>
          <button
            type="button"
            className={`${styles.headButton} ${styles.headPrimary}`}
            onClick={save}
            disabled={!image || saving}
          >
            {saving ? "Salvando…" : remaining > 0 ? "Próxima" : "Concluir"}
          </button>
        </header>

        <div ref={stageRef} className={styles.stage}>
          {/* Fora do quadro a foto aparece apagada; dentro, nítida: o recorte fica óbvio. */}
          {image && frame.w > 0 && (
            <div
              ref={frameRef}
              className={styles.frame}
              style={{ width: frame.w, height: frame.h }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {/* eslint-disable @next/next/no-img-element -- object URLs locais, sem otimização */}
              <div className={styles.ghost} aria-hidden="true">
                <img
                  src={image.src}
                  alt=""
                  draggable={false}
                  style={{ transform, filter }}
                />
              </div>
              <div className={styles.cut}>
                <img
                  src={image.src}
                  alt="Foto em edição"
                  draggable={false}
                  style={{ transform, filter }}
                />
              </div>
              {/* eslint-enable @next/next/no-img-element */}
              <div className={styles.grid} aria-hidden="true" />
              <span className={`${styles.corner} ${styles.cornerTl}`} aria-hidden="true" />
              <span className={`${styles.corner} ${styles.cornerTr}`} aria-hidden="true" />
              <span className={`${styles.corner} ${styles.cornerBl}`} aria-hidden="true" />
              <span className={`${styles.corner} ${styles.cornerBr}`} aria-hidden="true" />
              <p className={styles.frameLabel}>Área do card · 4:4,6</p>
            </div>
          )}
          {!image && !error && <p className={styles.loading}>Abrindo a foto…</p>}
          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.tools}>
          <div className={styles.tabs} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "quadro"}
              className={`${styles.tab} ${tab === "quadro" ? styles.tabOn : ""}`}
              onClick={() => setTab("quadro")}
            >
              Quadro
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "luz"}
              className={`${styles.tab} ${tab === "luz" ? styles.tabOn : ""}`}
              onClick={() => setTab("luz")}
            >
              Luz
            </button>
            <button type="button" className={styles.reset} onClick={reset}>
              Desfazer tudo
            </button>
          </div>

          {tab === "quadro" ? (
            <div className={styles.toolRow}>
              <label className={styles.slider}>
                <span>Zoom</span>
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoomClamped(Number(e.target.value))}
                />
              </label>
              <div className={styles.buttons}>
                <button type="button" className={styles.tool} onClick={rotate}>
                  <RotateIcon /> Girar
                </button>
                <button
                  type="button"
                  className={`${styles.tool} ${flip ? styles.toolOn : ""}`}
                  onClick={() => setFlip((f) => !f)}
                  aria-pressed={flip}
                >
                  <FlipIcon /> Espelhar
                </button>
                <button
                  type="button"
                  className={styles.tool}
                  onClick={() => {
                    setZoom(1);
                    setOffset({ x: 0, y: 0 });
                  }}
                >
                  <CenterIcon /> Centralizar
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.toolRow}>
              {(
                [
                  ["brightness", "Brilho"],
                  ["contrast", "Contraste"],
                  ["saturation", "Cor"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className={styles.slider}>
                  <span>
                    {label} <em>{light[key] - 100 > 0 ? "+" : ""}{light[key] - 100}</em>
                  </span>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={light[key]}
                    onChange={(e) =>
                      setLight((l) => ({ ...l, [key]: Number(e.target.value) }))
                    }
                  />
                </label>
              ))}
            </div>
          )}
          <p className={styles.hint}>
            Arraste para enquadrar · pinça ou roda do mouse para o zoom
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function RotateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20 12a8 8 0 1 1-2.3-5.7" />
      <path d="M20 4v5h-5" />
    </svg>
  );
}

function FlipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3v18" strokeDasharray="2 3" />
      <path d="M9 7 4 12l5 5V7z" fill="currentColor" stroke="none" />
      <path d="m15 7 5 5-5 5V7z" />
    </svg>
  );
}

function CenterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
