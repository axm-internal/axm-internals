import type { Kysely } from 'kysely';
import { getMeta, setMeta } from './meta';
import { createSchema } from './schema';
import type { Database } from './types';

const META_SCHEMA_VERSION = 'schema_version';
const SCHEMA_VERSION = 1;

export const migrate = async (db: Kysely<Database>): Promise<void> => {
    await createSchema(db);
    const currentVersion = await getMeta(db, META_SCHEMA_VERSION);
    if (!currentVersion || Number(currentVersion) < SCHEMA_VERSION) {
        await setMeta(db, META_SCHEMA_VERSION, String(SCHEMA_VERSION));
    }
};
