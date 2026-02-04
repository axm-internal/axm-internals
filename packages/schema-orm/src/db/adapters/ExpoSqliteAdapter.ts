import type { SQLQueryBindings } from 'bun:sqlite';
import { createRequire } from 'node:module';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import type { SQLiteBindParams, SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';
import type { DatabaseConfigInput } from '../../types';
import type { SqlRunner } from '../schema-metadata';
import type { AdapterInterface, AdapterType } from './AdapterInterface';
import { BaseSyncSqliteAdapter } from './BaseSyncSqliteAdapter';

export type ExpoSqliteConnection = SQLiteDatabase;

const require = createRequire(import.meta.url);
const getExpoSqlite = () => require('expo-sqlite') as typeof import('expo-sqlite');
const getDrizzleExpo = () => require('drizzle-orm/expo-sqlite') as typeof import('drizzle-orm/expo-sqlite');

export class ExpoSqliteAdapter
    extends BaseSyncSqliteAdapter<ExpoSqliteConnection>
    implements AdapterInterface<ExpoSQLiteDatabase>
{
    readonly id: AdapterType = 'expo-sqlite';
    protected client: SQLiteDatabase | null = null;
    protected drizzleDatabase: ExpoSQLiteDatabase | null = null;

    constructor(protected config: Pick<DatabaseConfigInput, 'databasePath'>) {
        super();
    }

    getDrizzleDatabase(): ExpoSQLiteDatabase {
        if (!this.drizzleDatabase) {
            const client = this.getClient();
            const { drizzle } = getDrizzleExpo();
            this.drizzleDatabase = drizzle(client);
        }
        return this.drizzleDatabase;
    }

    protected getClient(): SQLiteDatabase {
        if (!this.client) {
            const { openDatabaseSync } = getExpoSqlite();
            this.client = openDatabaseSync(this.config.databasePath);
        }
        return this.client;
    }

    getSqlRunner(): SqlRunner {
        const client = this.getClient();
        const normalizeParams = (params?: SQLQueryBindings[]): SQLiteBindParams | undefined => {
            if (!params) {
                return undefined;
            }
            return params.map((value) => (typeof value === 'bigint' ? Number(value) : value)) as SQLiteBindValue[];
        };

        return {
            run: (sql, params?: SQLQueryBindings[]) => {
                const bindParams = normalizeParams(params);
                if (bindParams) {
                    client.runSync(sql, bindParams);
                } else {
                    client.runSync(sql);
                }
            },
            query: (sql) => ({
                get: (params?: SQLQueryBindings[]) => {
                    const bindParams = normalizeParams(params);
                    return bindParams ? client.getFirstSync(sql, bindParams) : client.getFirstSync(sql);
                },
            }),
        };
    }

    protected execPragma(conn: SQLiteDatabase, statement: string): void {
        conn.execSync(`PRAGMA ${statement}`);
    }
}
