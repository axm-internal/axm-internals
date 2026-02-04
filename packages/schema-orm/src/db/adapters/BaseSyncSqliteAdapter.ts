import type { Pragmas } from '../../types';

export abstract class BaseSyncSqliteAdapter<TConn> {
    protected abstract execPragma(conn: TConn, statement: string): void;

    protected static escapeSqlString(value: string): string {
        return value.replace(/'/g, "''");
    }

    protected static formatPragmaValue(value: Pragmas[string]): string | number {
        if (typeof value === 'boolean') {
            return value ? 1 : 0;
        }
        if (typeof value === 'string') {
            return `'${BaseSyncSqliteAdapter.escapeSqlString(value)}'`;
        }
        return value;
    }

    presetPragmas(): Pragmas {
        return {
            journal_mode: 'WAL',
            synchronous: 'NORMAL',
            busy_timeout: 5000,
            foreign_keys: 'ON',
        };
    }

    applyPragmas(pragmas: Pragmas): void {
        const client = this.getClient();
        for (const [key, value] of Object.entries(pragmas)) {
            const formatted = BaseSyncSqliteAdapter.formatPragmaValue(value);
            this.execPragma(client, `${key} = ${formatted}`);
        }
    }

    protected abstract getClient(): TConn;
}
