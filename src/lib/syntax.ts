import type { SyntaxToken, SyntaxTokenType } from '../types';

const DYNAMIC_TYPES: SyntaxTokenType[] = [
  'YYYY',
  'YY',
  'MM',
  'DD',
  'HH',
  'mm',
  'SS',
  'Date',
  'Photo_Nr',
  'Random',
  'Fileending',
];

export const DYNAMIC_TOKEN_OPTIONS = DYNAMIC_TYPES;

export function isDynamicType(type: SyntaxTokenType): boolean {
  return DYNAMIC_TYPES.includes(type);
}

export function tokenLabel(token: SyntaxToken): string {
  if (token.type === 'static') return token.value;
  return token.type;
}

export function defaultSyntaxTokens(): SyntaxToken[] {
  // Default DJI Osmo Pocket 4 syntax:
  // "DJI_20260603202236_0759_D.JPG"
  return [
    { id: id(), type: 'static', value: 'DJI_' },
    { id: id(), type: 'YYYY', value: '' },
    { id: id(), type: 'MM', value: '' },
    { id: id(), type: 'DD', value: '' },
    { id: id(), type: 'HH', value: '' },
    { id: id(), type: 'mm', value: '' },
    { id: id(), type: 'SS', value: '' },
    { id: id(), type: 'static', value: '_' },
    { id: id(), type: 'Photo_Nr', value: '' },
    { id: id(), type: 'static', value: '_D' },
    { id: id(), type: 'Fileending', value: '' },
  ];
}

let nextId = 1;
function id(): string {
  return `t${nextId++}`;
}

export function newToken(
  type: SyntaxTokenType,
  value: string = ''
): SyntaxToken {
  return { id: id(), type, value };
}

interface ParsedFields {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  photoNr?: string;
  fileEnding?: string;
}

/**
 * Parse a filename against the configured syntax tokens.
 * Returns the parsed fields, or null if the filename doesn't match.
 */
export function parseFilename(
  filename: string,
  tokens: SyntaxToken[]
): ParsedFields | null {
  const fields: ParsedFields = {};
  let cursor = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'static') {
      if (!matchesStatic(filename, cursor, token.value)) return null;
      cursor += token.value.length;
      continue;
    }

    const read = readTokenValue(filename, cursor, tokens, i);
    if (!read) return null;
    if (!assignField(token.type, read.value, fields)) return null;
    cursor = read.nextCursor;
  }

  return fields;
}

function matchesStatic(
  filename: string,
  cursor: number,
  value: string
): boolean {
  const slice = filename.substring(cursor, cursor + value.length);
  return slice.toLowerCase() === value.toLowerCase();
}

interface TokenRead {
  value: string;
  nextCursor: number;
}

/** Read the raw string a dynamic token covers, starting at `cursor`. */
function readTokenValue(
  filename: string,
  cursor: number,
  tokens: SyntaxToken[],
  index: number
): TokenRead | null {
  const token = tokens[index];

  if (token.type === 'Fileending') {
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex < cursor) return null;
    return { value: filename.substring(dotIndex), nextCursor: filename.length };
  }

  const len = fixedLength(token.type);
  if (len !== null) {
    return {
      value: filename.substring(cursor, cursor + len),
      nextCursor: cursor + len,
    };
  }

  // Variable length: read until the next static token, the file extension, or the end.
  const nextStatic = findNextStatic(tokens, index + 1);
  if (nextStatic) {
    const idx = filename.indexOf(nextStatic, cursor);
    if (idx < 0) return null;
    return { value: filename.substring(cursor, idx), nextCursor: idx };
  }

  if (tokens[index + 1]?.type === 'Fileending') {
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex < cursor) return null;
    return { value: filename.substring(cursor, dotIndex), nextCursor: dotIndex };
  }

  return { value: filename.substring(cursor), nextCursor: filename.length };
}

function fixedLength(type: SyntaxTokenType): number | null {
  switch (type) {
    case 'YYYY':
      return 4;
    case 'YY':
      return 2;
    case 'MM':
    case 'DD':
    case 'HH':
    case 'mm':
    case 'SS':
      return 2;
    default:
      return null;
  }
}

function findNextStatic(tokens: SyntaxToken[], from: number): string | null {
  for (let i = from; i < tokens.length; i++) {
    if (tokens[i].type === 'static') return tokens[i].value;
  }
  return null;
}

function assignField(
  type: SyntaxTokenType,
  raw: string,
  fields: ParsedFields
): boolean {
  switch (type) {
    case 'YYYY': {
      const n = parseInt(raw, 10);
      if (Number.isNaN(n)) return false;
      fields.year = n;
      return true;
    }
    case 'YY': {
      const n = parseInt(raw, 10);
      if (Number.isNaN(n)) return false;
      fields.year = 2000 + n;
      return true;
    }
    case 'MM': {
      const n = parseInt(raw, 10);
      if (Number.isNaN(n) || n < 1 || n > 12) return false;
      fields.month = n;
      return true;
    }
    case 'DD': {
      const n = parseInt(raw, 10);
      if (Number.isNaN(n) || n < 1 || n > 31) return false;
      fields.day = n;
      return true;
    }
    case 'HH': {
      const n = parseInt(raw, 10);
      if (Number.isNaN(n) || n < 0 || n > 23) return false;
      fields.hour = n;
      return true;
    }
    case 'mm': {
      const n = parseInt(raw, 10);
      if (Number.isNaN(n) || n < 0 || n > 59) return false;
      fields.minute = n;
      return true;
    }
    case 'SS': {
      const n = parseInt(raw, 10);
      if (Number.isNaN(n) || n < 0 || n > 59) return false;
      fields.second = n;
      return true;
    }
    case 'Date': {
      if (raw.length < 8) return false;
      fields.year = parseInt(raw.substring(0, 4), 10);
      fields.month = parseInt(raw.substring(4, 6), 10);
      fields.day = parseInt(raw.substring(6, 8), 10);
      if (raw.length >= 14) {
        fields.hour = parseInt(raw.substring(8, 10), 10);
        fields.minute = parseInt(raw.substring(10, 12), 10);
        fields.second = parseInt(raw.substring(12, 14), 10);
      }
      return !Number.isNaN(fields.year);
    }
    case 'Photo_Nr':
    case 'Random':
      fields.photoNr = raw;
      return true;
    case 'Fileending':
      fields.fileEnding = raw;
      return true;
    default:
      return false;
  }
}

export function dateFromFields(fields: ParsedFields): Date | null {
  if (fields.year == null || fields.month == null || fields.day == null) {
    return null;
  }
  return new Date(
    fields.year,
    fields.month - 1,
    fields.day,
    fields.hour ?? 0,
    fields.minute ?? 0,
    fields.second ?? 0
  );
}
