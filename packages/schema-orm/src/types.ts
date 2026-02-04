import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { z } from 'zod';
import type { AdapterInterface } from './db/adapters/AdapterInterface';
import type { SqlRunner } from './db/schema-metadata';
import type { AutoIncrementBrand } from './schema/meta';
import type {
    DatabaseConfigSchema,
    InsertOptionsSchema,
    ModelConfigSchema,
    PaginationQuerySchema,
    UpdateOptionsSchema,
} from './schema/schemas';

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type DatabaseConfigInput = z.input<typeof DatabaseConfigSchema>;
export type DefineDatabaseHookContext<TModels = Record<string, unknown>> = {
    adapter: AdapterInterface;
    runner: SqlRunner;
    models?: TModels;
};
export type DefineDatabaseHooks<TModels = Record<string, unknown>> = {
    onConnect?: (ctx: DefineDatabaseHookContext<TModels>) => void;
    onFirstCreate?: (ctx: DefineDatabaseHookContext<TModels> & { models: TModels }) => void;
    onSchemaChange?: (args: { table: string; storedHash: string; currentHash: string }) => void;
    onModelsReady?: (args: { models: TModels }) => void;
};

export type ModelConfig = z.infer<typeof ModelConfigSchema>;

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export type OrderBy<T extends Record<string, unknown>> = Array<{
    field: keyof T;
    direction: 'asc' | 'desc';
}>;

export type Where<T extends Record<string, unknown>> = Partial<T>;

export type FindAllOptions<T extends Record<string, unknown>> = {
    pagination?: PaginationQuery;
    orderBy?: OrderBy<T>;
};

export type InsertOptions = z.infer<typeof InsertOptionsSchema>;

export type UpdateOptions = z.infer<typeof UpdateOptionsSchema>;

type ShapeOf<TSchema extends z.ZodObject<z.ZodRawShape>> = TSchema extends z.ZodObject<infer Shape> ? Shape : never;

type ShapeKeys<TShape extends z.ZodRawShape> = Extract<keyof TShape, string>;

type OptionalInsertKeys<TShape extends z.ZodRawShape> = {
    [K in ShapeKeys<TShape>]: TShape[K] extends
        | z.ZodOptional<z.ZodTypeAny>
        | z.ZodDefault<z.ZodTypeAny>
        | z.ZodNullable<z.ZodTypeAny>
        | AutoIncrementBrand
        ? K
        : TShape[K] extends z.ZodPipe<infer In, z.ZodTypeAny>
          ? In extends
                | z.ZodOptional<z.ZodTypeAny>
                | z.ZodDefault<z.ZodTypeAny>
                | z.ZodNullable<z.ZodTypeAny>
                | AutoIncrementBrand
              ? K
              : never
          : never;
}[ShapeKeys<TShape>];

type OptionalizeKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type InsertInput<TSchema extends z.ZodObject<z.ZodRawShape>> = OptionalizeKeys<
    z.input<TSchema>,
    Extract<OptionalInsertKeys<ShapeOf<TSchema>>, keyof z.input<TSchema>>
>;
export type Pragmas = Record<string, string | number | boolean>;
export type NullablePragmas = Record<string, string | number | boolean | null>;
export type AnySQLiteDb = BaseSQLiteDatabase<'sync', unknown, Record<string, unknown>>;
