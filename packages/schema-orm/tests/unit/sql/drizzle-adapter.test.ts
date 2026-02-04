import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { makeAutoIncrement, makeJson, makePrimaryKey, makeUnique } from '../../../src/schema/meta';
import { modelConfigToDrizzleTable } from '../../../src/sql/dml/drizzle-adapter';

const buildModelConfig = () => ({
    table: 'drizzle_types',
    schema: z.object({
        id: makeAutoIncrement(makePrimaryKey(z.number().int())),
        name: makeUnique(z.string()),
        score: z.number(),
        flags: makeJson(z.array(z.string())),
        payload: makeJson(z.object({ ok: z.boolean() })),
        active: z.boolean(),
    }),
});

describe('drizzle-adapter', () => {
    it('creates a drizzle table from model config', () => {
        const table = modelConfigToDrizzleTable(buildModelConfig());
        expect(table).toBeDefined();
    });
});
