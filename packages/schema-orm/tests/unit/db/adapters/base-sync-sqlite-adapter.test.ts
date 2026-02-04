import { describe, expect, it } from 'bun:test';
import { BaseSyncSqliteAdapter } from '../../../../src/db/adapters/BaseSyncSqliteAdapter';
import type { Pragmas } from '../../../../src/types';

type Captured = { statements: string[] };

class TestAdapter extends BaseSyncSqliteAdapter<Captured> {
    protected client: Captured = { statements: [] };

    protected execPragma(conn: Captured, statement: string): void {
        conn.statements.push(statement);
    }

    protected getClient(): Captured {
        return this.client;
    }

    getStatements(): string[] {
        return this.client.statements;
    }
}

describe('BaseSyncSqliteAdapter', () => {
    it('quotes and escapes string pragmas', () => {
        const adapter = new TestAdapter();
        const pragmas: Pragmas = {
            journal_mode: 'WAL',
            foreign_keys: 'ON',
        };
        adapter.applyPragmas(pragmas);
        expect(adapter.getStatements()).toEqual(["journal_mode = 'WAL'", "foreign_keys = 'ON'"]);
    });

    it('escapes single quotes in string pragmas', () => {
        const adapter = new TestAdapter();
        const pragmas: Pragmas = {
            user_version: "O'Reilly",
        };
        adapter.applyPragmas(pragmas);
        expect(adapter.getStatements()).toEqual(["user_version = 'O''Reilly'"]);
    });

    it('formats boolean pragmas as numeric', () => {
        const adapter = new TestAdapter();
        const pragmas: Pragmas = {
            foreign_keys: true,
            reverse_unordered_selects: false,
        };
        adapter.applyPragmas(pragmas);
        expect(adapter.getStatements()).toEqual(['foreign_keys = 1', 'reverse_unordered_selects = 0']);
    });
});
