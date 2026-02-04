import { describe, expect, it } from 'bun:test';
import { BetterSqlite3Adapter } from '../../../../src/db/adapters/BetterSqlite3Adapter';
import { BunSqliteAdapter } from '../../../../src/db/adapters/BunSqliteAdapter';
import { getAdapterInstance } from '../../../../src/db/adapters/getAdapterInstance';

describe('getAdapterInstance', () => {
    it('returns a bun adapter', () => {
        const adapter = getAdapterInstance({
            adapter: 'bun-sqlite',
            databasePath: ':memory:',
            modelDefinitions: {},
            usePragmaPreset: false,
        });

        expect(adapter).toBeInstanceOf(BunSqliteAdapter);
    });

    it('returns a better-sqlite3 adapter', () => {
        const adapter = getAdapterInstance({
            adapter: 'better-sqlite3',
            databasePath: ':memory:',
            modelDefinitions: {},
            usePragmaPreset: false,
        });

        expect(adapter).toBeInstanceOf(BetterSqlite3Adapter);
    });
});
