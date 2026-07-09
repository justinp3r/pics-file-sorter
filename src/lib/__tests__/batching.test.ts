import { describe, expect, it } from 'vitest';
import type { MediaFile } from '../../types';
import { buildCarouselItems, groupIntoBatches } from '../batching';

function file(name: string, iso: string): MediaFile {
  const dotIdx = name.lastIndexOf('.');
  const ext = name.substring(dotIdx).toLowerCase();
  return {
    handle: {} as FileSystemFileHandle,
    name,
    extension: ext,
    baseName: name.substring(0, dotIdx),
    date: new Date(iso),
    isImage: ['.jpg', '.jpeg', '.png'].includes(ext),
    isVideo: ext === '.mp4',
    isRaw: ext === '.dng',
  };
}

describe('groupIntoBatches (minutes mode)', () => {
  it('groups transitively: chained gaps form one batch', () => {
    const files = [
      file('a.jpg', '2026-06-03T10:00:00'),
      file('b.jpg', '2026-06-03T10:09:00'),
      file('c.jpg', '2026-06-03T10:18:00'),
    ];
    const batches = groupIntoBatches(files, { mode: 'minutes', minutes: 10 });
    expect(batches).toHaveLength(1);
    expect(batches[0].files).toHaveLength(3);
  });

  it('splits when the gap is exceeded', () => {
    const files = [
      file('a.jpg', '2026-06-03T10:00:00'),
      file('b.jpg', '2026-06-03T10:09:00'),
      file('c.jpg', '2026-06-03T10:40:00'),
    ];
    const batches = groupIntoBatches(files, { mode: 'minutes', minutes: 10 });
    expect(batches).toHaveLength(2);
    expect(batches[0].files.map((f) => f.name)).toEqual(['a.jpg', 'b.jpg']);
    expect(batches[1].files.map((f) => f.name)).toEqual(['c.jpg']);
  });

  it('sorts unsorted input by date first', () => {
    const files = [
      file('late.jpg', '2026-06-03T11:00:00'),
      file('early.jpg', '2026-06-03T10:00:00'),
    ];
    const batches = groupIntoBatches(files, { mode: 'minutes', minutes: 90 });
    expect(batches).toHaveLength(1);
    expect(batches[0].files[0].name).toBe('early.jpg');
    expect(batches[0].startDate).toEqual(new Date('2026-06-03T10:00:00'));
    expect(batches[0].endDate).toEqual(new Date('2026-06-03T11:00:00'));
  });

  it('returns an empty list for no files', () => {
    expect(groupIntoBatches([], { mode: 'minutes', minutes: 10 })).toEqual([]);
  });
});

describe('groupIntoBatches (day mode)', () => {
  it('groups all files of one calendar day, regardless of gaps', () => {
    const files = [
      file('morning.jpg', '2026-06-03T06:00:00'),
      file('noon.jpg', '2026-06-03T12:30:00'),
      file('night.jpg', '2026-06-03T23:55:00'),
    ];
    const batches = groupIntoBatches(files, { mode: 'day' });
    expect(batches).toHaveLength(1);
    expect(batches[0].files).toHaveLength(3);
  });

  it('splits at midnight', () => {
    const files = [
      file('before.jpg', '2026-06-03T23:55:00'),
      file('after.jpg', '2026-06-04T00:05:00'),
    ];
    const batches = groupIntoBatches(files, { mode: 'day' });
    expect(batches).toHaveLength(2);
  });
});

describe('buildCarouselItems', () => {
  it('collapses files sharing a base name and prefers JPG over DNG', () => {
    const files = [
      file('DJI_0001.DNG', '2026-06-03T10:00:00'),
      file('DJI_0001.JPG', '2026-06-03T10:00:00'),
      file('DJI_0002.MP4', '2026-06-03T10:05:00'),
    ];
    const items = buildCarouselItems(files);
    expect(items).toHaveLength(2);
    expect(items[0].representative.name).toBe('DJI_0001.JPG');
    expect(items[0].group).toHaveLength(2);
    expect(items[1].representative.name).toBe('DJI_0002.MP4');
  });

  it('orders items by date', () => {
    const files = [
      file('b.jpg', '2026-06-03T11:00:00'),
      file('a.jpg', '2026-06-03T10:00:00'),
    ];
    const items = buildCarouselItems(files);
    expect(items.map((i) => i.key)).toEqual(['a', 'b']);
  });
});
