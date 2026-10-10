/**
 * Geometria das peças em SVG (viewBox 0 0 400 480).
 * Cada peça tem o corpo (frente e costas), costuras e os pontos
 * usados para desenhar as linhas de medida.
 */
export type GarmentKind = "tee" | "oversized" | "polo" | "shorts";

export interface MeasureLine {
  key: "chest" | "length" | "sleeve" | "waist";
  from: [number, number];
  to: [number, number];
  /** Deslocamento do rótulo em relação ao meio da linha. */
  label: [number, number];
}

export interface GarmentGeometry {
  front: string;
  back: string;
  /** Linhas de costura e acabamentos (strokes). */
  seams: string[];
  /** Área da estampa frontal (centro) e das costas. */
  printFront: [number, number];
  printBack: [number, number];
  measures: MeasureLine[];
}

const teeFrontNeck = "C 176 142, 224 142, 235 112";
const teeBackNeck = "C 176 120, 224 120, 235 112";

const teeBody = (neck: string) =>
  `M165 112 ${neck} L290 112 L352 182 L318 224 L278 202 L282 440 L118 440 L122 202 L82 224 L48 182 L110 112 Z`;

const tee: GarmentGeometry = {
  front: teeBody(teeFrontNeck),
  back: teeBody(teeBackNeck),
  seams: [
    "M122 202 L278 202", // linha das cavas
    "M118 430 L282 430", // barra
    "M85 216 L120 196", // acabamento manga esq.
    "M315 216 L280 196", // acabamento manga dir.
  ],
  printFront: [200, 230],
  printBack: [200, 250],
  measures: [
    { key: "chest", from: [120, 250], to: [280, 250], label: [0, -10] },
    { key: "length", from: [330, 112], to: [330, 440], label: [14, 0] },
    { key: "sleeve", from: [290, 100], to: [352, 170], label: [16, -8] },
  ],
};

const oversizedBody = (neck: string) =>
  `M160 120 ${neck} L308 120 L372 212 L330 262 L292 238 L298 468 L102 468 L108 238 L70 262 L28 212 L92 120 Z`;

const oversized: GarmentGeometry = {
  front: oversizedBody("C 170 150, 230 150, 240 120"),
  back: oversizedBody("C 170 128, 230 128, 240 120"),
  seams: ["M108 238 L292 238", "M102 456 L298 456", "M74 254 L106 232", "M326 254 L294 232"],
  printFront: [200, 260],
  printBack: [200, 280],
  measures: [
    { key: "chest", from: [104, 290], to: [296, 290], label: [0, -10] },
    { key: "length", from: [345, 120], to: [345, 468], label: [14, 0] },
    { key: "sleeve", from: [308, 108], to: [372, 200], label: [16, -8] },
  ],
};

const poloBody = (neck: string) =>
  `M168 112 ${neck} L290 112 L352 182 L318 224 L278 202 L282 440 L118 440 L122 202 L82 224 L48 182 L110 112 Z`;

const polo: GarmentGeometry = {
  front: poloBody("L200 160 L232 112"),
  back: poloBody("C 178 122, 222 122, 232 112"),
  seams: [
    "M122 202 L278 202",
    "M118 430 L282 430",
    "M92 210 L126 190", // punho esq.
    "M308 210 L274 190", // punho dir.
    "M200 160 L200 215", // carcela
    "M212 160 L212 215",
  ],
  printFront: [152, 196],
  printBack: [200, 250],
  measures: [
    { key: "chest", from: [120, 250], to: [280, 250], label: [0, -10] },
    { key: "length", from: [330, 112], to: [330, 440], label: [14, 0] },
    { key: "sleeve", from: [290, 100], to: [352, 170], label: [16, -8] },
  ],
};

const shortsBody =
  "M118 120 L282 120 L282 144 L296 262 L312 402 L208 402 L200 270 L192 402 L88 402 L104 262 L118 144 Z";

const shorts: GarmentGeometry = {
  front: shortsBody,
  back: shortsBody,
  seams: [
    "M118 144 L282 144", // cós
    "M200 144 L200 270", // gancho
    "M96 392 L190 392", // barra esq.
    "M210 392 L304 392", // barra dir.
    "M126 160 L150 215", // bolso esq.
    "M274 160 L250 215", // bolso dir.
    "M190 132 L200 132 M200 132 L210 132", // cordão
  ],
  printFront: [262, 330],
  printBack: [262, 190],
  measures: [
    { key: "waist", from: [118, 132], to: [282, 132], label: [0, -10] },
    { key: "length", from: [340, 120], to: [340, 402], label: [14, 0] },
  ],
};

export const GEOMETRY: Record<GarmentKind, GarmentGeometry> = { tee, oversized, polo, shorts };

/** Gola crew/costas: faixa de ribana. */
export const RIBBING: Partial<Record<GarmentKind, { front: string; back: string }>> = {
  tee: {
    front: "M165 112 C 176 142, 224 142, 235 112 C 224 150, 176 150, 165 112 Z",
    back: "M165 112 C 176 120, 224 120, 235 112 C 224 128, 176 128, 165 112 Z",
  },
  oversized: {
    front: "M160 120 C 170 150, 230 150, 240 120 C 230 158, 170 158, 160 120 Z",
    back: "M160 120 C 170 128, 230 128, 240 120 C 230 136, 170 136, 160 120 Z",
  },
};

/** Gola da polo: duas abas. */
export const POLO_COLLAR = {
  left: "M146 102 L200 102 L200 158 L170 130 Z",
  right: "M254 102 L200 102 L200 158 L230 130 Z",
  back: "M146 102 L254 102 L240 124 L160 124 Z",
};
