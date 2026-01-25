import { describe, expect, it } from 'bun:test';
import { truncateString } from '../../../src/utils/truncateString';

describe('truncateString', () => {
    it('truncates long strings', () => {
        const value = truncateString('abcdefghijklmnopqrstuvwxyz', 10);
        expect(value).toBe('abcdefghij...');
    });

    it('returns the original string when under the limit', () => {
        const value = truncateString('short', 10);
        expect(value).toBe('short');
    });

    it('handles nullish values', () => {
        expect(truncateString(null, 5)).toBe('');
        expect(truncateString(undefined, 5)).toBe('');
    });
});
