import { describe, expect, it } from 'bun:test';
import type { SQLiteDatabase } from 'expo-sqlite';
import { ExpoSqliteAdapter } from '../../../../src/db/adapters/ExpoSqliteAdapter';

describe('ExpoSqliteAdapter', () => {
    it('returns the recommended preset pragmas', () => {
        const adapter = new ExpoSqliteAdapter({ databasePath: ':memory:' });

        expect(adapter.presetPragmas()).toEqual({
            journal_mode: 'WAL',
            synchronous: 'NORMAL',
            busy_timeout: 5000,
            foreign_keys: 'ON',
        });
    });

    it('applies pragmas via exec sync', () => {
        const calls: string[] = [];
        const fakeClient = {
            execSync: (statement: string) => {
                calls.push(statement);
            },
            runSync: () => {
                // no-op
            },
            getFirstSync: () => null,
        } as unknown as SQLiteDatabase;

        class TestAdapter extends ExpoSqliteAdapter {
            // Avoid native expo-sqlite bindings in Bun tests.
            protected override getClient() {
                return fakeClient;
            }
        }

        const adapter = new TestAdapter({ databasePath: ':memory:' });

        adapter.applyPragmas({
            journal_mode: 'WAL',
            busy_timeout: 5000,
            foreign_keys: true,
        });

        expect(calls).toEqual(['PRAGMA journal_mode = WAL', 'PRAGMA busy_timeout = 5000', 'PRAGMA foreign_keys = 1']);
    });
});
