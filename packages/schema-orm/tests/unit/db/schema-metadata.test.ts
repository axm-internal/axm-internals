import { Database } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { checkSchemaHash, ensureMetaTable, isFirstCreate, type SqlRunner } from '../../../src/db/schema-metadata';
import { makeAutoIncrement, makePrimaryKey } from '../../../src/schema/meta';

const createModelConfig = () => ({
    table: 'users',
    schema: z.object({
        id: makeAutoIncrement(makePrimaryKey(z.number().int())),
        name: z.string(),
    }),
});

describe('schema metadata helpers', () => {
    it('creates the meta table', () => {
        const db = new Database(':memory:');
        const runner: SqlRunner = {
            run: (sql, params) => (params ? db.run(sql, params) : db.run(sql)),
            query: (sql) => ({
                get: (params) => (params ? db.query(sql).get(...params) : db.query(sql).get()),
            }),
        };

        ensureMetaTable(runner);

        const row = runner
            .query('SELECT name FROM sqlite_master WHERE type = ? AND name = ?')
            .get(['table', '__bun_record_db_meta']) as { name: string } | undefined;

        expect(row?.name).toBe('__bun_record_db_meta');
    });

    it('detects a first-create database', () => {
        const db = new Database(':memory:');
        const runner: SqlRunner = {
            run: (sql, params) => (params ? db.run(sql, params) : db.run(sql)),
            query: (sql) => ({
                get: (params) => (params ? db.query(sql).get(...params) : db.query(sql).get()),
            }),
        };

        ensureMetaTable(runner);
        expect(isFirstCreate(runner)).toBe(true);

        runner.run('INSERT INTO "__bun_record_db_meta" ("table_name", "schema_hash") VALUES (?, ?)', ['users', 'hash']);

        expect(isFirstCreate(runner)).toBe(false);
    });

    it('stores schema hashes and warns when the hash changes', () => {
        const db = new Database(':memory:');
        const runner: SqlRunner = {
            run: (sql, params) => (params ? db.run(sql, params) : db.run(sql)),
            query: (sql) => ({
                get: (params) => (params ? db.query(sql).get(...params) : db.query(sql).get()),
            }),
        };
        ensureMetaTable(runner);

        const modelConfig = createModelConfig();
        const initialResult = checkSchemaHash(runner, modelConfig);

        const existing = runner
            .query('SELECT schema_hash FROM "__bun_record_db_meta" WHERE table_name = ?')
            .get(['users']) as { schema_hash: string } | undefined;

        expect(existing?.schema_hash).toBeDefined();

        const updatedConfig = {
            table: 'users',
            schema: z.object({
                id: makeAutoIncrement(makePrimaryKey(z.number().int())),
                name: z.string(),
                email: z.email(),
            }),
        };

        const updatedResult = checkSchemaHash(runner, updatedConfig);

        expect(initialResult).toEqual({
            changed: false,
            storedHash: initialResult.currentHash,
            currentHash: initialResult.currentHash,
        });
        expect(updatedResult).toEqual({
            changed: true,
            storedHash: initialResult.currentHash,
            currentHash: updatedResult.currentHash,
        });
    });
});
