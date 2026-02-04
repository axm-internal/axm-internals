import type { SQLQueryBindings } from 'bun:sqlite';
import { Database } from 'bun:sqlite';
import { type BunSQLiteDatabase, drizzle } from 'drizzle-orm/bun-sqlite';
import type { DatabaseConfigInput } from '../../types';
import type { SqlRunner } from '../schema-metadata';
import type { AdapterInterface, AdapterType } from './AdapterInterface';
import { BaseSyncSqliteAdapter } from './BaseSyncSqliteAdapter';

export type BunSqliteConnection = Database;

export class BunSqliteAdapter
    extends BaseSyncSqliteAdapter<BunSqliteConnection>
    implements AdapterInterface<BunSQLiteDatabase>
{
    readonly id: AdapterType = 'bun-sqlite';
    protected client: BunSqliteConnection | null = null;
    protected drizzleDatabase: BunSQLiteDatabase | null = null;

    constructor(protected config: Pick<DatabaseConfigInput, 'databasePath'>) {
        super();
    }

    getDrizzleDatabase(): BunSQLiteDatabase {
        if (!this.drizzleDatabase) {
            const client = this.getClient();
            this.drizzleDatabase = drizzle({ client });
        }
        return this.drizzleDatabase;
    }

    protected getClient(): BunSqliteConnection {
        if (!this.client) {
            this.client = new Database(this.config.databasePath);
        }
        return this.client;
    }

    getSqlRunner(): SqlRunner {
        const client = this.getClient();

        return {
            run: (sql, params?: SQLQueryBindings[]) => {
                if (params) {
                    client.run(sql, params);
                } else {
                    client.run(sql);
                }
            },
            query: (sql) => ({
                get: (params?: SQLQueryBindings[]) =>
                    params ? client.query(sql).get(...params) : client.query(sql).get(),
            }),
        };
    }

    protected execPragma(conn: BunSqliteConnection, statement: string): void {
        conn.run(`PRAGMA ${statement}`);
    }
}
