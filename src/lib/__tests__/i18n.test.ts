import { describe, expect, it } from 'vitest';
import { translations } from '../../i18n/translations';
import { translate, LANGUAGES } from '../../i18n';
import type { Language } from '../../types';

const ALL_LANGUAGES = Object.keys(translations) as Language[];

describe('translations', () => {
  it('covers exactly the five supported languages', () => {
    expect(ALL_LANGUAGES.sort()).toEqual(['de', 'en', 'es', 'fr', 'it']);
    expect(LANGUAGES.map((l) => l.code).sort()).toEqual(
      ['de', 'en', 'es', 'fr', 'it']
    );
  });

  it('has identical keys in every language', () => {
    const reference = Object.keys(translations.de).sort();
    for (const lang of ALL_LANGUAGES) {
      expect(Object.keys(translations[lang]).sort(), `keys of ${lang}`).toEqual(
        reference
      );
    }
  });

  it('has no empty strings', () => {
    for (const lang of ALL_LANGUAGES) {
      for (const [key, value] of Object.entries(translations[lang])) {
        expect(value.length, `${lang}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('keeps interpolation placeholders consistent across languages', () => {
    const placeholders = (s: string) =>
      (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort();
    for (const key of Object.keys(translations.de) as Array<
      keyof typeof translations.de
    >) {
      const expected = placeholders(translations.de[key]);
      for (const lang of ALL_LANGUAGES) {
        expect(
          placeholders(translations[lang][key]),
          `placeholders of ${lang}.${key}`
        ).toEqual(expected);
      }
    }
  });
});

describe('translate', () => {
  it('returns the plain translation', () => {
    expect(translate('de', 'settings.title')).toBe('Einstellungen');
    expect(translate('en', 'settings.title')).toBe('Settings');
    expect(translate('it', 'settings.title')).toBe('Impostazioni');
    expect(translate('fr', 'settings.title')).toBe('Réglages');
    expect(translate('es', 'settings.title')).toBe('Ajustes');
  });

  it('interpolates parameters', () => {
    expect(translate('de', 'progress.of', { done: 3, total: 9 })).toBe(
      '3 von 9'
    );
    expect(translate('en', 'build.namedCount', { named: 2, total: 5 })).toBe(
      '2 of 5 scenes are named.'
    );
  });
});
