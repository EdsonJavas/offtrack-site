import type { FrameRenderer, FrameSource, LoadProgress } from "./types";

interface ImageSequenceOptions {
  count: number;
  /** URL do frame `index` (0 a count-1). */
  url: (index: number) => string;
  /** Downloads simultâneos. */
  concurrency?: number;
}

type Frame = ImageBitmap | HTMLImageElement;

/**
 * Sequência de frames extraídos de um vídeo (WebP), desenhada em cover-fit.
 * Enquanto um frame não chegou, usa o mais próximo já carregado.
 */
export function createImageSequence(options: ImageSequenceOptions): FrameSource {
  return () => new ImageSequenceRenderer(options);
}

class ImageSequenceRenderer implements FrameRenderer {
  private frames: (Frame | undefined)[];
  private disposed = false;

  constructor(private readonly options: ImageSequenceOptions) {
    this.frames = new Array(options.count);
  }

  async load(onProgress?: LoadProgress) {
    const { count, concurrency = 6 } = this.options;
    let next = 0;
    let loaded = 0;

    const worker = async () => {
      while (next < count && !this.disposed) {
        const index = next++;
        this.frames[index] = await this.fetchFrame(index);
        loaded++;
        onProgress?.(loaded, count);
      }
    };

    await Promise.all(Array.from({ length: concurrency }, worker));
  }

  draw(ctx: CanvasRenderingContext2D, progress: number, width: number, height: number) {
    const frame = this.nearestFrame(Math.round(progress * (this.options.count - 1)));
    if (!frame) return;

    const scale = Math.max(width / frame.width, height / frame.height);
    const w = frame.width * scale;
    const h = frame.height * scale;
    ctx.drawImage(frame, (width - w) / 2, (height - h) / 2, w, h);
  }

  dispose() {
    this.disposed = true;
    for (const frame of this.frames) {
      if (frame && "close" in frame) frame.close();
    }
    this.frames = [];
  }

  private nearestFrame(index: number): Frame | undefined {
    for (let offset = 0; offset < this.frames.length; offset++) {
      const before = this.frames[index - offset];
      if (before) return before;
      const after = this.frames[index + offset];
      if (after) return after;
    }
    return undefined;
  }

  private async fetchFrame(index: number): Promise<Frame> {
    const url = this.options.url(index);

    if (typeof createImageBitmap === "function") {
      const blob = await fetch(url).then((r) => r.blob());
      return createImageBitmap(blob);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
}
