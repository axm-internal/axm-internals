import type { DbClient } from '../db/client';
import type { MetaEntry } from '../db/types';

export const listMeta = async (db: DbClient): Promise<MetaEntry[]> => {
    return db.selectFrom('meta').selectAll().orderBy('key', 'asc').execute();
};
