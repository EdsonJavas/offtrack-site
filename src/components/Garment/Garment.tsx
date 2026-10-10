import { useId } from "react";
import { isLight, shade } from "@/lib/color";
import { GEOMETRY, POLO_COLLAR, RIBBING, type GarmentKind } from "./geometry";

export type GarmentView = "front" | "back";

interface GarmentProps {
  kind: GarmentKind;
  color: string;
  view?: GarmentView;
  /**
   * Giro contínuo: -1 e 1 = costas, 0 = frente, ±0.5 = de lado.
   * Quando informado, `view` é ignorado.
   */
  angle?: number;
  className?: string;
}

/**
 * Peça desenhada em SVG, sombreada a partir da cor escolhida.
 * Placeholder fiel em forma e cor até as fotos reais chegarem.
 */
export function Garment({ kind, color, view = "front", angle, className }: GarmentProps) {
  const id = useId();
  const geometry = GEOMETRY[kind];

  const turning = angle !== undefined;
  const resolvedView: GarmentView = turning ? (Math.abs(angle) < 0.5 ? "front" : "back") : view;
  const scaleX = turning ? Math.cos(angle * Math.PI) : 1;
  // Quanto mais de lado, mais escura (simula a luz saindo da face).
  const edgeShadow = turning ? (1 - Math.abs(scaleX)) * 0.55 : 0;

  const body = geometry[resolvedView];
  const ink = isLight(color) ? "rgba(10,10,10,0.82)" : "rgba(244,244,242,0.9)";
  const seam = isLight(color) ? "rgba(10,10,10,0.22)" : "rgba(244,244,242,0.16)";
  const safeScale = Math.abs(scaleX) < 0.02 ? 0.02 : scaleX;

  return (
    <svg viewBox="0 0 400 480" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-shade`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(color, -0.42)} />
          <stop offset="0.3" stopColor={color} />
          <stop offset="0.5" stopColor={shade(color, 0.1)} />
          <stop offset="0.72" stopColor={color} />
          <stop offset="1" stopColor={shade(color, -0.45)} />
        </linearGradient>
        <linearGradient id={`${id}-fold`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="rgba(0,0,0,0)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.35)" />
        </linearGradient>
        <filter id={`${id}-fabric`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.35 0" />
        </filter>
        <filter id={`${id}-drop`} x="-20%" y="-10%" width="140%" height="130%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <path d={body} />
        </clipPath>
      </defs>

      <g transform={`translate(200 0) scale(${safeScale} 1) translate(-200 0)`}>
        {/* Sombra projetada */}
        <path d={body} fill="rgba(0,0,0,0.55)" transform="translate(6 18)" filter={`url(#${id}-drop)`} />

        {/* Corpo */}
        <path d={body} fill={`url(#${id}-shade)`} />
        <g clipPath={`url(#${id}-clip)`}>
          <rect width="400" height="480" filter={`url(#${id}-fabric)`} style={{ mixBlendMode: "overlay" }} opacity="0.5" />
          <rect y="300" width="400" height="180" fill={`url(#${id}-fold)`} />
        </g>

        {/* Costuras */}
        {geometry.seams.map((d) => (
          <path key={d} d={d} fill="none" stroke={seam} strokeWidth="1.4" strokeDasharray="3 3" />
        ))}

        {/* Gola */}
        {RIBBING[kind] && <path d={RIBBING[kind][resolvedView]} fill={shade(color, -0.3)} />}
        {kind === "polo" && resolvedView === "front" && (
          <>
            <path d={POLO_COLLAR.left} fill={shade(color, -0.12)} stroke={seam} strokeWidth="1" />
            <path d={POLO_COLLAR.right} fill={shade(color, -0.18)} stroke={seam} strokeWidth="1" />
            <circle cx="206" cy="178" r="3" fill={shade(color, -0.5)} />
            <circle cx="206" cy="200" r="3" fill={shade(color, -0.5)} />
          </>
        )}
        {kind === "polo" && resolvedView === "back" && (
          <path d={POLO_COLLAR.back} fill={shade(color, -0.14)} stroke={seam} strokeWidth="1" />
        )}

        {/* Estampa: OT. na frente, estrela grande nas costas */}
        {resolvedView === "front" ? (
          <text
            x={geometry.printFront[0]}
            y={geometry.printFront[1]}
            textAnchor="middle"
            fill={ink}
            fontSize="22"
            fontWeight="800"
            letterSpacing="-0.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            OT.
          </text>
        ) : (
          // Se a peça está espelhada (scaleX < 0), desespelha a estampa para o texto ler certo.
          <g
            transform={`translate(${geometry.printBack[0]} ${geometry.printBack[1]}) scale(${safeScale < 0 ? -1 : 1} 1)`}
            fill={ink}
          >
            <path d="M0 -40 C 2 -17 17 -2 40 0 C 17 2 2 17 0 40 C -2 17 -17 2 -40 0 C -17 -2 -2 -17 0 -40 Z" />
            <text
              y="68"
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              letterSpacing="4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              OFFTRACK
            </text>
          </g>
        )}

        {/* Escurece ao virar */}
        {edgeShadow > 0 && <path d={body} fill="rgb(0,0,0)" opacity={edgeShadow} />}
      </g>
    </svg>
  );
}
