import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { getSchemaMeta } from '../../src';

describe('getSchemaMeta', () => {
    type MetaData = {
        description: string;
        foo: string;
    };

    const schema = z.any().meta({
        description: 'sample desc',
        foo: 'bar',
    });

    it('returns values for defined meta', () => {
        const { description, foo } = getSchemaMeta<MetaData>(schema);
        expect(description).toBe('sample desc');
        expect(foo).toBe('bar');
    });

    it('returns undefined for non-set meta', () => {
        const { nonExistent } = getSchemaMeta(schema);
        expect(nonExistent).toBeUndefined();
    });

    it('returns an empty object for schemas without meta', () => {
        const meta = getSchemaMeta(z.string());
        expect(meta).toEqual({});
    });
});
