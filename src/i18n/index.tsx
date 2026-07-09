import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Language } from '../types';
import { translations, type TranslationKey } from './translations';

export type TranslateFn = (
  key: TranslationKey,
  params?: Record<string, string | number>
) => string;

export function translate(
  lang: Language,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  let text = translations[lang][key] ?? translations.en[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replace(`{${name}}`, String(value));
    }
  }
  return text;
}

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'it', label: 'Italiano' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];

interface I18n {
  lang: Language;
  t: TranslateFn;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({
  lang,
  children,
}: {
  lang: Language;
  children: ReactNode;
}) {
  const value = useMemo<I18n>(
    () => ({ lang, t: (key, params) => translate(lang, key, params) }),
    [lang]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
