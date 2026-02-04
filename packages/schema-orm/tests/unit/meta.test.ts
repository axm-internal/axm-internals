import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import {
    getColumnMeta,
    getDefault,
    getPrimaryKeyField,
    isAutoIncrement,
    isJsonColumn,
    isNullable,
    isPrimaryKey,
    isUnique,
    isZodNullable,
    isZodOptional,
    makeAutoIncrement,
    makeJson,
    makePrimaryKey,
    makeUnique,
} from '../../src/schema/meta';

const baseSchema = z.number().int();

describe('meta helpers', () => {
    it('getColumnMeta returns defaults when no meta is set', () => {
        const meta = getColumnMeta(baseSchema);
        expect(meta.primaryKey).toBe(false);
        expect(meta.autoincrement).toBe(false);
        expect(meta.unique).toBe(false);
        expect(meta.json).toBe(false);
    });

    it('makePrimaryKey sets primaryKey metadata', () => {
        const schema = makePrimaryKey(baseSchema);
        const meta = getColumnMeta(schema);
        expect(meta.primaryKey).toBe(true);
        expect(isPrimaryKey(schema)).toBe(true);
    });

    it('makeAutoIncrement sets autoincrement metadata', () => {
        const schema = makeAutoIncrement(baseSchema);
        const meta = getColumnMeta(schema);
        expect(meta.autoincrement).toBe(true);
        expect(isAutoIncrement(schema)).toBe(true);
    });

    it('makeUnique sets unique metadata', () => {
        const schema = makeUnique(baseSchema);
        const meta = getColumnMeta(schema);
        expect(meta.unique).toBe(true);
        expect(isUnique(schema)).toBe(true);
    });

    it('makeJson sets json metadata', () => {
        const schema = makeJson(z.object({ theme: z.string() }));
        const meta = getColumnMeta(schema);
        expect(meta.json).toBe(true);
        expect(isJsonColumn(schema)).toBe(true);
    });

    it('detects json metadata through wrappers', () => {
        const schema = makeJson(z.object({ theme: z.string() })).optional();
        expect(isJsonColumn(schema)).toBe(true);
    });

    it('merges metadata without dropping existing flags', () => {
        const schema = makeUnique(makePrimaryKey(baseSchema));
        const meta = getColumnMeta(schema);
        expect(meta.primaryKey).toBe(true);
        expect(meta.unique).toBe(true);
        expect(meta.autoincrement).toBe(false);
    });

    it('detects ZodNullable', () => {
        const schema = z.string().nullable();
        expect(isZodNullable(schema)).toBe(true);
        expect(isZodOptional(schema)).toBe(false);
    });

    it('detects ZodOptional', () => {
        const schema = z.string().optional();
        expect(isZodOptional(schema)).toBe(true);
        expect(isZodNullable(schema)).toBe(false);
    });

    it('isNullable returns true for nullable or optional', () => {
        expect(isNullable(z.string().nullable())).toBe(true);
        expect(isNullable(z.string().optional())).toBe(true);
    });

    it('isNullable returns false for primary keys', () => {
        const schema = makePrimaryKey(z.number().int().optional());
        expect(isNullable(schema)).toBe(false);
    });

    it('getPrimaryKeyField returns null for non-object schemas', () => {
        expect(getPrimaryKeyField(z.string())).toBeNull();
    });

    it('getPrimaryKeyField returns primary key field name', () => {
        const schema = z.object({
            id: makePrimaryKey(z.number().int()),
            name: z.string(),
        });
        expect(getPrimaryKeyField(schema)).toBe('id');
    });

    it('getPrimaryKeyField returns null when no primary key is defined', () => {
        const schema = z.object({
            name: z.string(),
        });
        expect(getPrimaryKeyField(schema)).toBeNull();
    });
});

describe('getDefault', () => {
    it('returns null when there is no default', () => {
        expect(getDefault(z.string())).toBeNull();
    });

    it('returns string default', () => {
        expect(getDefault(z.string().default('hello'))).toBe('hello');
    });

    it('returns falsy defaults', () => {
        expect(getDefault(z.number().default(0))).toBe(0);
        expect(getDefault(z.boolean().default(false))).toBe(false);
        expect(getDefault(z.string().default(''))).toBe('');
    });

    it('returns null when parsing undefined fails', () => {
        const schema = z.number().min(5);
        expect(getDefault(schema)).toBeNull();
    });

    it('returns defaults through coercion', () => {
        expect(getDefault(z.coerce.number().default(42))).toBe(42);
    });
});
