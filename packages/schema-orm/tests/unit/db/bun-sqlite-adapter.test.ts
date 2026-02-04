import { describe, expect, it } from 'bun:test';
import { BunSqliteAdapter } from '../../../src/db/adapters/BunSqliteAdapter';

describe('BunSqliteAdapter', () => {
    it('creates a bun:sqlite client and drizzle db', () => {
        const adapter = new BunSqliteAdapter({ databasePath: ':memory:' });
        const db = adapter.getDrizzleDatabase();
        const runner = adapter.getSqlRunner();

        expect(typeof db.select).toBe('function');
        expect(typeof db.insert).toBe('function');
        expect(typeof runner.run).toBe('function');
        expect(typeof runner.query).toBe('function');
    });
});
