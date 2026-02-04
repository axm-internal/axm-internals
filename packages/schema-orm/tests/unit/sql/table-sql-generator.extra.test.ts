import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { makePrimaryKey } from '../../../src/schema/meta';
import { generateCreateTable } from '../../../src/sql/ddl/TableSqlGenerator';

const toConfig = (schema: z.ZodObject<z.ZodRawShape>) => ({ table: 't', schema });

describe('TableSqlGenerator edge cases', () => {
    it('unwraps optional/nullable/default', () => {
        const schema = z.object({
            age: z.number().int().optional().nullable().default(1),
        });
        const sql = generateCreateTable(toConfig(schema));
        expect(sql).toBe('CREATE TABLE IF NOT EXISTS "t" ("age" INTEGER DEFAULT 1);');
    });

    it('handles unions with identical types', () => {
        const schema = z.object({
            value: z.union([z.string(), z.string().min(1)]),
        });
        const sql = generateCreateTable(toConfig(schema));
        expect(sql).toBe('CREATE TABLE IF NOT EXISTS "t" ("value" TEXT NOT NULL);');
    });

    it('throws on unions with incompatible types', () => {
        const schema = z.object({
            value: z.union([z.string(), z.number()]),
        });
        expect(() => generateCreateTable(toConfig(schema))).toThrow();
    });

    it('throws on unsupported schema types', () => {
        const schema = z.object({
            value: z.function(),
        });
        expect(() => generateCreateTable(toConfig(schema))).toThrow();
    });

    it('handles primary key without autoincrement', () => {
        const schema = z.object({
            id: makePrimaryKey(z.number().int()),
        });
        const sql = generateCreateTable({ table: 'pks', schema });
        expect(sql).toBe('CREATE TABLE IF NOT EXISTS "pks" ("id" INTEGER PRIMARY KEY NOT NULL);');
    });

    it('escapes text defaults with single quotes', () => {
        const schema = z.object({
            note: z.string().default("O'Reilly"),
        });
        const sql = generateCreateTable(toConfig(schema));
        expect(sql).toBe('CREATE TABLE IF NOT EXISTS "t" ("note" TEXT NOT NULL DEFAULT \'O\'\'Reilly\');');
    });
});
