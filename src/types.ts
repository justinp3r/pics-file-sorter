export type SyntaxTokenType =
  | 'static'
  | 'YYYY'
  | 'YY'
  | 'MM'
  | 'DD'
  | 'HH'
  | 'mm'
  | 'SS'
  | 'Date'
  | 'Photo_Nr'
  | 'Random'
  | 'Fileending';

export interface SyntaxToken {
  id: string;
  type: SyntaxTokenType;
  value: string;
}

export type Language = 'de' | 'en' | 'it' | 'fr' | 'es';

export type ThemePreference = 'system' | 'light' | 'dark';

export type BatchGapPreset = '1min' | '10min' | 'day' | 'custom';

export interface AppSettings {
  batchGapPreset: BatchGapPreset;
  customGapMinutes: number;
  syntaxTokens: SyntaxToken[];
  theme: ThemePreference;
  language: Language;
}

export interface MediaFile {
  handle: FileSystemFileHandle;
  name: string;
  extension: string;
  baseName: string;
  date: Date | null;
  isImage: boolean;
  isVideo: boolean;
  isRaw: boolean;
}

export interface Batch {
  id: string;
  files: MediaFile[];
  startDate: Date;
  endDate: Date;
  description: string;
}

export type AppScreen =
  | 'directory'
  | 'scenery'
  | 'build'
  | 'progress'
  | 'done';
