import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { AdapterTypes } from '../db/adapters/AdapterInterface';
import type { DefineDatabaseHooks } from '../types';

const resolveDbPath = (value: string): string | null => {
    if (value === ':memory:') {
        return null;
    }
    if (value.startsWith('file://')) {
        try {
            return fileURLToPath(value);
        } catch {
            return null;
        }
    }
    if (value.startsWith('sqlite://')) {
        return value.slice('sqlite://'.length);
    }
    return value;
};

export const PaginationQuerySchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).default(50),
});

export const OrderBySchema = z
    .array(
        z.object({
            field: z.string(),
            direction: z.enum(['asc', 'desc']).default('asc'),
        })
    )
    .min(1);

export const FindAllOptionsSchema = z
    .object({
        pagination: PaginationQuerySchema.optional(),
        orderBy: OrderBySchema.optional(),
    })
    .strict();

export const WriteOptionsSchema = z
    .object({
        validate: z.union([z.literal(false), z.instanceof(z.ZodType)]).optional(),
    })
    .strict();

export const InsertOptionsSchema = WriteOptionsSchema;

export const UpdateOptionsSchema = WriteOptionsSchema;

export const DefineDatabaseHooksSchema = z
    .object({
        onConnect: z.custom<DefineDatabaseHooks['onConnect']>((value) => typeof value === 'function').optional(),
        onFirstCreate: z
            .custom<DefineDatabaseHooks['onFirstCreate']>((value) => typeof value === 'function')
            .optional(),
        onSchemaChange: z
            .custom<DefineDatabaseHooks['onSchemaChange']>((value) => typeof value === 'function')
            .optional(),
        onModelsReady: z
            .custom<DefineDatabaseHooks['onModelsReady']>((value) => typeof value === 'function')
            .optional(),
    })
    .strict();

export const ModelConfigSchema = z.object({
    table: z.string(),
    schema: z.instanceof(z.ZodObject),
});

export const DatabaseConfigSchema = z.object({
    adapter: z.enum(AdapterTypes).default('bun-sqlite'),
    usePragmaPreset: z.boolean().default(false),
    pragma: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
    databasePath: z
        .string()
        .min(1)
        .superRefine((value, ctx) => {
            const resolved = resolveDbPath(value);
            if (resolved === null) {
                return;
            }
            const parent = dirname(resolved);
            if (!existsSync(parent)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Database directory does not exist: ${parent}`,
                });
            }
        }),
    modelDefinitions: z.record(z.string(), ModelConfigSchema),
    hooks: DefineDatabaseHooksSchema.optional(),
});

export const ColumnMetaSchema = z
    .object({
        primaryKey: z.boolean().default(false),
        autoincrement: z.boolean().default(false),
        unique: z.boolean().default(false),
        json: z.boolean().default(false),
    })
    .strict();
