import { describe, expect, it } from 'vitest';
import { monthFolderName, sanitizeName, yearFolderName } from '../fileSystem';

describe('folder naming', () => {
  const june = new Date(2026, 5, 3);

  it('names the year folder', () => {
    expect(yearFolderName(june)).toBe('2026');
  });

  it('localizes and capitalizes month folder names', () => {
    expect(monthFolderName(june, 'de')).toBe('Juni');
    expect(monthFolderName(june, 'en')).toBe('June');
    expect(monthFolderName(june, 'it')).toBe('Giugno');
    expect(monthFolderName(june, 'fr')).toBe('Juin');
    expect(monthFolderName(june, 'es')).toBe('Junio');
  });
});

describe('sanitizeName', () => {
  it('strips characters that are invalid in folder names', () => {
    expect(sanitizeName('Strand: Sonnenuntergang / Meer')).toBe(
      'Strand_ Sonnenuntergang _ Meer'
    );
  });

  it('collapses whitespace and trims', () => {
    expect(sanitizeName('  viel    Platz  ')).toBe('viel Platz');
  });

  it('falls back for empty names', () => {
    expect(sanitizeName('   ')).toBe('Scene');
    expect(sanitizeName('', 'Unbenannt')).toBe('Unbenannt');
  });

  it('limits the length to 120 characters', () => {
    expect(sanitizeName('x'.repeat(300)).length).toBe(120);
  });
});
