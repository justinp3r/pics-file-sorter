import type { Batch, MediaFile } from '../types';
import { previewRank } from './fileTypes';

export type BatchGap =
  | { mode: 'minutes'; minutes: number }
  | { mode: 'day' };

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Group files into batches.
 *
 * - `minutes` mode: consecutive files within the gap belong to the same batch
 *   (transitive — a batch's total span can exceed the gap).
 * - `day` mode: all files taken on the same calendar day form one batch.
 */
export function groupIntoBatches(files: MediaFile[], gap: BatchGap): Batch[] {
  const sorted = files
    .filter((f) => f.date)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());

  if (sorted.length === 0) return [];

  const belongsToPrevious =
    gap.mode === 'day'
      ? (prev: Date, next: Date) => sameCalendarDay(prev, next)
      : (() => {
          const gapMs = gap.minutes * 60 * 1000;
          return (prev: Date, next: Date) =>
            next.getTime() - prev.getTime() <= gapMs;
        })();

  const batches: Batch[] = [];
  let current: MediaFile[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    if (belongsToPrevious(sorted[i - 1].date!, sorted[i].date!)) {
      current.push(sorted[i]);
    } else {
      batches.push(makeBatch(batches.length, current));
      current = [sorted[i]];
    }
  }
  batches.push(makeBatch(batches.length, current));

  return batches;
}

function makeBatch(idx: number, files: MediaFile[]): Batch {
  return {
    id: `batch-${idx}`,
    files,
    startDate: files[0].date!,
    endDate: files[files.length - 1].date!,
    description: '',
  };
}

/**
 * One carousel item per unique base filename (e.g. DNG+JPG pairs collapse
 * into one item, represented by the best previewable file).
 */
export interface CarouselItem {
  key: string;
  representative: MediaFile;
  group: MediaFile[];
}

export function buildCarouselItems(files: MediaFile[]): CarouselItem[] {
  const groups = new Map<string, MediaFile[]>();
  for (const file of files) {
    const group = groups.get(file.baseName);
    if (group) group.push(file);
    else groups.set(file.baseName, [file]);
  }

  const items: CarouselItem[] = [];
  for (const [key, group] of groups) {
    let representative = group[0];
    for (const file of group) {
      if (previewRank(file.extension) < previewRank(representative.extension)) {
        representative = file;
      }
    }
    items.push({ key, representative, group });
  }

  items.sort(
    (a, b) =>
      (a.representative.date?.getTime() ?? 0) -
      (b.representative.date?.getTime() ?? 0)
  );
  return items;
}
