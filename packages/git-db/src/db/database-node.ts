import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import { ensureDbPath } from './paths';
import type { Database as DbSchema } from './types';

export const createNodeDb = (dbPath: string): Kysely<DbSchema> =>
    new Kysely<DbSchema>({
        dialect: new SqliteDialect({
            database: new Database(ensureDbPath(dbPath)),
        }),
    });
