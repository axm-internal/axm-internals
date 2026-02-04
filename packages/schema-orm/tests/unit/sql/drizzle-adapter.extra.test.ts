import { describe, expect, it } from 'bun:test';
import { CasingCache } from 'drizzle-orm/casing';
import {
    buildCount,
    buildDelete,
    buildExists,
    buildInsert,
    buildSelect,
    buildUpdate,
} from '../../../src/sql/dml/drizzle-adapter';

const normalize = (sql: string) => sql.replace(/\s+/g, ' ').trim();
const buildQueryConfig = () => ({
    casing: new CasingCache(),
    escapeName: (name: string) => `"${name.replace(/"/g, '""')}"`,
    escapeParam: () => '?',
    escapeString: (value: string) => `'${value.replace(/'/g, "''")}'`,
});
const toQuery = (query: {
    toQuery: (config: ReturnType<typeof buildQueryConfig>) => { sql: string; params: unknown[] };
}) => query.toQuery(buildQueryConfig());

describe('drizzle-adapter builders', () => {
    it('buildSelect with limit only', () => {
        const query = buildSelect({ table: 'users', limit: 2 });
        const { sql, params } = toQuery(query);
        expect(normalize(sql)).toBe('SELECT * FROM "users" LIMIT ?');
        expect(params).toEqual([2]);
    });

    it('buildSelect without where/order/pagination', () => {
        const query = buildSelect({ table: 'users' });
        const { sql, params } = toQuery(query);
        expect(normalize(sql)).toBe('SELECT * FROM "users"');
        expect(params).toEqual([]);
    });

    it('buildSelect with where/order/pagination', () => {
        const query = buildSelect({
            table: 'users',
            where: { name: 'Ada' },
            orderBy: [{ field: 'name', direction: 'asc' }],
            pagination: { page: 2, limit: 10 },
        });
        const { sql, params } = toQuery(query);
        expect(normalize(sql)).toBe('SELECT * FROM "users" WHERE "name" = ? ORDER BY "name" ASC LIMIT ? OFFSET ?');
        expect(params).toEqual(['Ada', 10, 10]);
    });

    it('buildCount without where', () => {
        const query = buildCount({ table: 'users' });
        const { sql, params } = toQuery(query);
        expect(normalize(sql)).toBe('SELECT COUNT(*) as count FROM "users"');
        expect(params).toEqual([]);
    });

    it('buildCount with where', () => {
        const query = buildCount({ table: 'users', where: { name: 'Bob' } });
        const { sql, params } = toQuery(query);
        expect(normalize(sql)).toBe('SELECT COUNT(*) as count FROM "users" WHERE "name" = ?');
        expect(params).toEqual(['Bob']);
    });

    it('buildExists', () => {
        const query = buildExists({ table: 'users', where: { id: 1 } });
        const { sql, params } = toQuery(query);
        expect(normalize(sql)).toBe('SELECT 1 as value FROM "users" WHERE "id" = ? LIMIT 1');
        expect(params).toEqual([1]);
    });

    it('buildInsert', () => {
        const query = buildInsert({ table: 'users', data: { id: 1, name: 'Ada' } });
        const { sql, params } = toQuery(query);
        expect(normalize(sql)).toBe('INSERT INTO "users" ("id", "name") VALUES (?, ?) RETURNING *');
        expect(params).toEqual([1, 'Ada']);
    });

    it('buildInsert rejects empty data', () => {
        expect(() => buildInsert({ table: 'users', data: {} })).toThrow('insert data must not be empty');
    });

    it('buildUpdate', () => {
        const query = buildUpdate({ table: 'users', where: { id: 1 }, data: { name: 'Ada' } });
        const { sql, params } = toQuery(query);
        expect(normalize(sql)).toBe('UPDATE "users" SET "name" = ? WHERE "id" = ? RETURNING *');
        expect(params).toEqual(['Ada', 1]);
    });

    it('buildUpdate rejects empty data', () => {
        expect(() => buildUpdate({ table: 'users', where: { id: 1 }, data: {} })).toThrow(
            'update data must not be empty'
        );
    });

    it('buildDelete', () => {
        const query = buildDelete({ table: 'users', where: { id: 1 } });
        const { sql, params } = toQuery(query);
        expect(normalize(sql)).toBe('DELETE FROM "users" WHERE "id" = ? RETURNING *');
        expect(params).toEqual([1]);
    });
});
