import { Database } from 'bun:sqlite';
import { BunSqliteDialect } from '@meck93/kysely-bun-sqlite';
import { Kysely } from 'kysely';
import { ensureDbPath } from './paths';
import type { Database as DbSchema } from './types';

export const createBunDb = (dbPath: string): Kysely<DbSchema> =>
    new Kysely<DbSchema>({
        dialect: new BunSqliteDialect({
            database: new Database(ensureDbPath(dbPath)),
        }),
    });
