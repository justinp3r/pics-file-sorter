import { describe, expect, it } from 'vitest';
import {
  getBaseName,
  getExtension,
  isImage,
  isMedia,
  isRaw,
  isVideo,
  previewRank,
} from '../fileTypes';

describe('extension helpers', () => {
  it('extracts lowercase extensions', () => {
    expect(getExtension('DJI_0001.JPG')).toBe('.jpg');
    expect(getExtension('video.MP4')).toBe('.mp4');
    expect(getExtension('noextension')).toBe('');
  });

  it('extracts base names', () => {
    expect(getBaseName('DJI_0001.JPG')).toBe('DJI_0001');
    expect(getBaseName('noextension')).toBe('noextension');
  });
});

describe('type detection', () => {
  it('classifies images, videos and RAW files', () => {
    expect(isImage('.jpg')).toBe(true);
    expect(isVideo('.mp4')).toBe(true);
    expect(isRaw('.dng')).toBe(true);
    expect(isImage('.mp4')).toBe(false);
    expect(isVideo('.jpg')).toBe(false);
  });

  it('recognizes DJI Osmo Pocket formats as media', () => {
    for (const ext of ['.jpg', '.dng', '.mp4', '.mov', '.lrv']) {
      expect(isMedia(ext)).toBe(true);
    }
    expect(isMedia('.txt')).toBe(false);
    expect(isMedia('.srt')).toBe(false);
  });
});

describe('previewRank', () => {
  it('prefers JPG over PNG over MP4 over DNG', () => {
    expect(previewRank('.jpg')).toBeLessThan(previewRank('.png'));
    expect(previewRank('.png')).toBeLessThan(previewRank('.mp4'));
    expect(previewRank('.mp4')).toBeLessThan(previewRank('.dng'));
  });

  it('ranks unknown extensions last', () => {
    expect(previewRank('.xyz')).toBeGreaterThan(previewRank('.dng'));
  });
});
