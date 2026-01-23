import type { Kysely } from 'kysely';
import type { Database } from './types';

export const getMeta = async (db: Kysely<Database>, key: string): Promise<string | null> => {
    const row = await db.selectFrom('meta').select('value').where('key', '=', key).executeTakeFirst();
    return row?.value ?? null;
};

export const setMeta = async (db: Kysely<Database>, key: string, value: string): Promise<void> => {
    await db
        .insertInto('meta')
        .values({ key, value })
        .onConflict((conflict) => conflict.column('key').doUpdateSet({ value }))
        .execute();
};

export const deleteMeta = async (db: Kysely<Database>, key: string): Promise<void> => {
    await db.deleteFrom('meta').where('key', '=', key).execute();
};
