import type { MediaFile } from '../types';

export interface Preview {
  url: string;
  /** 0..1 average luminance of the top-left corner (drives the play badge color). */
  cornerLuminance: number;
}

const MAX_WIDTH = 1024;
const VIDEO_CAPTURE_TIMEOUT_MS = 5000;

/**
 * Module-level cache keyed by file identity. Deduplicates concurrent requests
 * and makes revisiting batches instant. Thumbnails are downscaled JPEG blobs,
 * so memory stays low even for large source photos.
 */
const cache = new Map<string, Promise<Preview | null>>();

function cacheKey(file: MediaFile): string {
  return `${file.name}|${file.date?.getTime() ?? 0}`;
}

export function getPreview(file: MediaFile): Promise<Preview | null> {
  const key = cacheKey(file);
  let pending = cache.get(key);
  if (!pending) {
    pending = createPreview(file).catch(() => null);
    cache.set(key, pending);
  }
  return pending;
}

async function createPreview(file: MediaFile): Promise<Preview | null> {
  // RAW formats (DNG etc.) cannot be decoded by browsers — callers show a fallback tile.
  if (file.isRaw || (!file.isImage && !file.isVideo)) return null;
  const blob = await file.handle.getFile();
  return file.isVideo ? videoPreview(blob) : imagePreview(blob);
}

async function imagePreview(blob: File): Promise<Preview | null> {
  try {
    const bitmap = await createImageBitmap(blob);
    const preview = await sourceToPreview(bitmap, bitmap.width, bitmap.height);
    bitmap.close();
    return preview;
  } catch {
    return null;
  }
}

function videoPreview(blob: File): Promise<Preview | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    let settled = false;
    let timer: number | undefined;

    const finish = (preview: Preview | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      resolve(preview);
    };

    const capture = () => {
      sourceToPreview(video, video.videoWidth, video.videoHeight).then(
        finish,
        () => finish(null)
      );
    };

    video.addEventListener(
      'loadedmetadata',
      () => {
        // Seek slightly past 0 so the captured frame isn't black.
        try {
          video.currentTime = Math.min(0.1, (video.duration || 1) * 0.05);
        } catch {
          capture();
        }
      },
      { once: true }
    );
    video.addEventListener('seeked', capture, { once: true });
    video.addEventListener('error', () => finish(null), { once: true });
    timer = window.setTimeout(() => finish(null), VIDEO_CAPTURE_TIMEOUT_MS);
    video.src = url;
  });
}

async function sourceToPreview(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number
): Promise<Preview | null> {
  if (!sourceWidth || !sourceHeight) return null;

  const scale = Math.min(1, MAX_WIDTH / sourceWidth);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(source, 0, 0, width, height);
  const luminance = cornerLuminance(ctx, width, height);

  const jpeg = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.82)
  );
  if (!jpeg) return null;
  return { url: URL.createObjectURL(jpeg), cornerLuminance: luminance };
}

function cornerLuminance(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): number {
  const size = Math.max(1, Math.round(Math.min(width, height) * 0.16));
  const data = ctx.getImageData(0, 0, size, size).data;
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }
  return total / (data.length / 4) / 255;
}
