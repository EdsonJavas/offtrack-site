import type { DrawFrame } from "@/components/FrameSequence/proceduralSequence";

/**
 * PLACEHOLDER — frames desenhados em código até os vídeos reais chegarem.
 * Mostra a mecânica do scroll: a estrela de quatro pontas (símbolo da marca)
 * gira e cresce, um anel se expande e a luz varre o fundo.
 */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function starPath(ctx: CanvasRenderingContext2D, outer: number, inner: number) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * A vinheta não muda com o scroll: fica pronta num canvas auxiliar e é só
 * carimbada por cima (um gradiente radial de tela inteira a menos por frame).
 */
let vignetteCache: { key: string; canvas: HTMLCanvasElement } | null = null;

function vignetteFor(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const dpr = ctx.getTransform().a || 1;
  const key = `${width}x${height}@${dpr}`;
  if (vignetteCache?.key === key) return vignetteCache.canvas;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const vctx = canvas.getContext("2d")!;
  vctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cx = width / 2;
  const cy = height / 2;
  const base = Math.min(width, height);
  const vignette = vctx.createRadialGradient(cx, cy, base * 0.3, cx, cy, base * 0.95);
  vignette.addColorStop(0, "rgba(10,10,10,0)");
  vignette.addColorStop(1, "rgba(10,10,10,0.85)");
  vctx.fillStyle = vignette;
  vctx.fillRect(0, 0, width, height);

  vignetteCache = { key, canvas };
  return canvas;
}

export const drawHeroPlaceholder: DrawFrame = (
  ctx,
  progress,
  width,
  height,
) => {
  const cx = width / 2;
  const cy = height / 2;
  const base = Math.min(width, height);

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, width, height);

  // Luz varrendo de cima para o centro.
  const lightY = cy - height * 0.35 * (1 - progress);
  const light = ctx.createRadialGradient(
    cx,
    lightY,
    0,
    cx,
    cy,
    base * (0.5 + progress * 0.7),
  );
  light.addColorStop(0, `rgba(244,244,242,${0.08 + 0.1 * progress})`);
  light.addColorStop(1, "rgba(244,244,242,0)");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, width, height);

  // Estrela e anéis só entram depois que o wordmark sai (progress > 0.2).
  const reveal = Math.min(1, Math.max(0, (progress - 0.2) / 0.2));
  if (reveal === 0) return;

  // Anéis concêntricos que se expandem e somem.
  const rings = 3;
  for (let i = 0; i < rings; i++) {
    const local = Math.min(1, Math.max(0, (progress - 0.2) * 1.6 - i * 0.18));
    if (local <= 0) continue;
    const radius = base * (0.08 + easeOut(local) * 0.7);
    ctx.strokeStyle = `rgba(244,244,242,${0.45 * (1 - local)})`;
    ctx.lineWidth = Math.max(1, base * 0.0025);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Estrela de quatro pontas girando e crescendo.
  const grow = easeInOut(Math.min(1, (progress - 0.2) * 1.4));
  const outer = base * (0.03 + grow * 0.27);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(progress * Math.PI * 1.25);
  starPath(ctx, outer, outer * 0.16);
  ctx.fillStyle = `rgba(244,244,242,${reveal * (0.95 - progress * 0.25)})`;
  ctx.fill();
  ctx.restore();

  // Vinheta para o texto ler bem nas bordas (pré-desenhada).
  ctx.drawImage(vignetteFor(ctx, width, height), 0, 0, width, height);
};
