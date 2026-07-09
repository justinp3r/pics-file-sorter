import { describe, expect, it } from 'vitest';
import {
  dateFromFields,
  defaultSyntaxTokens,
  newToken,
  parseFilename,
} from '../syntax';

describe('parseFilename with default DJI tokens', () => {
  const tokens = defaultSyntaxTokens();

  it('parses a DJI Osmo Pocket filename', () => {
    const fields = parseFilename('DJI_20260603202236_0759_D.JPG', tokens);
    expect(fields).not.toBeNull();
    const date = dateFromFields(fields!);
    expect(date).toEqual(new Date(2026, 5, 3, 20, 22, 36));
    expect(fields!.photoNr).toBe('0759');
    expect(fields!.fileEnding).toBe('.JPG');
  });

  it('matches static prefixes case-insensitively', () => {
    expect(parseFilename('dji_20260603202236_0759_D.mp4', tokens)).not.toBeNull();
  });

  it('rejects filenames that do not match the prefix', () => {
    expect(parseFilename('IMG_1234.JPG', tokens)).toBeNull();
  });

  it('rejects filenames with an invalid month', () => {
    expect(parseFilename('DJI_20261303202236_0759_D.JPG', tokens)).toBeNull();
  });
});

describe('parseFilename with custom tokens', () => {
  it('parses a simple prefix + number + extension pattern', () => {
    const tokens = [
      newToken('static', 'IMG_'),
      newToken('Photo_Nr'),
      newToken('Fileending'),
    ];
    const fields = parseFilename('IMG_1234.JPG', tokens);
    expect(fields).not.toBeNull();
    expect(fields!.photoNr).toBe('1234');
    expect(fields!.fileEnding).toBe('.JPG');
  });

  it('parses a combined Date token including the time part', () => {
    const tokens = [
      newToken('Date'),
      newToken('static', '_'),
      newToken('Photo_Nr'),
      newToken('Fileending'),
    ];
    const fields = parseFilename('20260603202236_0759.JPG', tokens);
    expect(fields).not.toBeNull();
    expect(dateFromFields(fields!)).toEqual(new Date(2026, 5, 3, 20, 22, 36));
  });

  it('interprets a two-digit year as 20xx', () => {
    const tokens = [
      newToken('static', 'CAM'),
      newToken('YY'),
      newToken('MM'),
      newToken('DD'),
      newToken('Fileending'),
    ];
    const fields = parseFilename('CAM260603.JPG', tokens);
    expect(fields).not.toBeNull();
    expect(dateFromFields(fields!)).toEqual(new Date(2026, 5, 3));
  });
});

describe('dateFromFields', () => {
  it('returns null when the date is incomplete', () => {
    expect(dateFromFields({ year: 2026 })).toBeNull();
    expect(dateFromFields({})).toBeNull();
  });

  it('defaults missing time parts to midnight', () => {
    expect(dateFromFields({ year: 2026, month: 6, day: 3 })).toEqual(
      new Date(2026, 5, 3, 0, 0, 0)
    );
  });
});
