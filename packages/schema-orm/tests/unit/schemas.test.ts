import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import {
    DatabaseConfigSchema,
    ModelConfigSchema,
    OrderBySchema,
    PaginationQuerySchema,
} from '../../src/schema/schemas';

describe('ModelConfigSchema', () => {
    it('accepts a Zod object schema', () => {
        const config = {
            table: 'users',
            schema: z.object({
                id: z.number().int(),
                name: z.string(),
            }),
        };

        const result = ModelConfigSchema.safeParse(config);
        expect(result.success).toBe(true);
    });

    it('rejects non-object Zod schemas', () => {
        const config = {
            table: 'users',
            schema: z.string(),
        };

        const result = ModelConfigSchema.safeParse(config);
        expect(result.success).toBe(false);
    });
});

describe('PaginationQuerySchema', () => {
    it('applies defaults', () => {
        const result = PaginationQuerySchema.parse({});
        expect(result.page).toBe(1);
        expect(result.limit).toBe(50);
    });

    it('rejects invalid values', () => {
        const result = PaginationQuerySchema.safeParse({ page: 0, limit: 0 });
        expect(result.success).toBe(false);
    });
});

describe('OrderBySchema', () => {
    it('accepts valid ordering', () => {
        const result = OrderBySchema.safeParse([
            { field: 'name', direction: 'asc' },
            { field: 'createdAt', direction: 'desc' },
        ]);

        expect(result.success).toBe(true);
    });

    it('rejects empty ordering', () => {
        const result = OrderBySchema.safeParse([]);
        expect(result.success).toBe(false);
    });
});

describe('DatabaseConfigSchema', () => {
    const minimalModels = {
        Users: {
            table: 'users',
            schema: z.object({ id: z.number() }),
        },
    };

    it('accepts file paths', () => {
        const result = DatabaseConfigSchema.safeParse({
            databasePath: './sample.sqlite',
            modelDefinitions: minimalModels,
        });
        expect(result.success).toBe(true);
    });

    it('accepts file URLs', () => {
        const result = DatabaseConfigSchema.safeParse({
            databasePath: `file://${process.cwd()}/sample.sqlite`,
            modelDefinitions: minimalModels,
        });
        expect(result.success).toBe(true);
    });

    it('accepts sqlite:// URLs', () => {
        const result = DatabaseConfigSchema.safeParse({
            databasePath: 'sqlite://./sample.sqlite',
            modelDefinitions: minimalModels,
        });
        expect(result.success).toBe(true);
    });

    it('rejects missing parent directory', () => {
        const result = DatabaseConfigSchema.safeParse({
            databasePath: './does-not-exist-dir/sample.sqlite',
            modelDefinitions: minimalModels,
        });
        expect(result.success).toBe(false);
    });

    it('rejects empty databasePath', () => {
        const result = DatabaseConfigSchema.safeParse({
            databasePath: '',
            modelDefinitions: minimalModels,
        });
        expect(result.success).toBe(false);
    });

    it('rejects unsupported databasePath schemes', () => {
        const result = DatabaseConfigSchema.safeParse({
            databasePath: 'http://example.com/sample.sqlite',
            modelDefinitions: minimalModels,
        });
        expect(result.success).toBe(false);
    });

    it('accepts pragma null overrides', () => {
        const result = DatabaseConfigSchema.safeParse({
            databasePath: './sample.sqlite',
            modelDefinitions: minimalModels,
            usePragmaPreset: true,
            pragma: {
                journal_mode: 'WAL',
                synchronous: null,
            },
        });
        expect(result.success).toBe(true);
    });
});
