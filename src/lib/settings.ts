import type {
  AppSettings,
  BatchGapPreset,
  Language,
  SyntaxToken,
} from '../types';
import { defaultSyntaxTokens } from './syntax';
import type { BatchGap } from './batching';

export const APP_VERSION = '1.2.1';

const STORAGE_KEY = 'pics-sorter-settings-v2';
const LEGACY_STORAGE_KEY = 'pics-sorter-settings-v1';

const SUPPORTED_LANGUAGES: readonly Language[] = ['de', 'en', 'it', 'fr', 'es'];
const GAP_PRESETS: readonly BatchGapPreset[] = ['1min', '10min', 'day', 'custom'];

export function detectDefaultLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';
  const code = (navigator.language ?? 'en').slice(0, 2).toLowerCase();
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code)
    ? (code as Language)
    : 'en';
}

export function defaultSettings(): AppSettings {
  return {
    batchGapPreset: '10min',
    customGapMinutes: 10,
    syntaxTokens: defaultSyntaxTokens(),
    theme: 'system',
    language: detectDefaultLanguage(),
  };
}

interface StoredSettings extends Partial<AppSettings> {
  /** v1 schema stored a raw minute count instead of a preset */
  batchSizeMinutes?: number;
}

/** Normalize any stored shape (v1 or v2, possibly partial/corrupt) into valid settings. */
export function normalizeSettings(raw: unknown): AppSettings {
  const settings = defaultSettings();
  if (!raw || typeof raw !== 'object') return settings;
  const data = raw as StoredSettings;

  if (typeof data.batchSizeMinutes === 'number' && data.batchSizeMinutes >= 1) {
    if (data.batchSizeMinutes === 1) settings.batchGapPreset = '1min';
    else if (data.batchSizeMinutes === 10) settings.batchGapPreset = '10min';
    else {
      settings.batchGapPreset = 'custom';
      settings.customGapMinutes = Math.round(data.batchSizeMinutes);
    }
  }

  if (data.batchGapPreset && GAP_PRESETS.includes(data.batchGapPreset)) {
    settings.batchGapPreset = data.batchGapPreset;
  }
  if (
    typeof data.customGapMinutes === 'number' &&
    data.customGapMinutes >= 1
  ) {
    settings.customGapMinutes = Math.round(data.customGapMinutes);
  }
  if (Array.isArray(data.syntaxTokens) && data.syntaxTokens.length > 0) {
    settings.syntaxTokens = data.syntaxTokens as SyntaxToken[];
  }
  if (
    data.theme === 'light' ||
    data.theme === 'dark' ||
    data.theme === 'system'
  ) {
    settings.theme = data.theme;
  }
  if (
    typeof data.language === 'string' &&
    (SUPPORTED_LANGUAGES as readonly string[]).includes(data.language)
  ) {
    settings.language = data.language as Language;
  }
  return settings;
}

export function loadSettings(): AppSettings {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) return normalizeSettings(JSON.parse(raw));
  } catch {
    // corrupted storage falls back to defaults
  }
  return defaultSettings();
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage unavailable (private mode) — settings stay in memory
  }
}

export function batchGapFromSettings(settings: AppSettings): BatchGap {
  switch (settings.batchGapPreset) {
    case '1min':
      return { mode: 'minutes', minutes: 1 };
    case 'day':
      return { mode: 'day' };
    case 'custom':
      return { mode: 'minutes', minutes: Math.max(1, settings.customGapMinutes) };
    default:
      return { mode: 'minutes', minutes: 10 };
  }
}
