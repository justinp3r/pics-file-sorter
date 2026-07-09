import { describe, expect, it } from 'vitest';
import {
  APP_VERSION,
  batchGapFromSettings,
  defaultSettings,
  normalizeSettings,
} from '../settings';

describe('APP_VERSION', () => {
  it('is 1.2.1', () => {
    expect(APP_VERSION).toBe('1.2.1');
  });
});

describe('normalizeSettings', () => {
  it('returns defaults for invalid input', () => {
    for (const raw of [null, undefined, 'x', 42, []]) {
      const s = normalizeSettings(raw);
      expect(s.batchGapPreset).toBe('10min');
      expect(s.theme).toBe('system');
      expect(s.syntaxTokens.length).toBeGreaterThan(0);
    }
  });

  it('migrates legacy v1 minute values to presets', () => {
    expect(normalizeSettings({ batchSizeMinutes: 1 }).batchGapPreset).toBe(
      '1min'
    );
    expect(normalizeSettings({ batchSizeMinutes: 10 }).batchGapPreset).toBe(
      '10min'
    );
    const custom = normalizeSettings({ batchSizeMinutes: 7 });
    expect(custom.batchGapPreset).toBe('custom');
    expect(custom.customGapMinutes).toBe(7);
  });

  it('keeps legacy light/dark theme and accepts system', () => {
    expect(normalizeSettings({ theme: 'dark' }).theme).toBe('dark');
    expect(normalizeSettings({ theme: 'light' }).theme).toBe('light');
    expect(normalizeSettings({ theme: 'system' }).theme).toBe('system');
    expect(normalizeSettings({ theme: 'neon' }).theme).toBe('system');
  });

  it('accepts v2 fields and rejects invalid values', () => {
    const s = normalizeSettings({
      batchGapPreset: 'day',
      customGapMinutes: 42,
      language: 'fr',
    });
    expect(s.batchGapPreset).toBe('day');
    expect(s.customGapMinutes).toBe(42);
    expect(s.language).toBe('fr');

    expect(normalizeSettings({ language: 'xx' }).language).not.toBe('xx');
    expect(
      normalizeSettings({ batchGapPreset: 'weekly' }).batchGapPreset
    ).toBe('10min');
    expect(
      normalizeSettings({ customGapMinutes: -5 }).customGapMinutes
    ).toBe(10);
  });
});

describe('batchGapFromSettings', () => {
  const base = defaultSettings();

  it('maps presets to gaps', () => {
    expect(
      batchGapFromSettings({ ...base, batchGapPreset: '1min' })
    ).toEqual({ mode: 'minutes', minutes: 1 });
    expect(
      batchGapFromSettings({ ...base, batchGapPreset: '10min' })
    ).toEqual({ mode: 'minutes', minutes: 10 });
    expect(batchGapFromSettings({ ...base, batchGapPreset: 'day' })).toEqual({
      mode: 'day',
    });
    expect(
      batchGapFromSettings({
        ...base,
        batchGapPreset: 'custom',
        customGapMinutes: 25,
      })
    ).toEqual({ mode: 'minutes', minutes: 25 });
  });

  it('clamps custom minutes to at least 1', () => {
    expect(
      batchGapFromSettings({
        ...base,
        batchGapPreset: 'custom',
        customGapMinutes: 0,
      })
    ).toEqual({ mode: 'minutes', minutes: 1 });
  });
});
