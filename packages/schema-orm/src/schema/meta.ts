import { z } from 'zod';
import { ColumnMetaSchema } from './schemas';

const resolveMeta = (schema: z.ZodType): z.infer<typeof ColumnMetaSchema> => {
    let current = schema as z.ZodType;

    while (true) {
        const meta = current.meta()?.db;
        if (meta) {
            return ColumnMetaSchema.parse(meta);
        }
        if (current instanceof z.ZodDefault) {
            current = current.unwrap() as z.ZodType;
            continue;
        }
        if (current instanceof z.ZodOptional) {
            current = current.unwrap() as z.ZodType;
            continue;
        }
        if (current instanceof z.ZodNullable) {
            current = current.unwrap() as z.ZodType;
            continue;
        }
        if (current instanceof z.ZodPipe) {
            current = current.in as z.ZodType;
            continue;
        }
        break;
    }

    return ColumnMetaSchema.parse({});
};

export const getColumnMeta = (schema: z.ZodType): z.infer<typeof ColumnMetaSchema> => {
    return resolveMeta(schema);
};

const withDbMeta = <T extends z.ZodType>(schema: T, dbPatch: Partial<z.infer<typeof ColumnMetaSchema>>): T => {
    const existing = schema.meta() ?? {};
    const db = { ...(existing.db ?? {}), ...dbPatch };
    return schema.meta({ ...existing, db }) as T;
};

export const makePrimaryKey = <T extends z.ZodType>(schema: T): T => {
    return withDbMeta(schema, { primaryKey: true });
};

export type AutoIncrementBrand = { __autoIncrement: true };
export type AutoIncrementZod<T extends z.ZodType> = T & AutoIncrementBrand;

export const makeJson = <T extends z.ZodType>(schema: T): T => {
    return withDbMeta(schema, { json: true });
};

export const makeAutoIncrement = <T extends z.ZodType>(schema: T): AutoIncrementZod<T> => {
    return withDbMeta(schema, { autoincrement: true }) as AutoIncrementZod<T>;
};

export const makeUnique = <T extends z.ZodType>(schema: T): T => {
    return withDbMeta(schema, { unique: true });
};

export const isJsonColumn = (schema: z.ZodType): boolean => {
    return getColumnMeta(schema).json;
};

export const isPrimaryKey = (schema: z.ZodType): boolean => {
    return getColumnMeta(schema).primaryKey;
};

export const isAutoIncrement = (schema: z.ZodType): boolean => {
    return getColumnMeta(schema).autoincrement;
};

export const isUnique = (schema: z.ZodType): boolean => {
    return getColumnMeta(schema).unique;
};

export const isZodNullable = (schema: z.ZodType): schema is z.ZodNullable<z.ZodTypeAny> =>
    schema instanceof z.ZodNullable;

export const isZodOptional = (schema: z.ZodType): schema is z.ZodOptional<z.ZodTypeAny> =>
    schema instanceof z.ZodOptional;

const resolveNullability = (schema: z.ZodType) => {
    let current = schema as z.ZodType;
    let optional = false;
    let nullable = false;

    while (true) {
        if (current instanceof z.ZodDefault) {
            current = current.unwrap() as z.ZodType;
            continue;
        }
        if (current instanceof z.ZodOptional) {
            optional = true;
            current = current.unwrap() as z.ZodType;
            continue;
        }
        if (current instanceof z.ZodNullable) {
            nullable = true;
            current = current.unwrap() as z.ZodType;
            continue;
        }
        if (current instanceof z.ZodPipe) {
            current = current.in as z.ZodType;
            continue;
        }
        break;
    }

    return { optional, nullable };
};

export const isNullable = (schema: z.ZodType): boolean => {
    const { optional, nullable } = resolveNullability(schema);
    return (optional || nullable) && !isPrimaryKey(schema);
};

export const getDefault = (schema: z.ZodType): string | number | boolean | null => {
    const result = schema.safeParse(undefined);
    if (!result.success) {
        return null;
    }

    return (result.data === undefined ? null : result.data) as string | number | boolean | null;
};

export const getPrimaryKeyField = (schema: z.ZodType): string | null => {
    if (!(schema instanceof z.ZodObject)) {
        return null;
    }

    const shape = schema.shape as Record<string, z.ZodType>;
    for (const [fieldName, fieldSchema] of Object.entries(shape)) {
        if (isPrimaryKey(fieldSchema)) {
            return fieldName;
        }
    }

    return null;
};
