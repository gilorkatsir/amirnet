import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeString,
  safeLocalStorageGet,
  safeLocalStorageSet,
  validateNumber,
  validateStatsStructure
} from '../security';

describe('sanitizeString', () => {
  it('escapes HTML special characters', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('escapes ampersands', () => {
    expect(sanitizeString('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('escapes single quotes', () => {
    expect(sanitizeString("it's")).toBe('it&#x27;s');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
    expect(sanitizeString(123)).toBe('');
  });

  it('passes through safe strings unchanged', () => {
    expect(sanitizeString('hello world')).toBe('hello world');
  });
});

describe('safeLocalStorageGet', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns parsed JSON from localStorage', () => {
    localStorage.setItem('test', JSON.stringify({ a: 1 }));
    expect(safeLocalStorageGet('test')).toEqual({ a: 1 });
  });

  it('returns default value for missing keys', () => {
    expect(safeLocalStorageGet('missing')).toBeNull();
    expect(safeLocalStorageGet('missing', 'fallback')).toBe('fallback');
  });

  it('returns default value for invalid JSON', () => {
    localStorage.setItem('bad', 'not json{');
    expect(safeLocalStorageGet('bad', 'fallback')).toBe('fallback');
  });
});

describe('safeLocalStorageSet', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores JSON in localStorage', () => {
    safeLocalStorageSet('key', { b: 2 });
    expect(JSON.parse(localStorage.getItem('key'))).toEqual({ b: 2 });
  });

  it('returns true on success', () => {
    expect(safeLocalStorageSet('key', 'value')).toBe(true);
  });
});

describe('validateNumber', () => {
  it('returns the number if within range', () => {
    expect(validateNumber(5, 0, 10, 0)).toBe(5);
  });

  it('returns default for values below min', () => {
    expect(validateNumber(-1, 0, 10, 0)).toBe(0);
  });

  it('returns default for values above max', () => {
    expect(validateNumber(11, 0, 10, 0)).toBe(0);
  });

  it('returns default for NaN', () => {
    expect(validateNumber('abc', 0, 10, 5)).toBe(5);
  });

  it('converts string numbers', () => {
    expect(validateNumber('7', 0, 10, 0)).toBe(7);
  });
});

describe('validateStatsStructure', () => {
  it('returns true for valid stats object', () => {
    expect(validateStatsStructure({
      word1: { correct: 3, incorrect: 1 },
      word2: { correct: 0, incorrect: 2, level: 0 }
    })).toBe(true);
  });

  it('returns true for empty object', () => {
    expect(validateStatsStructure({})).toBe(true);
  });

  it('returns false for null', () => {
    expect(validateStatsStructure(null)).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(validateStatsStructure('string')).toBe(false);
  });

  it('returns false for entries missing correct/incorrect', () => {
    expect(validateStatsStructure({
      word1: { level: 3 }
    })).toBe(false);
  });
});
