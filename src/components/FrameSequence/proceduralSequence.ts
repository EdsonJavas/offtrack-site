import type { FrameRenderer, FrameSource } from "./types";

export type DrawFrame = (
  ctx: CanvasRenderingContext2D,
  progress: number,
  width: number,
  height: number,
) => void;

/** Frames desenhados em código. Usado enquanto os vídeos reais não existem. */
export function createProceduralSequence(draw: DrawFrame): FrameSource {
  return (): FrameRenderer => ({
    load: async () => {},
    draw,
    dispose: () => {},
  });
}
