import { describe, expect, it } from 'bun:test';
import { truncateString } from '../../../src/utils/truncateString';

describe('truncateString', () => {
    it('returns an empty string for null/undefined', () => {
        expect(truncateString(null)).toBe('');
        expect(truncateString(undefined)).toBe('');
    });

    it('returns the same string when below limit', () => {
        expect(truncateString('hello', 10)).toBe('hello');
    });

    it('truncates and adds ellipsis when over limit', () => {
        expect(truncateString('abcdefghij', 5)).toBe('abcde...');
    });

    it('stringifies non-string values', () => {
        expect(truncateString(42, 10)).toBe('42');
        expect(truncateString(true, 10)).toBe('true');
    });
});
