export const IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.heic',
  '.heif',
  '.webp',
  '.tiff',
  '.tif',
  '.gif',
  '.bmp',
];

// RAW formats (DJI Osmo Pocket 4 shoots DNG)
export const RAW_EXTENSIONS = [
  '.dng',
  '.raw',
  '.cr2',
  '.cr3',
  '.nef',
  '.arw',
  '.orf',
  '.rw2',
  '.raf',
];

export const VIDEO_EXTENSIONS = [
  '.mp4',
  '.mov',
  '.m4v',
  '.avi',
  '.mkv',
  '.lrv',
  '.thm',
  '.insv',
];

export const ALL_MEDIA_EXTENSIONS = [
  ...IMAGE_EXTENSIONS,
  ...RAW_EXTENSIONS,
  ...VIDEO_EXTENSIONS,
];

export function getExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.substring(idx).toLowerCase() : '';
}

export function getBaseName(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.substring(0, idx) : filename;
}

export function isImage(ext: string): boolean {
  return IMAGE_EXTENSIONS.includes(ext.toLowerCase());
}

export function isVideo(ext: string): boolean {
  return VIDEO_EXTENSIONS.includes(ext.toLowerCase());
}

export function isRaw(ext: string): boolean {
  return RAW_EXTENSIONS.includes(ext.toLowerCase());
}

export function isMedia(ext: string): boolean {
  return ALL_MEDIA_EXTENSIONS.includes(ext.toLowerCase());
}

/**
 * For preview, given multiple files sharing the same baseName,
 * pick the best one to display.
 * Preference: JPG/JPEG > PNG > HEIC > others (image) > video first-frame.
 */
const PREVIEW_PRIORITY: string[] = [
  '.jpg',
  '.jpeg',
  '.png',
  '.heic',
  '.heif',
  '.webp',
  '.tiff',
  '.tif',
  '.gif',
  '.bmp',
  '.mp4',
  '.mov',
  '.m4v',
  '.dng',
];

export function previewRank(ext: string): number {
  const idx = PREVIEW_PRIORITY.indexOf(ext.toLowerCase());
  return idx < 0 ? 999 : idx;
}
