import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { getMetaValue } from '../../src';

describe('getMetaValue', () => {
    const schema = z.any().meta({
        description: 'sample desc',
        foo: 'bar',
    });

    it('returns values for defined meta', () => {
        const description = getMetaValue(schema, 'description');
        expect(description).toBe('sample desc');
    });

    it('returns undefined for non-set meta', () => {
        const nonExistent = getMetaValue(schema, 'nonExistent');
        expect(nonExistent).toBeUndefined();
    });

    it('returns undefined when the schema has no meta', () => {
        const plain = z.string();
        const meta = getMetaValue(plain, 'nonExistent');
        expect(meta).toBeUndefined();
    });
});
