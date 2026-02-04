import type { SQLQueryBindings } from 'bun:sqlite';
import type { Database as BetterSqlite3ConnectionType } from 'better-sqlite3';
import Database from 'better-sqlite3';
import { type BetterSQLite3Database as DrizzleBetterSqlite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import type { DatabaseConfigInput } from '../../types';
import type { SqlRunner } from '../schema-metadata';
import type { AdapterInterface, AdapterType } from './AdapterInterface';
import { BaseSyncSqliteAdapter } from './BaseSyncSqliteAdapter';

export type BetterSqlite3Connection = BetterSqlite3ConnectionType;

export class BetterSqlite3Adapter
    extends BaseSyncSqliteAdapter<BetterSqlite3Connection>
    implements AdapterInterface<DrizzleBetterSqlite3Database>
{
    readonly id: AdapterType = 'better-sqlite3';
    protected connection: BetterSqlite3Connection | null = null;
    protected drizzle: DrizzleBetterSqlite3Database | null = null;

    constructor(protected config: Pick<DatabaseConfigInput, 'databasePath'>) {
        super();
    }

    protected getClient(): BetterSqlite3Connection {
        if (!this.connection) {
            this.connection = new Database(this.config.databasePath);
        }
        return this.connection;
    }

    getDrizzleDatabase(): DrizzleBetterSqlite3Database {
        if (!this.drizzle) {
            const client = this.getClient();
            this.drizzle = drizzle({ client });
        }
        return this.drizzle;
    }

    getSqlRunner(): SqlRunner {
        const client = this.getClient();

        return {
            run: (sql, params?: SQLQueryBindings[]) => {
                if (params) {
                    client.prepare(sql).run(...params);
                } else {
                    client.prepare(sql).run();
                }
            },
            query: (sql) => ({
                get: (params?: SQLQueryBindings[]) =>
                    params ? client.prepare(sql).get(...params) : client.prepare(sql).get(),
            }),
        };
    }

    protected execPragma(conn: BetterSqlite3Connection, statement: string): void {
        conn.pragma(statement);
    }
}
