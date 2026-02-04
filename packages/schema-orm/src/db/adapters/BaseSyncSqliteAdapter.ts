import type { Pragmas } from '../../types';

export abstract class BaseSyncSqliteAdapter<TConn> {
    protected abstract execPragma(conn: TConn, statement: string): void;

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
            const formatted = typeof value === 'boolean' ? (value ? 1 : 0) : value;
            this.execPragma(client, `${key} = ${formatted}`);
        }
    }

    protected abstract getClient(): TConn;
}
