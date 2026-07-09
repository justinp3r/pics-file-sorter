import type { MediaFile, SyntaxToken } from '../types';
import {
  getBaseName,
  getExtension,
  isImage,
  isMedia,
  isRaw,
  isVideo,
} from './fileTypes';
import { dateFromFields, parseFilename } from './syntax';

interface PickDirectoryOptions {
  mode?: 'read' | 'readwrite';
  id?: string;
}

declare global {
  interface Window {
    showDirectoryPicker?: (opts?: {
      mode?: 'read' | 'readwrite';
      id?: string;
      startIn?: string;
    }) => Promise<FileSystemDirectoryHandle>;
  }
  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<
      FileSystemFileHandle | FileSystemDirectoryHandle
    >;
    getDirectoryHandle(
      name: string,
      options?: { create?: boolean }
    ): Promise<FileSystemDirectoryHandle>;
    getFileHandle(
      name: string,
      options?: { create?: boolean }
    ): Promise<FileSystemFileHandle>;
    requestPermission?: (opts: {
      mode: 'read' | 'readwrite';
    }) => Promise<'granted' | 'denied'>;
    queryPermission?: (opts: {
      mode: 'read' | 'readwrite';
    }) => Promise<'granted' | 'denied' | 'prompt'>;
  }
  interface FileSystemFileHandle {
    createWritable(): Promise<FileSystemWritableFileStream>;
  }
  interface FileSystemWritableFileStream extends WritableStream {
    write(data: BufferSource | Blob | string): Promise<void>;
    close(): Promise<void>;
  }
}

export function supportsFileSystemAPI(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export async function pickDirectory(
  opts: PickDirectoryOptions = {}
): Promise<FileSystemDirectoryHandle> {
  if (!window.showDirectoryPicker) {
    throw new Error('File System Access API not available');
  }
  return await window.showDirectoryPicker({
    mode: opts.mode ?? 'read',
    id: opts.id,
  });
}

export async function ensurePermission(
  handle: FileSystemDirectoryHandle,
  mode: 'read' | 'readwrite'
): Promise<boolean> {
  if (handle.queryPermission) {
    const status = await handle.queryPermission({ mode });
    if (status === 'granted') return true;
  }
  if (handle.requestPermission) {
    const status = await handle.requestPermission({ mode });
    return status === 'granted';
  }
  return true;
}

/**
 * Recursively scan a directory for media files. Subdirectories are walked in
 * parallel, and file metadata (`getFile()`) is only fetched when the date
 * cannot be derived from the filename — this keeps SD card scans fast.
 */
export async function scanDirectory(
  dir: FileSystemDirectoryHandle,
  syntaxTokens: SyntaxToken[],
  onProgress?: (count: number) => void
): Promise<MediaFile[]> {
  const out: MediaFile[] = [];
  let count = 0;

  async function walk(d: FileSystemDirectoryHandle): Promise<void> {
    const subdirs: FileSystemDirectoryHandle[] = [];
    for await (const entry of d.values()) {
      if (entry.kind === 'directory') {
        subdirs.push(entry as FileSystemDirectoryHandle);
        continue;
      }
      const ext = getExtension(entry.name);
      if (!isMedia(ext)) continue;

      const fileHandle = entry as FileSystemFileHandle;
      const parsed = parseFilename(entry.name, syntaxTokens);
      let date = parsed ? dateFromFields(parsed) : null;
      if (!date) {
        const file = await fileHandle.getFile();
        date = new Date(file.lastModified);
      }
      out.push({
        handle: fileHandle,
        name: entry.name,
        extension: ext,
        baseName: getBaseName(entry.name),
        date,
        isImage: isImage(ext),
        isVideo: isVideo(ext),
        isRaw: isRaw(ext),
      });
      count++;
      if (count % 25 === 0) onProgress?.(count);
    }
    await Promise.all(subdirs.map(walk));
  }

  await walk(dir);
  onProgress?.(count);
  return out;
}

const monthFormatCache = new Map<string, Intl.DateTimeFormat>();

export function monthFolderName(date: Date, language: string): string {
  let fmt = monthFormatCache.get(language);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(language, { month: 'long' });
    monthFormatCache.set(language, fmt);
  }
  const name = fmt.format(date);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function yearFolderName(date: Date): string {
  return String(date.getFullYear());
}

export function sanitizeName(name: string, fallback = 'Scene'): string {
  return (
    name
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '_')
      .replace(/\s+/g, ' ')
      .substring(0, 120) || fallback
  );
}

export interface BuildProgress {
  done: number;
  total: number;
  currentFile?: string;
}

export interface SceneBatch {
  description: string;
  files: MediaFile[];
  date: Date;
}

const COPY_CONCURRENCY = 3;

/**
 * Create the Year/Month/Scene structure in the target directory and copy all
 * batch files into it. Files are copied with limited concurrency, which is
 * significantly faster than sequential copies on SD card readers.
 */
export async function buildFileStructure(
  target: FileSystemDirectoryHandle,
  batches: SceneBatch[],
  language: string,
  onProgress?: (p: BuildProgress) => void
): Promise<void> {
  interface CopyTask {
    dir: FileSystemDirectoryHandle;
    file: MediaFile;
  }

  const tasks: CopyTask[] = [];
  for (const batch of batches) {
    const sceneName = sanitizeName(batch.description);
    const yearDir = await target.getDirectoryHandle(
      yearFolderName(batch.date),
      { create: true }
    );
    const monthDir = await yearDir.getDirectoryHandle(
      monthFolderName(batch.date, language),
      { create: true }
    );
    const sceneDir = await monthDir.getDirectoryHandle(sceneName, {
      create: true,
    });
    for (const file of batch.files) {
      tasks.push({ dir: sceneDir, file });
    }
  }

  const total = tasks.length;
  let done = 0;
  let nextIndex = 0;
  onProgress?.({ done, total });

  async function worker(): Promise<void> {
    for (;;) {
      const i = nextIndex++;
      if (i >= total) return;
      const { dir, file } = tasks[i];
      try {
        const source = await file.handle.getFile();
        const destHandle = await dir.getFileHandle(file.name, { create: true });
        const writable = await destHandle.createWritable();
        await source.stream().pipeTo(writable);
      } catch (err) {
        console.error('Copy failed for', file.name, err);
      }
      done++;
      onProgress?.({ done, total, currentFile: file.name });
    }
  }

  const workers = Array.from(
    { length: Math.max(1, Math.min(COPY_CONCURRENCY, total)) },
    () => worker()
  );
  await Promise.all(workers);
  onProgress?.({ done: total, total });
}
