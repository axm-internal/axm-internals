import type { Kysely } from 'kysely';
import { createBunDb } from './database-bun';
import { createBunWorkerDb } from './database-bun-worker';
import { createNodeDb } from './database-node';
import { deleteMeta, getMeta, setMeta } from './meta';
import { migrate } from './migrations';
import type { Database } from './types';

export type DbClient = Kysely<Database>;

export type RepoIndexState = {
    lastIndexedHash: string | null;
    lastIndexedDate: string | null;
    schemaVersion: number;
};

const META_SCHEMA_VERSION = 'schema_version';
const META_LAST_HASH = 'last_indexed_hash';
const META_LAST_DATE = 'last_indexed_date';

export const openNodeDb = async (dbPath: string): Promise<DbClient> => {
    const db = createNodeDb(dbPath);
    await ensureSchema(db);
    return db;
};

export const openBunDb = async (dbPath: string): Promise<DbClient> => {
    const db = createBunDb(dbPath);
    await ensureSchema(db);
    return db;
};

export const openBunWorkerDb = async (dbPath: string): Promise<DbClient> => {
    const db = createBunWorkerDb(dbPath);
    await ensureSchema(db);
    return db;
};

const ensureSchema = async (db: DbClient): Promise<void> => {
    await migrate(db);
};

// internal: do not export meta helpers from the public client API

export const getIndexState = async (db: DbClient): Promise<RepoIndexState> => {
    const [lastIndexedHash, lastIndexedDate, schemaVersion] = await Promise.all([
        getMeta(db, META_LAST_HASH),
        getMeta(db, META_LAST_DATE),
        getMeta(db, META_SCHEMA_VERSION),
    ]);

    return {
        lastIndexedHash,
        lastIndexedDate,
        schemaVersion: schemaVersion ? Number(schemaVersion) : 0,
    };
};

export const setIndexState = async (db: DbClient, next: RepoIndexState): Promise<void> => {
    const writeMeta = async (key: string, value: string | null): Promise<void> => {
        if (value === null) {
            await deleteMeta(db, key);
            return;
        }
        await setMeta(db, key, value);
    };

    await Promise.all([
        writeMeta(META_LAST_HASH, next.lastIndexedHash),
        writeMeta(META_LAST_DATE, next.lastIndexedDate),
        setMeta(db, META_SCHEMA_VERSION, String(next.schemaVersion)),
    ]);
};
