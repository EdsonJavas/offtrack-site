export type LoadProgress = (loaded: number, total: number) => void;

/** Quem desenha um frame no canvas para um progresso de scroll entre 0 e 1. */
export interface FrameRenderer {
  load(onProgress?: LoadProgress): Promise<void>;
  draw(
    ctx: CanvasRenderingContext2D,
    progress: number,
    width: number,
    height: number,
  ): void;
  dispose(): void;
}

/** Fábrica: só roda no cliente, dentro do efeito do componente. */
export type FrameSource = () => FrameRenderer;
