import { describe, expect, it } from 'bun:test';
import { BetterSqlite3Adapter } from '../../../../src/db/adapters/BetterSqlite3Adapter';

describe('BetterSqlite3Adapter', () => {
    it('returns the recommended preset pragmas', () => {
        const adapter = new BetterSqlite3Adapter({ databasePath: ':memory:' });

        expect(adapter.presetPragmas()).toEqual({
            journal_mode: 'WAL',
            synchronous: 'NORMAL',
            busy_timeout: 5000,
            foreign_keys: 'ON',
        });
    });

    it('applies pragmas via pragma calls', () => {
        const calls: string[] = [];
        class TestAdapter extends BetterSqlite3Adapter {
            // Avoid native better-sqlite3 bindings in Bun tests.
            protected override getClient() {
                return {} as ReturnType<BetterSqlite3Adapter['getClient']>;
            }

            protected override execPragma(_conn: unknown, statement: string) {
                calls.push(statement);
            }
        }

        const adapter = new TestAdapter({ databasePath: ':memory:' });

        adapter.applyPragmas({
            journal_mode: 'WAL',
            busy_timeout: 5000,
            foreign_keys: true,
        });

        expect(calls).toEqual(['journal_mode = WAL', 'busy_timeout = 5000', 'foreign_keys = 1']);
    });
});
