import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { makeAutoIncrement, makeJson, makePrimaryKey, makeUnique } from '../../../src/schema/meta';
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
});
