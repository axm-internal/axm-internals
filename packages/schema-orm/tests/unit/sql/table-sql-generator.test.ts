import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { makeAutoIncrement, makeForeignKey, makeJson, makePrimaryKey, makeUnique } from '../../../src/schema/meta';
import { generateCreateTable } from '../../../src/sql/ddl/TableSqlGenerator';

const UserSchema = z.object({
    id: makeAutoIncrement(makePrimaryKey(z.number().int())),
    name: makeUnique(z.string()),
    age: z.number().int().optional(),
    favColor: z.string().default('pink'),
});

const UserModelConfig = {
    table: 'users',
    schema: UserSchema,
};

describe('TableSqlGenerator', () => {
    it('generates a CREATE TABLE statement with constraints', () => {
        const sql = generateCreateTable(UserModelConfig);
        expect(sql).toBe(
            'CREATE TABLE IF NOT EXISTS "users" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" TEXT NOT NULL UNIQUE, "age" INTEGER, "favColor" TEXT NOT NULL DEFAULT \'pink\');'
        );
    });

    it('omits AUTOINCREMENT when not integer primary key', () => {
        const schema = z.object({
            id: makeAutoIncrement(makePrimaryKey(z.string())),
        });
        const sql = generateCreateTable({ table: 'things', schema });
        expect(sql).toBe('CREATE TABLE IF NOT EXISTS "things" ("id" TEXT PRIMARY KEY NOT NULL);');
    });

    it('maps string-like schemas (email/url/uuid) to TEXT', () => {
        const schema = z.object({
            email: z.string().email(),
            url: z.string().url(),
            id: z.string().uuid(),
        });
        const sql = generateCreateTable({ table: 'emails', schema });
        expect(sql).toBe(
            'CREATE TABLE IF NOT EXISTS "emails" ("email" TEXT NOT NULL, "url" TEXT NOT NULL, "id" TEXT NOT NULL);'
        );
    });

    it('maps booleans and dates to INTEGER', () => {
        const schema = z.object({
            isActive: z.boolean(),
            createdAt: z.date(),
        });
        const sql = generateCreateTable({ table: 'flags', schema });
        expect(sql).toBe(
            'CREATE TABLE IF NOT EXISTS "flags" ("isActive" INTEGER NOT NULL, "createdAt" INTEGER NOT NULL);'
        );
    });

    it('handles nullable and optional columns', () => {
        const schema = z.object({
            nickname: z.string().nullable(),
            age: z.number().int().optional(),
        });
        const sql = generateCreateTable({ table: 'profiles', schema });
        expect(sql).toBe('CREATE TABLE IF NOT EXISTS "profiles" ("nickname" TEXT, "age" INTEGER);');
    });

    it('maps json-marked object schemas to TEXT', () => {
        const schema = z.object({
            settings: makeJson(z.object({ theme: z.string() })),
        });
        const sql = generateCreateTable({ table: 'prefs', schema });
        expect(sql).toBe('CREATE TABLE IF NOT EXISTS "prefs" ("settings" TEXT NOT NULL);');
    });

    it('maps json-marked array schemas to TEXT', () => {
        const schema = z.object({
            tags: makeJson(z.array(z.string())),
        });
        const sql = generateCreateTable({ table: 'tags', schema });
        expect(sql).toBe('CREATE TABLE IF NOT EXISTS "tags" ("tags" TEXT NOT NULL);');
    });

    it('throws on object schemas without json marker', () => {
        const schema = z.object({
            settings: z.object({ theme: z.string() }),
        });
        expect(() => generateCreateTable({ table: 'prefs', schema })).toThrow();
    });

    describe('composite primary keys', () => {
        it('generates composite PRIMARY KEY constraint', () => {
            const schema = z.object({
                userId: makePrimaryKey(z.number().int()),
                roleId: makePrimaryKey(z.number().int()),
                grantedAt: z.string(),
            });
            const sql = generateCreateTable({ table: 'user_roles', schema });
            expect(sql).toBe(
                'CREATE TABLE IF NOT EXISTS "user_roles" ("userId" INTEGER NOT NULL, "roleId" INTEGER NOT NULL, "grantedAt" TEXT NOT NULL, PRIMARY KEY ("userId", "roleId"));'
            );
        });

        it('does not add per-column PRIMARY KEY when in composite', () => {
            const schema = z.object({
                a: makePrimaryKey(z.number().int()),
                b: makePrimaryKey(z.number().int()),
            });
            const sql = generateCreateTable({ table: 't', schema });
            expect(sql).not.toContain('"a" INTEGER PRIMARY KEY');
            expect(sql).not.toContain('"b" INTEGER PRIMARY KEY');
            expect(sql).toContain('PRIMARY KEY ("a", "b")');
        });

        it('generates single PK as column constraint (not composite)', () => {
            const schema = z.object({
                id: makePrimaryKey(z.number().int()),
                name: z.string(),
            });
            const sql = generateCreateTable({ table: 'single', schema });
            expect(sql).toContain('"id" INTEGER PRIMARY KEY');
            expect(sql).not.toContain('PRIMARY KEY (');
        });
    });

    describe('foreign key references', () => {
        it('generates REFERENCES clause for foreign key columns', () => {
            const schema = z.object({
                id: makeAutoIncrement(makePrimaryKey(z.number().int())),
                userId: makeForeignKey(z.number().int(), { table: 'users', column: 'id' }),
            });
            const sql = generateCreateTable({ table: 'posts', schema });
            expect(sql).toContain('REFERENCES "users" ("id")');
        });

        it('combines foreign key with other constraints', () => {
            const schema = z.object({
                id: makeAutoIncrement(makePrimaryKey(z.number().int())),
                authorId: makeForeignKey(z.number().int(), { table: 'users', column: 'id' }),
            });
            const sql = generateCreateTable({ table: 'posts', schema });
            expect(sql).toContain('NOT NULL');
            expect(sql).toContain('REFERENCES "users" ("id")');
        });
    });
});
